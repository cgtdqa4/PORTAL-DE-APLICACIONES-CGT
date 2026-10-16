export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: 'Error: Falta configurar GEMINI_API_KEY en Vercel.' });
  }

  try {
    const { messages } = req.body;
    const lastUserMessage = messages[messages.length - 1].content;

    // Usamos el modelo v1 de Gemini Flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `Eres el Asistente de Asesoría Laboral de la Sección Sindical de CGT en Amazon DQA4. Responde de forma clara y profesional a esta consulta laboral basándote en el Estatuto de los Trabajadores: ${lastUserMessage}` }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    // Si hay un error de Google, lo imprimimos en los logs de Vercel para verlo claramente
    if (!response.ok) {
      console.error("DETALLE ERROR GOOGLE AI STUDIO:", JSON.stringify(data, null, 2));
      return res.status(200).json({ 
        reply: `Error de Google (${response.status}): ${data.error?.message || 'Revisa los logs de Vercel'}` 
      });
    }

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
    } else {
      return res.status(200).json({ reply: 'La IA no devolvió texto en su respuesta.' });
    }
  } catch (error) {
    console.error("Error de red en servidor:", error);
    return res.status(200).json({ reply: 'Error de conexión con el servidor.' });
  }
}
