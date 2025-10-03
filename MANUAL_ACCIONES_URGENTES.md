# 🚨 ACCIONES URGENTES - HACER AHORA

## ✅ Lo que YA está hecho (automático)

1. ✅ `.env.example` creado con plantilla
2. ✅ `.gitignore` actualizado
3. ✅ `firebase-config.js` migrado a variables de entorno
4. ✅ Backend proxy implementado (`backend/api-proxy.js`)
5. ✅ Scripts de limpieza de Git creados

---

## 🔴 PASO 1: REVOCAR API KEYS (URGENTE - 10 min)

### Gemini AI
1. Ve a: https://aistudio.google.com/app/apikey
2. Busca tu key: `AIzaSyCpVpRdHHauFb-Qyx8UqoiABVxoE8f9EBc`
3. Click en **"Delete"** o **"Revoke"**
4. Crear nueva key con restricciones:
   - Click "Create API Key"
   - Restricciones HTTP referrers: `dangivcontrol.com/*`
   - Guardar nueva key

### Unsplash
1. Ve a: https://unsplash.com/oauth/applications
2. Selecciona tu app
3. Click **"Regenerate Access Key"**
4. Copia la nueva key

### Firebase (Opcional - solo si quieres)
Las keys de Firebase pueden ser públicas si tienes Security Rules.
Pero si quieres rotarlas:

1. Ve a: https://console.firebase.google.com/project/control-gastos-44975/settings/general
2. Scroll a "Tus apps" → Web
3. Click en la app actual
4. Click en configuración (engranaje)
5. **"Eliminar esta app"** (cuidado, esto borra la config)
6. Crear nueva app web
7. Copiar nuevas credenciales

---

## 🟡 PASO 2: CONFIGURAR .ENV FILES (10 min)

### A. Frontend (.env.local)

Crear archivo `C:\Users\Lenovo\Desktop\aplica\.env.local`:

```bash
# Firebase (si rotaste keys, usa las nuevas, si no, usa las actuales)
VITE_FIREBASE_API_KEY=TU_NUEVA_API_KEY_AQUI
VITE_FIREBASE_AUTH_DOMAIN=control-gastos-44975.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=control-gastos-44975
VITE_FIREBASE_STORAGE_BUCKET=control-gastos-44975.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1021023056126
VITE_FIREBASE_APP_ID=TU_NUEVO_APP_ID_AQUI
VITE_FIREBASE_MEASUREMENT_ID=G-TU_MEASUREMENT_ID
```

### B. Backend (.env)

Crear archivo `C:\Users\Lenovo\Desktop\aplica\backend\.env`:

```bash
PORT=3000
NODE_ENV=development

# API Keys (las nuevas que generaste en PASO 1)
GEMINI_API_KEY=tu_nueva_gemini_key_aqui
UNSPLASH_ACCESS_KEY=tu_nueva_unsplash_key_aqui
PERPLEXITY_API_KEY=si_tienes_una

VITE_APP_URL=http://localhost:5173
```

---

## 🟠 PASO 3: LIMPIAR HISTORIAL DE GIT (15 min)

⚠️ **IMPORTANTE**: Hacer backup antes

### Opción A: Automático (Windows)

```bash
cd C:\Users\Lenovo\Desktop\aplica
cleanup-git-history.bat
```

### Opción B: Automático (Linux/Mac)

```bash
cd /path/to/aplica
chmod +x cleanup-git-history.sh
./cleanup-git-history.sh
```

### Opción C: Manual

```bash
# 1. Instalar git-filter-repo
pip install git-filter-repo

# 2. Crear backup
cd C:\Users\Lenovo\Desktop
cp -r aplica aplica-backup

# 3. Limpiar historial
cd aplica
git filter-repo --path firebase-config.js --invert-paths --force

# 4. Agregar versión segura
git add firebase-config.js
git commit -m "security: migrate to environment variables"

# 5. Force push
git push origin --force --all
```

---

## 🟢 PASO 4: VERIFICAR QUE TODO FUNCIONA (5 min)

### 1. Verificar que el frontend arranca

```bash
cd C:\Users\Lenovo\Desktop\aplica
npm run dev
```

Abrir: http://localhost:5173

**Verificar en consola del navegador**:
- ✅ NO debe haber errores de "VITE_FIREBASE_API_KEY undefined"
- ✅ Firebase debe conectar correctamente

### 2. Verificar backend

```bash
cd C:\Users\Lenovo\Desktop\aplica\backend
npm start
```

Abrir: http://localhost:3000/health

