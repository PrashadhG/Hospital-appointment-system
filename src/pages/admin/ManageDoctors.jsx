import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    password: '',
  });

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

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.getDoctors();
      setDoctors(response.data);
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

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const openModal = (doctor = null) => {
    if (doctor) {
      setCurrentDoctor(doctor);
      setFormData({
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialty: doctor.specialty,
        password: '', // Don't populate password for security
      });
    } else {
      setCurrentDoctor(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        password: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentDoctor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (currentDoctor) {
        // Update existing doctor
        await api.updateDoctor(currentDoctor.id, formData);
        toast.success('Doctor updated successfully');
      } else {
        // Create new doctor
        await api.createDoctor(formData);
        toast.success('Doctor created successfully');
      }
      
      fetchDoctors();
      closeModal();
    } catch (error) {
      toast.error(currentDoctor ? 'Failed to update doctor' : 'Failed to create doctor');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.deleteDoctor(id);
        toast.success('Doctor deleted successfully');
        fetchDoctors();
      } catch (error) {
        toast.error('Failed to delete doctor');
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add, edit, or remove doctors from the system
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add New Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search doctors by name, specialty, or email"
          value={searchTerm}
          onChange={handleSearchChange}
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

      {/* Doctors List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredDoctors.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredDoctors.map((doctor) => (
              <li key={doctor.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium">{doctor.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-blue-600">{doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {doctor.specialty}
                      </span>
                      <div className="ml-4 flex-shrink-0 flex">
                        <button
                          onClick={() => openModal(doctor)}
                          className="mr-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span>Phone: {doctor.phone}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <span>
                        Available: {doctor.availability ? doctor.availability.join(', ') : 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No doctors found matching your search criteria</p>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Doctor */}
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
                      {currentDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Full Name
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <div className="mt-1">
                              <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone
                            </label>
                            <div className="mt-1">
                              <input
                                type="tel"
                                name="phone"
                                id="phone"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                              Specialty
                            </label>
                            <div className="mt-1">
                              <select
                                id="specialty"
                                name="specialty"
                                required
                                value={formData.specialty}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                <option value="">Select a specialty</option>
                                {specialties.map((specialty) => (
                                  <option key={specialty} value={specialty}>
                                    {specialty}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="sm:col-span-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                              {currentDoctor ? 'New Password (leave blank to keep current)' : 'Password'}
                            </label>
                            <div className="mt-1">
                              <input
                                type="password"
                                name="password"
                                id="password"
                                required={!currentDoctor}
                                value={formData.password}
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                          >
                            {currentDoctor ? 'Update' : 'Create'}
                          </button>
                          <button
                            type="button"
                            onClick={closeModal}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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

export default ManageDoctors;