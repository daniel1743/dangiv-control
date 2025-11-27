# 🔥 Sistema de Reportes - Versión Firebase

## ✅ Archivos Adaptados para Firebase

He adaptado todo el sistema para trabajar con **Firebase/Firestore** en lugar de Supabase:

### Archivos Firebase:
- ✅ `eventReporter-firebase.ts` - Módulo principal (usa Firestore)
- ✅ `hooks/useEventReporter-firebase.ts` - Hook React
- ✅ `components/NotificationCenter-firebase.tsx` - Panel de admin
- ✅ `firestore-rules.txt` - Reglas de seguridad
- ✅ `FIREBASE-SETUP.md` - Guía de configuración

### Archivos Originales (Supabase):
- `eventReporter.ts` - Versión Supabase
- `hooks/useEventReporter.ts` - Versión Supabase
- `components/NotificationCenter.tsx` - Versión Supabase

## 🚀 Instalación Rápida

### 1. Instalar Firebase

```bash
npm install firebase
```

### 2. Configurar Firestore

1. Ve a Firebase Console → Firestore Database
2. Crea la colección `system_events`
3. Configura las reglas de seguridad (ver `firestore-rules.txt`)

### 3. Usar en tu App

```tsx
// Usa los archivos con sufijo -firebase
import { useEventReporter } from './admin-system/hooks/useEventReporter-firebase';
import NotificationCenter from './admin-system/components/NotificationCenter-firebase';
```

## 📖 Ver Guía Completa

Lee `FIREBASE-SETUP.md` para instrucciones detalladas.

## 🔄 Diferencias con Supabase

| Característica | Supabase | Firebase |
|---------------|----------|----------|
| Base de datos | PostgreSQL | Firestore |
| Tiempo real | Supabase Realtime | Firestore onSnapshot |
| Edge Functions | Supabase Functions | Cloud Functions |
| Autenticación | Supabase Auth | Firebase Auth |
| Reglas | RLS (SQL) | Security Rules (JSON) |

## ✅ Todo lo demás es igual

- Misma estructura de eventos
- Mismo formato JSON
- Mismo conversor a lenguaje natural
- Mismos estilos CSS
- Misma funcionalidad

Solo cambia el backend de almacenamiento.

