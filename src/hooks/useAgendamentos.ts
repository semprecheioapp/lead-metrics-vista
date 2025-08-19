import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agendamento {
  id: number;
  name: string | null;
  number: string | null;
  email: string | null;
  data: string | null;
  hora: string | null;
  serviço: string | null;
  status: boolean | null;
  compareceu: boolean | null;
  lembrete_enviado: boolean | null;
  lembrete_enviado_2: boolean | null;
  created_at: string | null;
  empresa_id: number | null;
}

// Hook principal agora filtra por empresa e só executa quando a empresa estiver carregada
export const useAgendamentos = (empresaId?: number) => {
  return useQuery({
    queryKey: ["agendamentos", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("empresa_id", empresaId as number)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Agendamento[];
    },
  });
};

export const useCreateAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agendamento: Omit<Agendamento, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("agendamentos")
        .insert([agendamento])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"], exact: false });
      toast.success("Agendamento criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar agendamento:", error);
      toast.error("Erro ao criar agendamento");
    },
  });
};

export const useUpdateAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Agendamento> & { id: number }) => {
      const { data, error } = await supabase
        .from("agendamentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"], exact: false });
      toast.success("Agendamento atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error("Erro ao atualizar agendamento");
    },
  });
};

export const useDeleteAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"], exact: false });
      toast.success("Agendamento deletado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao deletar agendamento:", error);
      toast.error("Erro ao deletar agendamento");
    },
  });
};