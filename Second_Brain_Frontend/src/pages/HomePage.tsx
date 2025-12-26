import Navbar from '../components/Navbar';
import HeroSection from '../components/home/HeroSection';
import FeatureSection from '../components/home/FeatureSection';
import Footer from '../components/Footer';
import { BrainCircuit, Database, Share2, Sparkles } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-orange-500/30 overflow-x-hidden">
      <Navbar />

      {/* Global Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Top Orange Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        <HeroSection />

        {/* --- DETAILED FEATURE SECTIONS (Like Inspiration) --- */}

        {/* Feature 1: AI & Capture - Image Right */}
        <FeatureSection
          badge="Smart Capture"
          title="AI-Powered Knowledge Ingestion"
          description="Stop manually tagging. Our vector database engine analyzes your links, videos, and articles to generate descriptions and categorize them automatically upon save."
          icon={<Sparkles className="text-orange-400" />}
          align="right"
        >
          {/* Abstract Tech Graphic representing AI processing */}
          <div className="relative w-full h-[400px] bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
             {/* Simulated Data Flow Nodes */}
             <div className="relative z-10 flex gap-8">
                <div className="w-24 h-24 bg-neutral-800 border border-orange-500/50 rounded-xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]">Input Link</div>
                <BrainCircuit className="w-12 h-12 text-orange-500 animate-pulse" />
                <div className="w-24 h-24 bg-neutral-800 border border-orange-500/50 rounded-xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]">Vector DB</div>
             </div>
          </div>
        </FeatureSection>

        {/* Feature 2: Infrastructure - Image Left */}
        <FeatureSection
          badge="True Transactional"
          title="Infrastructure-Grade Reliability"
          description="Built on Supabase PostgreSQL with Prisma ORM connection pooling. Your data rests on industry-standard, scalable infrastructure designed for performance and security."
          icon={<Database className="text-orange-400" />}
          align="left"
        >
           {/* Abstract Tech Graphic representing Database */}
          <div className="relative w-full h-[400px] bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-4">
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-orange-500/10 blur-[80px] rounded-full"></div>
             <div className="w-4/5 h-16 border border-neutral-700 bg-neutral-900/80 rounded-lg flex items-center px-4 text-neutral-400 font-mono text-sm shadow-[0_0_15px_rgba(249,115,22,0.1)]">Prisma Client Connection Pool</div>
             <div className="h-8 w-0.5 bg-orange-500/50"></div>
             <div className="w-4/5 h-24 border border-orange-500/30 bg-neutral-900/80 rounded-lg flex items-center justify-center text-orange-200 font-bold text-lg shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                Supabase PostgreSQL (pgvector)
             </div>
          </div>
        </FeatureSection>

        {/* Feature 3: Sharing - Image Right */}
        <FeatureSection
          badge="Collaboration"
          title="Share Your Brain With The World"
          description="Curate collections and generate unique, hashed public links. Share your structured knowledge base without exposing your private dashboard."
          icon={<Share2 className="text-orange-400" />}
          align="right"
        >
           {/* Abstract Graphic representing Sharing */}
          <div className="relative w-full h-[400px] bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center">
              {/* Central Hub */}
              <div className="w-32 h-32 bg-orange-600/20 border border-orange-500 rounded-full flex items-center justify-center relative z-10">
                 <BrainCircuit size={40} className="text-orange-400" />
              </div>
              {/* Orbiting Nodes */}
              <div className="absolute w-[280px] h-[280px] border border-neutral-700 rounded-full animate-spin-slow">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-neutral-800 border border-orange-400 rounded-full"></div>
              </div>
               <div className="absolute w-[200px] h-[200px] border border-neutral-700 rounded-full animate-reverse-spin-slow">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-neutral-800 border border-orange-400 rounded-full"></div>
              </div>
          </div>
        </FeatureSection>

        {/* Final CTA Section */}
        <div className="py-32 text-center relative overflow-hidden">
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-[100px] rounded-full"></div>
           <h2 className="text-4xl font-bold mb-8">Ready to organize your digital life?</h2>
           <button
             onClick={() => window.location.href = '/signup'}
             className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-full transition-all shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] hover:shadow-[0_0_50px_-5px_rgba(234,88,12,0.7)] relative z-10"
           >
             Get Started for Free
           </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
