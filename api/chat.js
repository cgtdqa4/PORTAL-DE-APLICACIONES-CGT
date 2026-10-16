import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const lastUserMessage = messages[messages.length - 1].content;

    const genAI = new GoogleGenerativeAI(apiKey);

    const systemPrompt = "Eres el Asistente de Asesoría Laboral de la Sección Sindical de CGT en Amazon DQA4. Responde de forma clara, concisa y profesional a las consultas laborales de los trabajadores basándote en el Estatuto de los Trabajadores. Si requiere estudio de nómina o documentos, remítelos a cgt.dqa4@gmail.com.";

    // Usamos el modelo actual exigido por la API de Google
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(lastUserMessage);
    const response = await result.response;
    const replyText = response.text();

    if (replyText) {
      return res.status(200).json({ reply: replyText });
    } else {
      return res.status(200).json({ reply: 'La IA no devolvió texto en su respuesta.' });
    }

  } catch (error) {
    console.error("Error al conectar con Gemini SDK:", error);
    return res.status(200).json({ 
      reply: `Error en la API de Google: ${error.message || 'Comprueba que tu API Key sea válida.'}` 
    });
  }
}
