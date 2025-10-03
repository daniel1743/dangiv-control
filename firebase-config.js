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
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js';

// ========================================
// CONFIGURACIÓN SEGURA CON VARIABLES DE ENTORNO
// ========================================
// IMPORTANTE: Las API keys ahora vienen de variables de entorno (.env)
// NO hardcodear credenciales aquí

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validar que las variables de entorno estén configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ ERROR: Variables de entorno de Firebase no configuradas');
  console.error('Por favor, crea un archivo .env.local con tus credenciales');
  console.error('Usa .env.example como plantilla');
}

// ========================================
// NOTA IMPORTANTE SOBRE API KEYS SENSIBLES
// ========================================
// ❌ NO incluir aquí:
//    - Gemini API Key
//    - Unsplash Access Key
//    - Perplexity API Key
//
// ✅ Estas keys deben estar SOLO en el backend
//    Ver: backend/api-proxy.js

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
const storage = getStorage(app);

// Se crea un objeto global 'FB' para que app.js pueda usar estas funciones
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

  // ❌ YA NO EXPONEMOS API KEYS AQUÍ
  // Las llamadas a APIs externas deben ir por el backend
};

// === FIN DE SECCIÓN: CONFIGURACIÓN DE FIREBASE ===
