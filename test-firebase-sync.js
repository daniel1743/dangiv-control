/**
 * ============================================
 * DIAGNÓSTICO COMPLETO: FIREBASE AUTH & SYNC
 * ============================================
 * Ejecutar en consola F12
 */

console.clear();
console.log('🔥 DIAGNÓSTICO DE FIREBASE - AUTH & SINCRONIZACIÓN\n');
console.log('='.repeat(60));

// 1. Verificar configuración de Firebase
console.log('\n📋 1. CONFIGURACIÓN DE FIREBASE:');
console.log('-'.repeat(60));

const FB = window.FB;
if (!FB) {
  console.error('❌ window.FB no está definido');
  console.error('   Firebase no se ha inicializado correctamente');
} else {
  console.log('✅ window.FB existe');
  console.log('   Componentes disponibles:');
  console.log(`   - app: ${FB.app ? '✅' : '❌'}`);
  console.log(`   - auth: ${FB.auth ? '✅' : '❌'}`);
  console.log(`   - db: ${FB.db ? '✅' : '❌'}`);
  console.log(`   - storage: ${FB.storage ? '✅' : '❌'}`);
}

// 2. Verificar estado de autenticación
console.log('\n📋 2. ESTADO DE AUTENTICACIÓN:');
console.log('-'.repeat(60));

if (FB && FB.auth) {
  const currentUser = FB.auth.currentUser;

  if (currentUser) {
    console.log('✅ Usuario autenticado en Firebase:');
    console.log(`   - UID: ${currentUser.uid}`);
    console.log(`   - Email: ${currentUser.email || 'Sin email'}`);
    console.log(`   - Display Name: ${currentUser.displayName || 'Sin nombre'}`);
    console.log(`   - Email Verified: ${currentUser.emailVerified ? 'Sí' : 'No'}`);
    console.log(`   - Created At: ${new Date(parseInt(currentUser.metadata.createdAt)).toLocaleString()}`);
    console.log(`   - Last Sign In: ${new Date(parseInt(currentUser.metadata.lastSignInTime || currentUser.metadata.lastLoginAt)).toLocaleString()}`);
  } else {
    console.warn('⚠️ No hay usuario autenticado en Firebase');
    console.log('   Estado: Anónimo o no autenticado');
  }
} else {
  console.error('❌ Firebase Auth no está disponible');
}

// 3. Verificar estado en la app
console.log('\n📋 3. ESTADO EN LA APLICACIÓN:');
console.log('-'.repeat(60));

if (window.app) {
  console.log('✅ window.app existe');
  console.log(`   - currentUser: ${window.app.currentUser || 'No definido'}`);
  console.log(`   - firebaseUser: ${window.app.firebaseUser ? window.app.firebaseUser.email : 'No definido'}`);
  console.log(`   - userPlan: ${window.app.userPlan || 'No definido'}`);
  console.log(`   - accountType: ${window.app.accountType || 'No definido'}`);
  console.log(`   - sharedAccountId: ${window.app.sharedAccountId || 'No definido'}`);

  console.log('\n   Perfil de usuario:');
  console.log(`   - name: ${window.app.userProfile?.name || 'No definido'}`);
  console.log(`   - email: ${window.app.userProfile?.email || 'No definido'}`);

  console.log('\n   Datos locales:');
  console.log(`   - Expenses: ${window.app.expenses?.length || 0}`);
  console.log(`   - Goals: ${window.app.goals?.length || 0}`);
  console.log(`   - Shopping Items: ${window.app.shoppingItems?.length || 0}`);
  console.log(`   - Savings Accounts: ${window.app.savingsAccounts?.length || 0}`);
} else {
  console.error('❌ window.app no existe');
}

// 4. Verificar localStorage
console.log('\n📋 4. DATOS EN LOCALSTORAGE:');
console.log('-'.repeat(60));

const authStatus = localStorage.getItem('financia_auth_status');
const localData = localStorage.getItem('financiaProData');

console.log(`   Auth Status: ${authStatus || 'No definido'}`);
console.log(`   Datos guardados: ${localData ? 'Sí (' + (localData.length / 1024).toFixed(2) + ' KB)' : 'No'}`);

