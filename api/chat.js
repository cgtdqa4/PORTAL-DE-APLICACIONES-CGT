import { GoogleGenerativeAI } from '@google/generative-ai';

// Función auxiliar para esperar milisegundos en caso de reintento
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

    const systemPrompt = "Eres el Asistente de Asesoría Laboral de la Sección Sindical de CGT en Amazon DQA4. Responde de forma clara, concisa y profesional a las consultas laborales de los trabajadores basándote en el Estatuto de los Trabajadores. Si la consulta requiere estudio de nómina o documentos, remítelos a cgt.dqa4@gmail.com.";

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.8-flash",
      systemInstruction: systemPrompt
    });

    let result = null;
    let attempts = 0;
    const maxAttempts = 2; // Intenta hasta 2 veces si hay un error 503

    while (attempts < maxAttempts) {
      try {
        attempts++;
        result = await model.generateContent(lastUserMessage);
        break; // Si tiene éxito, sale del bucle
      } catch (err) {
        // Si es un error de alta demanda (503) y aún nos queda un reintento, esperamos 1,5 segundos
        if (err.message && err.message.includes('503') && attempts < maxAttempts) {
          console.warn(`Servidor de Google ocupado (503). Reintentando en 1.5s... (Intento ${attempts})`);
          await sleep(1500);
        } else {
          throw err; // Si no es 503 o superó intentos, lanza el error al catch principal
        }
      }
    }

    const response = await result.response;
    const replyText = response.text();

    if (replyText) {
      return res.status(200).json({ reply: replyText });
    } else {
      return res.status(200).json({ reply: 'La IA no devolvió texto en su respuesta.' });
    }

  } catch (error) {
    console.error("Error al conectar con Gemini SDK:", error);

    // Si sigue dando 503 tras el reintento, le damos una respuesta amable al trabajador
    if (error.message && error.message.includes('503')) {
      return res.status(200).json({ 
        reply: 'El servidor de la IA está experimentando una alta demanda en este momento. Por favor, reintenta tu pregunta en unos segundos o escribe a cgt.dqa4@gmail.com.' 
      });
    }

    return res.status(200).json({ 
      reply: `Error en la API de Google: ${error.message || 'Comprueba que tu API Key sea válida.'}` 
    });
  }
}
