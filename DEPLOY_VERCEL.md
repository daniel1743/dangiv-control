# 🚀 Guía Rápida de Despliegue en Vercel

## ✅ Problema Resuelto

El error **"Si se utilizan rewrites, redirects, headers, cleanUrls o trailingSlash, entonces routes no puede estar presente"** fue corregido.

### ¿Qué se corrigió?

- ❌ **Antes**: `vercel.json` tenía `routes` + `rewrites` + `headers` (conflicto)
- ✅ **Ahora**: Solo `rewrites` + `headers` (compatible)

---

## 📦 Opción 1: Solo Frontend (Recomendado para Inicio)

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Desplegar

```bash
cd C:\Users\Lenovo\Desktop\aplica
vercel
```

Sigue las instrucciones:
- **Setup and deploy?** → Yes
- **Which scope?** → Tu cuenta
- **Link to existing project?** → No
- **Project name?** → financia-suite-pro (o el que quieras)
- **Directory?** → ./ (presiona Enter)
- **Override settings?** → No

### Paso 3: Configurar Variables de Entorno

```bash
# Agregar las API keys
vercel env add GEMINI_API_KEY
vercel env add PERPLEXITY_API_KEY
vercel env add UNSPLASH_ACCESS_KEY
vercel env add LOTTIE_ACCESS_KEY
vercel env add LOTTIE_SECRET_KEY
```

Cuando te pregunte por el valor, pega la key correspondiente.

### Paso 4: Redesplegar con las Variables

```bash
vercel --prod
```

### Paso 5: Configurar las Keys en el Código (Temporal)

Si las APIs no funcionan, es porque las variables no se cargan en frontend estático.

**Solución temporal**: Edita `firebase-config.js` con las keys (solo para producción):

```javascript
const geminiApiKey = 'tu_key_aqui';
const perplexityApiKey = 'tu_key_aqui';
const unsplashApiKey = 'tu_key_aqui';
```

⚠️ **Riesgo**: Las keys estarán visibles en el código. Para mayor seguridad, usa la Opción 2.

---

## 🔐 Opción 2: Frontend + Backend (Máxima Seguridad)

### Paso 1: Desplegar Backend

```bash
cd C:\Users\Lenovo\Desktop\aplica\backend
vercel
```

Configuración:
- **Setup and deploy?** → Yes
- **Project name?** → financia-backend
- **Directory?** → ./ (presiona Enter)

### Paso 2: Configurar Variables en el Backend

```bash
vercel env add GEMINI_API_KEY
vercel env add PERPLEXITY_API_KEY
vercel env add UNSPLASH_ACCESS_KEY
vercel env add LOTTIE_ACCESS_KEY
vercel env add LOTTIE_SECRET_KEY
```

### Paso 3: Obtener URL del Backend

```bash
vercel --prod
```

Copia la URL que te da, ejemplo: `https://financia-backend.vercel.app`

### Paso 4: Actualizar Frontend para Usar el Backend

Edita `app.js` para que use el backend:

**Busca en app.js (línea ~727):**
```javascript
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
```

**Reemplaza con:**
```javascript
const response = await fetch(`https://tu-backend.vercel.app/api/gemini`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: prompt })
});
```

### Paso 5: Desplegar Frontend

```bash
cd C:\Users\Lenovo\Desktop\aplica
vercel --prod
```

---

## 🎯 Configuración Actual de Archivos

### `vercel.json` (Frontend - Raíz)
```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,
  "headers": [...],
  "rewrites": [...]
}
```
✅ **Correcto** - Sin `routes`

### `backend/vercel.json` (Backend)
```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```
✅ **Correcto** - Puede usar `routes` porque no tiene `rewrites`

---

## 🔍 Verificar Despliegue

### Frontend
```bash
# Ver los logs
vercel logs

# Ver URL de producción
vercel ls
```

Visita tu URL: `https://financia-suite-pro.vercel.app`

### Backend
```bash
cd backend
vercel logs
```

Prueba la API: `https://financia-backend.vercel.app/api/models`

---

## ⚠️ Problemas Comunes

### 1. "API key no válida"

**Causa**: Variables de entorno no configuradas o mal escritas

**Solución**:
```bash
# Ver variables configuradas
vercel env ls

# Eliminar variable incorrecta
vercel env rm GEMINI_API_KEY

# Agregar de nuevo
vercel env add GEMINI_API_KEY
```

### 2. "CORS error"

**Causa**: Backend no permite el origen del frontend

**Solución**: Edita `backend/server.js`:
```javascript
app.use(cors({
  origin: ['https://financia-suite-pro.vercel.app', 'http://localhost:8000']
}));
```

### 3. "Module not found"

**Causa**: Dependencias no instaladas en Vercel

**Solución**: Verifica `backend/package.json`:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "node-fetch": "^3.3.2"
  }
}
```

### 4. Error de "routes" de nuevo

**Causa**: Modificaste `vercel.json` y agregaste `routes`

**Solución**:
- En el **frontend**: NO uses `routes`, solo `rewrites`
- En el **backend**: SÍ puedes usar `routes`

---

## 📊 Comparación de Opciones

| Aspecto | Opción 1: Solo Frontend | Opción 2: Frontend + Backend |
|---------|-------------------------|------------------------------|
| **Seguridad** | ⚠️ Baja (keys visibles) | ✅ Alta (keys ocultas) |
| **Simplicidad** | ✅ Fácil (1 deploy) | ⚠️ Media (2 deploys) |
| **Costo** | ✅ Gratis | ✅ Gratis |
| **Mantenimiento** | ✅ Simple | ⚠️ Requiere 2 proyectos |
| **Velocidad** | ✅ Rápida | ⚠️ Un poco más lenta |

---

## 🎓 Recomendación

**Para empezar rápido**: Usa **Opción 1** (Solo Frontend)
- Despliega en 5 minutos
- Funciona inmediatamente
- Acepta que las keys serán visibles

**Para producción real**: Migra a **Opción 2** (Frontend + Backend)
- Protege tus API keys
- Mejor arquitectura
- Más escalable

---

## ✅ Checklist de Despliegue

- [ ] `vercel.json` corregido (sin conflictos)
- [ ] Variables de entorno configuradas
- [ ] Backend desplegado (si aplica)
- [ ] Frontend desplegado
- [ ] Probar todas las funcionalidades:
  - [ ] Inicio de sesión
  - [ ] Agregar gastos
  - [ ] Crear metas
  - [ ] Mensajes motivadores (Gemini)
  - [ ] Chat AI (Perplexity)
  - [ ] Imágenes de metas (Unsplash)

---

## 🆘 Ayuda Adicional

Si tienes problemas:
1. Revisa los logs: `vercel logs`
2. Verifica variables: `vercel env ls`
3. Consulta: https://vercel.com/docs
4. Pregunta aquí y te ayudo

---

**¡Tu app está lista para desplegarse! 🚀**
