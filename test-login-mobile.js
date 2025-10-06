/**
 * ============================================
 * TEST DE LOGIN PARA MÓVILES
 * ============================================
 * Copia este código en la consola del navegador móvil (Chrome/Safari)
 * Para abrir consola en móvil:
 * - Android Chrome: chrome://inspect o usar Chrome DevTools remoto
 * - iOS Safari: Conectar a Mac y usar Safari Developer Tools
 */

console.clear();
console.log('📱 TEST DE LOGIN PARA MÓVILES\n');
console.log('='.repeat(50));

// 1. Verificar Firebase
console.log('\n1. Verificando Firebase...');
const FB = window.FB;
console.log('   Firebase:', FB ? '✅' : '❌');
console.log('   Auth:', FB?.auth ? '✅' : '❌');

// 2. Verificar conectividad
console.log('\n2. Verificando conectividad...');
console.log('   Online:', navigator.onLine ? '✅' : '❌');

// 3. Test de login programático
console.log('\n3. Preparando test de login...');
console.log('   IMPORTANTE: Cambia el email y password por tus credenciales reales\n');

// FUNCIÓN DE TEST
async function testLogin(email, password) {
  console.log('🔑 Intentando login...');
  console.log('   Email:', email);
  console.log('   Password length:', password.length);
  console.log('   Password visible:', password.substring(0, 3) + '***');

  // Limpiar
  const cleanEmail = email.toLowerCase().trim();
  const cleanPassword = password.trim();

  console.log('\n   Email limpio:', cleanEmail);
  console.log('   Password limpio length:', cleanPassword.length);

  // Verificar caracteres raros
  const emailBytes = new TextEncoder().encode(cleanEmail);
  const passwordBytes = new TextEncoder().encode(cleanPassword);

  console.log('   Email bytes:', emailBytes.length);
  console.log('   Password bytes:', passwordBytes.length);

  if (emailBytes.length !== cleanEmail.length) {
    console.warn('   ⚠️ Email contiene caracteres especiales/invisibles!');
  }

  if (passwordBytes.length !== cleanPassword.length) {
    console.warn('   ⚠️ Password contiene caracteres especiales/invisibles!');
  }

  try {
    console.log('\n   Llamando a Firebase Auth...');
    const userCredential = await FB.signInWithEmailAndPassword(
      FB.auth,
      cleanEmail,
      cleanPassword
    );

    console.log('\n   ✅ LOGIN EXITOSO!');
    console.log('   UID:', userCredential.user.uid);
    console.log('   Email:', userCredential.user.email);

    return true;
  } catch (error) {
    console.error('\n   ❌ LOGIN FALLÓ');
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);

    // Diagnóstico específico
    if (error.code === 'auth/wrong-password') {
      console.log('\n   💡 DIAGNÓSTICO: Contraseña incorrecta');
      console.log('   - Verifica que no haya espacios extras');
      console.log('   - Verifica mayúsculas/minúsculas');
      console.log('   - Intenta copiar y pegar desde un gestor de contraseñas');
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n   💡 DIAGNÓSTICO: Usuario no encontrado');
      console.log('   - Verifica el email:', cleanEmail);
      console.log('   - ¿Estás usando el email correcto?');
    } else if (error.code === 'auth/invalid-credential') {
      console.log('\n   💡 DIAGNÓSTICO: Credenciales inválidas');
      console.log('   - Email o contraseña incorrectos');
      console.log('   - Intenta restablecer la contraseña');
    } else if (error.code === 'auth/network-request-failed') {
      console.log('\n   💡 DIAGNÓSTICO: Error de red');
      console.log('   - Verifica tu conexión a internet');
      console.log('   - Intenta cambiar de WiFi a datos móviles o viceversa');
    } else if (error.code === 'auth/too-many-requests') {
      console.log('\n   💡 DIAGNÓSTICO: Demasiados intentos');
      console.log('   - Firebase bloqueó temporalmente esta cuenta');
      console.log('   - Espera 15-30 minutos e intenta de nuevo');
      console.log('   - O restablece tu contraseña');
    }

    return false;
  }
}

// Exponer función globalmente
window.testLogin = testLogin;

console.log('\n' + '='.repeat(50));
console.log('📝 INSTRUCCIONES:\n');
console.log('1. Ejecuta este comando (reemplaza con tus datos):');
console.log('   await testLogin("falcondaniel37@gmail.com", "tupassword");\n');
console.log('2. Lee los mensajes de error detallados');
console.log('3. Si el login es exitoso, prueba en la app normal\n');
console.log('='.repeat(50));
