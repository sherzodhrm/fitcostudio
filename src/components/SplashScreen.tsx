import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-[#0e0e0e] flex flex-col items-center justify-center p-6"
        >
          {/* Animated Background Pulse */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1],
              opacity: [0, 0.1, 0.05]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-[400px] h-[400px] bg-[#c8f060] rounded-full blur-[100px]"
          />

          <div className="relative">
            {/* The Logo Container */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              className="w-32 h-32 bg-black border-4 border-[#c8f060] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(200,240,96,0.3)]"
            >
              <Zap className="w-16 h-16 text-[#c8f060] fill-[#c8f060] blur-[0.5px]" />
            </motion.div>

            {/* Orbital Rings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              className="absolute inset-0 border border-[#c8f060] rounded-full"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 text-center"
          >
            <h1 className="text-4xl font-black tracking-tighter text-[#f0ede8]">
              SHERZOD<span className="text-[#c8f060]">.</span>FIT
            </h1>
            <p className="text-[10px] font-black text-[#555] uppercase tracking-[0.4em] mt-2">
              Precision Engineering
            </p>
          </motion.div>

          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
            className="mt-12 h-0.5 bg-[#c8f060] rounded-full opacity-20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
