/**
 * ========================================
 * CONVERSOR JSON → LENGUAJE NATURAL
 * Traduce eventos técnicos a mensajes humanos
 * ========================================
 */

import type { EventType, EventSeverity, EventOrigin } from '../eventReporter';

interface SystemEvent {
  id: string;
  type: EventType;
  severity?: EventSeverity;
  origin: EventOrigin;
  event: string;
  user_id?: string;
  message: any;
  metadata?: any;
  device_info?: any;
  url?: string;
  created_at: string;
  status: string;
}

/**
 * Traducir evento a lenguaje natural
 */
export function translateEventToHuman(event: SystemEvent): string {
  const timestamp = formatTimestamp(event.created_at);
  const userInfo = event.user_id ? `usuario ${event.user_id}` : 'un usuario';
  const deviceInfo = formatDeviceInfo(event.device_info);

  switch (event.type) {
    case 'bug':
      return translateBug(event, timestamp, userInfo, deviceInfo);
    case 'activity':
      return translateActivity(event, timestamp, userInfo, deviceInfo);
    case 'api_usage':
      return translateApiUsage(event, timestamp, userInfo, deviceInfo);
    case 'anomaly':
      return translateAnomaly(event, timestamp, userInfo, deviceInfo);
    case 'alert':
      return translateAlert(event, timestamp, userInfo, deviceInfo);
    default:
      return `Evento desconocido: ${event.event}`;
  }
}

/**
 * Traducir bug a lenguaje natural
 */
function translateBug(
  event: SystemEvent,
  timestamp: string,
  userInfo: string,
  deviceInfo: string
): string {
  const severity = event.severity || 'medium';
  const severityEmoji = getSeverityEmoji(severity);
  const originName = getOriginName(event.origin);
  
  const eventName = getEventName(event.event);
  const errorMessage = extractErrorMessage(event.message);
  
  let message = `${severityEmoji} `;
  
  // Construir mensaje según el tipo de error
  if (event.event.includes('voice') || event.event.includes('audio') || event.event.includes('mic')) {
    message += `Error en procesamiento de voz. ${userInfo} no pudo ${eventName}.`;
  } else if (event.event.includes('auth') || event.event.includes('login')) {
    message += `Error de autenticación. ${userInfo} tuvo problemas al ${eventName}.`;
  } else if (event.event.includes('transaction')) {
    message += `Error al procesar transacción. ${userInfo} no pudo ${eventName}.`;
  } else if (event.event.includes('api')) {
    message += `Error en llamada a API. ${originName} falló al ${eventName}.`;
  } else {
    message += `Error en ${originName}. ${userInfo} experimentó: ${eventName}.`;
  }

  if (errorMessage) {
    message += ` ${errorMessage}`;
  }

  message += ` Ocurrió ${timestamp} desde ${deviceInfo}.`;

  if (event.url) {
    const path = new URL(event.url).pathname;
    message += ` En la página ${path}.`;
  }

  return message;
}

/**
 * Traducir actividad a lenguaje natural
 */
function translateActivity(
  event: SystemEvent,
  timestamp: string,
  userInfo: string,
  deviceInfo: string
): string {
  const emoji = getActivityEmoji(event.event);
  const action = getActivityAction(event.event);
  
  let message = `${emoji} ${userInfo} ${action}`;

  // Agregar detalles según el tipo de actividad
  if (event.metadata) {
    if (event.metadata.buttonText) {
      message += ` el botón "${event.metadata.buttonText}"`;
    }
    if (event.metadata.duration) {
      message += ` durante ${formatDuration(event.metadata.duration)}`;
    }
    if (event.metadata.success === false) {
      message += ` (falló)`;
    }
  }

  message += ` ${timestamp}.`;

  return message;
}

/**
 * Traducir uso de API a lenguaje natural
 */
