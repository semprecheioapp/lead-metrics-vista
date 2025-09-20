"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover3D?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className, hover3D = true, glow = false }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-card/40 backdrop-blur-md border border-primary/10",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        hover3D && "hover:scale-[1.02] hover:-translate-y-1",
        glow && "hover:border-primary/30 hover:shadow-primary/20",
        className
      )}
      whileHover={hover3D ? { 
        rotateX: 2,
        rotateY: 2,
        scale: 1.02,
        y: -4
      } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glass overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none" />
      
      {/* Subtle border glow */}
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 -right-1 w-1 h-1 bg-primary-glow/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute -bottom-1 left-1/4 w-1.5 h-1.5 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }} />
      </div>
    </motion.div>
  );
}