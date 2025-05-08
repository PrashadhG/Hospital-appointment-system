import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Calendar, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/doctors', icon: <UserPlus size={20} />, label: 'Manage Doctors' },
    { to: '/admin/patients', icon: <Users size={20} />, label: 'Manage Patients' },
    { to: '/admin/appointments', icon: <Calendar size={20} />, label: 'View Appointments' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-blue-600">MediCare Admin</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {link.icon}
                  <span className="ml-3">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@hospital.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-gray-600 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="ml-4 md:ml-0 text-xl font-semibold text-gray-800">
                Admin Portal
              </h1>
            </div>
            <div className="flex items-center">
              <span className="hidden md:inline-block mr-4 text-sm text-gray-600">
                Welcome, {user?.name || 'Admin'}
              </span>
              <button
                onClick={handleLogout}
                className="md:hidden p-2 text-red-600 rounded-full hover:bg-red-50"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <nav className="p-4">
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      end={link.to === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center p-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.icon}
                      <span className="ml-3">{link.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;