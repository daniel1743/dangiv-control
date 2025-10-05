// PRUEBA RÁPIDA - Copiar y pegar en F12
console.clear();

// Crear notificaciones de prueba
window.app.createDailyMessageNotification('morning');
window.app.createDailyMessageNotification('night');
window.app.updateNotifications();

console.log('✅ Notificaciones creadas');
console.log(`📬 Total: ${window.app.currentNotifications?.length || 0}`);
console.log(`🔴 No leídas: ${window.app.currentNotifications?.filter(n => !n.isRead).length || 0}`);

// Verificar badges
const bannerBadge = document.getElementById('bannerNotificationCount');
const dropdown = document.getElementById('notificationDropdown');

console.log(`\n🔔 Badge visible: ${bannerBadge.style.display !== 'none' ? 'SÍ 🔴' : 'NO ⚪'}`);
console.log(`📋 Dropdown oculto: ${dropdown.classList.contains('hidden') ? 'SÍ' : 'NO'}`);

// Simular click
console.log('\n🖱️ Haciendo click en campanita en 2 segundos...');
setTimeout(() => {
  document.getElementById('bannerNotificationArea').click();
  setTimeout(() => {
    const isOpen = !dropdown.classList.contains('hidden');
    console.log(`📋 Dropdown ${isOpen ? 'ABIERTO ✅' : 'CERRADO ❌'}`);
  }, 500);
}, 2000);
