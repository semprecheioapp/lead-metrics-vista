import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QualificationForm } from "@/components/QualificationForm";
import { 
  Target,
  ArrowRight,
  Menu,
  X,
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface LandingHeaderProps {
  onOpenQualification: () => void;
}

export function LandingHeader({ onOpenQualification }: LandingHeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <img 
                  src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                  alt="MBK" 
                  className="w-4 h-4 object-contain"
                />
              </div>
              <span className="font-semibold text-foreground text-lg leading-none py-1">MBK Dashboard</span>
            </div>
            
            <nav className="flex items-center gap-8">
              <button 
                onClick={() => scrollToSection("features")}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Recursos
              </button>
              <button 
                onClick={() => scrollToSection("testimonials")}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Depoimentos
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contato
              </button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/auth")}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Bot className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button onClick={onOpenQualification}>
                <Target className="w-4 h-4 mr-2" />
                Contratar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <img 
                  src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                  alt="MBK" 
                  className="w-4 h-4 object-contain"
                />
              </div>
              <span className="font-semibold text-foreground leading-none py-1">MBK Inteligente</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={onOpenQualification} className="text-xs px-3">
                <Target className="w-3 h-3 mr-1" />
                Contratar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 h-full w-80 bg-background border-l border-border p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Menu</h3>
                  <p className="text-sm text-muted-foreground">Navegue pela página</p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => scrollToSection("features")}
                  >
                    Recursos
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => scrollToSection("testimonials")}
                  >
                    Depoimentos
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => scrollToSection("contact")}
                  >
                    Contato
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/auth");
                      setIsMenuOpen(false);
                    }}
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    Acessar Dashboard
                  </Button>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      onOpenQualification();
                      setIsMenuOpen(false);
                    }}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Solicitar Proposta
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}