export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: 'Error: Falta configurar la variable GEMINI_API_KEY en Vercel.' });
  }

  try {
    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1].content;

    // Usamos el endpoint directo con la clave en la URL
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { 
                text: `Eres el Asistente de Asesoría Laboral de la Sección Sindical de CGT en Amazon DQA4. Responde de forma clara, concisa y profesional a la siguiente duda laboral basándote en el Estatuto de los Trabajadores: ${lastMessage}` 
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
    } else {
      console.error("Respuesta inesperada de Google:", JSON.stringify(data));
      return res.status(200).json({ 
        reply: 'La IA no pudo procesar la respuesta. Comprueba que tu API Key sea correcta y tenga cuota activa en Google AI Studio.' 
      });
    }
  } catch (error) {
    console.error("Error en Serverless Function:", error);
    return res.status(200).json({ reply: 'Error interno al conectar con el servicio de IA.' });
  }
}
