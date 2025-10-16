// ========================================
// PREMIUM STATUS WIDGET
// Widget para mostrar estado de suscripción y mensajes
// ========================================

class PremiumStatusWidget {
  constructor(premiumManager) {
    this.manager = premiumManager;
    this.container = null;
  }

  // ========================================
  // RENDERIZAR WIDGET
  // ========================================
  render(containerId = 'premiumStatusWidget') {
    let container = document.getElementById(containerId);

    if (!container) {
      // Crear container si no existe
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    this.container = container;
    this.container.innerHTML = this.getHTML();
    this.attachEventListeners();

    return this.container;
  }

  getHTML() {
    const info = this.manager.getSubscriptionInfo();
    const stats = this.manager.getUsageStats();
    const badge = this.manager.getStatusBadge();
    const messagesText = this.manager.getMessagesStatusText();

    if (info.active) {
      // Usuario Premium
      return `
        <div class="premium-status-card premium-active">
          <div class="premium-status-header">
            <div class="premium-badge-large">
              <i class="fas ${badge.icon}"></i>
              <span>${badge.text}</span>
            </div>
            <button class="premium-manage-btn" onclick="showPremiumManagement()">
              <i class="fas fa-cog"></i>
            </button>
          </div>

          <div class="premium-status-content">
            <div class="premium-feature-item">
              <i class="fas fa-check-circle"></i>
              <span>Mensajes ilimitados</span>
            </div>
            <div class="premium-feature-item">
              <i class="fas fa-check-circle"></i>
              <span>15 recomendaciones IA</span>
            </div>
            <div class="premium-feature-item">
              <i class="fas fa-check-circle"></i>
              <span>Registro conversacional</span>
            </div>
          </div>

          <div class="premium-status-footer">
            <span class="premium-expiry">
              <i class="fas fa-calendar"></i>
              Renueva el ${info.expiryDate} (${info.daysLeft} días)
            </span>
          </div>
        </div>
      `;
    } else {
      // Usuario Gratis
      const remaining = stats.messagesUsedToday;
      const total = stats.messagesLimit;
      const percent = (remaining / total) * 100;

      return `
        <div class="premium-status-card premium-free">
          <div class="premium-status-header">
            <div class="premium-badge-large free">
              <i class="fas ${badge.icon}"></i>
              <span>${badge.text}</span>
            </div>
          </div>

          <div class="premium-messages-meter">
            <div class="messages-label">
              <span>Mensajes usados hoy</span>
              <span class="messages-count">${remaining}/${total}</span>
            </div>
            <div class="messages-progress-bar">
              <div class="messages-progress-fill" style="width: ${percent}%"></div>
            </div>
            <p class="messages-info">${messagesText}</p>
          </div>

          <button class="premium-upgrade-btn" onclick="showPremiumUpgradeModal()">
            <i class="fas fa-crown"></i>
            <span>Obtener Premium</span>
            <small>Mensajes ilimitados + más</small>
          </button>
        </div>
      `;
    }
  }

  // ========================================
  // WIDGET COMPACTO PARA CHAT
  // ========================================
  renderCompact(containerId = 'premiumCompactWidget') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const remaining = this.manager.getMessagesRemaining();
    const isPremium = this.manager.isPremiumActive();

    container.innerHTML = `
      <div class="premium-compact-widget ${isPremium ? 'premium' : 'free'}">
        ${isPremium ? `
          <i class="fas fa-crown premium-icon"></i>
          <span>Premium</span>
        ` : `
          <i class="fas fa-comment-dots"></i>
          <span>${remaining}/10 mensajes</span>
        `}
      </div>
    `;

    return container;
  }

  // ========================================
  // ACTUALIZAR WIDGET
  // ========================================
  update() {
    if (this.container) {
      this.container.innerHTML = this.getHTML();
      this.attachEventListeners();
    }
  }

  attachEventListeners() {
    // Los event listeners ya están inline con onclick
    // Aquí se pueden agregar listeners adicionales si es necesario
  }

