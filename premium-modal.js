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

// Exponer globalmente
window.showPremiumUpgradeModal = showPremiumUpgradeModal;
window.closePremiumUpgradeModal = closePremiumUpgradeModal;
window.handlePremiumPurchase = handlePremiumPurchase;

console.log('✅ Premium modal system loaded');
