import React from 'react';
import { Shield, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-8 h-8 text-[#f55064]" />
              <span className="text-xl font-bold tracking-tight text-gray-900">SafeGuard AI</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Empowering communities with high-speed, multi-modal content moderation powered by Groq LPU™ technology.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={<Github />} />
              <SocialLink icon={<Twitter />} />
              <SocialLink icon={<Linkedin />} />
            </div>
          </div>
          
          <FooterSection title="Product" links={["Features", "Pricing", "Integration", "Documentation"]} />
          <FooterSection title="Company" links={["About Us", "Careers", "Blog", "Privacy Policy"]} />
          <FooterSection title="Support" links={["Help Center", "Community", "Contact Sales", "Status"]} />
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">© 2026 SafeGuard AI Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">Privacy</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">Terms</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, links }: { title: string, links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">{title}</h4>
      <ul className="space-y-4">
        {links.map(link => (
          <li key={link}>
            <a href="#" className="text-sm text-gray-500 hover:text-[#f55064] transition-colors">{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ icon }: { icon: React.ReactNode }) {
  return (
    <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#f55064] hover:bg-red-50 transition-all">
      {React.cloneElement(icon as React.ReactElement, { size: 18 })}
    </a>
  );
}
