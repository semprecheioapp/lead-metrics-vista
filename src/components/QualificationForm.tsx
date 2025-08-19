import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle2, Send, Building, Users, MessageSquare, Phone, Mail, Target, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { InputValidator, ValidationMessages } from "@/utils/inputValidation";

interface QualificationFormProps {
  onClose: () => void;
}

interface FormData {
  // Etapa 1: Empresa
  companyName: string;
  employees: string;
  email: string;
  phone: string;
  
  // Etapa 2: Necessidades
  monthlyContacts: string;
  hasAI: boolean | null;
  
  // Etapa 3: Objetivos (se NÃO possui IA)
  objectives: string[];
  segment: string;
  urgent: boolean | null;
  
  // Observações extras
  notes: string;
}

const STEPS = [
  { id: 1, title: "Dados da Empresa", icon: <Building className="w-5 h-5" /> },
  { id: 2, title: "Necessidades", icon: <Target className="w-5 h-5" /> },
  { id: 3, title: "Objetivos", icon: <Zap className="w-5 h-5" /> },
  { id: 4, title: "Confirmação", icon: <CheckCircle2 className="w-5 h-5" /> }
];

const EMPLOYEE_OPTIONS = [
  "1-5 funcionários",
  "6-20 funcionários", 
  "21-50 funcionários",
  "51-100 funcionários",
  "Mais de 100 funcionários"
];

const CONTACT_OPTIONS = [
  "Até 100 contatos/mês",
  "101-500 contatos/mês",
  "501-1.000 contatos/mês", 
  "1.001-5.000 contatos/mês",
  "Mais de 5.000 contatos/mês"
];

const OBJECTIVE_OPTIONS = [
  { id: "vendas", label: "Vendas", icon: "💰" },
  { id: "atendimento", label: "Atendimento ao Cliente", icon: "🤝" },
  { id: "sdr", label: "SDR/Prospecção", icon: "🎯" },
  { id: "agendamentos", label: "Agendamentos", icon: "📅" },
  { id: "suporte", label: "Suporte Técnico", icon: "🔧" },
  { id: "qualificacao", label: "Qualificação de Leads", icon: "✅" }
];

const SEGMENT_OPTIONS = [
  "Clínicas e Consultórios",
  "Barbearias e Salões",
  "Advocacia",
  "E-commerce",
  "Imobiliárias",
  "Academias",
  "Restaurantes",
  "Consultoria",
  "Educação",
  "Serviços Financeiros",
  "Outros"
];

