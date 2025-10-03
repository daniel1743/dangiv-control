# 🔒 CHECKLIST DE SEGURIDAD - Dan&Giv Control

## 🚨 ESTADO ACTUAL: NO SEGURO PARA COMPARTIR

---

## ❌ PROBLEMAS CRÍTICOS (Solucionar ANTES de compartir)

### 1. API KEYS EXPUESTAS 🔴
**Archivo**: `firebase-config.js` líneas 45-58

**Problema**:
```javascript
// ❌ ESTAS KEYS ESTÁN VISIBLES PARA TODO EL MUNDO
const firebaseConfig = {
  apiKey: 'AIzaSyCNGTwiuxWNgBL_og_iCvus24pBO7tVmRk',
  // ... otras keys
};
const geminiApiKey = 'AIzaSyCpVpRdHHauFb-Qyx8UqoiABVxoE8f9EBc';
const unsplashApiKey = 'azcQPEGuSb5EXoR7CXTqr7GY3Ih2-FF9iXjtWgHvoWI';
```

**Consecuencias**:
- ❌ Cualquiera puede usar TU cuenta de Google Cloud
- ❌ Pueden gastar TU cuota de Gemini AI
- ❌ Pueden subir archivos a TU Firebase Storage
- ❌ Factura inesperada de $100, $1000 o más

**Solución**:
✅ [Ver sección "SOLUCIONES PASO A PASO" abajo]

---

### 2. Firebase API Key Pública ⚠️ (Parcialmente Seguro)

**Estado**: ✅ Firestore rules OK | ❌ API key expuesta

Firebase recomienda:
> "It's safe to include Firebase API keys in code or check them into version control
> because the security is enforced by Security Rules, not the API key itself."

**PERO** solo si:
1. ✅ Firestore rules están bien configuradas (TÚ SÍ LO TIENES)
2. ✅ No usas servicios facturables sin límites (TÚ NO LO TIENES)

**Riesgo actual**:
- Alguien puede crear millones de usuarios anónimos
- Spam en tu base de datos
- Uso excesivo de Firebase Auth

**Solución**:
```javascript
// En Firebase Console
1. Activar App Check (anti-abuse)
2. Configurar límites de cuota
3. Habilitar alertas de facturación
```

---

### 3. Gemini API Key Expuesta 🔴 CRÍTICO

**Costo actual**: $0/mes (plan gratuito)
**Riesgo**: Si alguien usa masivamente, Google puede facturarte

**Gemini Pricing**:
- Gratis: 15 requests/minuto, 1 millón tokens/mes
- Si excedes: $0.00025/1K tokens (puede ser $100+ fácilmente)

**Solución obligatoria**:
1. Mover Gemini a backend
2. Usar variables de entorno
3. Limitar requests desde tu backend

---

### 4. Unsplash API Key Expuesta ⚠️

**Riesgo**: Medio-Bajo
- Unsplash tiene rate limits por IP
- No es facturable, pero pueden bloquear tu key

**Solución**:
- Mover a backend (recomendado)
- O usar rate limiting cliente

---

## ✅ SOLUCIONES PASO A PASO

### OPCIÓN 1: Solución Rápida (1 hora) - MÍNIMO VIABLE

#### 1.1. Revocar y Rotar Keys 🔄

**Firebase**:
```bash
# 1. Ir a Firebase Console
https://console.firebase.google.com/project/control-gastos-44975/settings/general

# 2. Crear nueva aplicación web
- Nombre: "Dan&Giv Control - Producción"
- Copiar nuevas keys
```

**Gemini**:
```bash
# 1. Ir a Google Cloud Console
https://console.cloud.google.com/apis/credentials

# 2. REVOCAR key actual:
AIzaSyCpVpRdHHauFb-Qyx8UqoiABVxoE8f9EBc

# 3. Crear nueva key con restricciones:
- Nombre: "Gemini - Producción"
- Restricciones de aplicación: HTTP referrers
- Referrers permitidos: dangivcontrol.com/*
```

**Unsplash**:
```bash
# 1. Ir a Unsplash Developers
https://unsplash.com/oauth/applications

# 2. Rotar Access Key
# 3. Guardar nueva key
```

