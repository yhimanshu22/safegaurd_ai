import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';

interface DashboardPageProps {
  token: string | null;
  userRole: string | null;
}

export default function DashboardPage({ token, userRole }: DashboardPageProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div id="app-section" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4 animate-in slide-in-from-bottom duration-700">
            {userRole === 'moderator' ? 'Moderator Dashboard' : 'Community Feed'}
          </h2>
          <p className="text-gray-500 font-medium max-w-2xl mx-auto animate-in fade-in duration-1000">
            {userRole === 'moderator' 
              ? 'Real-time analytics and content oversight for your platform.' 
              : 'Secure, real-time sharing for your community.'}
          </p>
        </div>
        <Dashboard token={token} userRole={userRole} />
      </div>
      <Footer />
    </div>
  );
}
