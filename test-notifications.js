/**
 * ============================================
 * SCRIPT DE PRUEBA - SISTEMA DE NOTIFICACIONES
 * ============================================
 * Copia y pega este código en la consola F12
 */

console.log('🔔 Iniciando pruebas del sistema de notificaciones...\n');

// 1. Verificar que existen los elementos del DOM
console.log('📋 1. Verificando elementos del DOM:');
console.log('-----------------------------------');

const elements = {
  'Campanita Navbar': document.getElementById('notificationArea'),
  'Badge Navbar': document.getElementById('notificationCount'),
  'Campanita Banner': document.getElementById('bannerNotificationArea'),
  'Badge Banner': document.getElementById('bannerNotificationCount'),
  'Dropdown': document.getElementById('notificationDropdown'),
  'Lista': document.getElementById('notificationList'),
};

let allElementsExist = true;
Object.entries(elements).forEach(([name, element]) => {
  const exists = element !== null;
  console.log(`${exists ? '✅' : '❌'} ${name}: ${exists ? 'Encontrado' : 'NO ENCONTRADO'}`);
  if (!exists) allElementsExist = false;
});

if (!allElementsExist) {
  console.error('❌ Algunos elementos no fueron encontrados. Revisa el HTML.');
} else {
  console.log('\n✅ Todos los elementos existen en el DOM\n');
}

// 2. Verificar que existe la instancia de FinanceApp
console.log('📋 2. Verificando instancia de FinanceApp:');
console.log('-----------------------------------');
if (window.app) {
  console.log('✅ window.app existe');
  console.log(`   - Tipo: ${typeof window.app}`);
  console.log(`   - Constructor: ${window.app.constructor.name}`);

  // Verificar métodos relacionados con notificaciones
  const methods = [
    'updateNotifications',
    'updateNotificationBadge',
    'renderNotificationList',
    'setupNotificationBell',
    'createDailyMessageNotification',
    'showDailyMessageModal'
  ];

  console.log('\n   Métodos de notificaciones:');
  methods.forEach(method => {
    const exists = typeof window.app[method] === 'function';
    console.log(`   ${exists ? '✅' : '❌'} ${method}`);
  });
} else {
  console.error('❌ window.app no existe. La aplicación no se ha inicializado.');
}

// 3. Probar actualización manual de notificaciones
console.log('\n📋 3. Forzando actualización de notificaciones:');
console.log('-----------------------------------');
if (window.app && typeof window.app.updateNotifications === 'function') {
  try {
    window.app.updateNotifications();
    console.log('✅ updateNotifications() ejecutado sin errores');
  } catch (error) {
    console.error('❌ Error al ejecutar updateNotifications():', error);
  }
} else {
  console.error('❌ No se puede ejecutar updateNotifications()');
}

// 4. Crear notificación de prueba
console.log('\n📋 4. Creando notificación de prueba:');
console.log('-----------------------------------');

if (window.app) {
  try {
    // Simular una notificación del sistema de mensajes diarios
    window.app.createDailyMessageNotification('morning');
    console.log('✅ Notificación de prueba (morning) creada');

    // Actualizar y renderizar
    window.app.updateNotifications();

    // Verificar badge
    const bannerBadge = document.getElementById('bannerNotificationCount');
    const navBadge = document.getElementById('notificationCount');

    console.log('\n   Estado de los badges:');
    console.log(`   - Banner Badge visible: ${bannerBadge && bannerBadge.style.display !== 'none'}`);
    console.log(`   - Navbar Badge visible: ${navBadge && navBadge.style.display !== 'none'}`);

  } catch (error) {
    console.error('❌ Error al crear notificación de prueba:', error);
  }
}

// 5. Probar click en campanita del banner
console.log('\n📋 5. Probando interacción con campanita:');
console.log('-----------------------------------');

const bannerBell = document.getElementById('bannerNotificationArea');
const dropdown = document.getElementById('notificationDropdown');

if (bannerBell && dropdown) {
  console.log('   Haz click en la campanita del banner para probar...');
  console.log('   El dropdown debería aparecer/desaparecer');

  // Simular click programático
  console.log('\n   Simulando click automático en 2 segundos...');
  setTimeout(() => {
    bannerBell.click();
    const isVisible = !dropdown.classList.contains('hidden');
    console.log(`   ${isVisible ? '✅' : '❌'} Dropdown ${isVisible ? 'visible' : 'oculto'} después del click`);

    // Cerrar después de 2 segundos
    setTimeout(() => {
      bannerBell.click();
      const isClosed = dropdown.classList.contains('hidden');
      console.log(`   ${isClosed ? '✅' : '❌'} Dropdown ${isClosed ? 'cerrado' : 'aún visible'} después del segundo click`);
    }, 2000);
  }, 2000);
} else {
  console.error('❌ No se pueden probar los clicks');
}

// 6. Información de depuración
console.log('\n📋 6. Información de depuración:');
console.log('-----------------------------------');

if (window.app) {
  console.log('   Configuración actual:');
  console.log(`   - Usuario: ${window.app.currentUser || 'No autenticado'}`);
  console.log(`   - Mensajes cargados: ${window.app.mensajesManana ? 'Sí' : 'No'}`);
  console.log(`   - Última actualización mensajes: ${window.app.lastMessageUpdate || 'Nunca'}`);

  // Estado de notificaciones
  if (window.app.notificationStates) {
    console.log(`   - Estados guardados: ${window.app.notificationStates.size} notificaciones`);
  }
}

// 7. Comandos útiles para seguir probando
console.log('\n📋 7. Comandos útiles para pruebas manuales:');
console.log('-----------------------------------');
console.log('// Crear notificación de mañana:');
console.log('window.app.createDailyMessageNotification("morning");\n');

console.log('// Crear notificación de noche:');
console.log('window.app.createDailyMessageNotification("night");\n');

console.log('// Mostrar modal de mensaje:');
console.log('window.app.showDailyMessageModal(window.app.getRandomMessage("morning"), "morning");\n');

console.log('// Actualizar notificaciones:');
console.log('window.app.updateNotifications();\n');

console.log('// Ver todas las notificaciones actuales:');
console.log('console.log(window.app.currentNotifications);\n');

console.log('// Abrir/cerrar dropdown manualmente:');
console.log('document.getElementById("notificationDropdown").classList.toggle("hidden");\n');

console.log('\n✅ Pruebas completadas. Revisa los resultados arriba.');
console.log('💡 Puedes usar los comandos útiles para seguir probando.\n');