#### 1.2. Configurar Variables de Entorno

**Crear archivo `.env.local`** (NO subir a Git):
```bash
VITE_FIREBASE_API_KEY=nueva_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=control-gastos-44975.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=control-gastos-44975
VITE_FIREBASE_STORAGE_BUCKET=control-gastos-44975.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1021023056126
VITE_FIREBASE_APP_ID=1:1021023056126:web:nueva_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-nueva_measurement_id

# Gemini y Unsplash NO van aquí (ver backend)
```

**Actualizar `firebase-config.js`**:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ❌ ELIMINAR ESTAS LÍNEAS:
// const geminiApiKey = '...';
// const unsplashApiKey = '...';
```

#### 1.3. Actualizar `.gitignore`

```bash
# Agregar al .gitignore
.env
.env.local
.env.production
.env.development
firebase-config-backup.js
*.key
*.pem
```

#### 1.4. Limpiar Historial de Git

```bash
# ADVERTENCIA: Esto reescribe el historial
# Hacer backup primero

# 1. Instalar git-filter-repo (si no lo tienes)
pip install git-filter-repo

# 2. Eliminar firebase-config.js del historial
git filter-repo --path firebase-config.js --invert-paths

# 3. Force push (cuidado!)
git push origin --force --all
```

---

### OPCIÓN 2: Solución Profesional (4-6 horas) - RECOMENDADO

#### 2.1. Backend Proxy para APIs Externas

**Crear `backend/api-proxy.js`**:
```javascript
// Express server para proxies seguros
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(cors({ origin: 'https://dangivcontrol.com' }));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: 'Demasiadas solicitudes, intenta más tarde'
});

// Proxy para Gemini
app.post('/api/gemini', apiLimiter, async (req, res) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // desde .env

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar Gemini' });
  }
});

// Proxy para Unsplash (similar)
app.get('/api/unsplash/search', apiLimiter, async (req, res) => {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  // ... implementación similar
});

app.listen(3000, () => console.log('API Proxy en puerto 3000'));
```

**Actualizar `app.js`** (cliente):
```javascript
// ❌ ANTES (inseguro):
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiApiKey}`,
  { ... }
);

// ✅ DESPUÉS (seguro):
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(prompt)
});
```

#### 2.2. Desplegar Backend

**Vercel** (Gratis):
```bash
# vercel.json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "GEMINI_API_KEY": "@gemini-api-key",
    "UNSPLASH_ACCESS_KEY": "@unsplash-access-key"
  }
}

# Desplegar
npm i -g vercel
vercel --prod
vercel env add GEMINI_API_KEY
vercel env add UNSPLASH_ACCESS_KEY
```

**Netlify Functions** (Gratis):
```bash
# netlify/functions/gemini.js
exports.handler = async (event) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  // ... código del proxy
};

# netlify.toml
[build.environment]
  GEMINI_API_KEY = "${GEMINI_API_KEY}"

# Desplegar
netlify deploy --prod
```

---

## 🛡️ MEDIDAS ADICIONALES DE SEGURIDAD

### 1. Firebase App Check (Anti-Abuse)
```bash
# 1. Ir a Firebase Console > App Check
https://console.firebase.google.com/project/control-gastos-44975/appcheck

# 2. Activar reCAPTCHA v3 para web
# 3. Configurar enforcement en Firestore/Auth
```

### 2. Alertas de Facturación
```bash
# Google Cloud Console > Billing
1. Crear presupuesto: $10/mes
2. Alertas al 50%, 90%, 100%
3. Email de notificación
```

### 3. CSP Headers (Content Security Policy)
```html
<!-- En index.html -->
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' https://www.gstatic.com;
        connect-src 'self' https://*.firebaseapp.com https://*.googleapis.com;
        img-src 'self' data: https:;
      ">
```

### 4. Rate Limiting Frontend
```javascript
// app.js - Limitar requests de AI
const AI_LIMIT = 10; // 10 requests por hora
const aiRequestTimes = [];

async function callGeminiAPI() {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Limpiar requests antiguos
  aiRequestTimes = aiRequestTimes.filter(t => t > oneHourAgo);

  if (aiRequestTimes.length >= AI_LIMIT) {
    throw new Error('Límite de requests alcanzado. Intenta en 1 hora.');
  }

  aiRequestTimes.push(now);
  // ... hacer request
}
```

