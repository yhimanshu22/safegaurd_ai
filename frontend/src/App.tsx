import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import DashboardPage from './pages/DashboardPage';
import AuthModal from './components/AuthModal';

const API_BASE = "http://localhost:8000";

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  total_samples: number;
}

export default function App() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));

  const handleAuthSuccess = (newToken: string, newUsername: string, newRole: string) => {
    setToken(newToken);
    setUsername(newUsername);
    setUserRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    localStorage.setItem('userRole', newRole);
    setShowAuthModal(false);
    
    // Redirect to dashboard
    window.location.href = "/dashboard";
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    window.location.href = "/";
  };

  const fetchMetrics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/metrics`);
      setMetrics(res.data);
    } catch (e) {
      console.error("Failed to fetch metrics", e);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-gray-900">
        <Navbar 
          isAuthenticated={!!token}
          username={username}
          onLoginClick={() => setShowAuthModal(true)}
          onSignupClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />
        
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />

        <main>
          <Routes>
            <Route path="/" element={
              <Home 
                metrics={metrics} 
                token={token} 
                onAuth={() => setShowAuthModal(true)} 
                userRole={userRole}
              />
            } />
            <Route path="/dashboard" element={
              token ? <DashboardPage token={token} userRole={userRole} /> : <Navigate to="/" />
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
