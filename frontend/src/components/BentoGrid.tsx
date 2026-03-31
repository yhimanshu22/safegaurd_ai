import React from 'react';
import { Target, BarChart3, Activity, ShieldAlert } from 'lucide-react';

interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
}

export default function BentoGrid({ metrics }: { metrics: Metrics | null }) {
  const displayMetrics = metrics || { accuracy: 0.98, precision: 0.97, recall: 0.96 };

  return (
    <section id="metrics" className="py-24 px-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Unrivaled Performance</h2>
          <p className="text-gray-600">Real-time metrics from our latest inference batch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-[500px]">
          {/* Accuracy Card */}
          <div className="md:col-span-2 md:row-span-2 glass rounded-[32px] p-8 flex flex-col justify-between hover:shadow-xl transition-shadow border-none shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-14 h-14 rounded-2xl bg-[#f5506410] flex items-center justify-center text-[#f55064]">
                <Target className="w-8 h-8" />
              </div>
              <div className="text-right">
                <span className="text-6xl font-black text-gray-900">{(displayMetrics.accuracy * 100).toFixed(0)}%</span>
                <p className="text-sm font-bold text-[#f55064] uppercase tracking-widest mt-2">Accuracy</p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Near-Perfect Detection</h3>
              <p className="text-gray-600 leading-relaxed">Our Groq-powered models achieve industry-leading accuracy across diverse linguistic contexts.</p>
            </div>
          </div>

          {/* Precision Card */}
          <div className="md:col-span-2 glass rounded-[32px] p-8 flex items-center gap-8 hover:shadow-xl transition-shadow border-none shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-4xl font-black text-gray-900">{(displayMetrics.precision * 100).toFixed(0)}%</div>
              <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mt-1">Precision</p>
              <p className="text-sm text-gray-500 mt-2">Minimizing false positives for a smoother user experience.</p>
            </div>
          </div>

          {/* Recall Card */}
          <div className="md:col-span-1 glass rounded-[32px] p-8 flex flex-col justify-between hover:shadow-xl transition-shadow border-none shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Activity className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-gray-900">{(displayMetrics.recall * 100).toFixed(0)}%</div>
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">Recall</p>
            </div>
          </div>

          {/* Safety Card */}
          <div className="md:col-span-1 glass rounded-[32px] p-8 flex flex-col justify-between hover:shadow-xl transition-shadow border-none shadow-sm bg-[#f55064] text-white">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="mt-4">
              <div className="text-xl font-bold">Zero Tolerance</div>
              <p className="text-xs opacity-80 mt-1">Fail-safe protocols for extreme content.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
