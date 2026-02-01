import React from 'react';
import { LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const isRecruiter = user?.role === 'recruiter';

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link
          to={isRecruiter ? '/dashboard' : '/candidate-jobs'}
          className="text-2xl font-bold text-blue-600"
        >
          Recruit AI
        </Link>

        <div className="flex items-center gap-6">
          {user && (
            <>
              <span className="text-gray-600">
                {isRecruiter ? 'Recruiter' : 'Candidate'}: {user.name}
              </span>
              {!isRecruiter && (
                <Link
                  to="/candidate-dashboard"
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  My Applications
                </Link>
              )}
            </>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
