import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptInviteAfterRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'unauthorized'>('loading');
  const [inviteData, setInviteData] = useState<any>(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    acceptInvite();
  }, [token, user, navigate]);

  const acceptInvite = async () => {
    // Vamos usar a função agent-invite-accept que já existe e confiar no token

    try {
      const { data, error } = await supabase.functions.invoke('agent-invite-accept', {
        body: { token }
      });

      if (error) {
        if (error.message?.includes('expired')) {
          setStatus('expired');
        } else if (error.message?.includes('email')) {
          setStatus('unauthorized');
        } else {
          setStatus('error');
        }
        return;
      }

      setInviteData(data);
      setStatus('success');
      
      toast({
        title: "Convite aceito!",
        description: "Você agora faz parte da equipe. Redirecionando...",
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Refresh to update permissions
      }, 2000);

    } catch (error: any) {
      console.error('Error accepting invite:', error);
      setStatus('error');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h2 className="text-lg font-semibold">Processando convite...</h2>
            <p className="text-muted-foreground text-center">
              Aguarde enquanto validamos seu convite e adicionamos você à equipe.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <h2 className="text-lg font-semibold text-green-600">Convite aceito com sucesso!</h2>
            <p className="text-muted-foreground text-center">
              Você agora faz parte da equipe{inviteData?.company_name ? ` da ${inviteData.company_name}` : ''}.
              Redirecionando para o dashboard...
            </p>
          </div>
        );

      case 'expired':
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-8 w-8 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Convite expirado</h2>
            <p className="text-muted-foreground text-center">
              Este convite expirou. Entre em contato com o administrador para solicitar um novo convite.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Ir para Dashboard
            </Button>
          </div>
        );

      case 'unauthorized':
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-8 w-8 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Email não autorizado</h2>
            <p className="text-muted-foreground text-center">
              Este convite é para um email diferente do que você está usando. 
              Faça login com o email correto ou entre em contato com o administrador.
            </p>
            <Button onClick={() => navigate('/auth')} variant="outline">
              Fazer Login
            </Button>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-8 w-8 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Erro ao processar convite</h2>
            <p className="text-muted-foreground text-center">
              Ocorreu um erro ao processar seu convite. Verifique se o link está correto ou 
              entre em contato com o administrador.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar Novamente
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                Ir para Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Aceitar Convite</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}