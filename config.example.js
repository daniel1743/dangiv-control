// ========================================
// CONFIGURACIÓN - Dan&Giv Control
// ========================================
// INSTRUCCIONES:
// 1. Copia este archivo y renómbralo a config.js
// 2. Reemplaza los valores de ejemplo con tus credenciales reales
// 3. NUNCA subas config.js a Git

// ========================================
// FIREBASE CONFIGURATION
// ========================================
export const firebaseConfig = {
  apiKey: "tu_firebase_api_key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-ABCDEFGH",
};

// ========================================
// API KEYS EXTERNAS
// ========================================
// ⚠️ IMPORTANTE: En producción, estas keys deben estar en el backend
export const apiKeys = {
  gemini: "", // Tu Gemini API key
  unsplash: "", // Tu Unsplash Access Key
  perplexity: "", // Tu Perplexity API key (opcional)
};

// ========================================
// CONFIGURACIÓN DE ENTORNO
// ========================================
export const config = {
  appUrl: window.location.origin,
  apiUrl: 'http://localhost:3000',

  isDevelopment: window.location.hostname === 'localhost',
  isProduction: window.location.hostname !== 'localhost',

  useBackendProxy: false, // Cambiar a true en producción
};
