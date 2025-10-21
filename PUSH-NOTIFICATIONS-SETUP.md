# 🔔 Configuración de Notificaciones Push - Dan&Giv Control

## ✅ Sistema Implementado

Se ha implementado un sistema completo de notificaciones push para móviles usando Firebase Cloud Messaging (FCM).

### **Archivos Creados:**

1. **`firebase-messaging-sw.js`** - Service Worker para notificaciones en segundo plano
2. **`push-notifications.js`** - Clase `PushNotificationManager` para gestionar notificaciones
3. **Modal de permisos** en `index.html` - UI atractiva para solicitar permisos
4. **Estilos** en `style.css` (líneas 17747-18050) - Diseño premium del modal

### **Funcionalidades Implementadas:**

✅ Service Worker registrado automáticamente
✅ Solicitud de permisos con modal atractivo
✅ Notificaciones en primer plano (app abierta)
✅ Notificaciones en segundo plano (app cerrada)
✅ Click en notificaciones abre la app
✅ Guardado de tokens FCM en Firestore
✅ Notificaciones personalizadas por tipo:
   - Recordatorios de metas
   - Alertas de presupuesto excedido
   - Resúmenes diarios
   - Ofertas especiales

---

## 🔧 PASOS PENDIENTES PARA ACTIVAR

### **1. Generar VAPID Key en Firebase Console**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **dangivcontrol**
3. Ve a **Project Settings** (⚙️ en la esquina superior izquierda)
4. Click en la pestaña **Cloud Messaging**
5. Scroll hacia abajo hasta **Web Push certificates**
6. Click en **Generate key pair**
7. Copia la **VAPID Key** que se genera (empieza con `B...`)

### **2. Agregar VAPID Key al código**

Abre el archivo `push-notifications.js` y busca la línea 159:

```javascript
const vapidKey = 'BKxKxK...'; // ⚠️ REEMPLAZAR CON TU VAPID KEY
```

Reemplázala con tu VAPID key real:

```javascript
const vapidKey = 'BFr8...tu_vapid_key_completa...xyz';
```

### **3. Crear iconos para notificaciones**

Necesitas crear estos iconos en la carpeta raíz del proyecto:

- **`icon-192.png`** - Icono principal (192x192 px)
- **`badge-72.png`** - Badge pequeño (72x72 px)
- **`icon-check.png`** - Ícono de acción "Abrir" (opcional)
- **`icon-close.png`** - Ícono de acción "Cerrar" (opcional)

**Recomendación:** Usa el logo de Dan&Giv Control en formato PNG.

### **4. Habilitar Firebase Cloud Messaging API**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto: **dangivcontrol**
3. Ve a **APIs & Services** > **Library**
4. Busca **Firebase Cloud Messaging API**
5. Click en **Enable**

### **5. Desplegar a HTTPS**

**⚠️ IMPORTANTE:** Las notificaciones push solo funcionan en:

- **HTTPS** (producción)
- **localhost** (desarrollo)

No funcionan en HTTP ni en file://.

**Para Vercel:**
- Copia `firebase-messaging-sw.js` a la carpeta `/public` si Vercel lo requiere
- Asegúrate de que el service worker esté accesible en `/firebase-messaging-sw.js`

---

## 📱 CÓMO FUNCIONA

### **Flujo para Usuarios:**

1. Usuario se registra en la app
2. **10 segundos después**, aparece el modal de notificaciones con animación de campana
3. Usuario ve los 4 beneficios principales con íconos
4. Click en **"Activar Notificaciones"**:
   - El navegador solicita permisos (popup nativo)
   - Se registra el Service Worker
   - Se obtiene el token FCM
   - Se guarda el token en Firestore
   - Toast de éxito: "¡Notificaciones activadas correctamente! 🔔"
   - **2 segundos después**: Notificación de prueba
5. Usuario puede cerrar el modal con "Más tarde" (no vuelve a aparecer)

### **Tipos de Notificaciones Disponibles:**

```javascript
// 1. Notificación de prueba
window.pushNotificationManager.sendTestNotification();

// 2. Recordatorio de meta
window.pushNotificationManager.scheduleGoalReminder('Vacaciones', 5);

// 3. Resumen diario
window.pushNotificationManager.sendDailySummaryNotification(15000, 50000);

// 4. Alerta de presupuesto
window.pushNotificationManager.sendBudgetExceededNotification('Entretenimiento', 120);
```

