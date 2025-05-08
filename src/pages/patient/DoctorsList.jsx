import React, { useState, useEffect } from 'react';
import { User, Search, X, Phone, Mail, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

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
        <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse our specialists and their availability
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </div>
      </div>

      {/* Doctors List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Doctors ({filteredDoctors.length})
          </h3>
          <Link
            to="/patient/book-appointment"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Book Appointment
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {filteredDoctors.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredDoctors.map((doctor) => (
                <li key={doctor.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium text-lg">{doctor.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-lg font-medium text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-purple-600 font-medium">{doctor.specialty}</div>
                      </div>
                    </div>
                    <Link
                      to="/patient/book-appointment"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Book Appointment
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>{doctor.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>Available: {doctor.availability ? doctor.availability.join(', ') : 'Not set'}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorsList;