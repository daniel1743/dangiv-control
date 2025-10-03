// 1. Importar las herramientas
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();

// 2. Configurar el servidor
const app = express();
const PORT = 3000;

// 3. Configurar CORS
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:8000',
    'http://localhost:8000'
  ]
}));

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

// === INICIO: ENDPOINT PARA CHAT FINANCIERO ===
app.post('/api/gemini/financial-chat', async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada en .env' });
    }

    const { userMessage, context } = req.body;

    if (!userMessage || !context) {
      return res.status(400).json({ error: 'Faltan parámetros: userMessage y context requeridos' });
    }

    const systemPrompt = `Eres un asistente financiero personal llamado "FinanBot". Tu tarea es analizar las finanzas del usuario y dar consejos personalizados, motivadores y prácticos.

Contexto del usuario ${context.userName}:
- Ingreso mensual: $${context.monthlyIncome}
- Total gastado: $${context.totalExpenses}
- Disponible: $${context.available}
- Gastos innecesarios: $${context.unnecessaryTotal} (${context.unnecessaryCount} gastos)
- Metas activas: ${context.activeGoalsCount}
- Metas cerca de completarse: ${context.goalsNearCompletion}

Gastos por categoría:
${Object.entries(context.categoryTotals || {}).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}

IMPORTANTE:
1. Usa el nombre del usuario (${context.userName}) en tu respuesta
2. Si hay gastos innecesarios, menciónalos con tacto
3. Si están cerca de completar metas, felicítalos y motívalos
4. Si el disponible es negativo, alerta con empatía
5. Sé conciso (máximo 150 palabras)
6. Usa emojis relevantes pero con moderación
7. Da consejos accionables y específicos

Responde de manera amigable, personalizada y motivadora.`;

    const requestBody = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nPregunta del usuario: ${userMessage}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Gemini API:', errorData);
      return res.status(response.status).json({
        error: `Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`
      });
    }

    const data = await response.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!botResponse) {
      return res.status(500).json({ error: 'Gemini no generó una respuesta válida' });
    }

    res.json({ response: botResponse });

  } catch (error) {
    console.error('Error en /api/gemini/financial-chat:', error);
    res.status(500).json({ error: error.message });
  }
});
// === FIN: ENDPOINT PARA CHAT FINANCIERO ===

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
