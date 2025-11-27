/**
 * ========================================
 * HOOK GLOBAL PARA REPORTAR EVENTOS
 * React Hook para usar EventReporter - VERSIÓN FIREBASE
 * ========================================
 */

import { useEffect, useCallback } from 'react';
import { getEventReporter, reportError, reportUserActivity, reportApiError } from '../eventReporter-firebase';
import type { EventSeverity, EventOrigin } from '../eventReporter-firebase';

/**
 * Hook principal para reportar eventos
 */
export function useEventReporter() {
  const reporter = getEventReporter();

  useEffect(() => {
    // Intentar enviar eventos pendientes al montar
    reporter.retryPendingEvents();

    // Limpiar al desmontar
    return () => {
      // No destruir la instancia, solo hacer flush
      reporter.flush();
    };
  }, []);

  /**
   * Reportar bug
   */
  const reportBug = useCallback((data: {
    severity: EventSeverity;
    origin: EventOrigin;
    event: string;
    message: string;
    rawError?: any;
    userId?: string;
    metadata?: Record<string, any>;
  }) => {
    reporter.reportBug({
      ...data,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [reporter]);

  /**
   * Reportar actividad del usuario
   */
  const reportActivity = useCallback((event: string, metadata?: Record<string, any>, userId?: string) => {
    reporter.reportActivity({
      event,
      metadata,
      userId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [reporter]);

  /**
   * Reportar uso de API
   */
  const reportApiUsage = useCallback((data: {
    apiName: string;
    endpoint: string;
    method: string;
    statusCode?: number;
    duration?: number;
    cost?: number;
    userId?: string;
    error?: any;
  }) => {
    reporter.reportApiUsage(data);
  }, [reporter]);

  /**
   * Reportar anomalía
   */
  const reportAnomaly = useCallback((event: string, description: string, metadata?: Record<string, any>, userId?: string) => {
    reporter.reportAnomaly({
      event,
      description,
      metadata,
      userId,
    });
  }, [reporter]);

  return {
    reportBug,
    reportActivity,
    reportApiUsage,
    reportAnomaly,
    reportError,
    reportUserActivity,
    reportApiError,
  };
}

/**
 * Hook para capturar errores globales de React
 */
export function useErrorBoundaryReporter() {
  const { reportBug } = useEventReporter();

  useEffect(() => {
    // Capturar errores no manejados
    const handleError = (event: ErrorEvent) => {
      reportBug({
        severity: 'critical',
        origin: 'frontend',
        event: 'unhandled_error',
        message: event.message || 'Error no manejado',
        rawError: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        },
      });
    };

    // Capturar promesas rechazadas
    const handleRejection = (event: PromiseRejectionEvent) => {
      reportBug({
        severity: 'high',
        origin: 'frontend',
        event: 'unhandled_promise_rejection',
        message: 'Promesa rechazada sin manejar',
        rawError: {
          reason: event.reason,
        },
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [reportBug]);
}

/**
 * Hook para trackear actividad del usuario automáticamente
 */
export function useActivityTracker() {
  const { reportActivity } = useEventReporter();

  useEffect(() => {
    // Obtener userId del contexto/auth
    const getUserId = () => {
      // Adaptar según tu sistema de auth de Firebase
      if (typeof window !== 'undefined') {
        // Si usas Firebase Auth, puedes obtenerlo así:
        // import { getAuth } from 'firebase/auth';
        // const auth = getAuth();
        // return auth.currentUser?.uid;
        
        // O desde localStorage si guardas el usuario ahí
        const authData = localStorage.getItem('auth_user');
        if (authData) {
          try {
            const user = JSON.parse(authData);
            return user.uid || user.id;
          } catch {
            return undefined;
          }
        }
      }
      return undefined;
    };

    // Trackear clicks en botones importantes
    const handleImportantClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button, [role="button"], a');
      
      if (button) {
        const buttonText = button.textContent?.trim() || '';
        const buttonId = button.id || button.getAttribute('data-action') || '';
        
        // Solo trackear botones importantes
        const importantActions = [
          'login', 'logout', 'register', 'submit', 'save', 'delete',
          'mic', 'microphone', 'voice', 'record', 'transaction',
          'dashboard', 'expenses', 'goals', 'budget'
        ];

        if (importantActions.some(action => 
          buttonText.toLowerCase().includes(action) || 
          buttonId.toLowerCase().includes(action)
        )) {
          reportActivity('button_click', {
            buttonText,
            buttonId,
            action: button.getAttribute('data-action'),
          }, getUserId());
        }
      }
    };

    // Trackear uso del micrófono
    const trackMicrophoneUsage = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        reportActivity('microphone_accessed', {
          success: true,
        }, getUserId());
        
        // Detectar cuando se detiene
        stream.getTracks().forEach(track => {
          track.onended = () => {
            reportActivity('microphone_stopped', {
              duration: 'unknown', // Podrías trackear la duración
            }, getUserId());
          };
        });
      } catch (error: any) {
        reportActivity('microphone_denied', {
          error: error.message,
          errorName: error.name,
        }, getUserId());
      }
    };

    // Trackear navegación
    const trackNavigation = () => {
      reportActivity('page_view', {
        path: window.location.pathname,
        search: window.location.search,
      }, getUserId());
    };

    // Trackear tiempo de carga
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        reportActivity('page_load', {
          loadTime,
          isSlow: loadTime > 3000,
        }, getUserId());
      });
    }

    document.addEventListener('click', handleImportantClick);
    trackNavigation();

    return () => {
      document.removeEventListener('click', handleImportantClick);
    };
  }, [reportActivity]);
}

