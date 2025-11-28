/**
 * ========================================
 * EVENT REPORTER - Sistema de Reportes
 * Finantel Admin System - VERSIÓN FIREBASE
 * ========================================
 * 
 * Este módulo envía eventos del sistema a Firestore
 * de forma eficiente y no bloqueante.
 */

import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  Firestore 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeApp, FirebaseApp } from 'firebase/app';

// Tipos de eventos
export type EventType = 'bug' | 'activity' | 'alert' | 'api_usage' | 'anomaly';
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EventOrigin = 'frontend' | 'backend' | 'firebase' | 'api' | 'auth' | 'database' | 'user';
export type EventStatus = 'new' | 'reviewed' | 'resolved' | 'ignored';

// Interfaz base para eventos
export interface BaseEvent {
  type: EventType;
  event: string;
  userId?: string;
  message: Record<string, any>;
  metadata?: Record<string, any>;
  deviceInfo?: DeviceInfo;
  url?: string;
}

// Interfaz para bugs
export interface BugEvent extends BaseEvent {
  type: 'bug';
  severity: EventSeverity;
  origin: EventOrigin;
  rawError?: any;
}

// Interfaz para actividad
export interface ActivityEvent extends BaseEvent {
  type: 'activity';
  event: string;
}

// Información del dispositivo
export interface DeviceInfo {
  userAgent?: string;
  platform?: string;
  language?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  browser?: string;
  os?: string;
}

class EventReporter {
  private firestore: Firestore | null = null;
  private auth: Auth | null = null;
  private queue: Array<BaseEvent> = [];
  private isProcessing = false;
  private batchSize = 10;
  private flushInterval = 5000; // 5 segundos
  private flushTimer: NodeJS.Timeout | null = null;
  private retryQueue: Array<BaseEvent> = [];
  private maxRetries = 3;

