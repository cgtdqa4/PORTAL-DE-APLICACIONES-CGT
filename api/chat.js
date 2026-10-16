export default async function handler(req, res) {
  // Asegurarse de que solo se acepten peticiones POST (o el método que necesites)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { message } = req.body;

    // Aquí puedes procesar la lógica, llamar a una API externa (como OpenAI, etc.)
    // Usando variables de entorno seguras de Vercel (ej: process.env.MI_CLAVE_SECRETA)

    // Respuesta de ejemplo de la API
    return res.status(200).json({ 
      success: true, 
      reply: `Mensaje recibido correctamente: "${message}"` 
    });

  } catch (error) {
    console.error('Error en la función de Vercel:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
