import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalPatients: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock doctor ID for demo purposes
  const doctorId = 1; // In a real app, this would come from the authenticated user

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch appointments for this doctor
        const appointmentsRes = await api.getDoctorAppointments(doctorId);
        const appointments = appointmentsRes.data;
        
        // Fetch patients for patient names
        const patientsRes = await api.getPatients();
        const patients = patientsRes.data;

        // Calculate stats
        const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
        const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
        const completedAppointments = appointments.filter(a => a.status === 'completed').length;
        const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
        
        // Get unique patient count
        const uniquePatientIds = [...new Set(appointments.map(a => a.patientId))];

        setStats({
          totalAppointments: appointments.length,
          pendingAppointments,
          confirmedAppointments,
          completedAppointments,
          cancelledAppointments,
          totalPatients: uniquePatientIds.length,
        });

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Filter today's appointments
        const todayAppts = appointments
          .filter(a => a.date === today && (a.status === 'confirmed' || a.status === 'pending'))
          .map(appointment => {
            const patient = patients.find(p => p.id === appointment.patientId);
            return {
              ...appointment,
              patientName: patient ? patient.name : 'Unknown Patient',
            };
          })
          .sort((a, b) => {
            // Sort by time
            return a.time.localeCompare(b.time);
          });

        // Filter upcoming appointments (future dates, not today)
        const upcomingAppts = appointments
          .filter(a => {
            return a.date > today && (a.status === 'confirmed' || a.status === 'pending');
          })
          .map(appointment => {
            const patient = patients.find(p => p.id === appointment.patientId);
            return {
              ...appointment,
              patientName: patient ? patient.name : 'Unknown Patient',
            };
          })
          .sort((a, b) => {
            // Sort by date, then time
            if (a.date !== b.date) {
              return a.date.localeCompare(b.date);
            }
            return a.time.localeCompare(b.time);
          })
          .slice(0, 5); // Get only the next 5 upcoming appointments

        setTodayAppointments(todayAppts);
        setUpcomingAppointments(upcomingAppts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [doctorId]);

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
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await api.updateAppointment(id, { status });
      toast.success(`Appointment ${status}`);
      
      // Refresh the data
      const appointmentsRes = await api.getDoctorAppointments(doctorId);
      const appointments = appointmentsRes.data;
      const patientsRes = await api.getPatients();
      const patients = patientsRes.data;
      
      // Update today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = appointments
        .filter(a => a.date === today && (a.status === 'confirmed' || a.status === 'pending'))
        .map(appointment => {
          const patient = patients.find(p => p.id === appointment.patientId);
          return {
            ...appointment,
            patientName: patient ? patient.name : 'Unknown Patient',
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));
      
      setTodayAppointments(todayAppts);
      
      // Update upcoming appointments
      const upcomingAppts = appointments
        .filter(a => {
          return a.date > today && (a.status === 'confirmed' || a.status === 'pending');
        })
        .map(appointment => {
          const patient = patients.find(p => p.id === appointment.patientId);
          return {
            ...appointment,
            patientName: patient ? patient.name : 'Unknown Patient',
          };
        })
        .sort((a, b) => {
          if (a.date !== b.date) {
            return a.date.localeCompare(b.date);
          }
          return a.time.localeCompare(b.time);
        })
        .slice(0, 5);
      
      setUpcomingAppointments(upcomingAppts);
      
      // Update stats
      const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
      const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
      const completedAppointments = appointments.filter(a => a.status === 'completed').length;
      const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
      
      setStats({
        ...stats,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
      });
    } catch (error) {
      toast.error('Failed to update appointment status');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, Dr. {user?.name || 'Smith'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Appointments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalAppointments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Appointments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.pendingAppointments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Appointments</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.completedAppointments}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalPatients}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Today's Appointments
          </h3>
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {todayAppointments.length} appointments
          </span>
        </div>
        <div className="border-t border-gray-200">
          {todayAppointments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {todayAppointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white font-medium">{appointment.patientName.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">
                          {appointment.time} - {appointment.notes || 'No notes'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(appointment.status)}
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upcoming Appointments
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your next scheduled appointments
          </p>
        </div>
        <div className="border-t border-gray-200">
          {upcomingAppointments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white font-medium">{appointment.patientName.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">
                          {appointment.date} at {appointment.time}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.notes || 'No notes'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(appointment.status)}
                      <div className="flex space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No upcoming appointments scheduled</p>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm">
            <a href="/doctor/appointments" className="font-medium text-green-600 hover:text-green-500">
              View all appointments
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;