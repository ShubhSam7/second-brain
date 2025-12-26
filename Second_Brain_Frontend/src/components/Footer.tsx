import { BrainCircuit, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 pt-20 pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

        {/* Column 1: Brand & Mission */}
        <div className="col-span-1 space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg shadow-orange-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SecondBrain</span>
          </div>
          <p className="text-neutral-400 text-sm leading-relaxed">
            Your personal infrastructure for knowledge. Capture, organize, and utilize your digital life with AI-powered tools built on robust technologies.
          </p>
          <div className="flex gap-4 text-neutral-500">
            <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>

        {/* Column 2: Product */}
        <div>
          <h4 className="text-white font-semibold mb-6">Product</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li><a href="#" className="hover:text-orange-400 transition-colors">Features</a></li>
            <li><a href="#" className="hover:text-orange-400 transition-colors">AI Integration</a></li>
            <li><a href="#" className="hover:text-orange-400 transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-orange-400 transition-colors">Changelog</a></li>
          </ul>
        </div>

         {/* Column 3: Resources */}
         <div>
          <h4 className="text-white font-semibold mb-6">Resources</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li><a href="#" className="hover:text-orange-400 transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-orange-400 transition-colors">API Reference</a></li>
            <li><a href="#" className="hover:text-orange-400 transition-colors">Community Discord</a></li>
          </ul>
        </div>

         {/* Column 4: Legal */}
         <div>
          <h4 className="text-white font-semibold mb-6">Legal</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-neutral-900 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
        <p>© {new Date().getFullYear()} SecondBrain Inc. All rights reserved.</p>
        <p className="mt-4 md:mt-0">
          Built with React, Tailwind, Supabase & Prisma.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
