// ========================================
// SISTEMA DE NOTIFICACIONES PUSH
// Maneja permisos, suscripciones y envío de notificaciones
// ========================================

/**
 * Clase para manejar notificaciones push con Firebase Cloud Messaging
 */
class PushNotificationManager {
  constructor() {
    this.messaging = null;
    this.currentToken = null;
    this.isSupported = false;
    this.permissionGranted = false;
  }

  /**
   * Inicializa el sistema de notificaciones push
   */
  async init() {
    console.log('🔔 Inicializando sistema de notificaciones push...');

    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.warn('❌ Este navegador no soporta notificaciones');
      return false;
    }

    // Verificar si el navegador soporta Service Workers
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Este navegador no soporta Service Workers');
      return false;
    }

    this.isSupported = true;

    // Verificar si Firebase Messaging está disponible
    if (!window.FB?.messaging) {
      console.warn('⚠️ Firebase Messaging no está inicializado');
      return false;
    }

    this.messaging = window.FB.messaging;

    // Registrar Service Worker
    await this.registerServiceWorker();

    // Verificar permisos actuales
    await this.checkPermissionStatus();

    // Configurar listener de mensajes en primer plano
    this.setupForegroundMessageListener();

    return true;
  }

  /**
   * Registra el Service Worker para notificaciones
   */
  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registrado:', registration.scope);
      return registration;
    } catch (error) {
      console.error('❌ Error al registrar Service Worker:', error);
      throw error;
    }
  }

  /**
   * Verifica el estado actual de los permisos de notificación
   */
  async checkPermissionStatus() {
    const permission = Notification.permission;
    console.log('📋 Estado de permisos de notificación:', permission);

    this.permissionGranted = permission === 'granted';

    if (permission === 'granted') {
      // Si ya tenemos permiso, intentar obtener el token
      await this.getRegistrationToken();
    }

    return permission;
  }

  /**
   * Solicita permisos de notificación al usuario
   */
  async requestPermission() {
    console.log('🔔 Solicitando permisos de notificación...');

    if (!this.isSupported) {
      console.warn('❌ Notificaciones no soportadas');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('📋 Resultado de solicitud de permisos:', permission);

      if (permission === 'granted') {
        console.log('✅ Permiso de notificaciones concedido');
        this.permissionGranted = true;

        // Obtener token de registro
        await this.getRegistrationToken();

        return true;
      } else {
        console.warn('❌ Permiso de notificaciones denegado');
        this.permissionGranted = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      return false;
    }
  }

  /**
   * Obtiene el token de registro de FCM
   */
  async getRegistrationToken() {
    if (!this.messaging) {
      console.warn('⚠️ Messaging no disponible');
      return null;
    }

    try {
      // VAPID Key - Generada en Firebase Console
      // Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
      const vapidKey = 'BGbDQL5BNEtTwX9jNXs8dMs0sibK2FSTty0SQD85is4qXT2KXnfxHMLdFDCFngybks0clXFbFcu0SgpRdNiDXXs';

      const currentToken = await window.FB.getToken(this.messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });

      if (currentToken) {
        console.log('✅ Token FCM obtenido:', currentToken);
        this.currentToken = currentToken;

        // Guardar token en Firestore para enviar notificaciones después
        await this.saveTokenToFirestore(currentToken);

        return currentToken;
      } else {
        console.warn('⚠️ No se pudo obtener token de registro');
        return null;
      }
    } catch (error) {
      console.error('❌ Error al obtener token FCM:', error);
      return null;
    }
  }

  /**
   * Guarda el token FCM en Firestore para el usuario actual
   */
  async saveTokenToFirestore(token) {
    if (!window.app?.currentUser || window.app.currentUser === 'anonymous') {
      console.log('⚠️ Usuario anónimo - Token no guardado en Firestore');
      // Guardar en localStorage para usuarios anónimos
      localStorage.setItem('fcmToken', token);
      return;
    }

    try {
      const userId = window.app.currentUser;
      const userDocRef = window.FB.doc(window.FB.db, 'usuarios', userId);

      await window.FB.setDoc(userDocRef, {
        fcmTokens: {
          [token]: {
            createdAt: Date.now(),
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        }
      }, { merge: true });

      console.log('✅ Token FCM guardado en Firestore');
    } catch (error) {
      console.error('❌ Error al guardar token en Firestore:', error);
    }
  }

  /**
   * Configura listener para mensajes recibidos en primer plano
   */
  setupForegroundMessageListener() {
    if (!this.messaging) return;

    window.FB.onMessage(this.messaging, (payload) => {
      console.log('🔔 Notificación recibida en primer plano:', payload);

      // Mostrar notificación personalizada
      this.showNotification(
        payload.notification?.title || 'Dan&Giv Control',
        {
          body: payload.notification?.body || 'Tienes una nueva actualización',
          icon: payload.notification?.icon || '/icon-192.png',
          image: payload.notification?.image,
          data: payload.data || {},
          tag: payload.data?.tag || 'foreground-notification'
        }
      );

      // Mostrar también toast en la app
      if (window.app) {
        window.app.showToast(
          payload.notification?.body || 'Nueva notificación',
          'info'
        );
      }
    });
  }

  /**
   * Muestra una notificación del navegador
   */
  async showNotification(title, options = {}) {
    if (!this.permissionGranted) {
      console.warn('⚠️ Sin permisos para mostrar notificación');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Preparar opciones - spread primero para que los defaults no sobrescriban
      const finalOptions = {
        vibrate: [200, 100, 200],
        requireInteraction: false,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">💰</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">💰</text></svg>',
        ...options // Spread al final para que options.icon sobrescriba si existe
      };

      await registration.showNotification(title, finalOptions);

      console.log('✅ Notificación mostrada:', title);
    } catch (error) {
      console.error('❌ Error al mostrar notificación:', error);
    }
  }

  /**
   * Envía una notificación de prueba
   */
  async sendTestNotification() {
    await this.showNotification('Notificación de prueba', {
      body: '¡Las notificaciones push están funcionando correctamente! 🎉',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">✅</text></svg>',
      tag: 'test-notification',
      requireInteraction: true,
      actions: [
        { action: 'ok', title: 'Entendido' }
      ]
    });
  }

  /**
   * Programa una notificación para recordatorio de meta
   */
  scheduleGoalReminder(goalName, daysLeft) {
    // Las notificaciones programadas requieren backend
    // Por ahora, mostrar notificación inmediata
    this.showNotification('Recordatorio de Meta 🎯', {
      body: `Quedan ${daysLeft} días para alcanzar tu meta: ${goalName}`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🎯</text></svg>',
      tag: `goal-reminder-${goalName}`,
      data: { type: 'goal-reminder', goalName }
    });
  }

  /**
   * Notificación de resumen diario
   */
  sendDailySummaryNotification(totalGastos, totalIngresos) {
    this.showNotification('Resumen Diario 📊', {
      body: `Hoy gastaste $${totalGastos.toLocaleString()} y recibiste $${totalIngresos.toLocaleString()}`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">💰</text></svg>',
      tag: 'daily-summary',
      data: { type: 'daily-summary' }
    });
  }

  /**
   * Notificación de presupuesto excedido
   */
  sendBudgetExceededNotification(category, percentage) {
    this.showNotification('⚠️ Presupuesto Excedido', {
      body: `Has gastado ${percentage}% de tu presupuesto en ${category}`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">⚠️</text></svg>',
      tag: 'budget-alert',
      requireInteraction: true,
      data: { type: 'budget-alert', category }
    });
  }
}

// ========================================
// EXPONER GLOBALMENTE
// ========================================

// Crear instancia global
window.pushNotificationManager = new PushNotificationManager();

// Exportar para uso en módulos
export default PushNotificationManager;

console.log('📱 PushNotificationManager cargado');
