-- Add LLM configuration fields to configuracoes_empresa table
ALTER TABLE public.configuracoes_empresa
ADD COLUMN IF NOT EXISTS llm_provider TEXT DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS llm_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reports_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reports_frequency TEXT DEFAULT 'weekly';

-- Create ai_insights table for lead analysis
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    analysis_type TEXT NOT NULL DEFAULT 'leads',
    insights JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_analysis table for conversation analysis
CREATE TABLE IF NOT EXISTS public.conversation_analysis (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id BIGINT NOT NULL,
    analysis_type TEXT NOT NULL DEFAULT 'conversation',
    insights JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_insights
CREATE POLICY "Users can access own empresa ai_insights" 
ON public.ai_insights 
FOR ALL 
USING (empresa_id = ( SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "ai_insights_select_company" 
ON public.ai_insights 
FOR SELECT 
USING (empresa_id IN ( SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "ai_insights_insert_company" 
ON public.ai_insights 
FOR INSERT 
WITH CHECK (empresa_id IN ( SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

-- Create RLS policies for conversation_analysis
CREATE POLICY "Users can access own empresa conversation_analysis" 
ON public.conversation_analysis 
FOR ALL 
USING (empresa_id = ( SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "conversation_analysis_select_company" 
ON public.conversation_analysis 
FOR SELECT 
USING (empresa_id IN ( SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "conversation_analysis_insert_company" 
ON public.conversation_analysis 
FOR INSERT 
WITH CHECK (empresa_id IN ( SELECT profiles.empresa_id FROM profiles WHERE profiles.id = auth.uid()));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_ai_insights_updated_at
    BEFORE UPDATE ON public.ai_insights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_analysis_updated_at
    BEFORE UPDATE ON public.conversation_analysis
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();