function translateApiUsage(
  event: SystemEvent,
  timestamp: string,
  userInfo: string,
  deviceInfo: string
): string {
  const apiName = event.metadata?.apiName || 'API desconocida';
  const endpoint = event.metadata?.endpoint || '';
  const statusCode = event.metadata?.statusCode;
  const duration = event.metadata?.duration;
  const cost = event.metadata?.cost;

  let message = `🔌 Llamada a ${apiName}`;

  if (endpoint) {
    message += ` (${endpoint})`;
  }

  if (statusCode) {
    if (statusCode >= 400) {
      message += ` falló con código ${statusCode}`;
    } else {
      message += ` exitosa (${statusCode})`;
    }
  }

  if (duration) {
    message += `. Tardó ${duration}ms`;
  }

  if (cost) {
    message += `. Costo: $${cost.toFixed(4)}`;
  }

  if (userInfo !== 'un usuario') {
    message += `. Usuario: ${userInfo}`;
  }

  message += ` ${timestamp}.`;

  return message;
}

/**
 * Traducir anomalía a lenguaje natural
 */
function translateAnomaly(
  event: SystemEvent,
  timestamp: string,
  userInfo: string,
  deviceInfo: string
): string {
  const description = event.message?.text || event.event;
  
  return `⚠️ Anomalía detectada: ${description}. ${userInfo} ${timestamp} desde ${deviceInfo}.`;
}

/**
 * Traducir alerta a lenguaje natural
 */
function translateAlert(
  event: SystemEvent,
  timestamp: string,
  userInfo: string,
  deviceInfo: string
): string {
  const message = event.message?.text || event.event;
  return `🔔 ${message} ${timestamp}.`;
}

/**
 * Obtener emoji según severidad
 */
function getSeverityEmoji(severity: EventSeverity): string {
  switch (severity) {
    case 'critical':
      return '🔴';
    case 'high':
      return '🟠';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
    default:
      return '⚪';
  }
}

/**
 * Obtener nombre legible del origen
 */
function getOriginName(origin: EventOrigin): string {
  const names: Record<EventOrigin, string> = {
    frontend: 'el frontend',
    backend: 'el backend',
    supabase: 'Supabase',
    api: 'una API externa',
    auth: 'el sistema de autenticación',
    database: 'la base de datos',
    user: 'acción del usuario',
  };
  return names[origin] || origin;
}

/**
 * Obtener nombre legible del evento
 */
function getEventName(event: string): string {
  // Mapeo de eventos técnicos a lenguaje natural
  const eventMap: Record<string, string> = {
    'voice_to_transaction': 'convertir audio a transacción',
    'audio_processing': 'procesar audio',
    'microphone_access': 'acceder al micrófono',
    'login': 'iniciar sesión',
    'logout': 'cerrar sesión',
    'register': 'registrarse',
    'transaction_create': 'crear transacción',
    'transaction_edit': 'editar transacción',
    'transaction_delete': 'eliminar transacción',
    'dashboard_load': 'cargar el dashboard',
    'api_call': 'llamar a la API',
    'database_query': 'consultar la base de datos',
    'auth_token_expired': 'token expirado',
    'permission_denied': 'permiso denegado',
  };

  // Buscar coincidencia exacta
  if (eventMap[event]) {
    return eventMap[event];
  }

  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(eventMap)) {
    if (event.includes(key)) {
      return value;
    }
  }

  // Si no hay coincidencia, formatear el nombre del evento
  return event
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Extraer mensaje de error del objeto message
 */
function extractErrorMessage(message: any): string {
  if (!message) return '';

  if (typeof message === 'string') {
    return message;
  }

  if (message.text) {
    return message.text;
  }

  if (message.error) {
    if (typeof message.error === 'string') {
      return message.error;
    }
    if (message.error.message) {
      return message.error.message;
    }
  }

  return '';
}

/**
 * Obtener emoji según tipo de actividad
 */
function getActivityEmoji(event: string): string {
  if (event.includes('login')) return '🔐';
  if (event.includes('logout')) return '👋';
  if (event.includes('mic') || event.includes('voice') || event.includes('audio')) return '🎤';
  if (event.includes('transaction')) return '💰';
  if (event.includes('click')) return '👆';
  if (event.includes('view') || event.includes('load')) return '👀';
  if (event.includes('create')) return '➕';
  if (event.includes('edit') || event.includes('update')) return '✏️';
  if (event.includes('delete')) return '🗑️';
  return '👤';
}

