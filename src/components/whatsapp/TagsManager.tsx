
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TagsManagerProps {
  leadId: number;
  currentTags: string[];
  onTagsUpdate: (newTags: string[]) => void;
}

const predefinedTags = [
  "Interessado",
  "Qualificado", 
  "Urgente",
  "Perdido",
  "Follow-up",
  "VIP",
  "Potencial Alto",
  "Potencial Baixo",
  "Reagendado",
  "Convertido"
];

export const TagsManager = ({ leadId, currentTags, onTagsUpdate }: TagsManagerProps) => {
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { empresaData } = useAuth();

  const updateLeadTags = async (tags: string[]) => {
    if (!empresaData?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('novos_leads')
        .update({ tags: tags })
        .eq('id', leadId)
        .eq('empresa_id', empresaData.id);

      if (error) throw error;

      onTagsUpdate(tags);
      toast.success("Tags atualizadas com sucesso!");
    } catch (error) {
      console.error('Erro ao atualizar tags:', error);
      toast.error("Erro ao atualizar tags");
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = async (tag: string) => {
    if (!tag.trim() || currentTags.includes(tag.trim())) return;
    
    const newTags = [...currentTags, tag.trim()];
    await updateLeadTags(newTags);
    setNewTag("");
  };

  const removeTag = async (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    await updateLeadTags(newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTag(newTag);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="w-4 h-4" />
          Tags do Lead
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tags Atuais */}
        <div className="flex flex-wrap gap-2">
          {currentTags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="flex items-center gap-1 px-2 py-1"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                disabled={isLoading}
                className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {currentTags.length === 0 && (
            <span className="text-sm text-muted-foreground">Nenhuma tag aplicada</span>
          )}
        </div>

        {/* Adicionar Nova Tag */}
        <div className="flex gap-2">
          <Input
            placeholder="Digite uma nova tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => addTag(newTag)}
            disabled={isLoading || !newTag.trim()}
            size="sm"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Tags Predefinidas */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Tags Sugeridas:</span>
          <div className="flex flex-wrap gap-2">
            {predefinedTags
              .filter(tag => !currentTags.includes(tag))
              .map((tag) => (
                <Badge 
                  key={tag}
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
