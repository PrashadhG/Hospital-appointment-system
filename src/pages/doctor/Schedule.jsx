import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    startTime: '',
    endTime: '',
  });

  // Mock doctor ID for demo purposes
  const doctorId = 1; // In a real app, this would come from the authenticated user

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctorSchedule(doctorId);
      setSchedule(response.data);
    } catch (error) {
      toast.error('Failed to fetch schedule');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const openModal = () => {
    setFormData({
      day: '',
      startTime: '',
      endTime: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate time range
    if (formData.startTime >= formData.endTime) {
      toast.error('End time must be after start time');
      return;
    }
    
    try {
      // Check if schedule for this day already exists
      const existingSchedule = schedule.find(s => s.day === formData.day);
      
      if (existingSchedule) {
        toast.error(`You already have a schedule for ${formData.day}`);
        return;
      }
      
      // Create new schedule
      await api.createSchedule({
        doctorId,
        ...formData,
      });
      
      toast.success('Schedule created successfully');
      fetchSchedule();
      closeModal();
    } catch (error) {
      toast.error('Failed to create schedule');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await api.deleteSchedule(id);
        toast.success('Schedule deleted successfully');
        fetchSchedule();
      } catch (error) {
        toast.error('Failed to delete schedule');
        console.error(error);
      }
    }
  };

  // Group schedule by day for better display
  const scheduleByDay = daysOfWeek.map(day => {
    const daySchedule = schedule.filter(s => s.day === day);
    return {
      day,
      schedules: daySchedule,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set your availability for patient appointments
          </p>
        </div>
        <button
          onClick={openModal}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Availability
        </button>
      </div>

      {/* Schedule Calendar */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Weekly Schedule
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your availability for each day of the week
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {scheduleByDay.map(({ day, schedules }) => (
              <div key={day} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="text-sm font-medium text-gray-900">{day}</h4>
                </div>
                <div className="p-4">
                  {schedules.length > 0 ? (
                    schedules.map((s) => (
                      <div key={s.id} className="flex items-center justify-between mb-2 last:mb-0">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Not available</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add Availability
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                              Day of Week
                            </label>
                            <div className="mt-1">
                              <select
                                id="day"
                                name="day"
                                required
                                value={formData.day}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="">Select a day</option>
                                {daysOfWeek.map((day) => (
                                  <option key={day} value={day}>
                                    {day}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                              Start Time
                            </label>
                            <div className="mt-1">
                              <input
                                type="time"
                                name="startTime"
                                id="startTime"
                                required
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                              End Time
                            </label>
                            <div className="mt-1">
                              <input
                                type="time"
                                name="endTime"
                                id="endTime"
                                required
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={closeModal}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;