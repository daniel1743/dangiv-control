# 🌟 Configuración de Mensajes Motivadores con Gemini API

## 📖 Descripción

El sistema de mensajes motivadores utiliza la API de Gemini de Google para generar contenido inspirador y personalizado sobre finanzas personales cuando el usuario está logueado.

**Características:**
- ✨ Mensajes motivadores únicos generados por IA
- 💰 Historias de éxito financiero
- 📅 Actualización automática diaria a la 1 AM
- 💾 Sistema de caché (mensajes válidos por 24 horas)
- 🎯 Solo para usuarios autenticados (usuarios anónimos ven mensajes por defecto)

---

## 🔑 Obtener tu API Key de Gemini

### Paso 1: Crear cuenta en Google AI Studio

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Acepta los términos y condiciones

### Paso 2: Generar API Key

1. Haz clic en **"Get API Key"** o **"Create API Key"**
2. Selecciona un proyecto existente o crea uno nuevo
3. Copia la API Key generada

> ⚠️ **IMPORTANTE**: Nunca compartas tu API Key públicamente

### Paso 3: Configurar la API Key en tu proyecto

Abre el archivo `firebase-config.js` y reemplaza el placeholder:

```javascript
const geminiApiKey = 'TU_API_KEY_AQUI'; // Reemplaza con tu API Key real
```

**Ejemplo:**
```javascript
const geminiApiKey = 'AIzaSyC1234567890abcdefghijklmnopqrstuvw';
```

---

## 🚀 Cómo Funciona

### 1. Activación Automática
El sistema se activa automáticamente cuando un usuario inicia sesión:

```javascript
// Se ejecuta al detectar usuario autenticado
this.fetchMotivationalMessages();  // Obtiene mensajes nuevos si es necesario
this.updateCarouselWithMessages(); // Actualiza el carrusel
this.scheduleDailyMessageUpdate(); // Programa actualización a la 1 AM
```

### 2. Sistema de Caché
- Los mensajes se guardan en `localStorage` y Firebase
- Solo se solicitan nuevos mensajes si han pasado más de 24 horas
- Evita consumo innecesario de la API

### 3. Actualización Diaria
- Programada automáticamente para la **1:00 AM** de cada día
- Se ejecuta en segundo plano
- No requiere que el usuario esté activo

### 4. Mensajes Generados
La IA genera 8 mensajes con:
- **Emojis** motivadores (💰, 📈, 💪, ✨, 🎯, etc.)
- **Historias** de personas que lograron sus metas
- **Consejos** prácticos sobre ahorro
- **Mensajes** de empatía y apoyo

**Ejemplo de mensaje generado:**
```json
{
  "title": "🌟 Historias de Éxito",
  "message": "María ahorró $50 al mes y en un año compró su auto 🚗✨",
  "icon": "fas fa-trophy",
  "gradient": "blue"
}
```

---

## 📊 Límites de la API Gratuita

| Límite | Valor |
|--------|-------|
| Solicitudes por día | 60 |
| Solicitudes por minuto | 2 |
| Caracteres por solicitud | ~30,000 |

**Con este sistema:**
- Solo 1 solicitud por día (a la 1 AM)
- Consumo: ~1% del límite diario
- ✅ **Totalmente gratis** para uso personal

---

## 🛠️ Solución de Problemas

### Problema: No se actualizan los mensajes

**Solución 1:** Verifica que la API Key esté configurada correctamente
```javascript
// En la consola del navegador:
console.log(window.geminiApiKey);
// Debe mostrar tu API Key, NO 'TU_API_KEY_DE_GEMINI'
```

**Solución 2:** Revisa la consola para ver errores
```javascript
// Busca mensajes como:
// ✅ "Mensajes motivadores actualizados desde Gemini API"
// ❌ "Error al obtener mensajes de Gemini:"
```

**Solución 3:** Verifica que estés logueado
- Los mensajes solo se generan para usuarios autenticados
- Usuarios anónimos ven los mensajes por defecto

### Problema: Error 429 (Too Many Requests)

**Causa:** Has excedido el límite de la API

**Solución:**
- Espera 24 horas para que se resetee el límite
- El sistema tiene caché para evitar este problema

### Problema: Error 400 (Bad Request)

**Causa:** API Key inválida o formato incorrecto

**Solución:**
1. Verifica que la API Key sea correcta
2. Asegúrate de no tener espacios al inicio/final
3. Regenera la API Key si es necesario

---

## 🔒 Seguridad

### Buenas Prácticas

1. **No subas la API Key a GitHub público**
   ```bash
   # Agregar a .gitignore:
   firebase-config.js
   ```

2. **Usa variables de entorno en producción**
   ```javascript
   // En Vercel, agrega la variable:
   // GEMINI_API_KEY = tu_api_key_aqui

   const geminiApiKey = process.env.GEMINI_API_KEY || 'fallback_key';
   ```

3. **Restricciones de API Key** (recomendado)
   - En Google Cloud Console, restringe la API Key
   - Solo permite dominio: `tu-dominio.vercel.app`
   - Solo API: `Generative Language API`

---

## 📝 Personalización

### Modificar el Prompt

Puedes personalizar los mensajes editando el prompt en `app.js`:

```javascript
const prompt = `Genera 8 mensajes motivadores cortos sobre finanzas personales y ahorro.
Cada mensaje debe:
- Ser inspirador y empático
- Incluir emojis relevantes (💰, 📈, 💪, ✨, 🎯, etc)
- Mencionar historias de éxito o consejos prácticos
- Tener máximo 100 caracteres
// ... personaliza aquí según tus necesidades
`;
```

### Cambiar Hora de Actualización

Por defecto: **1:00 AM**

Para cambiar a otra hora, edita en `app.js`:

```javascript
scheduleDailyMessageUpdate() {
  // ...
  tomorrow1AM.setHours(6, 0, 0, 0); // Cambia a 6 AM
  // ...
}
```

### Cambiar Frecuencia de Actualización

Por defecto: **1 vez al día (24 horas)**

Para cambiar, edita en `app.js`:

```javascript
const oneDayMs = 12 * 60 * 60 * 1000; // Cambia a 12 horas
```

---

## 🎨 Ejemplo Completo de Flujo

1. **Usuario anónimo** → Ve mensajes por defecto (tarjetas estáticas)
2. **Usuario inicia sesión** → Sistema detecta autenticación
3. **Primera vez** → Solicita mensajes a Gemini API
4. **API responde** → 8 mensajes personalizados
5. **Se guardan** → En localStorage y Firebase
6. **Carrusel se actualiza** → Con nuevos mensajes
7. **Se programa** → Próxima actualización a la 1 AM
8. **24 horas después** → Automáticamente solicita nuevos mensajes
9. **Ciclo se repite** → Mensajes frescos cada día

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador (F12)
2. Verifica que la API Key esté configurada
3. Confirma que estés logueado (no anónimo)
4. Revisa los límites de la API en Google AI Studio

---

## 🌐 Enlaces Útiles

- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Documentación Gemini API](https://ai.google.dev/docs)
- [Guía de Rate Limits](https://ai.google.dev/docs/rate_limits)
- [Mejores Prácticas de Prompts](https://ai.google.dev/docs/prompt_best_practices)

---

**Desarrollado con ❤️ por Dan&Giv Control**

**Última actualización:** Octubre 2025