if (localData) {
  try {
    const parsed = JSON.parse(localData);
    console.log(`   - Expenses: ${parsed.expenses?.length || 0}`);
    console.log(`   - Goals: ${parsed.goals?.length || 0}`);
    console.log(`   - Shopping Items: ${parsed.shoppingItems?.length || 0}`);
  } catch (e) {
    console.error('   ❌ Error al parsear datos locales');
  }
}

// 5. Probar conexión a Firestore
console.log('\n📋 5. PRUEBA DE CONEXIÓN A FIRESTORE:');
console.log('-'.repeat(60));

if (FB && FB.auth && FB.auth.currentUser && window.app) {
  console.log('Intentando leer documento de Firestore...');

  const firestoreDocId = window.app.sharedAccountId || window.app.currentUser;
  const userDocRef = FB.doc(FB.db, 'userData', firestoreDocId);

  console.log(`   Doc ID: ${firestoreDocId}`);

  FB.getDoc(userDocRef)
    .then(docSnap => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('   ✅ Documento encontrado en Firestore');
        console.log(`   - Expenses: ${data.expenses?.length || 0}`);
        console.log(`   - Goals: ${data.goals?.length || 0}`);
        console.log(`   - Shopping Items: ${data.shoppingItems?.length || 0}`);
        console.log(`   - Last Updated: ${data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'No definido'}`);

        // Comparar con datos locales
        console.log('\n   📊 COMPARACIÓN LOCAL vs NUBE:');
        if (window.app.expenses.length !== (data.expenses?.length || 0)) {
          console.warn(`   ⚠️ Expenses diferentes: Local=${window.app.expenses.length}, Nube=${data.expenses?.length || 0}`);
        } else {
          console.log(`   ✅ Expenses sincronizados: ${window.app.expenses.length}`);
        }

        if (window.app.goals.length !== (data.goals?.length || 0)) {
          console.warn(`   ⚠️ Goals diferentes: Local=${window.app.goals.length}, Nube=${data.goals?.length || 0}`);
        } else {
          console.log(`   ✅ Goals sincronizados: ${window.app.goals.length}`);
        }
      } else {
        console.warn('   ⚠️ No existe documento en Firestore para este usuario');
        console.log('   Esto es normal para usuarios nuevos');
      }
    })
    .catch(error => {
      console.error('   ❌ Error al leer Firestore:', error.code, error.message);
    });
} else {
  console.log('   ⏭️ Saltando prueba (usuario no autenticado)');
}

// 6. Verificar método de guardado
console.log('\n📋 6. MÉTODO DE GUARDADO (saveData):');
console.log('-'.repeat(60));

if (window.app && typeof window.app.saveData === 'function') {
  console.log('✅ Método saveData existe');
  console.log('\n   Probando saveData en 2 segundos...');

  setTimeout(() => {
    console.log('\n   Ejecutando window.app.saveData()...');
    try {
      window.app.saveData();
      console.log('   ✅ saveData ejecutado sin errores');
    } catch (error) {
      console.error('   ❌ Error al ejecutar saveData:', error);
    }
  }, 2000);
} else {
  console.error('❌ Método saveData no existe');
}

// 7. Comandos útiles
console.log('\n📋 7. COMANDOS ÚTILES:');
console.log('-'.repeat(60));
console.log('// Forzar sincronización desde Firebase:');
console.log('await window.app.syncFromFirebase();\n');

console.log('// Guardar datos locales a Firebase:');
console.log('window.app.saveData();\n');

console.log('// Ver usuario actual de Firebase:');
console.log('console.log(FB.auth.currentUser);\n');

console.log('// Cerrar sesión:');
console.log('await FB.signOut(FB.auth);\n');

console.log('// Login manual (reemplaza con tus credenciales):');
console.log('await window.app.loginWithEmail("tu@email.com", "tupassword");\n');

console.log('\n' + '='.repeat(60));
console.log('✅ DIAGNÓSTICO COMPLETADO');
console.log('='.repeat(60));
