import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock patient ID for demo purposes
  const patientId = 1; // In a real app, this would come from the authenticated user

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch appointments for this patient
        const appointmentsRes = await api.getPatientAppointments(patientId);
        const appointments = appointmentsRes.data;
        
        // Fetch doctors for doctor names
        const doctorsRes = await api.getDoctors();
        const doctors = doctorsRes.data;

        // Calculate stats
        const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
        const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

        setStats({
          totalAppointments: appointments.length,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          cancelledAppointments,
        });

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Filter upcoming appointments (today and future dates)
        const upcomingAppts = appointments
          .filter(a => {
            return a.date >= today && (a.status === 'confirmed' || a.status === 'pending');
          })
          .map(appointment => {
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            return {
              ...appointment,
              doctorName: doctor ? doctor.name : 'Unknown Doctor',
              specialty: doctor ? doctor.specialty : '',
            };
          })
          .sort((a, b) => {
            // Sort by date, then time
            if (a.date !== b.date) {
              return new Date(a.date) - new Date(b.date);
            }
            return a.time.localeCompare(b.time);
          })
          .slice(0, 3); // Get only the next 3 upcoming appointments

        // Filter recent completed appointments
        const recentAppts = appointments
          .filter(a => a.status === 'completed')
          .map(appointment => {
            const doctor = doctors.find(d => d.id === appointment.doctorId);
            return {
              ...appointment,
              doctorName: doctor ? doctor.name : 'Unknown Doctor',
              specialty: doctor ? doctor.specialty : '',
            };
          })
          .sort((a, b) => {
            // Sort by date (most recent first)
            return new Date(b.date) - new Date(a.date);
          })
          .slice(0, 3); // Get only the 3 most recent appointments

        setUpcomingAppointments(upcomingAppts);
        setRecentAppointments(recentAppts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [patientId]);

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
        
        // Update the upcoming appointments list
        setUpcomingAppointments(upcomingAppointments.filter(a => a.id !== id));
        
        // Update stats
        setStats({
          ...stats,
          confirmedAppointments: stats.confirmedAppointments - 1,
          pendingAppointments: stats.pendingAppointments - 1,
          cancelledAppointments: stats.cancelledAppointments + 1,
        });
      } catch (error) {
        toast.error('Failed to cancel appointment');
        console.error(error);
      }
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.name || 'John Doe'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/patient/book-appointment"
          className="bg-white overflow-hidden shadow rounded-lg border border-purple-100 hover:border-purple-200 transition-colors"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Book New Appointment</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Schedule a visit with one of our doctors
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/patient/doctors"
          className="bg-white overflow-hidden shadow rounded-lg border border-purple-100 hover:border-purple-200 transition-colors"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Find Doctors</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Browse our specialists and their availability
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Appointment Statistics
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <div className="flex flex-col items-center">
                <Calendar className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-sm text-purple-700">Total</p>
                <p className="text-2xl font-semibold text-purple-800">{stats.totalAppointments}</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex flex-col items-center">
                <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-semibold text-yellow-800">{stats.pendingAppointments}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-green-700">Confirmed</p>
                <p className="text-2xl font-semibold text-green-800">{stats.confirmedAppointments}</p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-sm text-blue-700">Completed</p>
                <p className="text-2xl font-semibold text-blue-800">{stats.completedAppointments}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upcoming Appointments
          </h3>
          <Link
            to="/patient/appointments"
            className="text-sm font-medium text-purple-600 hover:text-purple-500"
          >
            View all
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {upcomingAppointments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium">{appointment.doctorName.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                        <div className="text-xs text-gray-500">{appointment.specialty}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-gray-900">{appointment.date}</div>
                      <div className="text-sm text-gray-500">{appointment.time}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="text-sm text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No upcoming appointments</p>
              <Link
                to="/patient/book-appointment"
                className="mt-2 inline-block text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                Book an appointment
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Appointments
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {recentAppointments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentAppointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium">{appointment.doctorName.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                        <div className="text-xs text-gray-500">{appointment.specialty}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-gray-900">{appointment.date}</div>
                      <div className="text-sm text-gray-500">{appointment.time}</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      {appointment.notes || 'No notes available'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No recent appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;