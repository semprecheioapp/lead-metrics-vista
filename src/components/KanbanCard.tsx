import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Calendar, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { LeadConversationModal } from "./LeadConversationModal";

interface KanbanCardProps {
  lead: {
    id: number;
    name: string;
    number: string;
    qualificacao?: string;
    created_at: string;
  };
}

export function KanbanCard({ lead }: KanbanCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        onClick={handleCardClick}
        className={`cursor-pointer bg-background border-border hover:shadow-lg transition-all duration-200 flex-shrink-0 ${
          isDragging ? "opacity-30 rotate-2 scale-105 shadow-2xl border-primary/50" : ""
        }`}
      >
      <CardContent className="p-2 md:p-3">
        <div className="space-y-2">
          {/* Drag handle and Nome do lead */}
          <div className="flex items-center gap-2">
            <div 
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
            <User className="w-4 h-4 text-primary flex-shrink-0" />
            <h4 className="font-medium text-foreground text-xs md:text-sm truncate">
              {lead.name || "Lead sem nome"}
            </h4>
          </div>

          {/* Número do lead */}
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground truncate">
              {lead.number || "Sem número"}
            </span>
          </div>

          {/* Data de criação */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              {format(new Date(lead.created_at), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Qualificação */}
          {lead.qualificacao && (
            <Badge 
              variant={
                lead.qualificacao === "MUITO_QUALIFICADO" ? "default" :
                lead.qualificacao === "QUALIFICADO" ? "secondary" :
                "outline"
              }
              className="text-xs"
            >
              {lead.qualificacao.replace("_", " ")}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>

    <LeadConversationModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      leadName={lead.name || "Lead sem nome"}
      phoneNumber={lead.number || ""}
    />
    </>
  );
}