export function QualificationForm({ onClose }: QualificationFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    employees: "",
    email: "",
    phone: "",
    monthlyContacts: "",
    hasAI: null,
    objectives: [],
    segment: "",
    urgent: null,
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rate limiter for form submissions
  const rateLimiter = InputValidator.createRateLimiter(3, 60000); // 3 attempts per minute

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        // Required field validation
        if (!formData.companyName || !formData.email || !formData.phone) {
          toast({
            title: "Campos obrigatórios",
            description: "Preencha todos os campos obrigatórios.",
            variant: "destructive"
          });
          return false;
        }

        // Email validation
        if (!InputValidator.isValidEmail(formData.email)) {
          toast({
            title: "E-mail inválido",
            description: ValidationMessages.INVALID_EMAIL,
            variant: "destructive"
          });
          return false;
        }

        // Phone validation
        if (!InputValidator.isValidPhone(formData.phone)) {
          toast({
            title: "Telefone inválido",
            description: ValidationMessages.INVALID_PHONE,
            variant: "destructive"
          });
          return false;
        }

        // Company name validation
        if (!InputValidator.isValidCompanyName(formData.companyName)) {
          toast({
            title: "Nome da empresa inválido",
            description: ValidationMessages.INVALID_COMPANY_NAME,
            variant: "destructive"
          });
          return false;
        }
        break;

      case 2:
        if (!formData.monthlyContacts || formData.hasAI === null) {
          toast({
            title: "Campos obrigatórios", 
            description: "Preencha todos os campos desta etapa.",
            variant: "destructive"
          });
          return false;
        }
        break;

      case 3:
        if (!formData.hasAI && (!formData.objectives.length || !formData.segment || formData.urgent === null)) {
          toast({
            title: "Campos obrigatórios",
            description: "Preencha todos os campos desta etapa.",
            variant: "destructive"
          });
          return false;
        }

        // Validate notes if provided
        if (formData.notes && !InputValidator.isValidText(formData.notes, 500)) {
          toast({
            title: "Observações inválidas",
            description: "As observações contêm caracteres inválidos ou são muito longas.",
            variant: "destructive"
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleObjectiveChange = (objectiveId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      objectives: checked 
        ? [...prev.objectives, objectiveId]
        : prev.objectives.filter(id => id !== objectiveId)
    }));
  };

  const handleSubmit = async () => {
    // Rate limiting check
    if (!rateLimiter(formData.email)) {
      toast({
        title: "Muitas tentativas",
        description: ValidationMessages.RATE_LIMIT_EXCEEDED,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Sanitize and validate all form data
      const sanitizedData = {
        companyName: InputValidator.sanitizeInput(formData.companyName),
        employees: InputValidator.sanitizeInput(formData.employees),
        email: InputValidator.sanitizeInput(formData.email),
        phone: InputValidator.sanitizeInput(formData.phone),
        monthlyContacts: InputValidator.sanitizeInput(formData.monthlyContacts),
        hasAI: formData.hasAI,
        objectives: formData.objectives.map(obj => InputValidator.sanitizeInput(obj)),
        segment: InputValidator.sanitizeInput(formData.segment),
        urgent: formData.urgent,
        notes: InputValidator.sanitizeInput(formData.notes)
      };

      // Final validation
      if (!InputValidator.isValidEmail(sanitizedData.email) || 
          !InputValidator.isValidPhone(sanitizedData.phone) ||
          !InputValidator.isValidCompanyName(sanitizedData.companyName)) {
        throw new Error("Dados inválidos detectados");
      }

      const webhookUrl = "https://wb.semprecheioapp.com.br/webhook/formulario_dashmbk";
      
      console.log("Enviando dados sanitizados para webhook:", webhookUrl);
      
      // Add security headers and request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Send sanitized data to webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-Source": "landing_page_qualification_form"
        },
        body: JSON.stringify({
          ...sanitizedData,
          timestamp: new Date().toISOString(),
          source: "landing_page_qualification_form",
          userAgent: window.navigator.userAgent.substring(0, 100) // Limited user agent
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook responded with status: ${response.status}`);
      }
      
      toast({
        title: "Solicitação enviada!",
        description: "Nossa equipe entrará em contato em breve.",
      });
      
      onClose();
    } catch (error) {
      console.error("Erro ao enviar para webhook:", error);
      
      if (error.name === 'AbortError') {
        toast({
          title: "Timeout",
          description: "A solicitação demorou muito para ser processada. Tente novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao enviar",
          description: "Tente novamente em alguns minutos.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Building className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold">Informações da Empresa</h3>
              <p className="text-muted-foreground">Conte-nos sobre seu negócio</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-sm font-medium">
                  Nome da Empresa *
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    companyName: InputValidator.sanitizeInput(e.target.value) 
                  }))}
                  placeholder="Digite o nome da sua empresa"
                  className="mt-1"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="employees" className="text-sm font-medium">
                  Quantos funcionários
                </Label>
                <Select value={formData.employees} onValueChange={(value) => setFormData(prev => ({ ...prev, employees: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tamanho da equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      email: InputValidator.sanitizeInput(e.target.value) 
                    }))}
                    placeholder="seu@email.com"
                    className="mt-1"
                    maxLength={255}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Telefone/WhatsApp *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      phone: InputValidator.sanitizeInput(e.target.value) 
                    }))}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Target className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold">Suas Necessidades</h3>
              <p className="text-muted-foreground">Vamos entender seu volume e situação atual</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">
                  Estimativa de atendimentos mensais *
                </Label>
                <Select value={formData.monthlyContacts} onValueChange={(value) => setFormData(prev => ({ ...prev, monthlyContacts: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o volume mensal" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_OPTIONS.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Já possui IA no sistema? *
                </Label>
                <RadioGroup 
                  value={formData.hasAI?.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, hasAI: value === "true" }))}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="true" id="hasAI-yes" />
                    <Label htmlFor="hasAI-yes" className="cursor-pointer">
                      Sim, já tenho IA
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="false" id="hasAI-no" />
                    <Label htmlFor="hasAI-no" className="cursor-pointer">
                      Não, preciso implementar
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold">
                {formData.hasAI ? "Otimização" : "Objetivos da IA"}
              </h3>
              <p className="text-muted-foreground">
                {formData.hasAI 
                  ? "Como podemos melhorar sua IA atual?" 
                  : "Para que você quer usar a IA?"
                }
              </p>
            </div>

            {!formData.hasAI && (
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Qual o objetivo da IA? * (Múltipla escolha)
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {OBJECTIVE_OPTIONS.map(objective => (
                      <div key={objective.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                        <Checkbox
                          id={objective.id}
                          checked={formData.objectives.includes(objective.id)}
                          onCheckedChange={(checked) => handleObjectiveChange(objective.id, checked as boolean)}
                        />
                        <Label htmlFor={objective.id} className="cursor-pointer flex items-center gap-2 text-sm">
                          <span>{objective.icon}</span>
                          {objective.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Segmento de atuação *
                  </Label>
                  <Select value={formData.segment} onValueChange={(value) => setFormData(prev => ({ ...prev, segment: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione seu segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENT_OPTIONS.map(segment => (
                        <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Precisa com urgência? *
                  </Label>
                  <RadioGroup 
                    value={formData.urgent?.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, urgent: value === "true" }))}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="true" id="urgent-yes" />
                      <Label htmlFor="urgent-yes" className="cursor-pointer">
                        Sim, é urgente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="false" id="urgent-no" />
                      <Label htmlFor="urgent-no" className="cursor-pointer">
                        Não, posso aguardar
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Observações extras (opcional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  notes: InputValidator.sanitizeInput(e.target.value) 
                }))}
                placeholder="Conte-nos mais sobre suas necessidades específicas..."
                className="mt-1 min-h-[100px]"
                maxLength={500}
              />
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold">Resumo da Solicitação</h3>
              <p className="text-muted-foreground">Confirme os dados antes de enviar</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Empresa:</strong> {formData.companyName}
                  </div>
                  <div>
                    <strong>Funcionários:</strong> {formData.employees || "Não informado"}
                  </div>
                  <div>
                    <strong>E-mail:</strong> {formData.email}
                  </div>
                  <div>
                    <strong>Telefone:</strong> {formData.phone}
                  </div>
                  <div>
                    <strong>Volume mensal:</strong> {formData.monthlyContacts}
                  </div>
                  <div>
                    <strong>Possui IA:</strong> {formData.hasAI ? "Sim" : "Não"}
                  </div>
                  
                  {!formData.hasAI && (
                    <>
                      <div className="sm:col-span-2">
                        <strong>Objetivos:</strong> {formData.objectives.map(id => OBJECTIVE_OPTIONS.find(opt => opt.id === id)?.label).join(", ")}
                      </div>
                      <div>
                        <strong>Segmento:</strong> {formData.segment}
                      </div>
                      <div>
                        <strong>Urgente:</strong> {formData.urgent ? "Sim" : "Não"}
                      </div>
                    </>
                  )}
                  
                  {formData.notes && (
                    <div className="sm:col-span-2">
                      <strong>Observações:</strong> {formData.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              Ao enviar, você aceita que nossa equipe entre em contato para apresentar a melhor solução para seu negócio.
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Etapa {currentStep} de {STEPS.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="flex justify-between mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center min-w-0 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
              currentStep >= step.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            }`}>
              {step.icon}
            </div>
            <span className={`text-xs text-center ${
              currentStep >= step.id ? "text-primary font-medium" : "text-muted-foreground"
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} className="px-6">
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            className="px-6 bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Solicitação
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}