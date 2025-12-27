import { BrainCircuit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../lib/api";
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  return (
    <motion.nav
      initial={{ y: -20, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] }}
      className="fixed top-6 left-1/2 z-50 w-[90%] max-w-5xl"
    >
      <div className="bg-neutral-950/60 backdrop-blur-md border border-white/10 rounded-full shadow-lg px-6 py-3">
        <div className="flex items-center justify-between relative">
          {/* LEFT: Brand Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
          >
            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:inline">
              Second<span className="text-neutral-400">Brain</span>
            </span>
          </div>

          {/* CENTER: Navigation Links (hidden on mobile) - Absolutely centered */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a
              href="#home"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-neutral-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
          </div>

          {/* RIGHT: CTA Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {authenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/signin")}
                  className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors hidden sm:block"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
