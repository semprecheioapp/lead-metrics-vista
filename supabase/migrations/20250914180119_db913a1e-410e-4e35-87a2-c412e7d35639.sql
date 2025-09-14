-- Add missing attachment columns to memoria_ai table
ALTER TABLE public.memoria_ai 
ADD COLUMN attachment_type text,
ADD COLUMN attachment_url text;