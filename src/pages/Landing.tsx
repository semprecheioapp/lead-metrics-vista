import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LandingHeader } from "@/components/LandingHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QualificationForm } from "@/components/QualificationForm";
import RetroGrid from "@/components/magicui/retro-grid";
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
      role: "Clínica Médica",
      content: "Conseguimos triplicar nossos agendamentos e reduzir drasticamente as faltas com o sistema de follow-up automático.",
      rating: 5
    },
    {
      name: "Marina Santos",
      role: "Barbearia Premium",
      content: "A IA entende perfeitamente nossos clientes e consegue agendar com precisão. Incrível!",
      rating: 5
    },
    {
      name: "Advocacia Lima & Associados",
      role: "Escritório de Advocacia",
      content: "O dashboard nos dá visibilidade total do funil. Nunca mais perdemos um lead qualificado.",
      rating: 5
    }
  ];

  const integrations = [
    { name: "WhatsApp Business", icon: "💬" },
    { name: "ChatGPT", icon: "🤖" },
    { name: "Google Calendar", icon: "📅" }
  ];

  return (
    <>
      <LandingHeader onOpenQualification={() => setIsQualificationOpen(true)} />
      <div className="min-h-screen bg-gradient-to-br from-background-base via-primary-dark/10 to-background-base">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Retro Grid Background Effect */}
        <RetroGrid className="opacity-40" />
        
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-background-base via-transparent to-background-base" />
        </div>

        <div className="relative container mx-auto px-4 pt-8 sm:pt-16 pb-16 sm:pb-24 lg:pt-24 lg:pb-32">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            {...fadeInUp}
          >
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slide"></div>
                <img 
                  src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                  alt="MBK" 
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain relative z-10"
                />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent leading-tight">
              Transforme seu Atendimento com IA Inteligente
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Automatize WhatsApp, qualifique leads, agende compromissos e multiplique suas vendas com nossa plataforma de IA conversacional
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Dialog open={isQualificationOpen} onOpenChange={setIsQualificationOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary-glow"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    CONTRATAR AGORA
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
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

              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-primary/10"
              >
                <Bot className="w-5 h-5 mr-2" />
                Ver Dashboard
              </Button>
            </div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-16"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {benefits.map((stat, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              Recursos que Transformam seu Negócio
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma plataforma completa com tudo que você precisa para automatizar e escalar seu atendimento
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20 bg-card/90 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center mb-4 text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-12 sm:py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              Integrações Nativas
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Conecte-se facilmente com as ferramentas que você já usa
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {integrations.map((integration, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card/90 backdrop-blur-sm border-2 hover:border-primary/20">
                  <CardContent className="p-6 sm:p-8">
                    <div className="text-4xl sm:text-5xl mb-4">{integration.icon}</div>
                    <div className="text-base sm:text-lg font-semibold text-foreground mb-2">{integration.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      Integração Nativa
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              Clientes que Confiam em Nós
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Veja como empresas estão transformando seus resultados
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full bg-card/90 backdrop-blur-sm border-2 hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-primary/10 via-primary-glow/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            {...fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
              Pronto para Transformar seu Atendimento?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de empresas que já automatizaram seus processos e multiplicaram suas vendas
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Dialog open={isQualificationOpen} onOpenChange={setIsQualificationOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary-glow"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    COMEÇAR AGORA
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
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

              <p className="text-sm text-muted-foreground">
                💬 <strong>Implementação rápida</strong> • 🔒 <strong>Dados seguros</strong> • 📞 <strong>Suporte especializado</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <img 
                  src="/lovable-uploads/885ae572-dec3-4868-92e1-8b1fcd6023e6.png" 
                  alt="MBK" 
                  className="w-4 h-4 object-contain"
                />
              </div>
              <span className="font-semibold text-foreground">MBK Dashboard</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 MBK. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}