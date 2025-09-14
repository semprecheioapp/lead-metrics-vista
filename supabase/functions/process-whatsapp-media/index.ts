import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MemoriaRecord {
  id: number
  message: {
    type: string
    content: string
    attachment?: {
      type: string
      base64: string
      filename?: string
    }
  }
  empresa_id: number
  session_id: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { record } = await req.json()
    console.log('🎯 Processando registro:', record.id)

    // Verificar se tem attachment base64
    const message = record.message
    if (!message?.attachment?.base64) {
      console.log('❌ Nenhum attachment base64 encontrado')
      return new Response(JSON.stringify({ success: false, reason: 'No base64 attachment' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { attachment } = message
    const { type, base64, filename } = attachment

    // Remover prefixo data: se existir
    const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '')
    
    // Converter base64 para bytes
    const bytes = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0))
    
    // Gerar nome único do arquivo
    const timestamp = Date.now()
    const extension = type === 'image' ? 'jpg' : 'bin'
    const fileName = filename || `${timestamp}.${extension}`
    const filePath = `${record.empresa_id}/${record.session_id}/${fileName}`

    console.log('📂 Fazendo upload:', filePath)

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('whatsapp-media')
      .upload(filePath, bytes, {
        contentType: type === 'image' ? 'image/jpeg' : 'application/octet-stream',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError)
      throw uploadError
    }

    console.log('✅ Upload realizado:', uploadData.path)

    // Gerar URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('whatsapp-media')
      .getPublicUrl(filePath)

    console.log('🔗 URL gerada:', publicUrl)

    // Atualizar registro com URL e remover base64
    const updatedMessage = {
      ...message,
      attachment: {
        type: attachment.type,
        filename: fileName
      }
    }

    const { error: updateError } = await supabase
      .from('memoria_ai')
      .update({
        attachment_type: type,
        attachment_url: publicUrl,
        message: updatedMessage
      })
      .eq('id', record.id)

    if (updateError) {
      console.error('❌ Erro ao atualizar registro:', updateError)
      throw updateError
    }

    console.log('✅ Registro atualizado com sucesso')

    return new Response(JSON.stringify({ 
      success: true, 
      attachment_url: publicUrl,
      attachment_type: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro na função:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})