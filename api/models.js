export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta la variable GEMINI_API_KEY' });
  }

  const url = new URL('https://generativelanguage.googleapis.com/v1/models');
  url.searchParams.set('key', apiKey);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || response.statusText;
      return res.status(response.status).json({ error: message });
    }

    const models = Array.isArray(data?.models)
      ? data.models.filter(
          (model) =>
            Array.isArray(model?.supportedGenerationMethods) &&
            model.supportedGenerationMethods.includes('generateContent')
        )
      : [];

    return res.status(200).json({ models });
  } catch (error) {
    console.error('Error solicitando modelos a Gemini:', error);
    return res.status(500).json({ error: 'Error interno al obtener modelos' });
  }
}
