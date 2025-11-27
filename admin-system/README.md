# 🎯 Sistema de Reportes y Notificaciones - Finantel

Sistema completo de monitoreo, reportes y notificaciones para el panel de administrador de Finantel.

## 📋 Tabla de Contenidos

1. [Características](#características)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Uso](#uso)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [API Reference](#api-reference)
7. [Ejemplos](#ejemplos)

## ✨ Características

- ✅ **Detección automática de bugs** (frontend, backend, APIs, auth, etc.)
- ✅ **Tracking de actividad del usuario** (clicks, navegación, uso de micrófono, etc.)
- ✅ **Monitoreo de APIs** (costos, errores, latencia)
- ✅ **Detección de anomalías** automática
- ✅ **Notificaciones en tiempo real** con Supabase Realtime
- ✅ **Conversión automática** de JSON a lenguaje natural
- ✅ **Panel de administrador** profesional estilo Apple/Stripe
- ✅ **Análisis automáticos** (métricas, tendencias, retención)
- ✅ **Sistema de prioridades** y severidad
- ✅ **Optimizado** para bajo consumo de recursos

## 🚀 Instalación

### 1. Base de Datos

Ejecuta el script SQL en Supabase:

```bash
# En Supabase SQL Editor
psql -f admin-system/database/schema.sql
```

O copia y pega el contenido de `admin-system/database/schema.sql` en el SQL Editor de Supabase.

### 2. Instalar Dependencias

```bash
npm install @supabase/supabase-js
# o
yarn add @supabase/supabase-js
```

### 3. Configurar Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## ⚙️ Configuración

### Integrar en tu App React

```tsx
// App.tsx o _app.tsx
import { useErrorBoundaryReporter, useActivityTracker } from './admin-system/hooks/useEventReporter';

function App() {
  // Capturar errores globales
  useErrorBoundaryReporter();
  
  // Trackear actividad automáticamente
  useActivityTracker();
  
  return (
    // Tu app
  );
}
```

### Configurar RLS (Row Level Security)

El sistema ya incluye políticas RLS. Asegúrate de tener una tabla `user_profiles` con un campo `role`:

```sql
-- Ejemplo de tabla user_profiles
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('admin', 'user')),
  -- otros campos...
);
```

## 📖 Uso

### Reportar un Bug

```tsx
import { useEventReporter } from './admin-system/hooks/useEventReporter';

function MyComponent() {
  const { reportBug } = useEventReporter();

  const handleError = (error: Error) => {
    reportBug({
      severity: 'high',
      origin: 'frontend',
      event: 'transaction_failed',
      message: 'No se pudo crear la transacción',
      rawError: error,
      userId: currentUser?.id,
    });
  };

  // ...
}
```

### Reportar Actividad del Usuario

```tsx
const { reportActivity } = useEventReporter();

// Cuando el usuario hace clic en un botón importante
reportActivity('button_click', {
  buttonText: 'Crear Transacción',
  buttonId: 'create-transaction-btn',
}, userId);

// Cuando el usuario usa el micrófono
reportActivity('microphone_accessed', {
  success: true,
}, userId);
```

### Reportar Uso de API

```tsx
const { reportApiUsage } = useEventReporter();

// Después de una llamada a API
const startTime = Date.now();
try {
  const response = await fetch('/api/transactions');
  const duration = Date.now() - startTime;
  
  reportApiUsage({
    apiName: 'OpenAI',
    endpoint: '/v1/chat/completions',
    method: 'POST',
    statusCode: response.status,
    duration,
    cost: 0.002, // Costo estimado
    userId: currentUser?.id,
  });
} catch (error) {
  reportApiUsage({
    apiName: 'OpenAI',
    endpoint: '/v1/chat/completions',
    method: 'POST',
    error,
    userId: currentUser?.id,
  });
}
```

### Usar el Panel de Administrador

```tsx
import NotificationCenter from './admin-system/components/NotificationCenter';

function AdminPanel() {
  return (
    <NotificationCenter
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
    />
  );
}
```

## 📁 Estructura del Proyecto

```
admin-system/
├── database/
│   └── schema.sql              # Esquema de base de datos
├── hooks/
│   └── useEventReporter.ts     # Hook React para reportar eventos
├── components/
│   └── NotificationCenter.tsx  # Componente del panel admin
├── utils/
│   └── eventTranslator.ts      # Conversor JSON → lenguaje natural
├── edge-functions/
│   └── process-events/
│       └── index.ts            # Edge Function para procesar eventos
├── styles/
│   └── notification-center.css # Estilos del panel
├── eventReporter.ts            # Módulo principal de reportes
└── README.md                    # Esta documentación
```

## 🔌 API Reference

### `useEventReporter()`

Hook principal para reportar eventos.

**Retorna:**
- `reportBug(data)` - Reportar un bug
- `reportActivity(event, metadata?, userId?)` - Reportar actividad
- `reportApiUsage(data)` - Reportar uso de API
- `reportAnomaly(event, description, metadata?, userId?)` - Reportar anomalía

### `getEventReporter()`

Obtener instancia del EventReporter (para uso fuera de React).

### `translateEventToHuman(event)`

Convertir evento JSON a mensaje en lenguaje natural.

### `generateAnalysisSummary(analysis)`

Generar resumen de análisis en lenguaje natural.

## 💡 Ejemplos

### Ejemplo 1: Capturar Error en Voice-to-Transaction

```tsx
import { useEventReporter } from './admin-system/hooks/useEventReporter';

function VoiceTransactionComponent() {
  const { reportBug, reportActivity } = useEventReporter();

  const handleVoiceError = async (error: Error) => {
    // Reportar bug
    reportBug({
      severity: 'critical',
      origin: 'frontend',
      event: 'voice_to_transaction_failed',
      message: 'Error al procesar audio a transacción',
      rawError: error,
      userId: currentUser?.id,
      metadata: {
        audioDuration: audioDuration,
        language: detectedLanguage,
      },
    });

    // Reportar actividad fallida
    reportActivity('voice_transaction_failed', {
      error: error.message,
      audioDuration,
    }, currentUser?.id);
  };

  // ...
}
```

### Ejemplo 2: Trackear Uso de Características

```tsx
const { reportActivity } = useEventReporter();

// Cuando el usuario abre el dashboard
useEffect(() => {
  reportActivity('dashboard_viewed', {
    section: 'overview',
  }, userId);
}, []);

// Cuando el usuario crea una transacción
const handleCreateTransaction = () => {
  reportActivity('transaction_created', {
    method: 'manual', // o 'voice', 'ai', etc.
    amount: transaction.amount,
    category: transaction.category,
  }, userId);
};
```

### Ejemplo 3: Monitorear Llamadas a Gemini

```tsx
const { reportApiUsage } = useEventReporter();

async function callGeminiAPI(prompt: string) {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_KEY,
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const duration = Date.now() - startTime;
    const data = await response.json();

    // Calcular costo estimado (ejemplo)
    const estimatedCost = (prompt.length / 1000) * 0.0005;

    reportApiUsage({
      apiName: 'Google Gemini',
      endpoint: '/v1beta/models/gemini-pro:generateContent',
      method: 'POST',
      statusCode: response.status,
      duration,
      cost: estimatedCost,
      userId: currentUser?.id,
    });

    return data;
  } catch (error) {
    reportApiUsage({
      apiName: 'Google Gemini',
      endpoint: '/v1beta/models/gemini-pro:generateContent',
      method: 'POST',
      error,
      userId: currentUser?.id,
    });
    throw error;
  }
}
```

## 🔒 Seguridad

- ✅ Solo administradores pueden ver eventos (RLS)
- ✅ Datos sensibles se sanitizan automáticamente
- ✅ No se almacenan tokens ni claves
- ✅ Validación de tipos en base de datos

## 📊 Métricas Disponibles

El sistema genera automáticamente:

- Errores por severidad (crítico, alto, medio, bajo)
- Endpoints con más errores
- Funcionalidades más usadas
- Fallos de micrófono
- Uso de IA
- Conversiones de voz (tasa de éxito)
- Errores de API
- Usuarios activos
- Retención (con análisis adicional)

## 🎨 Personalización

### Modificar Estilos

Edita `admin-system/styles/notification-center.css` para personalizar el diseño.

### Agregar Nuevos Tipos de Eventos

1. Agrega el tipo en `eventReporter.ts`:
```typescript
export type EventType = 'bug' | 'activity' | 'api_usage' | 'anomaly' | 'tu_nuevo_tipo';
```

2. Actualiza el schema SQL para incluir el nuevo tipo
3. Agrega traducción en `eventTranslator.ts`

## 🚀 Desplegar Edge Function

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link proyecto
supabase link --project-ref tu-project-ref

# Desplegar función
supabase functions deploy process-events
```

## 📝 Notas

- Los eventos se envían en lotes para optimizar rendimiento
- Si falla la conexión, los eventos se guardan en localStorage
- El sistema reintenta automáticamente eventos fallidos
- Los eventos antiguos se limpian automáticamente (configurable)

## 🤝 Soporte

Para preguntas o problemas, revisa:
- La documentación de Supabase
- Los logs en la consola del navegador
- Los logs de Edge Functions en Supabase Dashboard

---

**Desarrollado para Finantel** 🚀