Debe mostrar:
```json
{
  "status": "OK",
  "services": {
    "gemini": true,
    "unsplash": true
  }
}
```

---

## 🔵 PASO 5: ACTUALIZAR APP.JS (si usa API keys directamente)

Si tu `app.js` tiene llamadas directas a Gemini/Unsplash, actualízalas:

### ❌ ANTES (inseguro):
```javascript
const response = await fetch(
  `https://generativelanguage.googleapis.com/.../generateContent?key=${window.FB.geminiApiKey}`,
  { ... }
);
```

### ✅ DESPUÉS (seguro - a través del backend):
```javascript
const response = await fetch('http://localhost:3000/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'tu prompt aqui' })
});
```

**Buscar en app.js**:
```bash
# Buscar usos de geminiApiKey
grep -n "geminiApiKey" app.js

# Buscar usos de unsplashApiKey
grep -n "unsplashApiKey" app.js
```

---

## 🟣 PASO 6: FIREBASE APP CHECK (Opcional - 10 min)

1. Ve a: https://console.firebase.google.com/project/control-gastos-44975/appcheck
2. Click "Get Started"
3. Seleccionar **reCAPTCHA v3**
4. Seguir instrucciones para obtener site key
5. Activar enforcement para:
   - ✅ Firestore
   - ✅ Authentication

---

## 🔴 PASO 7: ALERTAS DE FACTURACIÓN (Obligatorio - 5 min)

### Google Cloud (Gemini)

1. Ve a: https://console.cloud.google.com/billing
2. Click en tu proyecto
3. "Budgets & alerts" → "Create Budget"
4. Configurar:
   - Name: "Dan&Giv Control - API Budget"
   - Amount: $10/month
   - Alerts: 50%, 90%, 100%
   - Email: tu-email@gmail.com

### Firebase (si usas Storage)

1. Ve a: https://console.firebase.google.com/project/control-gastos-44975/usage
2. Click "Set up billing alerts"
3. Configurar límites similares

---

## ✅ CHECKLIST FINAL

Marca cuando completes cada paso:

### Seguridad Crítica
- [ ] Gemini API key revocada y regenerada
- [ ] Unsplash API key regenerada
- [ ] `.env.local` creado con nuevas keys
- [ ] `backend/.env` creado con nuevas keys
- [ ] Historial de Git limpiado
- [ ] Force push a GitHub realizado
- [ ] Firebase App Check activado
- [ ] Alertas de facturación configuradas

### Funcionalidad
- [ ] Frontend arranca sin errores
- [ ] Backend arranca en puerto 3000
- [ ] `/health` endpoint funciona
- [ ] Firebase conecta correctamente
- [ ] Gemini funciona a través del backend
- [ ] Unsplash funciona a través del backend

### SEO (ya hecho)
- [x] Meta tags optimizados
- [x] Sitemap.xml actualizado
- [x] Robots.txt configurado
- [x] Schema.org agregado
- [x] Contenido SEO estático

### Pendiente (tu decides cuándo)
- [ ] Crear imágenes Open Graph (og-image-2025.jpg)
- [ ] Actualizar dominio real (si ya lo tienes)
- [ ] Registrar en Google Search Console
- [ ] Publicar en redes sociales
- [ ] Crear backlinks

---

## 🆘 ERRORES COMUNES Y SOLUCIONES

### Error: "VITE_FIREBASE_API_KEY is not defined"
**Solución**: Creaste `.env.local` pero olvidaste reiniciar el servidor
```bash
# Detener el servidor (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

### Error: "Cannot find module 'dotenv'"
**Solución**:
```bash
cd backend
npm install
```

### Error: "git-filter-repo: command not found"
**Solución**:
```bash
pip install git-filter-repo
```

### Error: "Port 3000 already in use"
**Solución**:
```bash
# Cambiar puerto en backend/.env
PORT=3001
```

---

## 📞 SIGUIENTE PASO

Después de completar TODO lo anterior:

### Si TODO está ✅:
1. Crear repositorio PRIVADO en GitHub
2. Invitar a testers como colaboradores (read-only)
3. Compartir link del repo

### Si algo falla:
1. Revisar logs de consola
2. Verificar que .env files existan
3. Verificar que las API keys sean correctas
4. Consultar la sección de errores comunes arriba

---

**¿Necesitas ayuda con algún paso?**
**¡Pregunta! Estoy aquí para asistirte.**

---

**Tiempo estimado total**: 1-1.5 horas
**Prioridad**: 🔴 URGENTE (antes de compartir con testers)
