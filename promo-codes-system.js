// ========================================
// SISTEMA DE CÓDIGOS PROMOCIONALES PRO
// ========================================

class PromoCodesSystem {
  constructor() {
    // Códigos promocionales válidos (15 días de prueba)
    this.validPromoCodes = [
      'FINPRO2025-A1B2',
      'FINPRO2025-C3D4',
      'FINPRO2025-E5F6',
      'FINPRO2025-G7H8',
      'FINPRO2025-I9J0',
      'FINPRO2025-K1L2',
      'FINPRO2025-M3N4',
      'FINPRO2025-O5P6',
      'FINPRO2025-Q7R8',
      'FINPRO2025-S9T0',
      'FINPRO2025-U1V2',
      'FINPRO2025-W3X4',
      'FINPRO2025-Y5Z6',
      'FINPRO2025-AA7B',
      'FINPRO2025-CC8D',
      'FINPRO2025-EE9F',
      'FINPRO2025-GG0H',
      'FINPRO2025-II1J',
      'FINPRO2025-KK2L',
      'FINPRO2025-MM3N'
    ];

    // Duración de la prueba en días
    this.trialDurationDays = 15;

    this.init();
  }

  init() {
    // Verificar si el trial ha expirado al cargar
    this.checkTrialExpiration();

    console.log('✅ Sistema de códigos promocionales inicializado');
  }

  // ========================================
  // VALIDAR Y ACTIVAR CÓDIGO
  // ========================================
  validateAndActivateCode(code) {
    // Limpiar el código (quitar espacios, convertir a mayúsculas)
    const cleanCode = code.trim().toUpperCase();

    // Verificar si el código es válido
    if (!this.validPromoCodes.includes(cleanCode)) {
      return {
        success: false,
        message: '❌ Código inválido. Por favor verifica e intenta de nuevo.'
      };
    }

    // Verificar si el código ya fue usado
    const usedCodes = this.getUsedCodes();
    if (usedCodes.includes(cleanCode)) {
      return {
        success: false,
        message: '⚠️ Este código ya fue utilizado anteriormente.'
      };
    }

    // Verificar si ya tiene una suscripción activa
    const currentStatus = this.getPremiumStatus();
    if (currentStatus.isPremium && currentStatus.type !== 'trial') {
      return {
        success: false,
        message: '✅ Ya tienes una suscripción Premium activa.'
      };
    }

    // Activar el código
    return this.activateTrial(cleanCode);
  }

  // ========================================
  // ACTIVAR TRIAL
  // ========================================
  activateTrial(code) {
    const now = Date.now();
    const expirationDate = now + (this.trialDurationDays * 24 * 60 * 60 * 1000);

    const trialData = {
      type: 'trial',
      isPremium: true,
      activatedAt: now,
      expiresAt: expirationDate,
      code: code,
      daysRemaining: this.trialDurationDays
    };

    // Guardar en localStorage
    localStorage.setItem('premiumStatus', JSON.stringify(trialData));

    // INTEGRACIÓN CON PREMIUM MANAGER
    // Actualizar también el sistema premium existente
    if (window.premiumManager) {
      window.premiumManager.activatePremium(this.trialDurationDays, 'trial');
    } else {
      // Si no existe premiumManager, actualizar el storage directamente
      const premiumData = {
        isPremium: true,
        messagesCount: 0,
        messagesLimit: 10,
        lastResetDate: new Date().toDateString(),
        subscriptionExpiry: new Date(expirationDate).toISOString(),
        subscriptionStart: new Date(now).toISOString(),
        plan: 'trial',
        features: {
          unlimitedMessages: true,
          allRecommendations: true,
          conversationalExpense: true,
          premiumAchievements: true,
          dataExport: true,
          advancedAnalysis: true
        },
        usage: {
          totalMessages: 0,
          totalRecommendationsViewed: 0,
          daysActive: 0
        }
      };
      localStorage.setItem('premium_anonymous', JSON.stringify(premiumData));
    }

    // Marcar código como usado
    this.markCodeAsUsed(code);

    // Emitir evento para actualizar UI
    window.dispatchEvent(new CustomEvent('premiumStatusChanged', {
      detail: trialData
    }));

    return {
      success: true,
      message: `🎉 ¡Código activado! Tienes ${this.trialDurationDays} días de FinanciaSuite Pro.`,
      data: trialData
    };
  }

  // ========================================
  // OBTENER STATUS PREMIUM
  // ========================================
  getPremiumStatus() {
    const saved = localStorage.getItem('premiumStatus');

    if (!saved) {
      return {
        isPremium: false,
        type: 'free'
      };
    }

    try {
      const data = JSON.parse(saved);

      // Verificar si es trial y si expiró
      if (data.type === 'trial') {
        const now = Date.now();
        if (now > data.expiresAt) {
          // Trial expirado
          this.expireTrial();
          return {
            isPremium: false,
            type: 'free',
            wasTrialUser: true
          };
        }

        // Calcular días restantes
        const msRemaining = data.expiresAt - now;
        const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

        return {
          ...data,
          daysRemaining: daysRemaining
        };
      }

      return data;
    } catch (e) {
      console.error('Error al leer premium status:', e);
      return {
        isPremium: false,
        type: 'free'
      };
    }
  }

  // ========================================
  // VERIFICAR EXPIRACIÓN
  // ========================================
  checkTrialExpiration() {
    const status = this.getPremiumStatus();

    if (status.type === 'trial' && !status.isPremium) {
      // Trial expirado - mostrar notificación
      this.showExpirationNotification();
    }
  }

