// ========================================
// API PROXY SEGURO - Dan&Giv Control
// ========================================
// Este archivo maneja llamadas a APIs externas de forma segura
// Las API keys están en variables de entorno, NO en el código

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - Permitir solo tu dominio
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://dangivcontrol.com',
  'https://www.dangivcontrol.com',
  process.env.VITE_APP_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La política CORS de este sitio no permite acceso desde este origen.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiting simple (en producción usar express-rate-limit)
const requestCounts = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = 100;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip).filter(time => now - time < windowMs);

  if (requests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Demasiadas solicitudes. Intenta más tarde.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }

  requests.push(now);
  requestCounts.set(ip, requests);
  next();
}

app.use(rateLimit);

// ========================================
// PROXY PARA GEMINI AI
// ========================================
app.post('/api/gemini', async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY no configurada en .env');
    return res.status(500).json({
      error: 'Servicio de IA no configurado'
    });
  }

  try {
    const { prompt, model = 'gemini-pro' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt requerido' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error en proxy Gemini:', error);
    res.status(500).json({
      error: 'Error al procesar solicitud de IA',
      details: error.message
    });
  }
});

// ========================================
// PROXY PARA UNSPLASH
// ========================================

// Endpoint para foto random
app.get('/api/unsplash/random', async (req, res) => {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!UNSPLASH_ACCESS_KEY) {
    console.error('❌ UNSPLASH_ACCESS_KEY no configurada en .env');
    return res.status(500).json({
      error: 'Servicio de imágenes no configurado'
    });
  }

  try {
    const { query, orientation = 'landscape' } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query requerido' });
    }

    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=${orientation}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error en proxy Unsplash random:', error);
    res.status(500).json({
      error: 'Error al obtener imagen random',
      details: error.message
    });
  }
});

// Endpoint para búsqueda
app.get('/api/unsplash/search', async (req, res) => {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

  if (!UNSPLASH_ACCESS_KEY) {
    console.error('❌ UNSPLASH_ACCESS_KEY no configurada en .env');
    return res.status(500).json({
      error: 'Servicio de imágenes no configurado'
    });
  }

  try {
    const { query, per_page = 10, page = 1 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query requerido' });
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${per_page}&page=${page}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error en proxy Unsplash:', error);
    res.status(500).json({
      error: 'Error al buscar imágenes',
      details: error.message
    });
  }
});

// ========================================
// PROXY PARA PERPLEXITY (Opcional)
// ========================================
app.post('/api/perplexity', async (req, res) => {
  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

  if (!PERPLEXITY_API_KEY) {
    return res.status(500).json({
      error: 'Servicio de Perplexity no configurado'
    });
  }

  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: 'Messages requerido' });
    }

    const response = await fetch(
      'https://api.perplexity.ai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: messages
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error en proxy Perplexity:', error);
    res.status(500).json({
      error: 'Error al procesar solicitud',
      details: error.message
    });
  }
});

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      gemini: !!process.env.GEMINI_API_KEY,
      unsplash: !!process.env.UNSPLASH_ACCESS_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY
    }
  });
});

// ========================================
// ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 API Proxy corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