  constructor() {
    this.initializeFirebase();
    this.startFlushTimer();
    
    // Enviar eventos pendientes antes de cerrar la página
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
      
      // También enviar cuando la página se oculta
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }
  }

  /**
   * Inicializar Firebase
   */
  private initializeFirebase() {
    if (typeof window === 'undefined') return;

    // Intentar obtener la app de Firebase ya inicializada
    let app: FirebaseApp;
    try {
      // Si ya hay una app inicializada, úsala
      const existingApps = (window as any).__FIREBASE_APPS__ || [];
      if (existingApps.length > 0) {
        app = existingApps[0];
      } else {
        // Si no, intentar inicializar con variables de entorno
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.REACT_APP_FIREBASE_APP_ID,
        };

        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
          console.warn('[EventReporter] Firebase config not found. Events will be queued.');
          return;
        }

        app = initializeApp(firebaseConfig);
      }

      this.firestore = getFirestore(app);
      this.auth = getAuth(app);
    } catch (error) {
      console.warn('[EventReporter] Firebase initialization failed. Events will be queued.', error);
    }
  }

  /**
   * Obtener información del dispositivo
   */
  private getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {};
    }

    const ua = navigator.userAgent;
    const screen = window.screen;

    // Detectar navegador
    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // Detectar OS
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS')) os = 'iOS';

    return {
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: screen.width,
      screenHeight: screen.height,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      browser,
      os,
    };
  }

  /**
   * Obtener userId actual
   */
  private getCurrentUserId(): string | undefined {
    if (this.auth?.currentUser) {
      return this.auth.currentUser.uid;
    }
    return undefined;
  }

  /**
   * Reportar un bug
   */
  reportBug(data: {
    severity: EventSeverity;
    origin: EventOrigin;
    event: string;
    message: string;
    rawError?: any;
    userId?: string;
    metadata?: Record<string, any>;
    url?: string;
  }): void {
    const event: BugEvent = {
      type: 'bug',
      severity: data.severity,
      origin: data.origin,
      event: data.event,
      userId: data.userId || this.getCurrentUserId(),
      message: {
        text: data.message,
        error: data.rawError ? this.sanitizeError(data.rawError) : undefined,
      },
      metadata: data.metadata || {},
      deviceInfo: this.getDeviceInfo(),
      url: data.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      rawError: data.rawError,
    };

    this.queueEvent(event);
  }

  /**
   * Reportar actividad del usuario
   */
  reportActivity(data: {
    event: string;
    userId?: string;
    metadata?: Record<string, any>;
    url?: string;
  }): void {
    const event: ActivityEvent = {
      type: 'activity',
      event: data.event,
      userId: data.userId || this.getCurrentUserId(),
      message: {
        text: data.event,
      },
      metadata: data.metadata || {},
      deviceInfo: this.getDeviceInfo(),
      url: data.url || (typeof window !== 'undefined' ? window.location.href : undefined),
    };

    this.queueEvent(event);
  }

  /**
   * Reportar uso de API
   */
  reportApiUsage(data: {
    apiName: string;
    endpoint: string;
    method: string;
    statusCode?: number;
    duration?: number;
    cost?: number;
    userId?: string;
    error?: any;
  }): void {
    const event: BaseEvent = {
      type: 'api_usage',
      event: `${data.apiName}_${data.method}_${data.endpoint}`,
      userId: data.userId || this.getCurrentUserId(),
      message: {
        api: data.apiName,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        duration: data.duration,
        cost: data.cost,
        success: !data.error,
      },
      metadata: {
        apiName: data.apiName,
        endpoint: data.endpoint,
        method: data.method,
        statusCode: data.statusCode,
        duration: data.duration,
        cost: data.cost,
        error: data.error ? this.sanitizeError(data.error) : undefined,
      },
      deviceInfo: this.getDeviceInfo(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.queueEvent(event);
  }

  /**
   * Reportar anomalía
   */
  reportAnomaly(data: {
    event: string;
    description: string;
    userId?: string;
    metadata?: Record<string, any>;
  }): void {
    const event: BaseEvent = {
      type: 'anomaly',
      event: data.event,
      userId: data.userId || this.getCurrentUserId(),
      message: {
        text: data.description,
      },
      metadata: data.metadata || {},
      deviceInfo: this.getDeviceInfo(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.queueEvent(event);
  }

  /**
   * Agregar evento a la cola
   */
  private queueEvent(event: BaseEvent): void {
    this.queue.push(event);

    // Si la cola está llena, procesar inmediatamente
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Enviar eventos a Firestore
   */
  private async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToSend = this.queue.splice(0, this.batchSize);

    try {
      if (!this.firestore) {
        // Si no hay Firestore, guardar en localStorage como fallback
        this.saveToLocalStorage(eventsToSend);
        this.isProcessing = false;
        return;
      }

      // Preparar eventos para insertar
      const batch = eventsToSend.map((event) => {
        const baseEvent: any = {
          type: event.type,
          event: event.event,
          userId: event.userId || null,
          message: event.message,
          metadata: event.metadata || {},
          deviceInfo: event.deviceInfo || {},
          url: event.url || null,
          status: 'new',
          createdAt: serverTimestamp(),
        };

        // Agregar campos específicos de bugs
        if (event.type === 'bug') {
          const bugEvent = event as BugEvent;
          baseEvent.severity = bugEvent.severity;
          baseEvent.origin = bugEvent.origin;
        }

        return baseEvent;
      });

      // Insertar eventos en Firestore
      const promises = batch.map((eventData) =>
        addDoc(collection(this.firestore!, 'system_events'), eventData)
      );

      await Promise.all(promises);

      // Limpiar cola de reintentos si hay éxito
      this.retryQueue = [];

      console.log(`[EventReporter] ✅ Enviados ${batch.length} eventos a Firestore`);
    } catch (error) {
      console.error('[EventReporter] ❌ Error enviando eventos:', error);
      
      // Agregar a cola de reintentos
      this.retryQueue.push(...eventsToSend);
      
      // Reintentar hasta maxRetries veces
      if (this.retryQueue.length > 0 && this.retryQueue.length < this.maxRetries * this.batchSize) {
        setTimeout(() => {
          this.queue.unshift(...this.retryQueue);
          this.retryQueue = [];
          this.flush();
        }, 5000);
      } else {
        // Guardar en localStorage como último recurso
        this.saveToLocalStorage(eventsToSend);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Guardar eventos en localStorage como fallback
   */
  private saveToLocalStorage(events: BaseEvent[]): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('pending_events');
      const pending = stored ? JSON.parse(stored) : [];
      pending.push(...events);
      
      // Limitar a 100 eventos máximo
      if (pending.length > 100) {
        pending.splice(0, pending.length - 100);
      }
      
      localStorage.setItem('pending_events', JSON.stringify(pending));
    } catch (error) {
      console.error('[EventReporter] Error guardando en localStorage:', error);
    }
  }

  /**
   * Intentar enviar eventos pendientes de localStorage
   */
  async retryPendingEvents(): Promise<void> {
    if (typeof window === 'undefined' || !this.firestore) return;

    try {
      const stored = localStorage.getItem('pending_events');
      if (!stored) return;

      const pending = JSON.parse(stored);
      if (pending.length === 0) return;

      this.queue.push(...pending);
      localStorage.removeItem('pending_events');
      
      await this.flush();
    } catch (error) {
      console.error('[EventReporter] Error reintentando eventos:', error);
    }
  }

  /**
   * Iniciar timer para flush automático
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Sanitizar errores (remover datos sensibles)
   */
  private sanitizeError(error: any): any {
    if (!error) return null;

    try {
      const errorStr = JSON.stringify(error);
      const sanitized = JSON.parse(errorStr);

      // Remover campos sensibles
      const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'auth', 'authorization', 'cookie'];
      
      const sanitizeObject = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) {
          return obj;
        }

        if (Array.isArray(obj)) {
          return obj.map(sanitizeObject);
        }

        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          const lowerKey = key.toLowerCase();
          if (sensitiveFields.some(field => lowerKey.includes(field))) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = sanitizeObject(value);
          }
        }
        return sanitized;
      };

      return sanitizeObject(sanitized);
    } catch {
      return { message: String(error) };
    }
  }

  /**
   * Limpiar recursos
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Instancia singleton
let eventReporterInstance: EventReporter | null = null;

/**
 * Obtener instancia del EventReporter
 */
export function getEventReporter(): EventReporter {
  if (!eventReporterInstance) {
    eventReporterInstance = new EventReporter();
  }
  return eventReporterInstance;
}

/**
 * Helpers para reportar eventos comunes
 */
export const reportError = (error: Error, context?: string) => {
  const reporter = getEventReporter();
  reporter.reportBug({
    severity: 'high',
    origin: 'frontend',
    event: 'javascript_error',
    message: error.message,
    rawError: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    },
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  });
};

export const reportApiError = (apiName: string, endpoint: string, error: any, userId?: string) => {
  const reporter = getEventReporter();
  reporter.reportApiUsage({
    apiName,
    endpoint,
    method: 'unknown',
    error,
    userId,
  });
};

export const reportUserActivity = (event: string, metadata?: Record<string, any>, userId?: string) => {
  const reporter = getEventReporter();
  reporter.reportActivity({
    event,
    metadata,
    userId,
  });
};

// Exportar instancia por defecto
export default getEventReporter();