  // ========================================
  // EXPIRAR TRIAL
  // ========================================
  expireTrial() {
    localStorage.removeItem('premiumStatus');

    // Emitir evento
    window.dispatchEvent(new CustomEvent('premiumStatusChanged', {
      detail: {
        isPremium: false,
        type: 'free',
        expired: true
      }
    }));
  }

  // ========================================
  // CÓDIGOS USADOS
  // ========================================
  getUsedCodes() {
    const saved = localStorage.getItem('usedPromoCodes');
    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }

  markCodeAsUsed(code) {
    const usedCodes = this.getUsedCodes();
    usedCodes.push(code);
    localStorage.setItem('usedPromoCodes', JSON.stringify(usedCodes));
  }

  // ========================================
  // NOTIFICACIONES
  // ========================================
  showExpirationNotification() {
    // Mostrar toast o modal
    if (typeof showToast === 'function') {
      showToast('⏰ Tu prueba de FinanciaSuite Pro ha expirado. ¡Suscríbete para seguir disfrutando!', 'info');
    }
  }

  // ========================================
  // VERIFICAR ACCESO A FEATURE PRO
  // ========================================
  hasProAccess(feature = null) {
    // Verificar en sistema de códigos promocionales
    const status = this.getPremiumStatus();
    if (status.isPremium === true) return true;

    // Verificar también en PremiumManager si existe
    if (window.premiumManager && window.premiumManager.isPremiumActive()) {
      return true;
    }

    // Verificar en localStorage de premium_anonymous
    try {
      const premiumData = localStorage.getItem('premium_anonymous');
      if (premiumData) {
        const data = JSON.parse(premiumData);
        return data.isPremium === true;
      }
    } catch (e) {
      console.error('Error checking premium status:', e);
    }

    return false;
  }

  // ========================================
  // OBTENER DÍAS RESTANTES
  // ========================================
  getDaysRemaining() {
    const status = this.getPremiumStatus();

    if (!status.isPremium || status.type !== 'trial') {
      return 0;
    }

    return status.daysRemaining || 0;
  }

  // ========================================
  // FORMATEAR FECHA DE EXPIRACIÓN
  // ========================================
  getExpirationDate() {
    const status = this.getPremiumStatus();

    if (!status.isPremium || !status.expiresAt) {
      return null;
    }

    const date = new Date(status.expiresAt);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ========================================
  // MOSTRAR MODAL DE INGRESO DE CÓDIGO
  // ========================================
  showPromoCodeModal() {
    const modal = document.getElementById('promoCodeModal');
    if (modal) {
      modal.classList.add('active');
    }
  }

  closePromoCodeModal() {
    const modal = document.getElementById('promoCodeModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // ========================================
  // PROCESAR INGRESO DE CÓDIGO DESDE UI
  // ========================================
  handlePromoCodeSubmit() {
    const input = document.getElementById('promoCodeInput');
    if (!input) return;

    const code = input.value.trim();

    if (!code) {
      this.showPromoMessage('⚠️ Por favor ingresa un código.', 'warning');
      return;
    }

    const result = this.validateAndActivateCode(code);

    if (result.success) {
      this.showPromoMessage(result.message, 'success');

      // Limpiar input
      input.value = '';

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        this.closePromoCodeModal();

        // Actualizar UI Premium
        if (typeof updatePremiumUI === 'function') {
          updatePremiumUI();
        }

        // Recargar página para aplicar cambios
        setTimeout(() => {
          location.reload();
        }, 1000);
      }, 2000);
    } else {
      this.showPromoMessage(result.message, 'error');
    }
  }

  // ========================================
  // MOSTRAR MENSAJES
  // ========================================
  showPromoMessage(message, type = 'info') {
    const messageEl = document.getElementById('promoCodeMessage');
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.className = `promo-message promo-message--${type}`;
    messageEl.style.display = 'block';

    // Ocultar después de 5 segundos si es error
    if (type === 'error' || type === 'warning') {
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 5000);
    }
  }
}

// ========================================
// FUNCIONES GLOBALES DE UTILIDAD
// ========================================

// Función para abrir modal de código promocional
function openPromoCodeModal() {
  const promoSystem = window.promoCodesSystem || new PromoCodesSystem();
  promoSystem.showPromoCodeModal();
}

// Función para cerrar modal
function closePromoCodeModal() {
  const promoSystem = window.promoCodesSystem || new PromoCodesSystem();
  promoSystem.closePromoCodeModal();
}

// Función para activar código (llamada desde formulario)
function activatePromoCode() {
  const promoSystem = window.promoCodesSystem || new PromoCodesSystem();
  promoSystem.handlePromoCodeSubmit();
}

// Verificar si usuario tiene acceso Pro
function isPremiumUser() {
  const promoSystem = window.promoCodesSystem || new PromoCodesSystem();
  return promoSystem.hasProAccess();
}

// Obtener días restantes de trial
function getTrialDaysRemaining() {
  const promoSystem = window.promoCodesSystem || new PromoCodesSystem();
  return promoSystem.getDaysRemaining();
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar sistema de códigos promocionales
  window.promoCodesSystem = new PromoCodesSystem();

  // Hacer disponible globalmente
  window.isPremiumUser = isPremiumUser;
  window.getTrialDaysRemaining = getTrialDaysRemaining;

  console.log('✅ Sistema de códigos promocionales cargado');
});
