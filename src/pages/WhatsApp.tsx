import { DashboardLayout } from "@/components/DashboardLayout";
import { WhatsAppCRM } from "@/components/whatsapp/WhatsAppCRM";

export default function WhatsApp() {
  try {
    return (
      <DashboardLayout>
        <WhatsAppCRM />
      </DashboardLayout>
    );
  } catch (error) {
    console.error('Erro no WhatsApp:', error);
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erro no WhatsApp CRM</h2>
          <p className="text-sm text-muted-foreground">Verifique o console para mais detalhes</p>
        </div>
      </DashboardLayout>
    );
  }
}