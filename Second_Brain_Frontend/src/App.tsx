import DashBoard from "./pages/DashBoard";
import Signin from "./pages/Signin";
import SignUp from "./pages/SignUp";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { isAuthenticated, signout, getCurrentUser } from "./lib/api";
import { ArrowRight, Brain, Share2, Layers, Sparkles, Database } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const username = getCurrentUser();

  const handleLogout = () => {
    signout();
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-orange-500/30 overflow-hidden relative">

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Radial Gradient Glow */}
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-500 opacity-20 blur-[100px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg shadow-orange-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">SecondBrain</span>
        </div>

        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400 hidden sm:inline">
                Welcome back, <span className="text-neutral-200">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/signin")}
                className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-orange-400 mb-8 animate-fade-in-up">
          <Sparkles className="w-3 h-3" />
          <span>Powered by GPT-4 & Prisma ORM</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          Your Digital <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
            Second Brain
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Stop losing great ideas. Capture links, articles, and videos with
          <span className="text-neutral-200"> automatic AI categorization</span>.
          Your personal infrastructure for knowledge.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="group relative px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-full transition-all shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] hover:shadow-[0_0_60px_-15px_rgba(234,88,12,0.6)] flex items-center gap-2"
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {!isLoggedIn && (
            <button
              onClick={() => navigate("/signin")}
              className="px-8 py-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-full transition-all flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>

        {/* FEATURE HIGHLIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 text-left">
          <FeatureCard
            icon={<Database className="w-6 h-6 text-orange-400" />}
            title="Supabase Powered"
            desc="Infrastructure-grade database reliability with Prisma ORM connection pooling."
          />
          <FeatureCard
            icon={<Layers className="w-6 h-6 text-orange-400" />}
            title="Smart Sorting"
            desc="Links are automatically categorized by domain and content type upon entry."
          />
          <FeatureCard
            icon={<Share2 className="w-6 h-6 text-orange-400" />}
            title="Share Brain"
            desc="Generate unique hashed links to share specific collections with the world."
          />
        </div>
      </main>
    </div>
  );
}

// Feature card component
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-orange-500/30 transition-colors backdrop-blur-sm group">
    <div className="mb-4 p-3 bg-neutral-800 rounded-lg inline-block group-hover:bg-orange-500/10 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-neutral-100">{title}</h3>
    <p className="text-neutral-400 leading-relaxed">{desc}</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashBoard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
