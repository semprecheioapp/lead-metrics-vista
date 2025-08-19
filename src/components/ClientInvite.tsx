import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import BlurFade from "@/components/ui/blur-fade";

export const ClientInvite = () => {
  const [email, setEmail] = useState("");
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [telefoneEmpresa, setTelefoneEmpresa] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !nomeEmpresa || !nomeUsuario) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      // Usar a edge function para criar empresa e enviar convite
      const { data, error } = await supabase.functions.invoke('create-company-invite', {
        body: {
          email,
          companyName: nomeEmpresa,
          companyPhone: telefoneEmpresa,
          userName: nomeUsuario
        }
      });

      if (error) {
        console.error("Erro ao criar convite:", error);
        const errorMessage = error.message || "Erro ao enviar convite";
        toast.error(`Erro: ${errorMessage}`);
      } else {
        toast.success(`Empresa criada com sucesso! Instruções de acesso enviadas para ${email}.`);
        // Limpar formulário
        setEmail("");
        setNomeEmpresa("");
        setTelefoneEmpresa("");
        setNomeUsuario("");
      }
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlurFade delay={0.1}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convidar Novo Cliente
          </CardTitle>
          <CardDescription>
            Crie uma nova empresa e envie um convite por email para o cliente definir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <BlurFade delay={0.15}>
              <div className="space-y-2">
                <Label htmlFor="nomeUsuario" className="text-foreground font-medium">
                  Nome do Usuário *
                </Label>
                <Input
                  id="nomeUsuario"
                  type="text"
                  placeholder="João Silva"
                  value={nomeUsuario}
                  onChange={(e) => setNomeUsuario(e.target.value)}
                  required
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.17}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.19}>
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa" className="text-foreground font-medium">
                  Nome da Empresa *
                </Label>
                <Input
                  id="nomeEmpresa"
                  type="text"
                  placeholder="Empresa Ltda"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  required
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.21}>
              <div className="space-y-2">
                <Label htmlFor="telefoneEmpresa" className="text-foreground font-medium">
                  Telefone da Empresa
                </Label>
                <Input
                  id="telefoneEmpresa"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={telefoneEmpresa}
                  onChange={(e) => setTelefoneEmpresa(e.target.value)}
                />
              </div>
            </BlurFade>

            <BlurFade delay={0.23}>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Convite"}
              </Button>
            </BlurFade>
          </form>
        </CardContent>
      </Card>
    </BlurFade>
  );
};