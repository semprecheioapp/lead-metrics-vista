import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/LandingHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QualificationForm } from "@/components/QualificationForm";
import RetroGrid from "@/components/magicui/retro-grid";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GlassCard } from "@/components/ui/glass-card";
import { FloatingElements } from "@/components/ui/floating-elements";
import { TestimonialsCarousel } from "@/components/ui/testimonials-carousel";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { 
  MessageSquare, 
  Zap, 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  Smartphone,
  Brain,
  Building,
  CheckCircle2,
  Star,
  ArrowRight,
  Target,
  Shield,
  Bot
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Atendimento Inteligente",
      description: "IA conversacional que entende context e nuances, proporcionando atendimento humanizado 24/7"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Automação Completa",
      description: "Automatize qualificação, agendamentos e follow-ups, economizando até 80% do tempo da equipe"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Avançado",
      description: "Dashboard com métricas em tempo real, ROI, predições e insights acionáveis para seu negócio"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-Segmentos",
      description: "Soluções especializadas para clínicas, barbearias, advocacia, e-commerce e muito mais"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA de Última Geração",
      description: "Integração com ChatGPT, Claude e modelos de IA mais avançados do mercado"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Segurança Total",
      description: "Dados protegidos com criptografia e compliance total com LGPD"
    }
  ];

  const benefits = [
    {
      value: "85%",
      label: "Redução no Tempo de Atendimento",
      description: "Automatização inteligente acelera processos"
    },
    {
      value: "300%",
      label: "Aumento na Taxa de Conversão",
      description: "Follow-ups automáticos e qualificação precisa"
    },
    {
      value: "24/7",
      label: "Disponibilidade Total",
      description: "Atendimento ininterrupto, mesmo fora do horário"
    },
    {
      value: "99.9%",
      label: "Uptime Garantido",
      description: "Infraestrutura robusta e confiável"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Carlos Silva",
      role: "Clínica Médica Premium",
      content: "Conseguimos triplicar nossos agendamentos e reduzir drasticamente as faltas com o sistema de follow-up automático. O ROI foi impressionante!",
      rating: 5,
      avatar: "/lovable-uploads/3b0a6feb-daff-4f37-a637-809d259c8ef4.png"
    },
    {
      name: "Marina Santos",
      role: "CEO - Barbearia Premium",
      content: "A IA entende perfeitamente nossos clientes e consegue agendar com precisão. Nunca vi nada igual no mercado. Simplesmente transformador!",
      rating: 5,
      avatar: "/lovable-uploads/3b0a6feb-daff-4f37-a637-809d259c8ef4.png"
    },
    {
      name: "Advocacia Lima & Associados",
      role: "Sócios Fundadores",
      content: "O dashboard nos dá visibilidade total do funil de captação. Nunca mais perdemos um lead qualificado e nossa conversão aumentou 400%.",
      rating: 5,
      avatar: "/lovable-uploads/3b0a6feb-daff-4f37-a637-809d259c8ef4.png"
    }
  ];

  const integrations = [
    { 
      name: "WhatsApp Business", 
      icon: "💬",
      description: "API oficial integrada"
    },
    { 
      name: "OpenAI GPT-4", 
      icon: "🤖",
      description: "IA de última geração"
    },
    { 
      name: "Google Calendar", 
      icon: "📅",
      description: "Sync automático"
    },
    { 
      name: "Claude AI", 
      icon: "🧠",
      description: "Análise avançada"
    },
    { 
      name: "Zapier", 
      icon: "⚡",
      description: "1000+ integrações"
    },
    { 
      name: "Stripe", 
      icon: "💳",
      description: "Pagamentos seguros"
    }
  ];

  return (
    <>
      <LandingHeader onOpenQualification={() => setIsQualificationOpen(true)} />
      <div className="min-h-screen bg-gradient-to-br from-background-base via-primary-dark/5 to-background-base relative overflow-hidden">
        
        {/* Enhanced background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary-glow/5 via-transparent to-transparent" />
        
        {/* Floating elements */}
        <FloatingElements />
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-screen flex items-center">
          {/* Retro Grid Background Effect */}
          <RetroGrid className="opacity-30" />
          
          {/* Enhanced background overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-base/50 to-background-base" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary-glow/5" />

          <div className="relative container mx-auto px-4 py-8 sm:py-16 lg:py-24">
            <motion.div 
              className="text-center max-w-6xl mx-auto"
              {...fadeInUp}
            >
              {/* Enhanced Logo */}
              <motion.div 
                className="flex justify-center mb-12"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-glow blur-xl opacity-60 animate-pulse-glow" />
                  
                  {/* Logo container */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary/90 to-primary-glow/90 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slide rounded-3xl"></div>
                    <img 
                      src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                      alt="MBK" 
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain relative z-10"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Hero Title */}
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                  Transforme
                </span>{' '}
                <span className="text-foreground">seu</span>{' '}
                <span className="bg-gradient-to-r from-primary-glow via-primary to-primary-dark bg-clip-text text-transparent">
                  Atendimento
                </span>
                <br />
                <span className="text-foreground">com</span>{' '}
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent glow-text">
                  IA Inteligente
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-primary font-semibold">Automatize WhatsApp</span>, qualifique leads, agende compromissos e{' '}
                <span className="text-primary-glow font-semibold">multiplique suas vendas</span> com nossa plataforma de IA conversacional de última geração
              </motion.p>

              {/* Enhanced CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Dialog open={isQualificationOpen} onOpenChange={setIsQualificationOpen}>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="lg" 
                        className="relative px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-r from-primary via-primary-glow to-primary text-white border-0 rounded-2xl overflow-hidden group"
                      >
                        {/* Button glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary-glow/50 to-primary/50 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Button content */}
                        <div className="relative flex items-center gap-3">
                          <Target className="w-6 h-6" />
                          CONTRATAR AGORA
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                        
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slide" />
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center">
                        Vamos Personalizar sua Solução
                      </DialogTitle>
                    </DialogHeader>
                    <QualificationForm onClose={() => setIsQualificationOpen(false)} />
                  </DialogContent>
                </Dialog>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="px-10 py-6 text-lg font-semibold border-2 border-primary/30 hover:border-primary/60 bg-card/60 backdrop-blur-sm hover:bg-primary/10 rounded-xl transition-all duration-300"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    Ver Dashboard Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Enhanced Stats with Animated Counters */}
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mt-20"
                variants={staggerChildren}
                initial="initial"
                animate="animate"
              >
                {benefits.map((stat, index) => (
                  <AnimatedCounter
                    key={index}
                    value={stat.value}
                    label={stat.label}
                    description={stat.description}
                    className="transition-transform duration-300 hover:scale-105"
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-32 relative">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-20"
              {...fadeInUp}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-foreground">
                Recursos que{' '}
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Transformam
                </span>{' '}
                seu Negócio
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Uma plataforma completa com tudo que você precisa para{' '}
                <span className="text-primary font-semibold">automatizar</span> e{' '}
                <span className="text-primary-glow font-semibold">escalar</span> seu atendimento
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <GlassCard hover3D={true} glow={true} className="h-full group">
                    <CardHeader className="pb-6">
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center mb-6 text-primary relative overflow-hidden"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="relative z-10">
                          {feature.icon}
                        </div>
                      </motion.div>
                      <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/20 to-transparent relative">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-20"
              {...fadeInUp}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-foreground">
                Integrações{' '}
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Nativas
                </span>
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Conecte-se facilmente com as{' '}
                <span className="text-primary font-semibold">ferramentas que você já usa</span>
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8 max-w-6xl mx-auto"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {integrations.map((integration, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <GlassCard hover3D={true} className="text-center group">
                    <CardContent className="p-6">
                      <motion.div 
                        className="text-4xl lg:text-5xl mb-4"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {integration.icon}
                      </motion.div>
                      <div className="text-sm lg:text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {integration.name}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        {integration.description}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20 transition-colors duration-300"
                      >
                        Nativo
                      </Badge>
                    </CardContent>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 lg:py-32 relative">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-20"
              {...fadeInUp}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-foreground">
                Clientes que{' '}
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Confiam
                </span>{' '}
                em Nós
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Veja como empresas estão{' '}
                <span className="text-primary font-semibold">transformando seus resultados</span>{' '}
                com nossa plataforma
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              className="relative"
            >
              <TestimonialsCarousel testimonials={testimonials} />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-20 lg:py-32 relative overflow-hidden">
          {/* Enhanced background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary-glow/10 to-primary/5" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <motion.div 
              className="text-center max-w-6xl mx-auto"
              {...fadeInUp}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-foreground">
                Pronto para{' '}
                <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent glow-text">
                  Transformar
                </span>{' '}
                seu Atendimento?
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
                Junte-se a{' '}
                <span className="text-primary font-bold">centenas de empresas</span>{' '}
                que já automatizaram seus processos e{' '}
                <span className="text-primary-glow font-bold">multiplicaram suas vendas</span>
              </p>

              <div className="flex flex-col gap-8 justify-center items-center">
                <Dialog open={isQualificationOpen} onOpenChange={setIsQualificationOpen}>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="lg" 
                        className="relative px-16 py-8 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 bg-gradient-to-r from-primary via-primary-glow to-primary text-white border-0 rounded-2xl overflow-hidden group"
                      >
                        {/* Enhanced button glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/60 via-primary-glow/60 to-primary/60 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Button content */}
                        <div className="relative flex items-center gap-4">
                          <Target className="w-7 h-7" />
                          COMEÇAR AGORA
                          <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                        
                        {/* Enhanced shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slide" />
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center">
                        Vamos Personalizar sua Solução
                      </DialogTitle>
                    </DialogHeader>
                    <QualificationForm onClose={() => setIsQualificationOpen(false)} />
                  </DialogContent>
                </Dialog>

                <motion.div 
                  className="flex flex-wrap justify-center gap-6 text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                    <span className="text-green-400">💬</span>
                    <strong className="text-foreground">Implementação rápida</strong>
                  </div>
                  <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                    <span className="text-blue-400">🔒</span>
                    <strong className="text-foreground">Dados seguros</strong>
                  </div>
                  <div className="flex items-center gap-2 bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
                    <span className="text-yellow-400">📞</span>
                    <strong className="text-foreground">Suporte 24/7</strong>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="py-12 border-t border-border bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg">
                  <img 
                    src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                    alt="MBK" 
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <div>
                  <div className="font-bold text-foreground text-lg">MBK Dashboard</div>
                  <div className="text-xs text-muted-foreground">Powered by AI</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                © 2024 MBK Tecnologia. Todos os direitos reservados.
              </div>
            </div>
          </div>
        </footer>

        {/* Floating Action Button */}
        <FloatingActionButton />
      </div>
    </>
  );
}