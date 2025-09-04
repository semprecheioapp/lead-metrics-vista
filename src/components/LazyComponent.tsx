import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadsTable } from '@/components/LeadsTable';
import { KanbanBoard } from '@/components/KanbanBoard';
import { WhatsAppCRM } from '@/components/whatsapp/WhatsAppCRM';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';

export function LazyLeadsTable(props: any) {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    }>
      <LeadsTable {...props} />
    </Suspense>
  );
}

export function LazyKanbanBoard(props: any) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    }>
      <KanbanBoard {...props} />
    </Suspense>
  );
}

export function LazyWhatsAppCRM(props: any) {
  return (
    <Suspense fallback={
      <div className="flex h-full">
        <Skeleton className="w-80 h-full" />
        <Skeleton className="flex-1 h-full" />
        <Skeleton className="w-80 h-full" />
      </div>
    }>
      <WhatsAppCRM {...props} />
    </Suspense>
  );
}

export function LazyAIInsightsDashboard(props: any) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    }>
      <AIInsightsDashboard {...props} />
    </Suspense>
  );
}