  // ========================================
  // NOTIFICACIONES
  // ========================================
  showLimitWarning() {
    const remaining = this.manager.getMessagesRemaining();

    if (remaining === 3) {
      this.showToast(
        `Solo te quedan ${remaining} mensajes hoy. ¿Quieres Premium?`,
        'warning',
        () => showPremiumUpgradeModal()
      );
    } else if (remaining === 0) {
      this.showToast(
        'Has alcanzado tu límite diario. Obtén Premium para mensajes ilimitados.',
        'error',
        () => showPremiumUpgradeModal()
      );
    }
  }

  showToast(message, type = 'info', action = null) {
    const toast = document.createElement('div');
    toast.className = `premium-toast premium-toast-${type}`;

    const icons = {
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle',
      success: 'fa-check-circle'
    };

    toast.innerHTML = `
      <i class="fas ${icons[type]}"></i>
      <span>${message}</span>
      ${action ? '<button class="toast-action-btn">Ver Premium</button>' : ''}
    `;

    document.body.appendChild(toast);

    if (action) {
      toast.querySelector('.toast-action-btn').onclick = () => {
        action();
        toast.remove();
      };
    }

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}

// ========================================
// GESTIÓN DE PREMIUM (MODAL)
// ========================================
function showPremiumManagement() {
  const manager = window.premiumManager;
  if (!manager) return;

  const info = manager.getSubscriptionInfo();
  const stats = manager.getUsageStats();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'premiumManagementModal';

  modal.innerHTML = `
    <div class="modal-content premium-management-modal">
      <button class="modal-close" onclick="closePremiumManagement()">
        <i class="fas fa-times"></i>
      </button>

      <div class="premium-management-header">
        <i class="fas fa-crown"></i>
        <h2>Gestionar Premium</h2>
      </div>

      <div class="premium-management-info">
        <div class="info-card">
          <h3>Estado de Suscripción</h3>
          <p><strong>Plan:</strong> ${info.plan === 'monthly' ? 'Mensual' : 'Anual'}</p>
          <p><strong>Vence:</strong> ${info.expiryDate}</p>
          <p><strong>Días restantes:</strong> ${info.daysLeft}</p>
        </div>

        <div class="info-card">
          <h3>Uso de Funciones</h3>
          <p><strong>Mensajes totales:</strong> ${stats.totalMessagesAllTime}</p>
          <p><strong>Recomendaciones vistas:</strong> ${stats.recommendationsViewed}</p>
          <p><strong>Días activo:</strong> ${stats.daysActive}</p>
        </div>
      </div>

      <div class="premium-management-actions">
        <button class="btn btn-secondary" onclick="extendPremiumTrial()">
          <i class="fas fa-plus-circle"></i> Extender 30 días (test)
        </button>
        <button class="btn btn-danger" onclick="confirmCancelPremium()">
          <i class="fas fa-times-circle"></i> Cancelar Premium
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePremiumManagement() {
  const modal = document.getElementById('premiumManagementModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = 'auto';
  }
}

function extendPremiumTrial() {
  if (window.premiumManager) {
    window.premiumManager.activatePremium(30);
    closePremiumManagement();

    if (window.premiumStatusWidget) {
      window.premiumStatusWidget.update();
    }

    alert('✅ Premium extendido por 30 días más');
  }
}

function confirmCancelPremium() {
  if (confirm('¿Estás seguro de cancelar Premium? Perderás acceso a todas las funciones premium.')) {
    if (window.premiumManager) {
      window.premiumManager.deactivatePremium();
      closePremiumManagement();

      if (window.premiumStatusWidget) {
        window.premiumStatusWidget.update();
      }

      alert('❌ Premium cancelado. Puedes reactivarlo cuando quieras.');
    }
  }
}

// Exponer globalmente
window.PremiumStatusWidget = PremiumStatusWidget;

// Crear instancia global si existe premiumManager
if (window.premiumManager) {
  window.premiumStatusWidget = new PremiumStatusWidget(window.premiumManager);
  console.log('✅ PremiumStatusWidget inicializado');
}

console.log('✅ PremiumStatusWidget loaded');
