import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';
import Footer from '../components/Footer';
import { ArrowRight } from 'lucide-react';

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
      
      {/* Active Metrics Bento */}
      <BentoGrid metrics={metrics} />

      {/* Moderation in Action Section */}
      <div className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Moderation in <span className="text-[#f55064]">Action</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Experience the power of real-time AI classification across text, links, and visual media.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ShowcaseCard 
              img="/images/showcase/showcase-intro.png" 
              title="Real-time Feed" 
              desc="Seamlessly integrated moderation feed with sub-200ms latency."
            />
            <ShowcaseCard 
              img="/images/showcase/showcase-misinfo.png" 
              title="Identify Scams" 
              desc="Advanced NLP to detect phishing, scams, and misinformation."
              pill="MISINFORMATION"
              pillColor="bg-purple-100 text-purple-600"
            />
            <ShowcaseCard 
              img="/images/showcase/showcase-safe.png" 
              title="Nurture Community" 
              desc="Reward positive interactions and maintain common-sense safety."
              pill="SAFE"
              pillColor="bg-emerald-100 text-emerald-600"
            />
            <ShowcaseCard 
              img="/images/showcase/showcase-image.png" 
              title="Visual Safety" 
              desc="Multi-modal AI that understands images and visual context."
              pill="FLAGGED"
              pillColor="bg-amber-100 text-amber-600"
            />
          </div>
        </div>
      </div>

      {/* Why Choose SafeGuard Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
               <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                 Built for the <br />
                 <span className="text-[#f55064]">Future of Trust.</span>
               </h2>
               <div className="space-y-8">
                 <FeatureItem title="Hybrid Waterfall AI" desc="Our multi-layer pass architecture ensures cost efficiency without sacrificing accuracy." />
                 <FeatureItem title="Enterprise RBAC" desc="Sophisticated Role-Based Access Control out of the box for teams of any size." />
                 <FeatureItem title="Developer First" desc="A clean, modern API and dashboard built with the latest industry best practices." />
               </div>
             </div>
             <div className="relative">
               <div className="absolute -inset-4 bg-gradient-to-tr from-[#f5506420] to-transparent rounded-[40px] blur-2xl" />
               <div className="glass rounded-[40px] border border-white p-2 overflow-hidden shadow-2xl skew-x-1 rotate-1 scale-95 group transition duration-700 hover:rotate-0 hover:scale-100">
                  <img src="/dashboard-preview.png" alt="Showcase" className="rounded-[32px] w-full" />
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Protect Your Community</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            SafeGuard AI provides real-time moderation that feels like magic. 
            Join thousands of platforms securing their content today.
          </p>
          {!token && (
            <button 
              onClick={onAuth}
              className="btn-primary mt-10 px-12 py-5 text-lg shadow-xl shadow-red-100 flex items-center justify-center gap-3 mx-auto"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

function ShowcaseCard({ img, title, desc, pill, pillColor }: any) {
  return (
    <div className="group bg-white rounded-[32px] border border-gray-100 p-3 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
      <div className="relative aspect-[4/3] rounded-2x overflow-hidden mb-4 rounded-2xl bg-gray-50 border border-gray-50">
        <img src={img} alt={title} className="w-full h-full object-cover transform transition duration-1000 group-hover:scale-110" />
        {pill && (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${pillColor} backdrop-blur-md shadow-sm`}>
            {pill}
          </div>
        )}
      </div>
      <div className="px-3 pb-4">
        <h3 className="font-extrabold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeatureItem({ title, desc }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#f55064]">
        <div className="w-2 h-2 rounded-full bg-[#f55064]" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
