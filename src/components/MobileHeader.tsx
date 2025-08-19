import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QualificationForm } from "@/components/QualificationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Brain, 
  BarChart3, 
  Users, 
  Phone, 
  Building,
  ArrowRight,
  Target,
  Zap,
  Menu,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function MobileHeader() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <img 
                src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                alt="MBK" 
                className="w-4 h-4 object-contain"
              />
            </div>
            <span className="font-semibold text-foreground">MBK</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isQualificationOpen} onOpenChange={setIsQualificationOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs px-3">
                  <Target className="w-3 h-3 mr-1" />
                  Contratar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-center">
                    Vamos Personalizar sua Solução
                  </DialogTitle>
                </DialogHeader>
                <QualificationForm onClose={() => setIsQualificationOpen(false)} />
              </DialogContent>
            </Dialog>
            
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
      </header>

      {/* Mobile Menu Overlay */}
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
                <h3 className="text-xl font-bold mb-2">Menu Principal</h3>
                <p className="text-sm text-muted-foreground">Navegue pelas funcionalidades</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    // Scroll to features section
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Recursos
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.getElementById("testimonials")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Depoimentos
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contato
                </Button>
              </div>
              
              <div className="pt-4 border-t border-border">
                <Dialog open={isQualificationOpen} onOpenChange={setIsQualificationOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Target className="w-4 h-4 mr-2" />
                      Solicitar Proposta
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}