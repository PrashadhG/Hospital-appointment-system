import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api', // In a real app, this would be your API URL
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API service for demo purposes
const mockData = {
  doctors: [
    { id: 1, name: 'Dr. John Smith', specialty: 'Cardiology', email: 'john.smith@hospital.com', phone: '123-456-7890', availability: ['Monday', 'Wednesday', 'Friday'] },
    { id: 2, name: 'Dr. Sarah Johnson', specialty: 'Neurology', email: 'sarah.johnson@hospital.com', phone: '123-456-7891', availability: ['Tuesday', 'Thursday'] },
    { id: 3, name: 'Dr. Michael Brown', specialty: 'Orthopedics', email: 'michael.brown@hospital.com', phone: '123-456-7892', availability: ['Monday', 'Tuesday', 'Friday'] },
    { id: 4, name: 'Dr. Emily Davis', specialty: 'Pediatrics', email: 'emily.davis@hospital.com', phone: '123-456-7893', availability: ['Wednesday', 'Thursday', 'Friday'] },
    { id: 5, name: 'Dr. Robert Wilson', specialty: 'Dermatology', email: 'robert.wilson@hospital.com', phone: '123-456-7894', availability: ['Monday', 'Thursday'] },
  ],
  patients: [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7895', dob: '1985-05-15' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', phone: '123-456-7896', dob: '1990-10-20' },
    { id: 3, name: 'Michael Johnson', email: 'michael.johnson@example.com', phone: '123-456-7897', dob: '1978-03-25' },
    { id: 4, name: 'Emily Brown', email: 'emily.brown@example.com', phone: '123-456-7898', dob: '1995-12-10' },
    { id: 5, name: 'David Wilson', email: 'david.wilson@example.com', phone: '123-456-7899', dob: '1982-07-30' },
  ],
  appointments: [
    { id: 1, patientId: 1, doctorId: 1, date: '2025-06-15', time: '09:00', status: 'confirmed', notes: 'Regular checkup' },
    { id: 2, patientId: 2, doctorId: 3, date: '2025-06-16', time: '10:30', status: 'pending', notes: 'Follow-up appointment' },
    { id: 3, patientId: 3, doctorId: 2, date: '2025-06-17', time: '14:00', status: 'completed', notes: 'Prescription renewal' },
    { id: 4, patientId: 4, doctorId: 5, date: '2025-06-18', time: '11:15', status: 'cancelled', notes: 'Skin examination' },
    { id: 5, patientId: 5, doctorId: 4, date: '2025-06-19', time: '15:45', status: 'confirmed', notes: 'Annual checkup' },
    { id: 6, patientId: 1, doctorId: 2, date: '2025-06-20', time: '13:30', status: 'pending', notes: 'Consultation' },
    { id: 7, patientId: 2, doctorId: 1, date: '2025-06-21', time: '10:00', status: 'confirmed', notes: 'Blood test results' },
    { id: 8, patientId: 3, doctorId: 5, date: '2025-06-22', time: '16:15', status: 'pending', notes: 'New patient visit' },
    { id: 9, patientId: 4, doctorId: 3, date: '2025-06-23', time: '09:45', status: 'confirmed', notes: 'X-ray review' },
    { id: 10, patientId: 5, doctorId: 4, date: '2025-06-24', time: '14:30', status: 'pending', notes: 'Vaccination' },
  ],
  schedules: [
    { id: 1, doctorId: 1, day: 'Monday', startTime: '09:00', endTime: '17:00' },
    { id: 2, doctorId: 1, day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
    { id: 3, doctorId: 1, day: 'Friday', startTime: '09:00', endTime: '17:00' },
    { id: 4, doctorId: 2, day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
    { id: 5, doctorId: 2, day: 'Thursday', startTime: '08:00', endTime: '16:00' },
    { id: 6, doctorId: 3, day: 'Monday', startTime: '10:00', endTime: '18:00' },
    { id: 7, doctorId: 3, day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
    { id: 8, doctorId: 3, day: 'Friday', startTime: '10:00', endTime: '18:00' },
    { id: 9, doctorId: 4, day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
    { id: 10, doctorId: 4, day: 'Thursday', startTime: '09:00', endTime: '17:00' },
    { id: 11, doctorId: 4, day: 'Friday', startTime: '09:00', endTime: '17:00' },
    { id: 12, doctorId: 5, day: 'Monday', startTime: '08:00', endTime: '16:00' },
    { id: 13, doctorId: 5, day: 'Thursday', startTime: '08:00', endTime: '16:00' },
  ],
};

// Mock API methods
const mockApi = {
  // Doctor methods
  getDoctors: () => Promise.resolve({ data: mockData.doctors }),
  getDoctor: (id) => Promise.resolve({ data: mockData.doctors.find(d => d.id === parseInt(id)) }),
  createDoctor: (doctor) => {
    const newDoctor = { ...doctor, id: mockData.doctors.length + 1 };
    mockData.doctors.push(newDoctor);
    return Promise.resolve({ data: newDoctor });
  },
  updateDoctor: (id, doctor) => {
    const index = mockData.doctors.findIndex(d => d.id === parseInt(id));
    if (index !== -1) {
      mockData.doctors[index] = { ...mockData.doctors[index], ...doctor };
      return Promise.resolve({ data: mockData.doctors[index] });
    }
    return Promise.reject(new Error('Doctor not found'));
  },
  deleteDoctor: (id) => {
    const index = mockData.doctors.findIndex(d => d.id === parseInt(id));
    if (index !== -1) {
      mockData.doctors.splice(index, 1);
      return Promise.resolve({ data: { success: true } });
    }
    return Promise.reject(new Error('Doctor not found'));
  },

  // Patient methods
  getPatients: () => Promise.resolve({ data: mockData.patients }),
  getPatient: (id) => Promise.resolve({ data: mockData.patients.find(p => p.id === parseInt(id)) }),
  createPatient: (patient) => {
    const newPatient = { ...patient, id: mockData.patients.length + 1 };
    mockData.patients.push(newPatient);
    return Promise.resolve({ data: newPatient });
  },
  updatePatient: (id, patient) => {
    const index = mockData.patients.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      mockData.patients[index] = { ...mockData.patients[index], ...patient };
      return Promise.resolve({ data: mockData.patients[index] });
    }
    return Promise.reject(new Error('Patient not found'));
  },
  deletePatient: (id) => {
    const index = mockData.patients.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      mockData.patients.splice(index, 1);
      return Promise.resolve({ data: { success: true } });
    }
    return Promise.reject(new Error('Patient not found'));
  },

  // Appointment methods
  getAppointments: () => Promise.resolve({ data: mockData.appointments }),
  getAppointment: (id) => Promise.resolve({ data: mockData.appointments.find(a => a.id === parseInt(id)) }),
  getDoctorAppointments: (doctorId) => Promise.resolve({ 
    data: mockData.appointments.filter(a => a.doctorId === parseInt(doctorId)) 
  }),
  getPatientAppointments: (patientId) => Promise.resolve({ 
    data: mockData.appointments.filter(a => a.patientId === parseInt(patientId)) 
  }),
  createAppointment: (appointment) => {
    const newAppointment = { ...appointment, id: mockData.appointments.length + 1 };
    mockData.appointments.push(newAppointment);
    return Promise.resolve({ data: newAppointment });
  },
  updateAppointment: (id, appointment) => {
    const index = mockData.appointments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      mockData.appointments[index] = { ...mockData.appointments[index], ...appointment };
      return Promise.resolve({ data: mockData.appointments[index] });
    }
    return Promise.reject(new Error('Appointment not found'));
  },
  deleteAppointment: (id) => {
    const index = mockData.appointments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      mockData.appointments.splice(index, 1);
      return Promise.resolve({ data: { success: true } });
    }
    return Promise.reject(new Error('Appointment not found'));
  },

  // Schedule methods
  getDoctorSchedule: (doctorId) => Promise.resolve({ 
    data: mockData.schedules.filter(s => s.doctorId === parseInt(doctorId)) 
  }),
  updateSchedule: (id, schedule) => {
    const index = mockData.schedules.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      mockData.schedules[index] = { ...mockData.schedules[index], ...schedule };
      return Promise.resolve({ data: mockData.schedules[index] });
    }
    return Promise.reject(new Error('Schedule not found'));
  },
  createSchedule: (schedule) => {
    const newSchedule = { ...schedule, id: mockData.schedules.length + 1 };
    mockData.schedules.push(newSchedule);
    return Promise.resolve({ data: newSchedule });
  },
  deleteSchedule: (id) => {
    const index = mockData.schedules.findIndex(s => s.id === parseInt(id));
    if (index !== -1) {
      mockData.schedules.splice(index, 1);
      return Promise.resolve({ data: { success: true } });
    }
    return Promise.reject(new Error('Schedule not found'));
  },
};

// Override axios methods with mock implementations for demo
api.getDoctors = mockApi.getDoctors;
api.getDoctor = mockApi.getDoctor;
api.createDoctor = mockApi.createDoctor;
api.updateDoctor = mockApi.updateDoctor;
api.deleteDoctor = mockApi.deleteDoctor;

api.getPatients = mockApi.getPatients;
api.getPatient = mockApi.getPatient;
api.createPatient = mockApi.createPatient;
api.updatePatient = mockApi.updatePatient;
api.deletePatient = mockApi.deletePatient;

api.getAppointments = mockApi.getAppointments;
api.getAppointment = mockApi.getAppointment;
api.getDoctorAppointments = mockApi.getDoctorAppointments;
api.getPatientAppointments = mockApi.getPatientAppointments;
api.createAppointment = mockApi.createAppointment;
api.updateAppointment = mockApi.updateAppointment;
api.deleteAppointment = mockApi.deleteAppointment;

api.getDoctorSchedule = mockApi.getDoctorSchedule;
api.updateSchedule = mockApi.updateSchedule;
api.createSchedule = mockApi.createSchedule;
api.deleteSchedule = mockApi.deleteSchedule;

export default api;