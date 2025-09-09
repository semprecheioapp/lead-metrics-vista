import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isChromeIOS, setIsChromeIOS] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    const chromeIOS = /CriOS/i.test(navigator.userAgent);
    setIsChromeIOS(chromeIOS);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA install accepted');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  // Don't show if already standalone, dismissed, or no install prompt available
  if (isStandalone || !showInstallBanner || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Alert className="bg-primary/10 border-primary/20 backdrop-blur-md">
        <Download className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="font-medium text-sm">
              {isIOS ? 'Instalar no iPhone' : 'Instalar App'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isIOS 
                ? (isChromeIOS
                    ? 'No Chrome para iOS, toque em ⋯ e escolha “Abrir no Safari”. Depois, toque no botão Compartilhar e selecione “Adicionar à Tela de Início”.'
                    : 'No Safari, toque no botão Compartilhar (quadrado com seta) e selecione “Adicionar à Tela de Início”.')
                : 'Instale nosso app para acesso rápido no seu dispositivo.'
              }
            </p>
          </div>
          <div className="flex gap-2">
            {!isIOS && (
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="h-8 px-3 text-xs"
              >
                Instalar
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};