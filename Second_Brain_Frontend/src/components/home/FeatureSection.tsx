import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';

interface FeatureSectionProps {
  badge: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}

const FeatureSection = ({ badge, title, description, icon, children, align = 'left' }: FeatureSectionProps) => {

  // Animation variants for Framer Motion
  const textVariants: Variants = {
    hidden: { opacity: 0, x: align === 'left' ? -50 : 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.6, 0.01, 0.05, 0.95] }
    }
  };

  const graphicVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, x: align === 'left' ? 50 : -50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.6, delay: 0.2, ease: [0.6, 0.01, 0.05, 0.95] }
    }
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 overflow-hidden">
      <div className={`flex flex-col md:flex-row items-center gap-16 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>

        {/* TEXT CONTENT BLOCK */}
        <motion.div
          className="flex-1 space-y-6 text-left"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={textVariants}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium uppercase tracking-wider">
            {icon}
            <span>{badge}</span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            {title}
          </h2>

          {/* Description */}
          <p className="text-lg text-neutral-400 leading-relaxed max-w-xl">
            {description}
          </p>

          <button className="group flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium transition-colors">
            Learn more
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>

        {/* GRAPHIC BLOCK */}
        <motion.div
          className="flex-1 w-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={graphicVariants}
        >
           {/* We wrap the children with a subtle glow effect */}
           <div className="relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="relative">
                {children}
             </div>
           </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
