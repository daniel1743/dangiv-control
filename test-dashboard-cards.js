/**
 * ============================================
 * DIAGNÓSTICO: TARJETAS DEL DASHBOARD
 * ============================================
 * Verifica funcionalidad de todas las tarjetas clickeables
 */

console.clear();
console.log('🎯 DIAGNÓSTICO DE TARJETAS DEL DASHBOARD\n');

// Lista de tarjetas clickeables del dashboard
const cards = [
  {
    id: 'totalExpensesCard',
    name: 'Gastos Totales',
    method: 'showExpensesDetailModal',
    hasClickClass: true
  },
  {
    id: 'savingsCard',
    name: 'Ahorros',
    method: 'showSavingsDetailModal',
    hasClickClass: false
  },
  {
    id: 'transactionsCard',
    name: 'Transacciones',
    method: 'showTransactionsModal',
    hasClickClass: true
  },
  {
    id: 'budgetCard',
    name: 'Presupuesto Extras',
    method: 'showBudgetModal',
    hasClickClass: true
  }
];

console.log('📋 VERIFICANDO TARJETAS:\n');

cards.forEach((card, index) => {
  console.log(`${index + 1}. ${card.name} (${card.id})`);
  console.log('   ' + '─'.repeat(50));

  // Verificar elemento DOM
  const element = document.getElementById(card.id);
  const exists = !!element;
  console.log(`   DOM Element: ${exists ? '✅ Existe' : '❌ No existe'}`);

  if (!exists) {
    console.log(`   ${' '.repeat(3)}⚠️ PROBLEMA: El elemento no existe en el HTML\n`);
    return;
  }

  // Verificar clase clickeable
  const hasClickClass = element.classList.contains('stat-card--clickable');
  console.log(`   Clase clickeable: ${hasClickClass ? '✅ Sí' : (card.hasClickClass ? '❌ Falta' : '⚪ No aplica')}`);

  // Verificar cursor pointer
  const cursorStyle = window.getComputedStyle(element).cursor;
  console.log(`   Cursor style: ${cursorStyle === 'pointer' ? '✅ pointer' : '⚠️ ' + cursorStyle}`);

  // Verificar que existe el método en la app
  const methodExists = window.app && typeof window.app[card.method] === 'function';
  console.log(`   Método ${card.method}: ${methodExists ? '✅ Existe' : '❌ No existe'}`);

  // Verificar event listeners
  const listeners = getEventListeners ? getEventListeners(element) : null;
  if (listeners && listeners.click) {
    console.log(`   Event Listeners: ✅ ${listeners.click.length} listener(s)`);
  } else {
    console.log(`   Event Listeners: ❌ Sin listeners (o no disponible en esta consola)`);
  }

  // Verificar si es visible
  const isVisible = element.offsetParent !== null;
  console.log(`   Visible: ${isVisible ? '✅ Sí' : '❌ No (oculto)'}`);

  console.log('');
});

console.log('\n🧪 PRUEBA AUTOMÁTICA:\n');
console.log('Haciendo click en cada tarjeta en 2 segundos...\n');

setTimeout(() => {
  cards.forEach((card, index) => {
    setTimeout(() => {
      const element = document.getElementById(card.id);
      if (element) {
        console.log(`${index + 1}. Haciendo click en: ${card.name}`);
        element.click();

        // Verificar si se abrió algún modal
        setTimeout(() => {
          const modals = document.querySelectorAll('.modal.show, .modal-overlay.show');
          if (modals.length > 0) {
            console.log(`   ✅ Modal abierto correctamente`);
            // Cerrar el modal
            modals.forEach(m => m.classList.remove('show'));
          } else {
            console.log(`   ❌ No se detectó modal abierto`);
          }
        }, 500);
      } else {
        console.log(`${index + 1}. ❌ No se pudo hacer click en ${card.name}`);
      }
    }, index * 2000);
  });
}, 2000);

console.log('\n💡 COMANDOS MANUALES:\n');
console.log('// Probar tarjeta de Gastos Totales:');
console.log('document.getElementById("totalExpensesCard").click();\n');
console.log('// Probar tarjeta de Ahorros:');
console.log('document.getElementById("savingsCard").click();\n');
console.log('// Probar tarjeta de Transacciones:');
console.log('document.getElementById("transactionsCard").click();\n');
console.log('// Probar tarjeta de Presupuesto:');
console.log('document.getElementById("budgetCard").click();\n');

console.log('⏳ Iniciando pruebas automáticas en 2 segundos...');
