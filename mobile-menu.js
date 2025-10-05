// ========================================
// SISTEMA DE MENÚ DEL AVATAR Y NOTIFICACIONES
// ========================================

console.log('📦 mobile-menu.js CARGANDO...');

// Esperar a que FinanceApp esté disponible
(function() {
  'use strict';

  console.log('🔍 Verificando FinanceApp...', typeof window.FinanceApp);

  // Verificar que FinanceApp existe
  if (typeof window.FinanceApp === 'undefined') {
    console.error('⚠️ FinanceApp no está definido. mobile-menu.js debe cargarse después de app.js');
    return;
  }

  console.log('✅ FinanceApp encontrado, definiendo métodos...');

// Inicializar sistema de menú móvil
window.FinanceApp.prototype.initMobileMenu = function() {
  console.log('🎯 Inicializando menú móvil del avatar...');

  // Elementos del DOM
  this.avatarContainer = document.getElementById('mobileAvatarContainer');
  this.avatarMenu = document.getElementById('avatarMenu');
  this.notificationBtn = document.getElementById('bannerNotificationBtn');
  this.notificationPanel = document.getElementById('notificationPanel');
  this.notificationCloseBtn = document.getElementById('notificationCloseBtn');
  this.menuBackdrop = document.getElementById('menuBackdrop');

  console.log('📱 Avatar container:', this.avatarContainer);
  console.log('📋 Avatar menu:', this.avatarMenu);

  // Event listeners
  if (this.avatarContainer) {
    console.log('✅ Agregando listener de click al avatar container');
    this.avatarContainer.addEventListener('click', (e) => {
      console.log('👆 Click en avatar container detectado');
      e.preventDefault();
      e.stopPropagation();
      this.toggleAvatarMenu();
    });
  } else {
    console.warn('⚠️ Avatar container no encontrado');
  }

  // BOTÓN LOGIN
  const loginBtn = document.getElementById('mobileQuickLoginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // Abrir modal de autenticación directamente
      const authModal = document.getElementById('authModal');
      if (authModal) {
        authModal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Activar pestaña de login por defecto
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (loginTab && registerTab && loginForm && registerForm) {
          loginTab.classList.add('active');
          registerTab.classList.remove('active');
          loginForm.classList.add('active');
          registerForm.classList.remove('active');
        }
      }
    });
  }

  // BOTÓN LOGOUT
  const logoutBtn = document.getElementById('mobileQuickLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      this.showLogoutConfirmModal();
    });
  }

  if (this.notificationBtn) {
    this.notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleNotificationPanel();
    });
  }

  if (this.notificationCloseBtn) {
    this.notificationCloseBtn.addEventListener('click', () => this.closeNotificationPanel());
  }

  if (this.menuBackdrop) {
    this.menuBackdrop.addEventListener('click', () => {
      this.closeAvatarMenu();
      this.closeNotificationPanel();
    });
  }

  // Menu item actions
  const menuItems = document.querySelectorAll('.avatar-menu-item[data-action]');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      this.handleMenuAction(action);
    });
  });

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeToggle.checked = savedTheme === 'dark';

    themeToggle.addEventListener('change', (e) => {
      this.toggleTheme(e.target.checked);
    });
  }

  // Inicializar elementos
  this.updateAvatarMenu();
  this.renderMobileAchievements();
  this.updateNotificationBadge();
  this.renderNotifications();
};

// Toggle menú del avatar
// Toggle menú del avatar
window.FinanceApp.prototype.toggleAvatarMenu = function() {
  if (this.avatarMenu.classList.contains('show')) {
    this.closeAvatarMenu();
  } else {
    this.openAvatarMenu();
  }
};

// Abrir menú del avatar
window.FinanceApp.prototype.openAvatarMenu = function() {
  console.log('🔓 Abriendo menú del avatar...');
  console.log('   this.avatarMenu:', this.avatarMenu);
  console.log('   this.menuBackdrop:', this.menuBackdrop);

  if (!this.avatarMenu) {
    console.error('❌ avatarMenu no encontrado!');
    return;
  }

  if (!this.menuBackdrop) {
    console.error('❌ menuBackdrop no encontrado!');
    return;
  }

  console.log('✅ Agregando clase show...');
  this.avatarMenu.classList.add('show');
  this.menuBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  console.log('   Clase show agregada:', this.avatarMenu.classList.contains('show'));

  if (this.closeNotificationPanel) {
    this.closeNotificationPanel(); // Cerrar notificaciones si están abiertas
  }
};

// Cerrar menú del avatar
window.FinanceApp.prototype.closeAvatarMenu = function() {
  if (this.avatarMenu) {
    this.avatarMenu.classList.remove('show');
  }
  if (this.menuBackdrop) {
    this.menuBackdrop.classList.remove('show');
    this.menuBackdrop.classList.remove('active');
  }
  document.body.style.overflow = '';
};

