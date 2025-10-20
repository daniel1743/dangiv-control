// === INICIO DE SECCIÓN: CONFIGURACIÓN DE FIREBASE ===
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';

import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

import {
  initializeFirestore,
  doc,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  onSnapshot, // <-- CAMBIO 1
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  memoryLruGarbageCollector,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js';

// Importar configuración
import { firebaseConfig, apiKeys, config } from './config.js';

// ========================================
// INICIALIZAR FIREBASE
// ========================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Detectar si estamos en modo incógnito y usar caché apropiado
let db;
try {
  // Intentar usar caché persistente (normal)
  db = initializeFirestore(app, {
    experimentalForceLongPolling: false,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: 40000000,
    }),
  });
  console.log('✅ Firestore inicializado con caché persistente multi-pestaña');
} catch (error) {
  console.warn('⚠️ Caché persistente no disponible (modo incógnito?), usando caché en memoria', error);

  // Fallback: usar caché en memoria (funciona en incógnito)
  db = initializeFirestore(app, {
    experimentalForceLongPolling: false,
    localCache: memoryLocalCache({
      garbageCollector: memoryLruGarbageCollector({
        cacheSizeBytes: 40000000,
      }),
    }),
  });
  console.log('✅ Firestore inicializado con caché en memoria (modo incógnito)');
}

const storage = getStorage(app);

// ========================================
// EXPONER GLOBALMENTE
// ========================================
window.FB = {
  app,
  auth,
  db,
  storage,
  // Auth methods
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
  // Social Auth Providers
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  // Firestore methods
  doc,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  onSnapshot, // <-- CAMBIO 2
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  // Storage methods
  ref,
  uploadString,
  getDownloadURL,

  // ⚠️ API Keys (TEMPORAL - Migrar a backend)
  geminiApiKey: apiKeys.gemini,
  unsplashApiKey: apiKeys.unsplash,
  perplexityApiKey: apiKeys.perplexity,
};

// Exponer config globalmente
window.APP_CONFIG = config;

console.log('🔥 Firebase inicializado correctamente');
console.log('🌍 Modo:', config.isDevelopment ? 'Desarrollo' : 'Producción');

if (config.isDevelopment && (!apiKeys.gemini || !apiKeys.unsplash)) {
  console.warn('⚠️ API Keys de Gemini/Unsplash no configuradas');
  console.warn('📝 Para usarlas, configura las keys en config.js');
}
// === FIN DE SECCIÓN: CONFIGURACIÓN DE FIREBASE ===
