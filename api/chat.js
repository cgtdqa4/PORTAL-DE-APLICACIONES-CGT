import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ reply: 'Error: Falta configurar GEMINI_API_KEY en los ajustes de Vercel.' });
  }

  try {
    const { messages } = req.body;
    const lastUserMessage = messages[messages.length - 1].content;

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemPrompt = "Eres el Asistente de Asesoría Laboral de la Sección Sindical de CGT en Amazon DQA4. Responde de forma clara, concisa y profesional a la consulta del trabajador basándote en el Estatuto de los Trabajadores. Si requiere estudio de nómina o documentos, remítelos a cgt.dqa4@gmail.com.";

    let replyText = "";

    // Intentamos primero con gemini-1.5-flash
    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
      });
      const result = await model.generateContent(lastUserMessage);
      const response = await result.response;
      replyText = response.text();
    } catch (e) {
      console.warn("Fallo gemini-1.5-flash, probando modelo alternativo...", e.message);
      // Fallback a gemini-1.5-pro si el anterior falla
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const result = await fallbackModel.generateContent(`${systemPrompt}\n\nPregunta: ${lastUserMessage}`);
      const response = await result.response;
      replyText = response.text();
    }

    if (replyText) {
      return res.status(200).json({ reply: replyText });
    } else {
      return res.status(200).json({ reply: 'La IA no devolvió texto en su respuesta.' });
    }

  } catch (error) {
    console.error("Error al conectar con Gemini SDK:", error);
    return res.status(200).json({ 
      reply: `Error en la API de Google: ${error.message || 'Comprueba que tu API Key esté activa en Google AI Studio.'}` 
    });
  }
}
