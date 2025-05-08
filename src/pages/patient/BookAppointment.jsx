import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Search, X, ArrowRight, Mail, Phone } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState(1);
  const [availableTimes, setAvailableTimes] = useState([]);
  const navigate = useNavigate();

  // Mock patient ID for demo purposes
  const patientId = 1; // In a real app, this would come from the authenticated user

  // List of specialties for filtering
  const specialties = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Obstetrics',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Urology',
  ];

  // Time slots for appointments
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const [doctorsRes, schedulesRes, appointmentsRes] = await Promise.all([
        api.getDoctors(),
        api.getDoctorSchedule(0), // Get all schedules
        api.getAppointments(),
      ]);

      setDoctors(doctorsRes.data);
      setSchedules(schedulesRes.data);
      
      // Store appointments for availability checking
      window.appointments = appointmentsRes.data;
    } catch (error) {
      toast.error('Failed to fetch doctors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSpecialtyChange = (e) => {
    setSelectedSpecialty(e.target.value);
  };

  const filteredDoctors = doctors.filter(
    (doctor) => {
      // Filter by search term
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by specialty
      const matchesSpecialty = selectedSpecialty === '' || doctor.specialty === selectedSpecialty;
      
      return matchesSearch && matchesSpecialty;
    }
  );

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    // Find available times for this doctor on this date
    findAvailableTimes(selectedDoctor.id, date);
  };

  const findAvailableTimes = (doctorId, date) => {
    // Get day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find doctor's schedule for this day
    const doctorSchedule = schedules.find(s => s.doctorId === doctorId && s.day === dayOfWeek);
    
    if (!doctorSchedule) {
      setAvailableTimes([]);
      return;
    }
    
    // Get doctor's start and end times
    const startTime = doctorSchedule.startTime;
    const endTime = doctorSchedule.endTime;
    
    // Filter time slots based on doctor's schedule
    const availableSlots = timeSlots.filter(time => {
      return time >= startTime && time < endTime;
    });
    
    // Filter out times that are already booked
    const appointments = window.appointments || [];
    const bookedTimes = appointments.filter(a => 
      a.doctorId === doctorId && 
      a.date === date && 
      (a.status === 'confirmed' || a.status === 'pending')
    ).map(a => a.time);
    
    const available = availableSlots.filter(time => !bookedTimes.includes(time));
    
    setAvailableTimes(available);
  };

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error('Please select doctor, date, and time');
      return;
    }
    
    try {
      const appointmentData = {
        patientId,
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        notes: notes.trim(),
      };
      
      await api.createAppointment(appointmentData);
      toast.success('Appointment booked successfully');
      navigate('/patient/appointments');
    } catch (error) {
      toast.error('Failed to book appointment');
      console.error(error);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedDoctor(null);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
        <p className="mt-1 text-sm text-gray-500">
          Schedule a visit with one of our specialists
        </p>
      </div>

      {/* Booking Steps */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {step === 1 ? 'Step 1: Select a Doctor' : 'Step 2: Choose Date & Time'}
            </h3>
            {step === 2 && (
              <button
                onClick={goBack}
                className="text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Back to doctor selection
              </button>
            )}
          </div>
          <div className="mt-4">
            <div className="flex items-center">
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                step === 1 ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'
              }`}>
                <User className="h-4 w-4" />
              </div>
              <div className={`h-1 w-16 ${
                step === 1 ? 'bg-gray-200' : 'bg-purple-600'
              }`}></div>
              <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
                step === 2 ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-800'
              }`}>
                <Calendar className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          {step === 1 ? (
            <div className="px-4 py-5 sm:p-6">
              {/* Search and Filter */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                    Search Doctors
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search by name or specialty"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                    Filter by Specialty
                  </label>
                  <select
                    id="specialty"
                    name="specialty"
                    value={selectedSpecialty}
                    onChange={handleSpecialtyChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctors List */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => selectDoctor(doctor)}
                    >
                      <div className="bg-gray-50 px-4 py-2 border-b">
                        <h4 className="text-sm font-medium text-gray-900">{doctor.name}</h4>
                        <p className="text-xs text-gray-500">{doctor.specialty}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-2">
                          <Mail className="h-4 w-4 inline mr-1 text-gray-400" />
                          {doctor.email}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <Phone className="h-4 w-4 inline mr-1 text-gray-400" />
                          {doctor.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          <Calendar className="h-4 w-4 inline mr-1 text-gray-400" />
                          Available: {doctor.availability ? doctor.availability.join(', ') : 'Not set'}
                        </p>
                      </div>
                      <div className="bg-purple-50 px-4 py-2 border-t flex justify-end">
                        <span className="text-xs text-purple-600 flex items-center">
                          Select Doctor <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6">
                    <p className="text-gray-500">No doctors found matching your criteria</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Selected Doctor
                    </label>
                    <div className="mt-1 flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium">{selectedDoctor.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{selectedDoctor.name}</div>
                        <div className="text-xs text-gray-500">{selectedDoctor.specialty}</div>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Select Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="date"
                        id="date"
                        required
                        min={today}
                        max={maxDateStr}
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    {selectedDate && availableTimes.length === 0 && (
                      <p className="mt-2 text-sm text-red-600">
                        No available time slots for this date. Please select another date.
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Time
                    </label>
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleTimeSelection(time)}
                            className={`py-2 px-4 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              selectedTime === time
                                ? 'bg-purple-600 text-white border-transparent'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {time}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full text-sm text-gray-500">
                          {selectedDate ? 'No available times for selected date' : 'Please select a date first'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes (Optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add any additional information for the doctor..."
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;