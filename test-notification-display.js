/**
 * ============================================
 * TEST: DESPLIEGUE DE NOTIFICACIONES
 * ============================================
 * Ejecutar en consola F12
 */

console.clear();
console.log('🔔 PRUEBA DE DESPLIEGUE DE NOTIFICACIONES\n');

// 1. Verificar elementos DOM
const dropdown = document.getElementById('notificationDropdown');
const bannerBell = document.getElementById('bannerNotificationArea');
const navBell = document.getElementById('notificationArea');
const bannerBadge = document.getElementById('bannerNotificationCount');
const navBadge = document.getElementById('notificationCount');
const notificationList = document.getElementById('notificationList');
const notificationEmpty = document.getElementById('notificationEmpty');

console.log('📋 1. Elementos DOM:');
console.log(`   Dropdown: ${dropdown ? '✅' : '❌'}`);
console.log(`   Banner Bell: ${bannerBell ? '✅' : '❌'}`);
console.log(`   Nav Bell: ${navBell ? '✅' : '❌'}`);
console.log(`   Banner Badge: ${bannerBadge ? '✅' : '❌'}`);
console.log(`   Nav Badge: ${navBadge ? '✅' : '❌'}`);
console.log(`   List Container: ${notificationList ? '✅' : '❌'}`);
console.log(`   Empty State: ${notificationEmpty ? '✅' : '❌'}`);

// 2. Verificar estado actual del dropdown
console.log('\n📋 2. Estado del Dropdown:');
console.log(`   Clase 'hidden': ${dropdown?.classList.contains('hidden') ? 'Sí (OCULTO)' : 'No (VISIBLE)'}`);
console.log(`   Display: ${dropdown ? getComputedStyle(dropdown).display : 'N/A'}`);
console.log(`   Opacity: ${dropdown ? getComputedStyle(dropdown).opacity : 'N/A'}`);

// 3. Crear notificaciones de prueba
console.log('\n📋 3. Creando notificaciones de prueba...');

if (window.app) {
  // Crear 3 notificaciones de diferentes tipos
  console.log('   Creando notificación matutina...');
  window.app.createDailyMessageNotification('morning');

  console.log('   Creando notificación nocturna...');
  window.app.createDailyMessageNotification('night');

  // Crear notificación de auditoría simulada
  console.log('   Creando notificación de auditoría...');
  if (!window.app.auditLog) {
    window.app.auditLog = [];
  }
  window.app.auditLog.push({
    id: 'test-audit-' + Date.now(),
    type: 'expense_deleted',
    action: 'deleted',
    description: 'Gasto eliminado por prueba',
    reason: 'Prueba del sistema de notificaciones',
    timestamp: Date.now(),
    details: { amount: 150 }
  });

  // Actualizar sistema de notificaciones
  console.log('   Actualizando sistema de notificaciones...');
  window.app.updateNotifications();

  console.log('   ✅ Notificaciones creadas');

  // Ver notificaciones actuales
  console.log('\n📋 4. Notificaciones actuales:');
  if (window.app.currentNotifications && window.app.currentNotifications.length > 0) {
    console.table(window.app.currentNotifications.map(n => ({
      ID: n.id,
      Tipo: n.type,
      Título: n.title.substring(0, 40),
      Leída: n.isRead ? 'Sí' : 'No',
      Prioridad: n.priority
    })));

    const unread = window.app.currentNotifications.filter(n => !n.isRead);
    console.log(`   📬 Total: ${window.app.currentNotifications.length}`);
    console.log(`   🔴 No leídas: ${unread.length}`);
  } else {
    console.log('   ⚠️ No hay notificaciones');
  }

} else {
  console.error('❌ window.app no existe');
}

// 5. Verificar estado de badges
console.log('\n📋 5. Estado de Badges:');
console.log(`   Banner Badge display: ${bannerBadge ? bannerBadge.style.display : 'N/A'}`);
console.log(`   Nav Badge display: ${navBadge ? navBadge.style.display : 'N/A'}`);
console.log(`   Banner Badge visible: ${bannerBadge && bannerBadge.style.display !== 'none' ? '🔴 SÍ' : '⚪ NO'}`);
console.log(`   Nav Badge visible: ${navBadge && navBadge.style.display !== 'none' ? '🔴 SÍ' : '⚪ NO'}`);

// 6. Verificar contenido del dropdown
console.log('\n📋 6. Contenido del Dropdown:');
if (notificationList) {
  const items = notificationList.querySelectorAll('.notification-item');
  console.log(`   Items en la lista: ${items.length}`);
  if (items.length === 0) {
    console.log('   ⚠️ La lista está vacía');
  } else {
    console.log('   ✅ Hay notificaciones renderizadas');
  }
}

if (notificationEmpty) {
  console.log(`   Empty state hidden: ${notificationEmpty.classList.contains('hidden') ? 'Sí' : 'No'}`);
}

// 7. Simular click en campanita del banner
console.log('\n📋 7. Simulando click en campanita del banner en 2 segundos...');

setTimeout(() => {
  if (bannerBell) {
    console.log('   🖱️ Click en campanita del banner...');
    bannerBell.click();

    setTimeout(() => {
      const isVisible = dropdown && !dropdown.classList.contains('hidden');
      console.log(`   Dropdown ahora: ${isVisible ? '✅ VISIBLE' : '❌ OCULTO'}`);

      if (!isVisible) {
        console.error('   ❌ ERROR: El dropdown NO se abrió');
        console.log('   Verificando event listeners...');

        // Verificar si hay listeners
        const listeners = getEventListeners ? getEventListeners(bannerBell) : null;
        if (listeners) {
          console.log('   Listeners en bannerBell:', listeners);
        }
      } else {
        console.log('   ✅ SUCCESS: El dropdown se abrió correctamente');

        // Cerrar después de 2 segundos
        setTimeout(() => {
          console.log('   🖱️ Cerrando dropdown...');
          bannerBell.click();
          console.log(`   Dropdown cerrado: ${dropdown.classList.contains('hidden') ? '✅' : '❌'}`);
        }, 2000);
      }
    }, 300);
  }
}, 2000);

console.log('\n💡 COMANDOS ÚTILES:');
console.log('// Abrir/cerrar dropdown manualmente:');
console.log('document.getElementById("notificationDropdown").classList.toggle("hidden");');
console.log('\n// Ver notificaciones actuales:');
console.log('console.table(window.app.currentNotifications);');
console.log('\n// Forzar actualización:');
console.log('window.app.updateNotifications();');
