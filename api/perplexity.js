function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return { error: 'El cuerpo debe incluir un arreglo messages' };
  }

  const normalized = [];
  for (const message of messages) {
    if (!message || typeof message.content !== 'string') {
      return { error: 'Cada mensaje debe incluir contenido de texto' };
    }

    const role = message.role === 'assistant' ? 'model' : 'user';
    normalized.push({
      role,
      parts: [{ text: message.content }],
    });
  }
  return { data: normalized };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'TU_CLAVE_DE_GEMINI_AQUI') {
    return res.status(500).json({
      error: 'La variable GEMINI_API_KEY no está configurada',
    });
  }

  const { data: conversationHistory, error: validationError } = normalizeMessages(
    req.body?.messages
  );

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const systemInstruction = {
    role: 'user',
    parts: [
      {
        text: 'Eres un asistente financiero amigable. Responde de forma breve y haz solo una pregunta a la vez.',
      },
    ],
  };

  const contents = [systemInstruction, ...conversationHistory];
  const modelFromRequest = req.body?.model;
  const model =
    typeof modelFromRequest === 'string' && modelFromRequest.trim().length > 0
      ? modelFromRequest.trim()
      : 'gemini-2.0-flash-lite';

  const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${geminiKey}`;

  try {
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || 'Fallo en la API de Gemini';
      console.error('Error de la API de Gemini:', message);
      return res.status(response.status).json({ error: message });
    }

    const aiMessage = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiMessage) {
      return res
        .status(502)
        .json({ error: 'La respuesta de Gemini no contiene contenido válido' });
    }

    return res.status(200).json({
      choices: [{ message: { content: aiMessage } }],
    });
  } catch (error) {
    console.error('Error al llamar a la API de Gemini:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
