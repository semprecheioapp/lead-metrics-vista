"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  label: string;
  description: string;
  className?: string;
}

export function AnimatedCounter({ value, label, description, className = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Extract numeric value from string (e.g., "85%" -> 85)
  const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
  const suffix = value.replace(/\d/g, '');

  useEffect(() => {
    if (isInView && numericValue > 0) {
      const duration = 2000; // 2 seconds
      const increment = numericValue / (duration / 16); // 60fps
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, numericValue]);

  return (
    <motion.div 
      ref={ref}
      className={`text-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="relative">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary-glow/30 to-primary/20 rounded-2xl blur-xl opacity-60 animate-pulse-glow" />
        
        {/* Counter display */}
        <div className="relative bg-card/60 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300">
          <motion.div 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent mb-2"
            animate={isInView ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {count}{suffix}
          </motion.div>
          
          <div className="text-sm sm:text-base font-semibold text-foreground mb-1">
            {label}
          </div>
          
          <div className="text-xs sm:text-sm text-muted-foreground">
            {description}
          </div>
        </div>
      </div>
    </motion.div>
  );
}