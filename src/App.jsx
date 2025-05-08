import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import PatientLayout from './layouts/PatientLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import ViewAppointments from './pages/admin/ViewAppointments';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorSchedule from './pages/doctor/Schedule';
import PatientHistory from './pages/doctor/PatientHistory';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import AppointmentHistory from './pages/patient/AppointmentHistory';
import DoctorsList from './pages/patient/DoctorsList';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="appointments" element={<ViewAppointments />} />
          </Route>

          {/* Doctor Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="patients/:id" element={<PatientHistory />} />
          </Route>

          {/* Patient Routes */}
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientLayout />
            </ProtectedRoute>
          }>
            <Route index element={<PatientDashboard />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="appointments" element={<AppointmentHistory />} />
            <Route path="doctors" element={<DoctorsList />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
