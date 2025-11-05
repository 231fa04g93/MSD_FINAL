import React from 'react';

const Navbar = ({ user, currentPage, setCurrentPage, handleLogout }) => (
  <nav className="bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-50 mb-12">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <div
        className="font-bold text-xl text-gray-800 cursor-pointer"
        onClick={() => setCurrentPage(user ? 'dashboard' : 'home')}
      >
        FinancePal
      </div>
      <div className="flex items-center space-x-6">
        {user ? (
          <>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className={`nav-link ${currentPage === 'profile' ? 'active' : ''}`}
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-red-700 transition-colors duration-300 text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentPage('home')}
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('login')}
              className="bg-gray-800 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-900 transition-colors duration-300 text-sm"
            >
              Login
            </button>
            <button
              onClick={() => setCurrentPage('signup')}
              className={`nav-link ${currentPage === 'signup' ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>
  </nav>
);

export default Navbar;
