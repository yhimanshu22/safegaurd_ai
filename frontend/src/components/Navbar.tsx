import React from 'react';
import { Shield, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  username: string | null;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
}

export default function Navbar({ isAuthenticated, username, onLoginClick, onSignupClick, onLogout }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
          <Shield className="w-8 h-8 text-[#f55064]" />
          <span className="text-xl font-bold tracking-tight text-gray-900">SafeGuard AI</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-[#f55064] transition-colors">Home</Link>
          <a href="/#features" className="text-sm font-medium text-gray-600 hover:text-[#f55064] transition-colors">Features</a>
          <a href="/#metrics" className="text-sm font-medium text-gray-600 hover:text-[#f55064] transition-colors">Metrics</a>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-bold text-gray-900 flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all">
              <LayoutDashboard className="w-4 h-4 text-[#f55064]" />
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                <UserIcon className="w-4 h-4 text-[#f55064]" />
                <span className="text-sm font-bold text-gray-700">{username}</span>
              </div>
              <button 
                onClick={onLogout}
                className="p-2.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-[#f55064] transition-all"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2"
              >
                Log in
              </button>
              <button 
                onClick={onSignupClick}
                className="btn-primary text-sm px-5 py-2.5"
              >
                Start for Free
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
