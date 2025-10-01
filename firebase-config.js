// === INICIO DE SECCIÓN: CONFIGURACIÓN DE FIREBASE ===
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';

import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
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

// IMPORTANTE: Reemplaza estos valores con tus claves reales de Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyCNGTwiuxWNgBL_og_iCvus24pBO7tVmRk',
  authDomain: 'control-gastos-44975.firebaseapp.com',
  projectId: 'control-gastos-44975',
  storageBucket: 'control-gastos-44975.firebasestorage.app',
  messagingSenderId: '1021023056126',
  appId: '1:1021023056126:web:0e6460f495c156b079f5af',
  measurementId: 'G-8YL7L3D5TC',
};
// API Keys - PROTEGIDAS (no incluir keys reales aquí)
// Para desarrollo local: usa backend/.env
// Para producción: configura variables de entorno en tu hosting (Vercel/Netlify)
const geminiApiKey = '';
const perplexityApiKey = '';
const unsplashApiKey = '';

// Exponer API keys globalmente
window.geminiApiKey = geminiApiKey;
window.perplexityApiKey = perplexityApiKey;
window.unsplashApiKey = unsplashApiKey;

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
  // API Keys
  geminiApiKey: geminiApiKey,
  perplexityApiKey: perplexityApiKey,
};

// === FIN DE SECCIÓN: CONFIGURACIÓN DE FIREBASE ===
