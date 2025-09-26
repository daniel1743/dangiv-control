// 1. Importar las herramientas
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// 2. Configurar el servidor
const app = express();
const PORT = 3000;

// 3. Configurar CORS
app.use(cors({ origin: ['http://127.0.0.1:5500', 'http://localhost:5500'] }));

// 4. Permitir que el servidor entienda JSON
app.use(express.json());

// === INICIO: NUEVO ENDPOINT PARA LISTAR MODELOS DISPONIBLES ===
app.get('/api/models', async (req, res) => {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res
        .status(500)
        .json({ error: 'Falta GEMINI_API_KEY en el archivo .env' });
    }

    const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: data.error?.message || response.statusText });
    }

    // Filtramos para mostrar solo los modelos que podemos usar para generar contenido
    const validModels = data.models.filter((model) =>
      model.supportedGenerationMethods.includes('generateContent')
    );

    return res.json({ models: validModels });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// === FIN: NUEVO ENDPOINT PARA LISTAR MODELOS ===

// 5. Endpoint principal para el chat
app.post('/api/perplexity', async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey === 'TU_CLAVE_DE_GEMINI_AQUI') {
      throw new Error(
        'La clave de API de Gemini no está configurada en el servidor.'
      );
    }

    const conversationHistory = req.body.messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

    const systemInstruction = {
      role: 'user',
      parts: [
        {
          text: 'Eres un asistente financiero amigable. Responde de forma breve y haz solo una pregunta a la vez.',
        },
      ],
    };

    const geminiRequestBody = {
      contents: [systemInstruction, ...conversationHistory],
    };

    // ▼▼▼ CORRECCIÓN FINAL Y DEFINITIVA ▼▼▼
    // Volvemos al modelo más estándar y ponemos la clave en la URL.
    // Usar el modelo disponible según /api/models
    const modelToUse = 'gemini-2.0-flash-lite';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${modelToUse}:generateContent?key=${geminiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // La clave ya no va aquí
      },
      body: JSON.stringify(geminiRequestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de la API de Gemini:', errorData);
      throw new Error(`Error de la API de Gemini: ${errorData.error.message}`);
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiMessage) {
      throw new Error('La IA no generó una respuesta válida.');
    }
    const frontendResponse = {
      choices: [{ message: { content: aiMessage } }],
    };

    res.json(frontendResponse);
  } catch (error) {
    console.error('Error en el servidor proxy:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Poner el servidor a escuchar
app.listen(PORT, () => {
  console.log(
    `✅ Servidor proxy (con diagnóstico) escuchando en http://localhost:${PORT}`
  );
});
