# 📱 Sistema de Mensajes Diarios - Piense y Hágase Rico

## 📁 Archivos Creados

### 1. **mensajes-manana.json**
- Mensajes para enviar a las 8:00 AM
- 10 mensajes inspiradores para comenzar el día
- Incluye saludos personalizados y despedidas motivacionales

### 2. **mensajes-noche.json**
- Mensajes para enviar a las 8:00 PM
- 10 mensajes de reflexión nocturna
- Incluye saludos de buenas noches y despedidas relajantes

### 3. **mensaje-bienvenida.json**
- Mensaje único que se envía cuando un usuario se registra
- Explicación del servicio
- Motivación inicial

### 4. **config-mensajes.json**
- Configuración general del sistema
- Horarios de envío
- Opciones de personalización

---

## 🔧 Cómo Funciona el Sistema

### Estructura de un Mensaje Personalizado:

```
{saludo_intro} → "Daniel, este mensaje es para ti"
{mensaje} → Enseñanza de Napoleon Hill
{reflexion} → Aplicación práctica
{despedida} → "Que tu día sea maravilloso"
```

### Ejemplo de Mensaje de Mañana:
```
Daniel, creo que te gustaría leer este mensaje:

Todo lo que la mente pueda concebir y creer, la mente puede alcanzar.
No hay limitaciones excepto las que tú mismo reconoces.

Hoy, elimina los límites mentales que te detienen.

Que tu día sea maravilloso ✨
```

### Ejemplo de Mensaje de Noche:
```
Buenas noches Daniel, lee este pensamiento antes de dormir:

Los pensamientos son cosas, y cosas poderosas cuando se mezclan con
un propósito definido y un deseo ardiente.

Antes de dormir, visualiza claramente tus metas cumplidas.

Que tengas una linda noche 🌙
```

---

## 🚀 Opciones de Implementación

### Opción 1: WhatsApp (Recomendado)
**Herramientas:**
- Node.js + `whatsapp-web.js` o `baileys`
- `node-cron` para programar mensajes

**Ventajas:**
- Llegada directa al usuario
- No requiere instalación de app
- Alta tasa de lectura

### Opción 2: Telegram Bot
**Herramientas:**
- Node.js + `node-telegram-bot-api`
- `node-cron` para horarios

**Ventajas:**
- Fácil de implementar
- API gratuita
- Soporte multimedia

### Opción 3: Email
**Herramientas:**
- Node.js + `nodemailer`
- `node-cron` para programación

**Ventajas:**
- Llegada garantizada
- Formal y profesional

### Opción 4: SMS
**Herramientas:**
- Twilio API
- `node-cron`

---

## 💻 Ejemplo de Código (Node.js + WhatsApp)

```javascript
const cron = require('node-cron');
const fs = require('fs');

// Cargar archivos JSON
const mensajesManana = JSON.parse(fs.readFileSync('./mensajes-manana.json'));
const mensajesNoche = JSON.parse(fs.readFileSync('./mensajes-noche.json'));
const bienvenida = JSON.parse(fs.readFileSync('./mensaje-bienvenida.json'));

// Usuario actual
let usuario = {
  nombre: "Daniel",
  mensajeActualManana: 0,
  mensajeActualNoche: 0
};

// Función para crear mensaje personalizado
function crearMensaje(tipo) {
  const data = tipo === 'manana' ? mensajesManana : mensajesNoche;
  const indice = tipo === 'manana' ? usuario.mensajeActualManana : usuario.mensajeActualNoche;

  // Seleccionar elementos aleatorios
  const saludo = data.saludos_intro[Math.floor(Math.random() * data.saludos_intro.length)]
    .replace('{nombre}', usuario.nombre);
  const despedida = data.despedidas[Math.floor(Math.random() * data.despedidas.length)];

  const mensaje = data.mensajes[indice];

  // Construir mensaje completo
  return `${saludo}\n\n${mensaje.mensaje}\n\n${mensaje.reflexion}\n\n${despedida}`;
}

// Programar mensaje de mañana (8:00 AM)
cron.schedule('0 8 * * *', () => {
  const mensaje = crearMensaje('manana');
  enviarMensaje(usuario.telefono, mensaje);

  // Avanzar al siguiente mensaje
  usuario.mensajeActualManana = (usuario.mensajeActualManana + 1) % mensajesManana.mensajes.length;
});

// Programar mensaje de noche (8:00 PM)
cron.schedule('0 20 * * *', () => {
  const mensaje = crearMensaje('noche');
  enviarMensaje(usuario.telefono, mensaje);

  // Avanzar al siguiente mensaje
  usuario.mensajeActualNoche = (usuario.mensajeActualNoche + 1) % mensajesNoche.mensajes.length;
});

// Función de envío (implementar según plataforma)
function enviarMensaje(telefono, mensaje) {
  // Aquí va la lógica de envío (WhatsApp, Telegram, etc.)
  console.log(`Enviando a ${telefono}:`, mensaje);
}
```

