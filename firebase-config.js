// === INICIO DE SECCIÓN: CONFIGURACIÓN DE FIREBASE ===
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';

import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

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
const geminiApiKey = 'TU_API_KEY_DE_GEMINI';
const perplexityApiKey =
  'Tpplx-oKfcPhGOZhJr8QYclMVcQTVNEoRo4vsKcrOaaXNpqUDLgHeJ';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Se crea un objeto global 'FB' para que app.js pueda usar estas funciones
window.FB = {
  app,
  auth,
  db,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  doc,
  getDoc,
  setDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,

  geminiApiKey: geminiApiKey,
  perplexityApiKey: perplexityApiKey,
};

// === FIN DE SECCIÓN: CONFIGURACIÓN DE FIREBASE ===