// Toggle panel de notificaciones
window.FinanceApp.prototype.toggleNotificationPanel = function() {
  if (this.notificationPanel.classList.contains('show')) {
    this.closeNotificationPanel();
  } else {
    this.openNotificationPanel();
  }
};

// Abrir panel de notificaciones
window.FinanceApp.prototype.openNotificationPanel = function() {
  this.notificationPanel.classList.add('show');
  this.menuBackdrop.classList.add('show');
  this.closeAvatarMenu(); // Cerrar menú si está abierto
};

// Cerrar panel de notificaciones
window.FinanceApp.prototype.closeNotificationPanel = function() {
  this.notificationPanel.classList.remove('show');
  this.menuBackdrop.classList.remove('show');
};

// Actualizar información del menú del avatar
window.FinanceApp.prototype.updateAvatarMenu = function() {
  const avatarMenuImg = document.getElementById('avatarMenuImg');
  const avatarMenuName = document.getElementById('avatarMenuName');
  const avatarMenuEmail = document.getElementById('avatarMenuEmail');

  if (avatarMenuImg) {
    const avatarSrc = this.userProfile.avatarType === 'custom'
      ? this.userProfile.avatar
      : this.defaultAvatars[this.userProfile.selectedAvatar];
    avatarMenuImg.src = avatarSrc;
  }

  if (avatarMenuName) {
    avatarMenuName.textContent = this.userProfile.name || 'Usuario';
  }

  if (avatarMenuEmail) {
    if (this.firebaseUser && this.firebaseUser.email) {
      avatarMenuEmail.textContent = this.firebaseUser.email;
    } else {
      avatarMenuEmail.textContent = 'Usuario anónimo';
    }
  }

  // Actualizar frase personal
  this.updateUserQuote();
};

// Actualizar frase personal
window.FinanceApp.prototype.updateUserQuote = function() {
  const quoteElement = document.getElementById('mobileUserQuote');
  if (quoteElement) {
    if (this.userProfile.quote && this.userProfile.quote.trim()) {
      quoteElement.textContent = this.userProfile.quote;
      quoteElement.style.opacity = '1';
    } else {
      quoteElement.textContent = 'Agrega una frase inspiradora...';
      quoteElement.style.opacity = '0.5';
    }
  }
};

// Manejar acciones del menú
window.FinanceApp.prototype.handleMenuAction = function(action) {
  this.closeAvatarMenu();

  switch (action) {
    case 'change-photo':
      this.openAvatarUploader();
      break;
    case 'change-name':
      this.openChangeNameModal();
      break;
    case 'edit-quote':
      this.openEditQuoteModal();
      break;
    case 'edit-info':
      this.openEditInfoModal();
      break;
    case 'my-achievements':
      this.showSection('achievements');
      break;
    case 'go-premium':
      this.showComingSoonModal('Premium');
      break;
    case 'report-problem':
      this.startTour(); // Usar el tour existente
      break;
    case 'delete-account':
      this.showDeleteAccountModal();
      break;
    case 'logout':
      this.logout();
      break;
  }
};

// Modal: Cambiar nombre
window.FinanceApp.prototype.openChangeNameModal = function() {
  const currentName = this.userProfile.name || 'Usuario';
  const newName = prompt('Ingresa tu nuevo nombre:', currentName);

  if (newName && newName.trim() && newName !== currentName) {
    this.userProfile.name = newName.trim();
    this.saveData();
    this.updateProfileDisplay();
    this.updateAvatarMenu();
    this.showToast('Nombre actualizado correctamente', 'success');
  }
};

