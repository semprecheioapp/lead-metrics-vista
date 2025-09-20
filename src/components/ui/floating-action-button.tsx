"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: "https://wa.me/5511999999999",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: Phone,
      label: "Telefone",
      href: "tel:+5511999999999",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: Mail,
      label: "Email",
      href: "mailto:contato@mbk.com.br",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col gap-3 mb-4"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {actions.map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 ${action.color}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className="w-5 h-5" />
                <span className="font-medium whitespace-nowrap">{action.label}</span>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          className={`w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 ${
            isOpen 
              ? "bg-red-500 hover:bg-red-600 rotate-45" 
              : "bg-primary hover:bg-primary-glow"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/30"
        animate={isOpen ? { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </div>
  );
}