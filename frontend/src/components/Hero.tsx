import React from 'react';
import { ArrowRight, Zap, ShieldCheck, Globe } from 'lucide-react';

export default function Hero({ onStartClick }: { onStartClick?: () => void }) {
  return (
    <div className="relative pt-20 pb-16 px-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-[#f5506410] to-transparent rounded-full blur-3xl -z-10" />
      
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#f55064] text-xs font-bold uppercase tracking-wider mb-8 animate-bounce">
          <Zap className="w-3 h-3 fill-current" />
          Powered by Groq LPU™
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
          Modern Moderation for <br />
          <span className="text-[#f55064]">Modern Communities.</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate content moderation engine. Secure your platform with sub-200ms AI inference, multi-modal safety, and a dashboard that feels like magic.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={onStartClick}
            className="btn-primary text-lg px-10 py-4 w-full sm:w-auto flex items-center justify-center gap-2 shadow-xl shadow-red-200"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-10 py-4 text-lg font-semibold text-gray-700 hover:text-gray-900 transition-all hover:bg-gray-50 rounded-2xl w-full sm:w-auto">
            View Live Demo
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
          <Stat label="Real-time Analysis" icon={<Zap className="w-5 h-5" />} />
          <Stat label="Multi-modal Support" icon={<ShieldCheck className="w-5 h-5" />} />
          <Stat label="Global Scalability" icon={<Globe className="w-5 h-5" />} className="hidden md:flex" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, icon, className = "" }: { label: string, icon: React.ReactNode, className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gray-500 font-medium ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#f55064]">
        {icon}
      </div>
      <span>{label}</span>
    </div>
  );
}
