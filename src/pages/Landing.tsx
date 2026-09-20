/**
 * Landing Page
 * Immersive entry experience for the application
 */

import { motion } from "framer-motion";

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  // Generate stable particle positions
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    initialX: (i * 137.5) % window.innerWidth,
    initialY: (i * 73) % window.innerHeight,
    opacity: 0.3 + (i % 7) * 0.1,
    duration: 10 + (i % 10),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070B] via-[#080B12] to-[#0D111A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 opacity-20">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
              opacity: particle.opacity,
            }}
            animate={{
              y: [null, (particle.initialY + 200) % window.innerHeight],
              opacity: [null, particle.opacity * 0.5, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-[#E8F1FF] mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          YOUR LIFE,
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            IN RECEIPTS.
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-[#94A3B8] mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Hundreds of moments.
        </motion.p>

        <motion.p
          className="text-xl md:text-2xl text-[#94A3B8] mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          One story waiting to be discovered.
        </motion.p>

        <motion.button
          type="button"
          onClick={onEnter}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 hover:scale-105"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ENTER THE ARCHIVE
        </motion.button>

        <motion.div
          className="mt-12 text-sm text-[#94A3B8]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <p>Explore • Connect • Discover</p>
        </motion.div>
      </motion.div>

      {/* Footer hint */}
      <motion.div
        className="absolute bottom-8 text-[#94A3B8] text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2 }}
      >
        ↓
      </motion.div>
    </div>
  );
}
