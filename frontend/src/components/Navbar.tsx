import React from 'react';
import { Shield } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
          <Shield className="w-8 h-8 text-[#f55064]" />
          <span className="text-xl font-bold tracking-tight text-gray-900">SafeGuard AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-[#f55064] transition-colors">Features</a>
          <a href="#metrics" className="text-sm font-medium text-gray-600 hover:text-[#f55064] transition-colors">Metrics</a>
          <a href="#demo" className="text-sm font-medium text-gray-600 hover:text-[#f55064] transition-colors">Live Demo</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2">Log in</button>
          <button className="btn-primary text-sm px-5 py-2.5">Start for Free</button>
        </div>
      </div>
    </nav>
  );
}
