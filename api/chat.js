export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: 'Error de configuración: Falta la API Key en el servidor.' });
  }

  // Convertimos el historial al formato que entiende Gemini API
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  // Prompt del sistema para definir la personalidad laboral y sindical del bot
  const systemInstruction = {
    parts: [{
      text: `Eres el Asistente de Asesoría Laboral de la Sección Sindical de CGT en Amazon DQA4.
Tu objetivo es responder las consultas laborales de los trabajadores de manera precisa, clara, empática y rigurosa basándote en el Estatuto de los Trabajadores, convenios aplicables y normativa laboral española.
Si la consulta requiere revisar documentación privada o un análisis legal detallado, aconseja al trabajador ponerse en contacto directamente con la representación sindical en cgt.dqa4@gmail.com.`
    }]
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: systemInstruction,
        contents: contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 500
        }
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply });
    } else {
      return res.status(500).json({ reply: 'No se pudo generar respuesta de la IA.' });
    }
  } catch (error) {
    return res.status(500).json({ reply: 'Error de conexión con el servicio de IA.' });
  }
}