---

## 📋 Pasos para Implementar

### 1. **Preparar el Entorno**
```bash
cd C:\Users\Lenovo\Desktop\aplica
npm init -y
npm install node-cron
# Instalar librería según plataforma elegida:
npm install whatsapp-web.js  # Para WhatsApp
# o
npm install node-telegram-bot-api  # Para Telegram
# o
npm install nodemailer  # Para Email
```

### 2. **Agregar tus Mensajes**
- Pega tus mensajes en `mensajes-manana.json` (reemplaza los existentes)
- Pega tus mensajes en `mensajes-noche.json` (reemplaza los existentes)

### 3. **Crear Base de Datos de Usuarios (Opcional)**
```json
// usuarios.json
[
  {
    "id": 1,
    "nombre": "Daniel",
    "telefono": "+52XXXXXXXXXX",
    "mensajeActualManana": 0,
    "mensajeActualNoche": 0,
    "activo": true
  }
]
```

### 4. **Personalizar Configuración**
- Edita `config-mensajes.json` según tus necesidades
- Ajusta zona horaria si es necesario

---

## 🎯 Características del Sistema

✅ **Personalización Completa**
- Usa el nombre del usuario en cada mensaje
- Varía los saludos y despedidas automáticamente

✅ **Mensajes Rotativos**
- Los mensajes se rotan automáticamente
- Cada día recibe un mensaje diferente

✅ **Horarios Configurables**
- 8:00 AM - Mensaje motivacional de mañana
- 8:00 PM - Mensaje reflexivo de noche

✅ **Mensaje de Bienvenida**
- Se envía una sola vez al registrarse
- Explica el servicio y motiva al usuario

---

## 🔄 Flujo de Funcionamiento

1. **Registro de Usuario** → Envía mensaje de bienvenida
2. **8:00 AM Diario** → Envía mensaje motivacional de mañana
3. **8:00 PM Diario** → Envía mensaje reflexivo de noche
4. **Ciclo de Mensajes** → Rota entre los 10 mensajes disponibles

---

## 📝 Notas Importantes

- Los JSON incluyen **variaciones de saludos** para que no sea repetitivo
- Cada mensaje tiene una **categoría** y **reflexión práctica**
- El sistema selecciona **aleatoriamente** saludos y despedidas
- Los mensajes principales se envían en **orden secuencial**

---

## 🛠️ Próximos Pasos

1. **Decide la plataforma** (WhatsApp, Telegram, Email, SMS)
2. **Agrega tus mensajes personalizados** a los JSON
3. **Implementa el código** según la plataforma elegida
4. **Prueba el sistema** antes de lanzarlo
5. **Agrega usuarios** y activa el sistema

---

¿Necesitas ayuda con la implementación técnica? Avísame qué plataforma elegiste y te ayudo con el código completo.
