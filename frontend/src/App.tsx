import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
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
    // Smooth scroll to the app section after login
    setTimeout(() => {
      document.getElementById('app-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLogout = () => {
    setToken(null);
    setUsername(null);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
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
        <Hero onStartClick={() => token ? document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' }) : setShowAuthModal(true)} />
        {userRole === 'moderator' && <BentoGrid metrics={metrics} />}
        <div id="app-section" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {userRole === 'moderator' ? 'Moderator Dashboard' : 'Community Feed'}
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {userRole === 'moderator' 
                    ? 'Manage pending content and view platform metrics in real-time.' 
                    : 'See what others are sharing and contribute to the community.'}
                </p>
                {!token && (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="mt-6 text-[#f55064] font-bold hover:underline"
                  >
                    Login to start sharing posts →
                  </button>
                )}
            </div>
            <Dashboard token={token} userRole={userRole} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
