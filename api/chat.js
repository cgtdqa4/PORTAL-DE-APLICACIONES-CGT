export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;
        
        // Aquí puedes integrar la lógica para responder (por ejemplo, respuestas automáticas o llamadas a una API de IA).
        // De momento, como respuesta de prueba o predeterminada:
        const userLastMessage = messages[messages.length - 1].content.toLowerCase();
        
        let reply = "Gracias por tu consulta. Para gestiones específicas o dudas concretas sobre tus derechos, recuerda que puedes ponerte en contacto con la sección sindical en cgt.dqa4@gmail.com";

        if (userLastMessage.includes("vacaciones")) {
            reply = "Las vacaciones se planifican según convenio. Consulta la sección de herramientas o contacta con la delegación.";
        } else if (userLastMessage.includes("permiso")) {
            reply = "Puedes revisar los detalles actualizados en la Guía de Permisos disponible en la sección de herramientas libres.";
        }

        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
