# 🚀 Guía de Despliegue - Dan&Giv Control

## 📋 Resumen de Variables de Entorno

### Estado Actual ✅

| Variable | Ubicación | Estado | Acción Requerida |
|----------|-----------|--------|------------------|
| `GEMINI_API_KEY` | `backend/.env` | ✅ Configurada | Mantener secreta |
| `PERPLEXITY_API_KEY` | `backend/.env` | ✅ Configurada | Mantener secreta |
| `firebase-config.js` | Código fuente | ✅ **LIMPIO** | Keys removidas |

---

## 🔒 Seguridad: Claves Protegidas

**✅ ACCIÓN COMPLETADA:** Las API keys fueron removidas del código fuente.

### Antes (INSEGURO ❌)
```javascript
const perplexityApiKey = 'Tpplx-oKfcPhGOZhJr8QYclMVcQTVNEoRo4vsKcrOaaXNpqUDLgHeJ';
```

### Ahora (SEGURO ✅)
```javascript
const perplexityApiKey = ''; // Vacío - se usa desde backend o variables de entorno
```

---

## 🎯 Opciones de Despliegue

### Opción 1: Frontend + Backend (Recomendado) 🔐

**Máxima seguridad** - Las API keys nunca están expuestas

#### Paso 1: Desplegar Backend

**Vercel (Recomendado)**
```bash
cd backend
npm install
vercel
```

Configurar variables en Vercel:
```bash
vercel env add GEMINI_API_KEY
vercel env add PERPLEXITY_API_KEY
```

**Railway**
```bash
railway login
railway init
railway up
```

**Render**
1. Conecta tu repositorio
2. Selecciona `backend/` como directorio raíz
3. Agrega variables de entorno en el dashboard

#### Paso 2: Desplegar Frontend

```bash
# En la raíz del proyecto
vercel
```

Configurar URL del backend en el frontend:
```javascript
// En app.js, cambiar:
const BACKEND_URL = 'https://tu-backend.vercel.app';
```

---

### Opción 2: Solo Frontend (Más Simple) ⚠️

**Para desarrollo o uso personal** - Las keys estarán visibles en el navegador

#### Paso 1: Crear archivo .env local

```bash
cp .env.example .env
```

Editar `.env` con tus keys reales:
```bash
GEMINI_API_KEY=tu_key_real_aqui
PERPLEXITY_API_KEY=tu_key_real_aqui
```

#### Paso 2: Desplegar en Vercel/Netlify

**Vercel**
```bash
vercel

# Agregar variables de entorno
vercel env add GEMINI_API_KEY
vercel env add PERPLEXITY_API_KEY
```

**Netlify**
```bash
netlify deploy

# O usa la UI para agregar variables
```

#### ⚠️ Limitación
Las API keys estarán accesibles en DevTools del navegador. Esto está bien para:
- Desarrollo local
- Proyectos personales
- Demos privadas

❌ **NO recomendado** para:
- Aplicaciones públicas
- Producción con muchos usuarios
- Si temes que roben tus API keys

---

## 📦 Archivos para Subir al Servidor

### Para Frontend Solo
```
✅ index.html
✅ app.js
✅ style.css
✅ firebase-config.js (sin keys expuestas)
✅ .gitignore
❌ .env (NUNCA subir)
❌ backend/ (no necesario)
```

### Para Frontend + Backend
```
Frontend:
✅ index.html
✅ app.js
✅ style.css
✅ firebase-config.js

Backend:
✅ backend/server.js
✅ backend/package.json
❌ backend/.env (configurar en hosting)
❌ backend/node_modules/
```

---

## 🌐 Configuración por Hosting

### Vercel

**Frontend**
```bash
# vercel.json
{
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null
}
```

**Backend**
```bash
# backend/vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### Netlify

**netlify.toml**
```toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/api/*"
  to = "https://tu-backend.vercel.app/api/:splat"
  status = 200
```

---

## 🔄 Flujo de Trabajo Completo

### Desarrollo Local

1. **Backend**
```bash
cd backend
npm install
node server.js
# Servidor en http://localhost:3000
```

2. **Frontend**
```bash
# En otra terminal
python -m http.server 8000
# O usa Live Server en VSCode
```

3. **Probar**
- Abre http://localhost:8000
- Las llamadas a API van a `http://localhost:3000`

### Producción

1. **Backend en Vercel**
```bash
cd backend
vercel --prod
# URL: https://tu-backend.vercel.app
```

2. **Frontend en Vercel**
```bash
cd ..
vercel --prod
# URL: https://tu-app.vercel.app
```

3. **Actualizar URL del backend en el frontend**
```javascript
// app.js
const BACKEND_URL = 'https://tu-backend.vercel.app';
```

---

## ✅ Checklist de Seguridad

Antes de subir a producción:

- [ ] ✅ `.env` está en `.gitignore`
- [ ] ✅ `firebase-config.js` no tiene API keys expuestas
- [ ] ✅ Variables de entorno configuradas en hosting
- [ ] ✅ Backend desplegado con variables de entorno
- [ ] ✅ Frontend apunta a la URL correcta del backend
- [ ] ❌ **REVOCASTE la Perplexity key antigua** (estaba expuesta)
- [ ] ❌ **Generaste una nueva Perplexity key**

---

## 🆘 Problemas Comunes

### 1. "API key no válida"
**Causa**: Variables de entorno no configuradas
**Solución**: Verifica variables en tu hosting

### 2. "CORS error"
**Causa**: Backend no permite origen del frontend
**Solución**: Actualiza CORS en `server.js`

### 3. "Cannot read property of undefined"
**Causa**: Backend no está respondiendo
**Solución**: Verifica que el backend esté desplegado y activo

---

## 🎓 Recomendación Final

**Para este proyecto:**
- ✅ Usa **Frontend + Backend** en producción
- ✅ Configura variables de entorno en Vercel
- ✅ Mantén `.env` local para desarrollo
- ✅ **REVOCA y regenera** las API keys expuestas

**¿Necesitas ayuda?**
Pregúntame y te guío paso a paso en el despliegue.
