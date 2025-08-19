-- Adicionar coluna para nome padrão do remetente na configuração da empresa
ALTER TABLE public.configuracoes_empresa 
ADD COLUMN nome_remetente_padrao TEXT DEFAULT 'Atendente';