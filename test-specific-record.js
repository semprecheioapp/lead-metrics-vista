// Teste específico para o registro 4725
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mycjqmnvyphnarjoriux.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Y2pxbW52eXBobmFyam9yaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODk0MTYsImV4cCI6MjA3MDI2NTQxNn0.2J4W2hsBj9R--BsGjFBQ5iKJJf0HM0JpQ-DgagC_Xv4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Buscar o registro específico
const { data: record } = await supabase
  .from('memoria_ai')
  .select('*')
  .eq('id', 4725)
  .single();

console.log('Registro encontrado:', record);

// Chamar a edge function diretamente
const { data: result, error } = await supabase.functions.invoke('process-whatsapp-media', {
  body: { record }
});

console.log('Resultado do processamento:', result);
if (error) console.error('Erro:', error);