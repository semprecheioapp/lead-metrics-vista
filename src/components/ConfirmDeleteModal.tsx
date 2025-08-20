import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactName?: string;
  contactPhone?: string;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contactName,
  contactPhone,
  isDeleting = false,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirmar exclusão
            </AlertDialogTitle>
          </div>
          
          <AlertDialogDescription className="text-sm">
            <p className="mb-3">
              Você está prestes a excluir permanentemente o contato:
            </p>
            
            <div className="bg-gray-50 p-3 rounded-md mb-3">
              <p className="font-medium text-gray-900">
                {contactName || 'Contato sem nome'}
              </p>
              {contactPhone && (
                <p className="text-sm text-gray-600 mt-1">
                  📱 {contactPhone}
                </p>
              )}
            </div>
            
            <div className="space-y-2 text-red-600">
              <p className="flex items-start gap-2">
                <span>•</span>
                <span>Este contato será removido permanentemente</span>
              </p>
              <p className="flex items-start gap-2">
                <span>•</span>
                <span>Todas as conversas do WhatsApp serão excluídas</span>
              </p>
              <p className="flex items-start gap-2">
                <span>•</span>
                <span>Esta ação não pode ser desfeita</span>
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex gap-2">
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              disabled={isDeleting}
              onClick={onClose}
            >
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir permanentemente
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};