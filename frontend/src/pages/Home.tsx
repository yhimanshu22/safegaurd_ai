import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import Footer from '../components/Footer';

interface HomeProps {
  metrics: any;
  token: string | null;
  onAuth: () => void;
  userRole: string | null;
}

export default function Home({ metrics, token, onAuth }: HomeProps) {
  return (
    <>
      <Hero onStartClick={() => token ? (window.location.href = '/dashboard') : onAuth()} />
      
      {/* Product Preview Section */}
      <div className="bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#f55064] to-[#ff8a9a] rounded-[40px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative glass rounded-[40px] border border-gray-100 overflow-hidden shadow-2xl">
              <img 
                src="/dashboard-preview.png" 
                alt="SafeGuard AI Dashboard Preview" 
                className="w-full object-cover transform transition duration-700 hover:scale-[1.02]"
              />
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -top-6 -right-6 glass px-6 py-4 rounded-3xl shadow-xl border border-white/50 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-gray-900">Live AI Moderation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show BentoGrid (Metrics) on landing page for anyone to see features */}
      <BentoGrid metrics={metrics} />
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Protect Your Community</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            SafeGuard AI provides real-time moderation that feels like magic. 
            Join thousands of platforms securing their content today.
          </p>
          {!token && (
            <button 
              onClick={onAuth}
              className="mt-6 text-[#f55064] font-bold hover:underline"
            >
              Get started for free →
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
