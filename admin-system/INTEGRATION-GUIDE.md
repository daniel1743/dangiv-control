# 🚀 Guía de Integración Rápida

## Paso 1: Configurar Base de Datos

1. Abre Supabase Dashboard → SQL Editor
2. Copia y pega el contenido de `database/schema.sql`
3. Ejecuta el script

## Paso 2: Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

## Paso 3: Configurar Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Paso 4: Integrar en tu App

### En tu archivo principal (App.tsx, _app.tsx, etc.):

```tsx
import { useErrorBoundaryReporter, useActivityTracker } from './admin-system/hooks/useEventReporter';

function App() {
  useErrorBoundaryReporter(); // Captura errores globales
  useActivityTracker(); // Trackea actividad automáticamente
  
  return (
    // Tu app
  );
}
```

## Paso 5: Usar en Componentes

```tsx
import { useEventReporter } from './admin-system/hooks/useEventReporter';

function MyComponent() {
  const { reportBug, reportActivity } = useEventReporter();

  const handleError = (error: Error) => {
    reportBug({
      severity: 'high',
      origin: 'frontend',
      event: 'my_error',
      message: error.message,
      rawError: error,
    });
  };

  // ...
}
```

## Paso 6: Agregar Panel de Admin

```tsx
import NotificationCenter from './admin-system/components/NotificationCenter';

function AdminPage() {
  return (
    <NotificationCenter
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
      supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
    />
  );
}
```

## Paso 7: Importar Estilos

```tsx
import './admin-system/styles/notification-center.css';
```

## ✅ Listo!

El sistema está funcionando. Los eventos se capturan automáticamente y puedes verlos en el panel de administrador.

## 🔍 Verificar que Funciona

1. Abre la consola del navegador
2. Deberías ver logs como: `[EventReporter] ✅ Enviados X eventos`
3. Abre el panel de admin y verifica que aparezcan eventos

## 📝 Próximos Pasos

- Personaliza los estilos en `styles/notification-center.css`
- Agrega más tracking según tus necesidades
- Configura la Edge Function para análisis automáticos (opcional)

