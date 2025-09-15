// Script para testar o processamento de mídia
const testRecord = {
  id: 4724,
  empresa_id: 2,
  session_id: "556699618890",
  message: {
    type: "image",
    content: ".",
    attachment: {
      type: "image",
      base64: "/9j/4AAQSkZJRgABAQAAAQABAAD..." // truncated for brevity
    }
  }
};

const response = await fetch('https://mycjqmnvyphnarjoriux.supabase.co/functions/v1/process-whatsapp-media', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Y2pxbW52eXBobmFyam9yaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2ODk0MTYsImV4cCI6MjA3MDI2NTQxNn0.2J4W2hsBj9R--BsGjFBQ5iKJJf0HM0JpQ-DgagC_Xv4'
  },
  body: JSON.stringify({ record: testRecord })
});

console.log(await response.json());