/**
 * Obtener acción en lenguaje natural
 */
function getActivityAction(event: string): string {
  if (event.includes('login')) return 'inició sesión';
  if (event.includes('logout')) return 'cerró sesión';
  if (event.includes('mic') || event.includes('microphone')) return 'usó el micrófono';
  if (event.includes('voice')) return 'grabó audio';
  if (event.includes('transaction_create')) return 'creó una transacción';
  if (event.includes('transaction_edit')) return 'editó una transacción';
  if (event.includes('click')) return 'hizo clic en';
  if (event.includes('view') || event.includes('load')) return 'visitó';
  return 'realizó una acción';
}

/**
 * Formatear información del dispositivo
 */
function formatDeviceInfo(deviceInfo: any): string {
  if (!deviceInfo || typeof deviceInfo !== 'object') {
    return 'dispositivo desconocido';
  }

  const parts: string[] = [];

  if (deviceInfo.browser && deviceInfo.os) {
    parts.push(`${deviceInfo.browser} (${deviceInfo.os})`);
  } else if (deviceInfo.browser) {
    parts.push(deviceInfo.browser);
  } else if (deviceInfo.os) {
    parts.push(deviceInfo.os);
  }

  if (deviceInfo.platform) {
    parts.push(deviceInfo.platform);
  }

  return parts.length > 0 ? parts.join(' en ') : 'dispositivo desconocido';
}

/**
 * Formatear timestamp a tiempo relativo
 */
function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'hace unos segundos';
  } else if (diffMins < 60) {
    return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffDays < 7) {
    return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Formatear duración
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  } else {
    return `${(ms / 60000).toFixed(1)}min`;
  }
}

/**
 * Generar resumen de análisis en lenguaje natural
 */
export function generateAnalysisSummary(analysis: any): string {
  const summaries: string[] = [];

  // Errores del día
  if (analysis.errors_today) {
    const critical = analysis.errors_today.critical || 0;
    const high = analysis.errors_today.high || 0;
    const total = analysis.errors_today.total || 0;

    if (total > 0) {
      let errorSummary = `Hoy hubo ${total} error${total > 1 ? 'es' : ''}`;
      if (critical > 0) {
        errorSummary += `, ${critical} crítico${critical > 1 ? 's' : ''}`;
      }
      if (high > 0) {
        errorSummary += ` y ${high} de alta severidad`;
      }
      summaries.push(errorSummary);
    }
  }

  // Endpoints con más errores
  if (analysis.top_error_endpoints && analysis.top_error_endpoints.length > 0) {
    const top = analysis.top_error_endpoints[0];
    summaries.push(`El endpoint con más errores es ${top.endpoint} con ${top.count} fallos.`);
  }

  // Actividad más usada
  if (analysis.top_activities && analysis.top_activities.length > 0) {
    const top = analysis.top_activities[0];
    summaries.push(`La funcionalidad más usada es ${top.activity} con ${top.count} usos.`);
  }

  // Fallos de micrófono
  if (analysis.microphone_failures && analysis.microphone_failures > 0) {
    summaries.push(`Hubo ${analysis.microphone_failures} fallo${analysis.microphone_failures > 1 ? 's' : ''} de micrófono, principalmente por denegación de permisos.`);
  }

  // Uso de IA
  if (analysis.ai_usage) {
    summaries.push(`${analysis.ai_usage.count} usuario${analysis.ai_usage.count > 1 ? 's' : ''} usaron la funcionalidad de IA.`);
  }

  // Conversiones de voz
  if (analysis.voice_conversions) {
    const success = analysis.voice_conversions.success || 0;
    const total = analysis.voice_conversions.total || 0;
    if (total > 0) {
      const rate = ((success / total) * 100).toFixed(1);
      summaries.push(`De ${total} intentos de conversión de voz, ${success} fueron exitosos (${rate}% de éxito).`);
    }
  }

  return summaries.length > 0 
    ? summaries.join(' ') 
    : 'No hay actividad significativa para reportar.';
}

