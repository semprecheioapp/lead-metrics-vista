import { ArrowLeft, Info, MoreVertical, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScheduleFollowupModal } from "@/components/ScheduleFollowupModal";
import { useScheduleFollowup } from "@/hooks/useScheduleFollowup";
import { useState } from "react";

interface ChatHeaderProps {
  currentLead: {
    id: string;
    name: string;
    telefone: string;
    isOnline?: boolean;
  };
  onBackToConversations?: () => void;
  onToggleInfoPanel: () => void;
  infoPanelCollapsed: boolean;
  isMobile?: boolean;
  onResolveConversation: () => void;
  isResolving: boolean;
}

export function ChatHeader({
  currentLead,
  onBackToConversations,
  onToggleInfoPanel,
  infoPanelCollapsed,
  isMobile,
  onResolveConversation,
  isResolving
}: ChatHeaderProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { scheduleFollowup, isScheduling } = useScheduleFollowup();

  const handleScheduleFollowup = (data: { date: Date; message: string; leadId: string }) => {
    scheduleFollowup(data);
    setShowScheduleModal(false);
  };
  return (
    <div className="p-3 sm:p-4 border-b border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {isMobile && onBackToConversations && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={onBackToConversations}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
            <AvatarFallback className="text-xs sm:text-sm">
              {currentLead.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
              {currentLead.name}
            </h3>
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {currentLead.telefone}
              </p>
              {currentLead.isOnline && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  Online
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onToggleInfoPanel}
          >
            <Info className={cn(
              "h-4 w-4 transition-colors",
              !infoPanelCollapsed && "text-primary"
            )} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              sideOffset={4} 
              collisionPadding={8} 
              className="w-56 max-w-[90vw] sm:max-w-[16rem]"
            >
              <DropdownMenuItem 
                onClick={onResolveConversation}
                disabled={isResolving}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marcar como resolvido
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowScheduleModal(true)}>
                <Clock className="w-4 h-4 mr-2" />
                Agendar follow-up
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScheduleFollowupModal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        lead={{
          id: currentLead.id,
          name: currentLead.name,
          number: currentLead.telefone
        }}
        onSchedule={handleScheduleFollowup}
        isLoading={isScheduling}
      />
    </div>
  );
}