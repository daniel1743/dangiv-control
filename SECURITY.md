# 🔒 Guía de Seguridad - Dan&Giv Control

## ⚠️ IMPORTANTE: API Keys Expuestas

Tu aplicación actualmente tiene las API keys **visibles en el código**. Esto es un riesgo de seguridad.

### Estado Actual

| Servicio | Estado | Riesgo |
|----------|--------|--------|
| Firebase Config | ✅ Expuesta (Normal) | Bajo - Es público por diseño |
| Gemini API | ⚠️ Placeholder | Medio - Debes configurarla |
| Perplexity API | ❌ **EXPUESTA** | **ALTO - Cualquiera puede verla** |

---

## 🛡️ Solución 1: Frontend Solo (Actual)

Si mantienes la app solo frontend (sin backend):

### Paso 1: Crear archivo .env
```bash
# Copia .env.example como .env
cp .env.example .env
```

### Paso 2: Agregar tus keys reales al .env
```bash
GEMINI_API_KEY=tu_key_real_aqui
PERPLEXITY_API_KEY=tu_key_real_aqui
```

### Paso 3: NUNCA subir .env a GitHub
El archivo `.gitignore` ya está configurado para ignorar `.env`

### ⚠️ Limitación
Aunque uses `.env` localmente, cuando subas a producción (Vercel, Netlify) las keys estarán visibles en el navegador del usuario.

**Riesgo**: Alguien puede abrir DevTools (F12) y copiar tus API keys.

---

## 🔐 Solución 2: Con Backend (Recomendado para Producción)

Para proteger completamente tus API keys, necesitas usar el backend.

### Arquitectura Segura

```
Usuario → Frontend (index.html, app.js) → Backend (server.js) → APIs (Gemini, Perplexity)
```

Las API keys están **solo en el servidor**, nunca en el navegador.

### Paso 1: Configurar Backend

Ya tienes `backend/server.js`. Solo necesitas:

```bash
cd backend
npm install
```

### Paso 2: Crear backend/.env
```bash
GEMINI_API_KEY=tu_key_real_aqui
PERPLEXITY_API_KEY=tu_key_real_aqui
PORT=3000
```

### Paso 3: Modificar firebase-config.js

En lugar de exponer las keys, usar placeholders:

```javascript
const geminiApiKey = ''; // Vacío - se usa el backend
const perplexityApiKey = ''; // Vacío - se usa el backend
```

### Paso 4: Modificar app.js

Cambiar las llamadas directas a APIs por llamadas al backend:

**ANTES (inseguro):**
```javascript
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, ...)
```

**DESPUÉS (seguro):**
```javascript
fetch(`http://localhost:3000/api/gemini`, {
  method: 'POST',
  body: JSON.stringify({ prompt: '...' })
})
```

### Paso 5: Desplegar Backend

Opciones gratuitas:
- **Vercel** - Soporta Node.js
- **Railway** - railway.app
- **Render** - render.com
- **Heroku** - heroku.com (hobby tier)

---

## 📊 Comparación de Opciones

| Aspecto | Frontend Solo | Con Backend |
|---------|---------------|-------------|
| **Seguridad** | ⚠️ Baja | ✅ Alta |
| **Velocidad** | ✅ Rápida | ⚠️ Más lenta |
| **Costo** | ✅ Gratis | ✅ Gratis (tier gratuito) |
| **Complejidad** | ✅ Simple | ⚠️ Requiere 2 deployments |
| **Keys visibles** | ❌ Sí | ✅ No |

---

## 🚀 Recomendación por Caso de Uso

### Para Desarrollo/Pruebas
→ **Frontend Solo** con `.env` local

### Para Producción Pública
→ **Con Backend** + Variables de entorno en servidor

### Para Uso Personal/Privado
→ **Frontend Solo** está bien si solo tú accedes

---

## 🔑 Configuración en Vercel/Netlify

Si despliegas sin backend, configura variables de entorno:

### Vercel
```bash
vercel env add GEMINI_API_KEY
vercel env add PERPLEXITY_API_KEY
```

### Netlify
```bash
# En Netlify UI:
Site settings → Environment variables → Add variables
```

**PROBLEMA**: Aunque uses variables de entorno, al cargar en el navegador estarán visibles en DevTools.

---

## ✅ Acción Inmediata Requerida

1. **REVOCA tu Perplexity API Key actual** (está expuesta en GitHub si subiste el código)
2. **Genera una nueva key** en Perplexity
3. **Decide**: ¿Frontend solo o con backend?
4. **Configura** según la opción elegida

---

## 🆘 Soporte

¿Necesitas ayuda implementando la solución con backend?
Pregunta y te guío paso a paso.
