import DashBoard from "./pages/DashBoard";
import Signin from "./pages/Signin";
import SignUp from "./pages/SignUp";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { FeatureSection } from "./components/FeatureSection";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { isAuthenticated, signout, getCurrentUser } from "./lib/api";

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
    <div className="relative min-h-screen bg-background-primary">
      {/* Top right buttons */}
      <div className="absolute top-8 right-8 flex gap-4 z-10 animate-fade-in">
        {isLoggedIn ? (
          <>
            <div className="px-5 py-2.5 text-sm font-medium text-text-secondary">
              Welcome, {username}
            </div>
            <button
              className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-surface border border-border-muted rounded-lg hover:border-red-400 hover:text-red-400 transition-all duration-300"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-surface border border-border-muted rounded-lg hover:border-accent-primary hover:text-accent-primary transition-all duration-300"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </button>
            <button
              className="px-5 py-2.5 text-sm font-medium text-background-primary bg-text-primary rounded-lg hover:bg-accent-primary hover:text-white transition-all duration-300"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </>
        )}
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        {/* Subtle glow background effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-glow rounded-full blur-3xl opacity-30 animate-glow-pulse"></div>

        <div className="relative z-10 text-center space-y-8 max-w-4xl animate-slide-up">
          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-text-primary via-text-primary to-text-secondary bg-clip-text text-transparent leading-tight">
            Your Digital
            <span className="block mt-2 bg-gradient-to-r from-accent-primary to-text-primary bg-clip-text text-transparent">
              Second Brain
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Capture, organize, and retrieve your ideas with a premium infrastructure-grade knowledge management system.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
            <button
              className="group px-8 py-4 text-base font-semibold text-background-primary bg-accent-primary rounded-lg hover:bg-accent-primary/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,106,0,0.3)] flex items-center gap-2"
              onClick={handleGetStarted}
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started"}
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
            {!isLoggedIn && (
              <button
                className="px-8 py-4 text-base font-semibold text-text-primary bg-surface border border-border-muted rounded-lg hover:border-accent-primary hover:text-accent-primary transition-all duration-300"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-24 space-y-16">
        <FeatureSection
          number="01"
          title="Universal Content Capture"
          description="Save anything from anywhere. Your second brain accepts all forms of knowledge."
          features={[
            "YouTube videos, tweets, and social media posts",
            "Articles, documents, and research papers",
            "Code snippets, GitHub repos, and technical content",
            "Images, podcasts, and multimedia resources",
          ]}
        />

        <FeatureSection
          number="02"
          title="Intelligent Organization"
          description="Automatically categorize and tag your content for instant retrieval."
          features={[
            "Smart categorization by content type",
            "Custom tags and collections",
            "Full-text search across all saved items",
            "Visual timeline of your knowledge journey",
          ]}
        />

        <FeatureSection
          number="03"
          title="Seamless Sharing"
          description="Share your curated knowledge collections with teams or the world."
          features={[
            "Public or private brain sharing",
            "Collaborative collections with teams",
            "Embed-friendly content previews",
            "Export to multiple formats",
          ]}
        />
      </div>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="border border-border-muted bg-surface rounded-2xl p-12 space-y-6">
          <h2 className="text-4xl font-bold text-text-primary">
            {isLoggedIn ? "Continue building your second brain" : "Ready to build your second brain?"}
          </h2>
          <p className="text-lg text-text-secondary">
            {isLoggedIn ? "Access your dashboard and manage your knowledge." : "Join thousands organizing their digital knowledge."}
          </p>
          <button
            className="mt-6 px-10 py-4 text-base font-semibold text-background-primary bg-accent-primary rounded-lg hover:bg-accent-primary/90 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,106,0,0.3)]"
            onClick={handleGetStarted}
          >
            {isLoggedIn ? "Go to Dashboard" : "Start Free Today"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