---

## 📋 CHECKLIST FINAL ANTES DE COMPARTIR

### Seguridad Básica (Obligatorio)
- [ ] Revocar todas las API keys actuales
- [ ] Crear nuevas keys con restricciones
- [ ] Configurar variables de entorno
- [ ] Actualizar `.gitignore`
- [ ] Limpiar historial de Git (git filter-repo)
- [ ] Activar Firebase App Check
- [ ] Configurar alertas de facturación

### Seguridad Avanzada (Recomendado)
- [ ] Implementar backend proxy para APIs
- [ ] Desplegar backend en Vercel/Netlify
- [ ] Agregar rate limiting frontend
- [ ] Configurar CSP headers
- [ ] Implementar logging de seguridad
- [ ] Crear repositorio privado para testing

### Preparación para Testing
- [ ] Crear rama `testing` separada
- [ ] Configurar permisos de colaborador (read-only)
- [ ] Documentar configuración requerida
- [ ] Preparar datos de prueba sintéticos
- [ ] Crear guía de setup para testers

---

## 🎯 TIEMPO ESTIMADO

| Tarea | Tiempo | Prioridad |
|-------|--------|-----------|
| Revocar y rotar keys | 30 min | 🔴 CRÍTICO |
| Variables de entorno | 15 min | 🔴 CRÍTICO |
| Limpiar Git history | 20 min | 🔴 CRÍTICO |
| Firebase App Check | 15 min | 🟠 Alto |
| Alertas facturación | 10 min | 🟠 Alto |
| Backend proxy | 3-4 horas | 🟡 Medio |
| CSP headers | 30 min | 🟡 Medio |
| Rate limiting | 1 hora | 🟡 Medio |

**Mínimo viable**: 1-1.5 horas
**Solución completa**: 5-6 horas

---

## ❓ PREGUNTAS FRECUENTES

### ¿Por qué Firebase API key puede ser pública?
Firebase usa Security Rules, no la API key, para seguridad. PERO solo si:
1. Tienes reglas configuradas (✅ tienes)
2. No usas servicios facturables sin límites (❌ no tienes)

### ¿Qué pasa si alguien usa mi Gemini API key?
- Consumen TU cuota gratuita (1M tokens/mes)
- Si exceden, TE cobran a TI ($0.25 por 1M tokens)
- Pueden gastar $100+ en horas

### ¿Puedo usar variables de entorno en frontend?
Sí, pero se exponen en el bundle final. Solo sirve para:
- Diferenciar dev/prod
- Ocultar de Git (no de usuarios finales)

Para keys sensibles: BACKEND OBLIGATORIO.

### ¿Es suficiente con revocar las keys?
NO. También debes:
1. Limpiar historial de Git
2. Configurar nuevas restricciones
3. Implementar backend para APIs sensibles

---

## 📞 PRÓXIMOS PASOS

### HOY (Urgente - 1 hora)
1. ✅ Revocar Gemini API key actual
2. ✅ Revocar Unsplash API key actual
3. ✅ Crear nuevas keys con restricciones
4. ✅ Configurar variables de entorno
5. ✅ Actualizar .gitignore

### MAÑANA (Importante - 2 horas)
1. ✅ Limpiar historial de Git
2. ✅ Activar Firebase App Check
3. ✅ Configurar alertas de facturación
4. ✅ Crear repositorio privado para testing

### PRÓXIMA SEMANA (Recomendado - 4 horas)
1. ✅ Implementar backend proxy
2. ✅ Desplegar en Vercel/Netlify
3. ✅ Configurar CSP headers
4. ✅ Agregar rate limiting

---

**Estado actual**: 🔴 NO SEGURO
**Después de mínimo viable**: 🟡 PARCIALMENTE SEGURO
**Después de solución completa**: 🟢 SEGURO

---

**¿Necesitas ayuda con algún paso? ¡Pregunta!**
