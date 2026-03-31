import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BentoGrid from './components/BentoGrid';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';

const API_BASE = "http://localhost:8000";

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  total_samples: number;
}

export default function App() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

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
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <BentoGrid metrics={metrics} />
        <div className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Try the Live Demo</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Experience our sub-200ms moderation in real-time. Post content and see how our AI labels it instantly.</p>
            </div>
            <Dashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
