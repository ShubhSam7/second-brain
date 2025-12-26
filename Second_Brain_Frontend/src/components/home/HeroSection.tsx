import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.main
      className="min-h-screen flex items-center justify-center px-6 py-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Main Headline */}
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.1]"
          variants={itemVariants}
        >
          Your Digital <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">
            Second Brain
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          variants={itemVariants}
        >
          Capture, organize, and retrieve your ideas with a premium
          infrastructure-grade knowledge management system.
        </motion.p>

        {/* CTA Button */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="group relative px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-full transition-all shadow-[0_0_40px_-10px_rgba(234,88,12,0.5)] hover:shadow-[0_0_50px_-5px_rgba(234,88,12,0.7)] flex items-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </motion.main>
  );
};

export default HeroSection;
