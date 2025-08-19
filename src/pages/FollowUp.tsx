import { DashboardLayout } from "@/components/DashboardLayout";
import { FollowupManagement } from "@/components/FollowupManagement";

export default function FollowUp() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Follow-up de Leads</h1>
            <p className="text-muted-foreground/90 mt-2 text-sm sm:text-base">
              Reengaje leads que pararam no meio do funil de vendas
            </p>
          </div>
        </div>

        {/* Componente principal */}
        <FollowupManagement />
      </div>
    </DashboardLayout>
  );
}