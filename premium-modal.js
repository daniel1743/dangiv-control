// ========================================
// PREMIUM UPGRADE MODAL
// Modal para promocionar características premium
// ========================================

function showPremiumUpgradeModal(options = {}) {
  const defaults = {
    feature: 'Recomendaciones Premium',
    benefits: [
      '✨ 12 recomendaciones adicionales personalizadas',
      '💬 Mensajes ilimitados con Fin',
      '🤖 Registro de gastos conversacional con IA',
      '📊 Análisis financiero avanzado',
      '📥 Exportación de datos',
      '🎯 Soporte prioritario'
    ],
    price: '$9.99 USD/mes',
    ctaText: 'Obtener Premium'
  };

  const config = { ...defaults, ...options };

  // Verificar si ya existe el modal
  let modal = document.getElementById('premiumUpgradeModal');

  if (!modal) {
    // Crear modal
    modal = document.createElement('div');
    modal.id = 'premiumUpgradeModal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
      <div class="modal-content premium-modal">
        <button class="modal-close" onclick="closePremiumUpgradeModal()">
          <i class="fas fa-times"></i>
        </button>

        <div class="premium-header">
          <div class="premium-icon">
            <i class="fas fa-crown"></i>
          </div>
          <h2>Desbloquea ${config.feature}</h2>
          <p class="premium-subtitle">Lleva tu gestión financiera al siguiente nivel</p>
        </div>

        <div class="premium-benefits">
          <h3>Incluye:</h3>
          <ul id="premiumBenefitsList">
            ${config.benefits.map(benefit => `<li><i class="fas fa-check-circle"></i> ${benefit}</li>`).join('')}
          </ul>
        </div>

        <div class="premium-pricing">
          <div class="price-tag">
            <span class="price-amount">${config.price}</span>
            <span class="price-period">o $99.99/año (ahorra 17%)</span>
          </div>
        </div>

        <div class="premium-actions">
          <button class="btn btn-premium" onclick="handlePremiumPurchase()">
            <i class="fas fa-crown"></i> Próximamente
          </button>
          <button class="btn btn-secondary" onclick="closePremiumUpgradeModal()">
            Tal vez después
          </button>
        </div>

        <div class="promo-code-section">
          <p class="promo-code-link" onclick="togglePromoCodeInput()">
            <i class="fas fa-gift"></i> ¿Tienes un código promocional?
          </p>
          <div class="promo-code-input-wrapper" id="promoCodeInputWrapper" style="display: none;">
            <input
              type="text"
              id="promoCodeInput"
              class="promo-code-input"
              placeholder="Ingresa tu código (ej: FINPRO2025-A1B2)"
              maxlength="20"
            />
            <button class="btn btn-promo-activate" onclick="activatePromoCodeFromModal()">
              <i class="fas fa-check-circle"></i> Activar código
            </button>
            <div id="promoCodeMessage" class="promo-message" style="display: none;"></div>
          </div>
        </div>

        <p class="premium-footer">
          🔒 Pago seguro • ✅ Cancela cuando quieras • 💯 Garantía de 7 días
        </p>
      </div>
    `;

    document.body.appendChild(modal);
  } else {
    // Actualizar contenido si ya existe
    const benefitsList = modal.querySelector('#premiumBenefitsList');
    if (benefitsList) {
      benefitsList.innerHTML = config.benefits.map(benefit =>
        `<li><i class="fas fa-check-circle"></i> ${benefit}</li>`
      ).join('');
    }
  }

  // Mostrar modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Cerrar al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePremiumUpgradeModal();
    }
  });
}

function closePremiumUpgradeModal() {
  const modal = document.getElementById('premiumUpgradeModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

function handlePremiumPurchase() {
  // Mostrar mensaje de próximamente
  alert('🚀 La suscripción Premium estará disponible próximamente. ¡Gracias por tu interés!');
  closePremiumUpgradeModal();
  return;

  // Por ahora, simular activación
  // En producción, aquí iría la integración con Stripe/PayPal

  if (confirm('¿Activar Premium por 30 días (simulación)?')) {
    // Simular activación
    if (!window.premiumManager) {
      // Si no existe, crear uno temporal
      const tempStorage = localStorage.getItem('premium_anonymous');
      const data = tempStorage ? JSON.parse(tempStorage) : {
        isPremium: false,
        messagesCount: 0,
        lastResetDate: new Date().toDateString(),
        subscriptionExpiry: null
      };

      data.isPremium = true;
      data.subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      localStorage.setItem('premium_anonymous', JSON.stringify(data));
    } else {
      window.premiumManager.activatePremium(30);
    }

    closePremiumUpgradeModal();

    // Mostrar confirmación
    showPremiumActivatedMessage();

    // Recargar recomendaciones si existen
    if (window.financeApp && window.financeApp.aiRecommendationsManager) {
      window.financeApp.aiRecommendationsManager.renderRecommendations();
    }
  }
}

function showPremiumActivatedMessage() {
  const toast = document.createElement('div');
  toast.className = 'toast success premium-toast';
  toast.innerHTML = `
    <i class="fas fa-crown"></i>
    <span>¡Premium activado! Ya puedes disfrutar de todas las funciones. 🎉</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========================================
// FUNCIONES DE CÓDIGO PROMOCIONAL
// ========================================

function togglePromoCodeInput() {
  const wrapper = document.getElementById('promoCodeInputWrapper');
  if (wrapper) {
    const isVisible = wrapper.style.display !== 'none';
    wrapper.style.display = isVisible ? 'none' : 'block';

    // Limpiar mensaje anterior
    const message = document.getElementById('promoCodeMessage');
    if (message) {
      message.style.display = 'none';
    }

    // Focus en el input si se muestra
    if (!isVisible) {
      setTimeout(() => {
        const input = document.getElementById('promoCodeInput');
        if (input) input.focus();
      }, 100);
    }
  }
}

function activatePromoCodeFromModal() {
  // Verificar que el sistema de promo codes esté cargado
  if (!window.promoCodesSystem) {
    showPromoMessage('❌ Sistema no cargado. Recarga la página.', 'error');
    return;
  }

  const input = document.getElementById('promoCodeInput');
  if (!input) return;

  const code = input.value.trim();

  if (!code) {
    showPromoMessage('⚠️ Por favor ingresa un código.', 'warning');
    return;
  }

  // Validar y activar código
  const result = window.promoCodesSystem.validateAndActivateCode(code);

  if (result.success) {
    showPromoMessage(result.message, 'success');

    // Limpiar input
    input.value = '';

    // Cerrar modal después de 2 segundos
    setTimeout(() => {
      closePremiumUpgradeModal();

      // Recargar página para aplicar cambios Pro
      setTimeout(() => {
        location.reload();
      }, 500);
    }, 2000);
  } else {
    showPromoMessage(result.message, 'error');
  }
}

function showPromoMessage(message, type = 'info') {
  const messageEl = document.getElementById('promoCodeMessage');
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.className = `promo-message promo-message--${type}`;
  messageEl.style.display = 'block';

  // Ocultar después de 5 segundos si es error o warning
  if (type === 'error' || type === 'warning') {
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }
}

// Exponer globalmente
window.showPremiumUpgradeModal = showPremiumUpgradeModal;
window.closePremiumUpgradeModal = closePremiumUpgradeModal;
window.handlePremiumPurchase = handlePremiumPurchase;
window.togglePromoCodeInput = togglePromoCodeInput;
window.activatePromoCodeFromModal = activatePromoCodeFromModal;

console.log('✅ Premium modal system loaded');
