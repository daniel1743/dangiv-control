/**
 * ============================================
 * TEST DE VELOCIDAD DE FIRESTORE
 * ============================================
 * Ejecutar en consola F12 para diagnosticar lentitud
 */

console.clear();
console.log('⚡ TEST DE VELOCIDAD DE FIRESTORE\n');

async function testFirestoreSpeed() {
  const FB = window.FB;

  if (!FB || !FB.auth || !FB.db) {
    console.error('❌ Firebase no está inicializado');
    return;
  }

  const user = FB.auth.currentUser;
  if (!user) {
    console.error('❌ No hay usuario autenticado');
    return;
  }

  console.log('👤 Usuario:', user.email);
  console.log('🆔 UID:', user.uid);

  const docRef = FB.doc(FB.db, 'userData', user.uid);

  console.log('\n📊 Iniciando medición de velocidad...\n');

  try {
    // Primera lectura (puede usar red)
    console.log('1️⃣ Primera lectura (red):');
    const start1 = performance.now();
    const doc1 = await FB.getDoc(docRef);
    const end1 = performance.now();
    const time1 = (end1 - start1).toFixed(0);

    if (doc1.exists()) {
      const data = doc1.data();
      const dataSize = JSON.stringify(data).length;
      const dataSizeKB = (dataSize / 1024).toFixed(2);

      console.log(`   ⏱️ Tiempo: ${time1}ms`);
      console.log(`   📦 Tamaño: ${dataSizeKB} KB`);
      console.log(`   📝 Expenses: ${data.expenses?.length || 0}`);
      console.log(`   🎯 Goals: ${data.goals?.length || 0}`);
      console.log(`   🛒 Shopping: ${data.shoppingItems?.length || 0}`);

      // Análisis de velocidad
      console.log('\n📈 ANÁLISIS DE VELOCIDAD:');
      if (time1 < 500) {
        console.log('   ✅ EXCELENTE - Muy rápido');
      } else if (time1 < 1000) {
        console.log('   ✅ BUENO - Velocidad aceptable');
      } else if (time1 < 2000) {
        console.log('   ⚠️ MODERADO - Un poco lento');
      } else {
        console.log('   ❌ LENTO - Hay un problema');
      }

      // Diagnóstico
      if (time1 > 2000) {
        console.log('\n🔍 DIAGNÓSTICO DEL PROBLEMA:');

        if (dataSizeKB > 500) {
          console.log('   ⚠️ Documento muy grande (>500KB)');
          console.log('   💡 Solución: Limpia imágenes base64 del perfil');
        }

        if (data.expenses?.length > 1000) {
          console.log('   ⚠️ Muchos gastos guardados (>' + data.expenses.length + ')');
          console.log('   💡 Solución: Archiva gastos antiguos');
        }

        console.log('\n   Otros factores:');
        console.log('   - Conexión a internet lenta');
        console.log('   - Servidor de Firestore sobrecargado');
        console.log('   - Firewall o VPN interfiriendo');
      }

      // Segunda lectura (debe usar caché)
      console.log('\n2️⃣ Segunda lectura (caché):');
      const start2 = performance.now();
      const doc2 = await FB.getDoc(docRef);
      const end2 = performance.now();
      const time2 = (end2 - start2).toFixed(0);

      console.log(`   ⏱️ Tiempo: ${time2}ms`);
      console.log(`   📦 Fuente: ${doc2.metadata.fromCache ? 'CACHÉ ✅' : 'RED ⚠️'}`);

      if (doc2.metadata.fromCache) {
        console.log('   ✅ Caché funcionando correctamente');
      } else {
        console.log('   ⚠️ No está usando caché');
      }

      // Comparación
      const speedup = ((time1 / time2) * 100).toFixed(0);
      console.log(`\n📊 Mejora con caché: ${speedup}%`);

    } else {
      console.error('   ❌ No existe documento para este usuario');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.code || error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test completado');
}

// Ejecutar test
testFirestoreSpeed();
