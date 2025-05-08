import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Filter, Search, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Mock patient ID for demo purposes
  const patientId = 1; // In a real app, this would come from the authenticated user

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes] = await Promise.all([
        api.getPatientAppointments(patientId),
        api.getDoctors(),
      ]);

      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      toast.error('Failed to fetch appointments data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const cancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.updateAppointment(id, { status: 'cancelled' });
        toast.success('Appointment cancelled successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to cancel appointment');
        console.error(error);
      }
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'Unknown Doctor';
  };

  const getDoctorSpecialty = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? doctor.specialty : '';
  };

  const filteredAppointments = appointments
    .filter(appointment => {
      // Filter by tab
      if (activeTab !== 'all' && appointment.status !== activeTab) {
        return false;
      }
      
      // Search term (doctor name or notes)
      if (searchTerm) {
        const doctorName = getDoctorName(appointment.doctorId).toLowerCase();
        const doctorSpecialty = getDoctorSpecialty(appointment.doctorId).toLowerCase();
        const notes = appointment.notes ? appointment.notes.toLowerCase() : '';
        
        return (
          doctorName.includes(searchTerm.toLowerCase()) ||
          doctorSpecialty.includes(searchTerm.toLowerCase()) ||
          notes.includes(searchTerm.toLowerCase())
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by date (newest first), then by time
      if (a.date !== b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return a.time.localeCompare(b.time);
    });

  // Get counts for tabs
  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

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
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage your appointment history
        </p>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by doctor name, specialty, or notes"
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
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 text-center`}
            >
              All
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {counts.all}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 text-center`}
            >
              Pending
              <span className="ml-2 bg-yellow-100 text-yellow-600 py-0.5 px-2 rounded-full text-xs">
                {counts.pending}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'confirmed'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 text-center`}
            >
              Confirmed
              <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs">
                {counts.confirmed}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 text-center`}
            >
              Completed
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                {counts.completed}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cancelled'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 text-center`}
            >
              Cancelled
              <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                {counts.cancelled}
              </span>
            </button>
          </nav>
        </div>

        {/* Appointments List */}
        <div className="divide-y divide-gray-200">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {getDoctorName(appointment.doctorId).charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {getDoctorName(appointment.doctorId)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getDoctorSpecialty(appointment.doctorId)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end">
                    <div className="text-sm text-gray-900">{appointment.date}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex flex-col">
                    <div className="mb-2">{getStatusBadge(appointment.status)}</div>
                    {appointment.notes && (
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </div>
                    )}
                  </div>
                  {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                    <button
                      onClick={() => cancelAppointment(appointment.id)}
                      className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'No appointments match your search criteria'
                  : activeTab === 'all'
                  ? "You don't have any appointments yet"
                  : `You don't have any ${activeTab} appointments`}
              </p>
              <div className="mt-6">
                <a
                  href="/patient/book-appointment"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book New Appointment
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentHistory;