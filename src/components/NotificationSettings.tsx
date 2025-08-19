import { useState } from "react";
import { ArrowLeft, Save, Bell, Mail, MessageSquare, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNotificationConfig, type NotificationConfig } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettings = ({ isOpen, onClose }: NotificationSettingsProps) => {
  const { config, updateConfig, isUpdating } = useNotificationConfig();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<Partial<NotificationConfig>>({
    tipos_ativos: {
      lead_urgente: true,
      followup_atrasado: true,
      oportunidade: true,
      meta_performance: true,
      problema_critico: true,
      ...config?.tipos_ativos,
    },
    canais_preferidos: {
      dashboard: true,
      email: false,
      whatsapp: false,
      push: false,
      ...config?.canais_preferidos,
    },
    horarios_permitidos: {
      inicio: "08:00",
      fim: "18:00",
      dias_semana: [1, 2, 3, 4, 5, 6],
      ...config?.horarios_permitidos,
    },
    limites_por_tipo: {
      lead_urgente: 10,
      followup_atrasado: 5,
      oportunidade: 8,
      meta_performance: 3,
      problema_critico: 999,
      ...config?.limites_por_tipo,
    },
  });

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync(settings);
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const updateTipoAtivo = (tipo: keyof NotificationConfig['tipos_ativos'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      tipos_ativos: {
        ...prev.tipos_ativos!,
        [tipo]: value,
      },
    }));
  };

  const updateCanalPreferido = (canal: keyof NotificationConfig['canais_preferidos'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      canais_preferidos: {
        ...prev.canais_preferidos!,
        [canal]: value,
      },
    }));
  };

  const updateLimite = (tipo: keyof NotificationConfig['limites_por_tipo'], value: number) => {
    setSettings(prev => ({
      ...prev,
      limites_por_tipo: {
        ...prev.limites_por_tipo!,
        [tipo]: value,
      },
    }));
  };

  const updateHorario = (campo: 'inicio' | 'fim', value: string) => {
    setSettings(prev => ({
      ...prev,
      horarios_permitidos: {
        ...prev.horarios_permitidos!,
        [campo]: value,
      },
    }));
  };

  const diasSemana = [
    { id: 1, label: "Segunda" },
    { id: 2, label: "Terça" },
    { id: 3, label: "Quarta" },
    { id: 4, label: "Quinta" },
    { id: 5, label: "Sexta" },
    { id: 6, label: "Sábado" },
    { id: 0, label: "Domingo" },
  ];

  const toggleDiaSemana = (dia: number) => {
    setSettings(prev => {
      const dias = prev.horarios_permitidos?.dias_semana || [];
      const newDias = dias.includes(dia) 
        ? dias.filter(d => d !== dia)
        : [...dias, dia];
      
      return {
        ...prev,
        horarios_permitidos: {
          ...prev.horarios_permitidos!,
          dias_semana: newDias,
        },
      };
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Tipos de Notificação */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Tipos de Notificação</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="lead_urgente" className="text-sm">Leads Urgentes</Label>
                <Switch
                  id="lead_urgente"
                  checked={settings.tipos_ativos?.lead_urgente || false}
                  onCheckedChange={(value) => updateTipoAtivo('lead_urgente', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="followup_atrasado" className="text-sm">Follow-ups Atrasados</Label>
                <Switch
                  id="followup_atrasado"
                  checked={settings.tipos_ativos?.followup_atrasado || false}
                  onCheckedChange={(value) => updateTipoAtivo('followup_atrasado', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="oportunidade" className="text-sm">Oportunidades</Label>
                <Switch
                  id="oportunidade"
                  checked={settings.tipos_ativos?.oportunidade || false}
                  onCheckedChange={(value) => updateTipoAtivo('oportunidade', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="meta_performance" className="text-sm">Metas & Performance</Label>
                <Switch
                  id="meta_performance"
                  checked={settings.tipos_ativos?.meta_performance || false}
                  onCheckedChange={(value) => updateTipoAtivo('meta_performance', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="problema_critico" className="text-sm">Problemas Críticos</Label>
                <Switch
                  id="problema_critico"
                  checked={settings.tipos_ativos?.problema_critico || false}
                  onCheckedChange={(value) => updateTipoAtivo('problema_critico', value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Canais de Notificação */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Canais de Notificação</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="dashboard" className="text-sm">Dashboard</Label>
                </div>
                <Switch
                  id="dashboard"
                  checked={settings.canais_preferidos?.dashboard || false}
                  onCheckedChange={(value) => updateCanalPreferido('dashboard', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="email" className="text-sm">Email</Label>
                </div>
                <Switch
                  id="email"
                  checked={settings.canais_preferidos?.email || false}
                  onCheckedChange={(value) => updateCanalPreferido('email', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                </div>
                <Switch
                  id="whatsapp"
                  checked={settings.canais_preferidos?.whatsapp || false}
                  onCheckedChange={(value) => updateCanalPreferido('whatsapp', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <Label htmlFor="push" className="text-sm">Push Notifications</Label>
                </div>
                <Switch
                  id="push"
                  checked={settings.canais_preferidos?.push || false}
                  onCheckedChange={(value) => updateCanalPreferido('push', value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Horários Permitidos */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Horários Permitidos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="inicio" className="text-xs">Início</Label>
                <Input
                  id="inicio"
                  type="time"
                  value={settings.horarios_permitidos?.inicio || "08:00"}
                  onChange={(e) => updateHorario('inicio', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="fim" className="text-xs">Fim</Label>
                <Input
                  id="fim"
                  type="time"
                  value={settings.horarios_permitidos?.fim || "18:00"}
                  onChange={(e) => updateHorario('fim', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Dias da Semana</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {diasSemana.map((dia) => (
                  <Button
                    key={dia.id}
                    variant={settings.horarios_permitidos?.dias_semana?.includes(dia.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDiaSemana(dia.id)}
                    className="text-xs"
                  >
                    {dia.label.slice(0, 3)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Limites por Tipo */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Limites por Tipo (por dia)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="limite_lead" className="text-xs">Leads Urgentes</Label>
                <Input
                  id="limite_lead"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.limites_por_tipo?.lead_urgente || 10}
                  onChange={(e) => updateLimite('lead_urgente', parseInt(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="limite_followup" className="text-xs">Follow-ups</Label>
                <Input
                  id="limite_followup"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.limites_por_tipo?.followup_atrasado || 5}
                  onChange={(e) => updateLimite('followup_atrasado', parseInt(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="limite_oportunidade" className="text-xs">Oportunidades</Label>
                <Input
                  id="limite_oportunidade"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.limites_por_tipo?.oportunidade || 8}
                  onChange={(e) => updateLimite('oportunidade', parseInt(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="limite_meta" className="text-xs">Metas</Label>
                <Input
                  id="limite_meta"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.limites_por_tipo?.meta_performance || 3}
                  onChange={(e) => updateLimite('meta_performance', parseInt(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};