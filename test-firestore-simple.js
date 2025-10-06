/**
 * TEST SIMPLE DE FIRESTORE
 */

(async function() {
  console.clear();
  console.log('🔥 TEST SIMPLE DE FIRESTORE\n');

  // 1. Verificar Firebase
  console.log('1. Verificando Firebase...');
  if (!window.FB) {
    console.error('❌ window.FB no existe');
    return;
  }
  console.log('✅ window.FB existe');

  if (!window.FB.auth) {
    console.error('❌ window.FB.auth no existe');
    return;
  }
  console.log('✅ window.FB.auth existe');

  if (!window.FB.db) {
    console.error('❌ window.FB.db no existe');
    return;
  }
  console.log('✅ window.FB.db existe');

  // 2. Verificar usuario
  console.log('\n2. Verificando usuario...');
  const user = window.FB.auth.currentUser;
  if (!user) {
    console.error('❌ No hay usuario autenticado');
    console.log('💡 Por favor inicia sesión primero');
    return;
  }
  console.log('✅ Usuario autenticado:', user.email);
  console.log('   UID:', user.uid);

  // 3. Test de velocidad
  console.log('\n3. Testeando velocidad de Firestore...\n');

  try {
    const docRef = window.FB.doc(window.FB.db, 'userData', user.uid);

    console.log('📊 Primera lectura (red)...');
    const start1 = performance.now();
    const doc1 = await window.FB.getDoc(docRef);
    const end1 = performance.now();
    const time1 = Math.round(end1 - start1);

    if (!doc1.exists()) {
      console.error('❌ El documento no existe');
      return;
    }

    const data = doc1.data();
    const dataSize = JSON.stringify(data).length;
    const dataSizeKB = (dataSize / 1024).toFixed(2);

    console.log(`⏱️  Tiempo: ${time1}ms`);
    console.log(`📦 Tamaño: ${dataSizeKB} KB`);
    console.log(`📝 Expenses: ${data.expenses?.length || 0}`);
    console.log(`🎯 Goals: ${data.goals?.length || 0}`);
    console.log(`🛒 Shopping: ${data.shoppingItems?.length || 0}`);

    // Análisis
    console.log('\n📈 ANÁLISIS:');
    if (time1 < 500) {
      console.log('✅ EXCELENTE - Muy rápido');
    } else if (time1 < 1000) {
      console.log('✅ BUENO - Velocidad aceptable');
    } else if (time1 < 2000) {
      console.log('⚠️  MODERADO - Un poco lento');
    } else {
      console.log('❌ LENTO - Hay un problema');

      // Diagnóstico
      if (dataSizeKB > 500) {
        console.log('\n⚠️  El documento es muy grande (>500KB)');
        console.log('💡 Considera eliminar imágenes base64 del perfil');
      }

      if (data.expenses?.length > 1000) {
        console.log('\n⚠️  Muchos gastos guardados (>1000)');
        console.log('💡 Considera archivar gastos antiguos');
      }
    }

    // Segunda lectura
    console.log('\n📊 Segunda lectura (caché)...');
    const start2 = performance.now();
    const doc2 = await window.FB.getDoc(docRef);
    const end2 = performance.now();
    const time2 = Math.round(end2 - start2);

    console.log(`⏱️  Tiempo: ${time2}ms`);
    console.log(`📦 Fuente: ${doc2.metadata.fromCache ? 'CACHÉ ✅' : 'RED ⚠️'}`);

    if (time1 > 0 && time2 > 0) {
      const improvement = Math.round((time1 / time2) * 100);
      console.log(`\n📊 Mejora con caché: ${improvement}%`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Test completado');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
  }
})();