---

## 🧪 TESTING

### **Testing Local:**

1. Asegúrate de que el servidor HTTP esté corriendo:
   ```bash
   python -m http.server 8000
   ```

2. Abre la app en Chrome/Edge: `http://localhost:8000`

3. Abre las DevTools (F12) y ve a **Application** > **Service Workers**

4. Verifica que `firebase-messaging-sw.js` esté registrado

5. Prueba solicitar permisos:
   ```javascript
   showPushNotificationModal()
   ```

6. Después de activar notificaciones, verás en la consola:
   ```
   ✅ Permiso de notificaciones concedido
   ✅ Token FCM obtenido: eyJ...
   ✅ Token FCM guardado en Firestore
   ```

### **Testing en Móvil:**

1. Despliega a Vercel (HTTPS requerido)
2. Abre la app desde tu móvil Android/iOS
3. Registra una cuenta o inicia sesión
4. Espera 10 segundos → Aparece el modal
5. Click en "Activar Notificaciones"
6. Acepta los permisos del sistema
7. Cierra la app o ponla en segundo plano
8. Las notificaciones llegarán como push notifications nativas

---

## 🚀 ENVIAR NOTIFICACIONES DESDE BACKEND

Para enviar notificaciones push a usuarios específicos, necesitas un backend que use el **Server Key** de Firebase.

### **Opción 1: Usar Firebase Admin SDK (Node.js)**

```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const message = {
  notification: {
    title: 'Meta Alcanzada! 🎯',
    body: 'Has alcanzado tu meta de ahorro de $500.000'
  },
  token: 'eyJ...token_del_usuario...'
};

admin.messaging().send(message)
  .then(response => console.log('✅ Notificación enviada:', response))
  .catch(error => console.error('❌ Error:', error));
```

### **Opción 2: HTTP Request directo**

```bash
curl -X POST https://fcm.googleapis.com/v1/projects/dangivcontrol/messages:send \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "eyJ...token_del_usuario...",
      "notification": {
        "title": "Dan&Giv Control",
        "body": "Tienes una nueva actualización"
      }
    }
  }'
```

---

## 📊 MONITOREO

### **Ver tokens guardados en Firestore:**

1. Ve a Firebase Console > Firestore Database
2. Abre la colección `usuarios`
3. Selecciona un documento de usuario
4. Verás el campo `fcmTokens` con los tokens registrados:

```json
{
  "fcmTokens": {
    "eyJ...": {
      "createdAt": 1737245897000,
      "userAgent": "Mozilla/5.0...",
      "platform": "Win32"
    }
  }
}
```

### **Ver logs en consola:**

- `🔔 Inicializando sistema de notificaciones push...`
- `✅ Service Worker registrado`
- `✅ Permiso de notificaciones concedido`
- `✅ Token FCM obtenido`
- `🔔 Notificación recibida en primer plano`

---

## ❓ TROUBLESHOOTING

### **"Service Worker registration failed"**
- Verifica que estés en HTTPS o localhost
- Revisa que `firebase-messaging-sw.js` esté en la raíz del proyecto

### **"Messaging not available"**
- Verifica que Firebase Messaging esté importado en `firebase-config.js`
- Revisa la consola para errores de importación

### **"VAPID key invalid"**
- Asegúrate de haber generado la VAPID key en Firebase Console
- Verifica que la key esté correctamente copiada en `push-notifications.js`

### **"Notificaciones no llegan en segundo plano"**
- Verifica que el Service Worker esté activo en DevTools > Application
- Revisa que el token FCM se haya guardado en Firestore
- Prueba enviar una notificación de prueba desde Firebase Console

---

## 🎉 LISTO!

Una vez completados estos pasos, tendrás un sistema completo de notificaciones push funcionando en móviles y desktop.

**Próximos pasos recomendados:**
- [ ] Agregar notificaciones programadas (requiere backend)
- [ ] Implementar notificaciones basadas en eventos (nuevo gasto, meta completada, etc.)
- [ ] Agregar configuración de preferencias de notificaciones en la app
- [ ] Analytics de notificaciones (tasa de apertura, engagement, etc.)
