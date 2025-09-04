import { DashboardLayout } from "@/components/DashboardLayout";
import { LazyWhatsAppCRM } from "@/components/LazyComponent";
import { PageTransition } from "@/components/PageTransition";

export default function WhatsApp() {
  try {
    return (
      <DashboardLayout>
        <PageTransition>
          <LazyWhatsAppCRM />
        </PageTransition>
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