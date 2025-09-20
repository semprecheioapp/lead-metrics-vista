"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length, isAutoPlaying]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div 
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Main carousel */}
      <div className="relative overflow-hidden rounded-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Card className="bg-card/60 backdrop-blur-md border border-primary/20 shadow-xl">
              <CardContent className="p-8 lg:p-12">
                <div className="text-center space-y-6">
                  {/* Avatar */}
                  <motion.div 
                    className="flex justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Avatar className="w-20 h-20 border-4 border-primary/20 shadow-lg">
                      <AvatarImage 
                        src={testimonials[currentIndex].avatar} 
                        alt={testimonials[currentIndex].name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary-glow/20 text-xl font-bold text-primary">
                        {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  {/* Rating */}
                  <motion.div 
                    className="flex justify-center gap-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Content */}
                  <motion.blockquote 
                    className="text-lg lg:text-xl text-muted-foreground italic leading-relaxed max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    "{testimonials[currentIndex].content}"
                  </motion.blockquote>

                  {/* Author */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="font-bold text-xl text-foreground">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-primary font-medium">
                      {testimonials[currentIndex].role}
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40"
        onClick={goToNext}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-primary shadow-lg scale-125" 
                : "bg-primary/30 hover:bg-primary/50"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}