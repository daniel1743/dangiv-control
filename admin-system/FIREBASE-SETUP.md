# 🔥 Configuración para Firebase

## Paso 1: Instalar Firebase SDK

```bash
npm install firebase
# o
yarn add firebase
```

## Paso 2: Configurar Firestore

### 2.1 Crear Colecciones en Firestore

Ve a Firebase Console → Firestore Database y crea estas colecciones:

1. **`system_events`** - Eventos del sistema
2. **`system_analytics`** - Análisis automáticos (opcional)
3. **`notification_settings`** - Configuración (opcional)
4. **`user_profiles`** - Perfiles de usuario (si no existe)

### 2.2 Configurar Reglas de Seguridad

Ve a Firestore Database → Rules y pega las reglas de `firestore-rules.txt`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/user_profiles/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/user_profiles/$(request.auth.uid)).data.role == 'admin';
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    match /system_events/{eventId} {
      allow create: if isAuthenticated();
      allow read, update, delete: if isAdmin();
    }

    match /system_analytics/{analyticsId} {
      allow read, write: if isAdmin();
    }

    match /notification_settings/{settingId} {
      allow read, write: if isAdmin();
    }
  }
}
```

### 2.3 Crear Índices

Firestore creará índices automáticamente cuando los necesites, pero puedes crearlos manualmente:

1. Ve a Firestore Database → Indexes
2. Crea estos índices compuestos:

**Para `system_events`:**
- Collection: `system_events`
- Fields: `type` (Ascending), `createdAt` (Descending)
- Query scope: Collection

- Collection: `system_events`
- Fields: `type` (Ascending), `status` (Ascending), `createdAt` (Descending)
- Query scope: Collection

- Collection: `system_events`
- Fields: `severity` (Ascending), `createdAt` (Descending)
- Query scope: Collection

## Paso 3: Configurar Variables de Entorno

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

O si usas React:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Paso 4: Inicializar Firebase en tu App

Si ya tienes Firebase inicializado, el `eventReporter-firebase.ts` lo detectará automáticamente.

Si no, inicialízalo así:

```tsx
// firebase.ts o firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
```

## Paso 5: Usar EventReporter

```tsx
// Usa eventReporter-firebase.ts en lugar de eventReporter.ts
import { useEventReporter } from './admin-system/hooks/useEventReporter-firebase';

function MyComponent() {
  const { reportBug } = useEventReporter();
  // ...
}
```

## Paso 6: Usar NotificationCenter

```tsx
import NotificationCenter from './admin-system/components/NotificationCenter-firebase';
import { getFirestore } from 'firebase/firestore';

function AdminPage() {
  const firestore = getFirestore();
  
  return (
    <NotificationCenter firestore={firestore} />
  );
}
```

## Paso 7: Crear Tabla user_profiles (si no existe)

Crea una colección `user_profiles` en Firestore con esta estructura:

```typescript
interface UserProfile {
  userId: string; // ID del usuario (document ID)
  role: 'admin' | 'user';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Para hacer un usuario admin:

```tsx
import { doc, setDoc } from 'firebase/firestore';

// Hacer un usuario admin
await setDoc(doc(firestore, 'user_profiles', userId), {
  role: 'admin',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});
```

## ✅ Verificación

1. Abre la consola del navegador
2. Deberías ver: `[EventReporter] ✅ Enviados X eventos a Firestore`
3. Ve a Firebase Console → Firestore Database
4. Deberías ver documentos en la colección `system_events`

## 🔍 Estructura de Documentos

### system_events
```typescript
{
  type: 'bug' | 'activity' | 'api_usage' | 'anomaly',
  severity?: 'low' | 'medium' | 'high' | 'critical',
  origin: 'frontend' | 'backend' | 'firebase' | 'api' | 'auth' | 'database' | 'user',
  event: string,
  userId?: string,
  message: {
    text: string,
    error?: any
  },
  metadata: {},
  deviceInfo: {},
  url?: string,
  status: 'new' | 'reviewed' | 'resolved' | 'ignored',
  adminNotes?: string,
  createdAt: Timestamp,
  resolvedAt?: Timestamp
}
```

## 📝 Notas

- Firestore crea índices automáticamente cuando los necesitas
- Las reglas de seguridad son importantes para proteger los datos
- El sistema funciona igual que la versión Supabase, solo cambia el backend
- Los eventos se almacenan como documentos en Firestore

## 🚀 Cloud Functions (Opcional)

Si quieres procesar eventos automáticamente, puedes crear una Cloud Function:

```typescript
// functions/src/processEvents.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const processEvents = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    
    // Obtener eventos del último día
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const snapshot = await db.collection('system_events')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(oneDayAgo))
      .get();
    
    // Procesar eventos...
    
    return null;
  });
```