// Modal: Editar frase personal
window.FinanceApp.prototype.openEditQuoteModal = function() {
  // Crear modal con 10 frases inspiradoras
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Elige tu frase inspiradora</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 1rem; color: var(--color-text-secondary);">
            O escribe tu propia frase personalizada:
          </p>
          <input
            type="text"
            id="customQuote"
            class="form-input"
            placeholder="Escribe tu frase aquí..."
            maxlength="60"
            value="${this.userProfile.quote || ''}"
          />
          <p style="margin: 1.5rem 0 0.5rem; font-weight: 600;">Frases sugeridas:</p>
          <div class="quote-list" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto;">
            ${this.getInspirationalQuotes().map((quote, index) => `
              <button
                class="quote-item"
                style="padding: 12px; text-align: left; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; cursor: pointer; transition: all 0.2s;"
                onclick="document.getElementById('customQuote').value = '${quote.replace(/'/g, "\\'")}'"
              >
                ${quote}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
            Cancelar
          </button>
          <button class="btn btn-primary" onclick="window.app.saveQuote()">
            Guardar
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
};

// 10 Frases inspiradoras
window.FinanceApp.prototype.getInspirationalQuotes = function() {
  return [
    "El ahorro de hoy es la libertad de mañana",
    "Pequeños pasos, grandes resultados",
    "Invierte en ti mismo",
    "El control financiero es poder",
    "Cada centavo cuenta",
    "Planifica tu futuro, vive tu presente",
    "La disciplina financiera es libertad",
    "Ahorra hoy, disfruta mañana",
    "Construyendo mi mejor versión",
    "El éxito financiero empieza aquí"
  ];
};

// Guardar frase
window.FinanceApp.prototype.saveQuote = function() {
  const quoteInput = document.getElementById('customQuote');
  if (quoteInput) {
    const newQuote = quoteInput.value.trim();
    this.userProfile.quote = newQuote;
    this.saveData();
    this.updateUserQuote();
    this.showToast('Frase actualizada correctamente', 'success');

    // Cerrar modal
    const modal = quoteInput.closest('.modal');
    if (modal) modal.remove();
  }
};

// Modal: Editar información (país, email, fecha)
window.FinanceApp.prototype.openEditInfoModal = function() {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Editar información</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              id="userEmail"
              class="form-input"
              value="${this.userProfile.email || ''}"
              placeholder="tu@email.com"
            />
          </div>
          <div class="form-group">
            <label>Fecha de nacimiento</label>
            <input
              type="date"
              id="userBirthdate"
              class="form-input"
              value="${this.userProfile.birthdate || ''}"
            />
          </div>
          <div class="form-group">
            <label>País</label>
            <select id="userCountry" class="form-input">
              <option value="">Selecciona un país</option>
              ${this.getCountries().map(country => `
                <option value="${country.code}" ${this.userProfile.country === country.code ? 'selected' : ''}>
                  ${country.flag} ${country.name}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Moneda</label>
            <select id="userCurrency" class="form-input">
              <option value="CLP" ${this.userProfile.currency === 'CLP' ? 'selected' : ''}>🇨🇱 Peso Chileno (CLP)</option>
              <option value="USD" ${this.userProfile.currency === 'USD' ? 'selected' : ''}>🇺🇸 Dólar (USD)</option>
              <option value="EUR" ${this.userProfile.currency === 'EUR' ? 'selected' : ''}>🇪🇺 Euro (EUR)</option>
              <option value="VES" ${this.userProfile.currency === 'VES' ? 'selected' : ''}>🇻🇪 Bolívar (VES)</option>
              <option value="COP" ${this.userProfile.currency === 'COP' ? 'selected' : ''}>🇨🇴 Peso Colombiano (COP)</option>
              <option value="MXN" ${this.userProfile.currency === 'MXN' ? 'selected' : ''}>🇲🇽 Peso Mexicano (MXN)</option>
              <option value="ARS" ${this.userProfile.currency === 'ARS' ? 'selected' : ''}>🇦🇷 Peso Argentino (ARS)</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
            Cancelar
          </button>
          <button class="btn btn-primary" onclick="window.app.saveUserInfo()">
            Guardar
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
};

// Países disponibles
window.FinanceApp.prototype.getCountries = function() {
  return [
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'ES', name: 'España', flag: '🇪🇸' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  ];
};

// Guardar información del usuario
window.FinanceApp.prototype.saveUserInfo = function() {
  const email = document.getElementById('userEmail').value.trim();
  const birthdate = document.getElementById('userBirthdate').value;
  const country = document.getElementById('userCountry').value;
  const currency = document.getElementById('userCurrency').value;

  this.userProfile.email = email;
  this.userProfile.birthdate = birthdate;
  this.userProfile.country = country;
  this.userProfile.currency = currency;

  this.saveData();
  this.updateAvatarMenu();
  this.showToast('Información actualizada correctamente', 'success');

  // Cerrar modal
  document.querySelector('.modal').remove();
};

// Modal: Eliminar cuenta
window.FinanceApp.prototype.showDeleteAccountModal = function() {
  const confirmed = confirm(
    '⚠️ ¿Estás seguro de que deseas eliminar tu cuenta?\n\n' +
    'Esta acción es IRREVERSIBLE y se perderán:\n' +
    '• Todos tus gastos y metas\n' +
    '• Tu progreso y logros\n' +
    '• Toda tu información personal\n\n' +
    'Escribe "ELIMINAR" para confirmar'
  );

  if (confirmed) {
    const verification = prompt('Escribe "ELIMINAR" para confirmar:');
    if (verification === 'ELIMINAR') {
      this.deleteAccount();
    } else {
      this.showToast('Eliminación cancelada', 'info');
    }
  }
};

// Eliminar cuenta
window.FinanceApp.prototype.deleteAccount = async function() {
  try {
    // Eliminar datos de Firestore
    const FB = window.FB;
    if (FB && this.firebaseUser) {
      const userDocRef = FB.doc(FB.db, 'userData', this.firebaseUser.uid);
      await FB.deleteDoc(userDocRef);
    }

    // Eliminar localStorage
    localStorage.clear();

    // Cerrar sesión
    this.showToast('Cuenta eliminada correctamente', 'success');

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    this.showToast('Error al eliminar cuenta: ' + error.message, 'error');
  }
};

// Modal "Próximamente"
window.FinanceApp.prototype.showComingSoonModal = function(feature) {
  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2>🚧 Estamos trabajando en ello</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>La función <strong>${feature}</strong> estará disponible próximamente.</p>
          <p style="margin-top: 1rem; color: var(--color-text-secondary);">
            Estamos trabajando para ofrecerte la mejor experiencia posible.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
            Entendido
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
};

// Toggle tema claro/oscuro
window.FinanceApp.prototype.toggleTheme = function(isDark) {
  if (isDark) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
};

// Renderizar logros en el banner
window.FinanceApp.prototype.renderMobileAchievements = function() {
  const container = document.getElementById('mobileAchievements');
  if (!container) return;

  // Verificar que achievements exista
  if (!this.achievements || !Array.isArray(this.achievements)) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  // Obtener últimos 5 logros desbloqueados
  const unlockedAchievements = this.achievements
    .filter(a => a.unlocked)
    .slice(-5);

  if (unlockedAchievements.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  container.innerHTML = unlockedAchievements.map(achievement => `
    <div
      class="achievement-icon"
      title="${achievement.name}: ${achievement.description}"
      onclick="window.app.showAchievementDetail('${achievement.id}')"
    >
      <i class="${achievement.icon}"></i>
    </div>
  `).join('');
};

// Mostrar detalle de logro
window.FinanceApp.prototype.showAchievementDetail = function(achievementId) {
  const achievement = this.achievements.find(a => a.id === achievementId);
  if (!achievement) return;

  const modal = document.createElement('div');
  modal.className = 'modal show';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h2><i class="${achievement.icon}"></i> ${achievement.name}</h2>
          <button class="modal-close" onclick="this.closest('.modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>${achievement.description}</p>
          <p style="margin-top: 1rem; color: var(--color-text-secondary);">
            Desbloqueado el: ${new Date(achievement.unlockedAt).toLocaleDateString()}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
};

// Actualizar badge de notificaciones
window.FinanceApp.prototype.updateNotificationBadge = function() {
  const badge = document.getElementById('notificationBadge');
  if (!badge) return;

  const unreadCount = this.getUnreadNotificationsCount();

  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
};

// Contar notificaciones sin leer
window.FinanceApp.prototype.getUnreadNotificationsCount = function() {
  // TODO: Implementar sistema de notificaciones real
  return 0; // Por ahora retorna 0
};

// Renderizar notificaciones
window.FinanceApp.prototype.renderNotifications = function() {
  const container = document.getElementById('notificationPanelBody');
  if (!container) return;

  // Notificaciones de ejemplo (TODO: Conectar con sistema real)
  const notifications = this.getNotifications();

  if (notifications.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem; color: var(--color-text-secondary);">
        <i class="fas fa-bell-slash" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
        <p>No tienes notificaciones</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notifications.map(notification => `
    <div class="notification-item ${notification.read ? '' : 'unread'}">
      <div class="notification-icon ${notification.type}">
        <i class="${notification.icon}"></i>
      </div>
      <div class="notification-content">
        <h4>${notification.title}</h4>
        <p>${notification.message}</p>
        <span class="notification-time">${notification.time}</span>
      </div>
    </div>
  `).join('');
};

// Obtener notificaciones (placeholder)
window.FinanceApp.prototype.getNotifications = function() {
  // TODO: Implementar sistema real de notificaciones
  return [];
};

// Cerrar IIFE
console.log('✅ mobile-menu.js cargado correctamente');

// Intentar inicializar el menú cuando app esté disponible
function tryInitMobileMenu() {
  if (window.app && typeof window.app.initMobileMenu === 'function') {
    console.log('🚀 Inicializando menú móvil ahora...');
    window.app.initMobileMenu();
  } else {
    console.log('⏳ Esperando que window.app esté disponible...');
    setTimeout(tryInitMobileMenu, 100);
  }
}

// Iniciar el proceso
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInitMobileMenu);
} else {
  tryInitMobileMenu();
}

})();
