// ========================================
// SERVICE WORKER PARA NOTIFICACIONES PUSH
// Firebase Cloud Messaging Service Worker
// ========================================

// Importar Firebase Messaging para Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

// Configuración de Firebase (debe coincidir con firebase-config.js)
const firebaseConfig = {
  apiKey: "AIzaSyAKhtER3ynV5VDsqkqbYQEP-q4jpIYSjRU",
  authDomain: "dangivcontrol.firebaseapp.com",
  projectId: "dangivcontrol",
  storageBucket: "dangivcontrol.firebasestorage.app",
  messagingSenderId: "536622297849",
  appId: "1:536622297849:web:0bb3d7ff66b9f6937e8c6e",
  measurementId: "G-EDQJE0PZRY"
};

// Inicializar Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);

// Obtener instancia de Messaging
const messaging = firebase.messaging();

// ========================================
// MANEJAR NOTIFICACIONES EN SEGUNDO PLANO
// ========================================

/**
 * Maneja notificaciones cuando la app está en segundo plano o cerrada
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación recibida en segundo plano:', payload);

  const notificationTitle = payload.notification?.title || 'Dan&Giv Control';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva actualización',
    // Usar emoji SVG como icono (fallback si no hay PNG)
    icon: payload.notification?.icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">💰</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">💰</text></svg>',
    image: payload.notification?.image, // Imagen grande (opcional)
    tag: payload.data?.tag || 'default', // Tag para agrupar notificaciones
    requireInteraction: false, // Auto-cerrar después de unos segundos
    vibrate: [200, 100, 200], // Patrón de vibración
    data: payload.data || {}, // Datos adicionales
    actions: [
      {
        action: 'open',
        title: 'Abrir app'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  // Mostrar la notificación
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ========================================
// MANEJAR CLICKS EN NOTIFICACIONES
// ========================================

/**
 * Maneja cuando el usuario hace click en una notificación
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notificación clickeada:', event.notification.tag);

  event.notification.close(); // Cerrar la notificación

  // Obtener datos de la notificación
  const urlToOpen = event.notification.data?.url || '/';
  const action = event.action;

  if (action === 'close') {
    // No hacer nada, solo cerrar
    return;
  }

  // Abrir o enfocar la ventana de la app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (let client of clientList) {
        if (client.url === new URL(urlToOpen, self.location.origin).href && 'focus' in client) {
          return client.focus();
        }
      }

      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ========================================
// EVENTOS DEL SERVICE WORKER
// ========================================

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalado');
  self.skipWaiting(); // Activar inmediatamente
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activado');
  event.waitUntil(clients.claim()); // Tomar control de todas las pestañas
});

console.log('[Service Worker] firebase-messaging-sw.js cargado correctamente');
