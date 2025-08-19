-- Criar políticas RLS para a tabela agendamentos
CREATE POLICY "Users can view own empresa agendamentos" 
ON public.agendamentos 
FOR SELECT 
USING (empresa_id IN ( SELECT profiles.empresa_id
   FROM profiles
  WHERE (profiles.id = auth.uid())));

CREATE POLICY "Users can insert own empresa agendamentos" 
ON public.agendamentos 
FOR INSERT 
WITH CHECK (empresa_id IN ( SELECT profiles.empresa_id
   FROM profiles
  WHERE (profiles.id = auth.uid())));

CREATE POLICY "Users can update own empresa agendamentos" 
ON public.agendamentos 
FOR UPDATE 
USING (empresa_id IN ( SELECT profiles.empresa_id
   FROM profiles
  WHERE (profiles.id = auth.uid())));

CREATE POLICY "Users can delete own empresa agendamentos" 
ON public.agendamentos 
FOR DELETE 
USING (empresa_id IN ( SELECT profiles.empresa_id
   FROM profiles
  WHERE (profiles.id = auth.uid())));