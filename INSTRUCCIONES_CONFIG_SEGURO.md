# 🔒 INSTRUCCIONES - Configurar config.js de forma SEGURA

## ⚠️ IMPORTANTE: NO SUBIR config.js A GIT

El archivo `config.js` que creé tiene tus API keys reales y está en `.gitignore`.

---

## 📋 PASOS PARA ASEGURAR TU APP

### PASO 1: Verificar que config.js NO está en Git ✅

```bash
cd C:\Users\Lenovo\Desktop\aplica
git status
```

**Resultado esperado**: `config.js` NO debe aparecer en la lista
- ✅ Si NO aparece = Seguro (gracias al .gitignore)
- ❌ Si aparece = Ejecutar: `git rm --cached config.js`

---

### PASO 2: Si ya hiciste commit con config.js (URGENTE)

Si ya subiste config.js a GitHub:

```bash
# 1. Remover del historial
git filter-repo --path config.js --invert-paths --force

# 2. O usar BFG Repo Cleaner (más rápido)
# Descargar de: https://rbs.github.com/bfg-repo-cleaner/
java -jar bfg.jar --delete-files config.js

# 3. Force push
git push origin --force --all

# 4. REVOCAR las API keys inmediatamente
# - Gemini: https://aistudio.google.com/app/apikey
# - Unsplash: https://unsplash.com/oauth/applications
```

---

### PASO 3: Usar Variables de Entorno (RECOMENDADO)

Para que esto nunca vuelva a pasar, usa variables de entorno reales:

#### A. Si usas Vercel/Netlify:

**Vercel**:
```bash
vercel env add FIREBASE_API_KEY
vercel env add GEMINI_API_KEY
vercel env add UNSPLASH_ACCESS_KEY
```

**Netlify**:
1. Ir a: Site settings → Environment variables
2. Agregar cada variable

#### B. Si usas servidor propio:

Crear archivo `.env` en el servidor:
```bash
FIREBASE_API_KEY=tu_key
GEMINI_API_KEY=tu_key
UNSPLASH_ACCESS_KEY=tu_key
```

---

### PASO 4: Actualizar config.js para producción

Cuando despliegues, usa un `config.js` que lea de variables de entorno del servidor:

```javascript
// config.js (versión para producción con variables de servidor)
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || window.ENV?.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || window.ENV?.FIREBASE_AUTH_DOMAIN,
  // ... resto
};
```

---

## 🎯 SOLUCIÓN TEMPORAL vs PERMANENTE

### ✅ TEMPORAL (para desarrollo local ahora):
- `config.js` con keys reales
- Está en `.gitignore` ✅
- NO hacer commit de este archivo ✅
- Solo para tu máquina local ✅

### ✅ PERMANENTE (para producción):
1. **Backend Proxy** (ya está en `backend/api-proxy.js`)
2. **Variables de entorno** en tu hosting
3. **config.js dinámico** que lea del servidor

---

## 🔐 ESTADO ACTUAL DE SEGURIDAD

### Lo que está SEGURO ✅:
- `config.js` está en `.gitignore`
- No se subirá a Git automáticamente
- Solo existe en tu máquina local

### Lo que NO está seguro ⚠️:
- API keys aún están en el código (config.js)
- Si alguien ve tu pantalla, las verá
- Si compartes el archivo por error, se expondrán

### Lo que DEBES hacer ANTES de producción 🔴:
1. **Mover API keys al backend** (usar `backend/api-proxy.js`)
2. **Revocar keys actuales** y crear nuevas con restricciones
3. **Configurar variables de entorno** en tu hosting

---

## 🚀 PLAN DE MIGRACIÓN

### Ahora (Desarrollo):
```
[Tu PC] → config.js (local) → Firebase/APIs ✅
```

### Después (Producción):
```
[Browser] → Backend Proxy → APIs ✅
                ↓
         Variables de entorno
```

---

## ✅ CHECKLIST ANTES DE COMPARTIR

- [ ] Verificar que `config.js` NO está en Git
- [ ] Verificar que `.gitignore` incluye `config.js`
- [ ] Asegurar que nunca hiciste commit de `config.js`
- [ ] Si ya lo subiste, limpiar historial (PASO 2)
- [ ] Para producción, usar backend proxy

---

**¿Dudas? Pregúntame antes de hacer push a GitHub.**
