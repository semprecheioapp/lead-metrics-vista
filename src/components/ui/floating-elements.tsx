"use client";

import { motion } from "framer-motion";

export function FloatingElements() {
  const elements = [
    { size: "w-2 h-2", position: "top-1/4 left-1/4", delay: 0 },
    { size: "w-1 h-1", position: "top-1/3 right-1/4", delay: 1 },
    { size: "w-3 h-3", position: "bottom-1/4 left-1/3", delay: 2 },
    { size: "w-1.5 h-1.5", position: "bottom-1/3 right-1/3", delay: 0.5 },
    { size: "w-2.5 h-2.5", position: "top-1/2 left-1/6", delay: 1.5 },
    { size: "w-1 h-1", position: "top-3/4 right-1/6", delay: 2.5 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.size} ${element.position} bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-sm`}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 6 + element.delay,
            repeat: Infinity,
            delay: element.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Larger floating orbs */}
      <motion.div
        className="absolute top-1/6 right-1/5 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary-glow/5 rounded-full blur-3xl"
        animate={{
          y: [-30, 30, -30],
          x: [-15, 15, -15],
          scale: [0.8, 1.1, 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/6 left-1/5 w-24 h-24 bg-gradient-to-br from-primary-glow/10 to-primary/5 rounded-full blur-2xl"
        animate={{
          y: [20, -20, 20],
          x: [10, -10, 10],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}