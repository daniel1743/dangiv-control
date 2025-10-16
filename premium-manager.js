// ========================================
// PREMIUM MANAGER
// Sistema de gestión de suscripciones y límites
// ========================================

class PremiumManager {
  constructor(userId) {
    this.userId = userId || 'anonymous';
    this.storageKey = `premium_${this.userId}`;
    this.data = this.load();
  }

  // ========================================
  // GESTIÓN DE ALMACENAMIENTO
  // ========================================
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const data = stored ? JSON.parse(stored) : this.getDefaultData();

      // Resetear contador si es un nuevo día
      const today = new Date().toDateString();
      if (data.lastResetDate !== today) {
        data.messagesCount = 0;
        data.lastResetDate = today;
        this.save(data);
      }

      // Verificar si la suscripción expiró
      this.checkPremiumExpiry(data);

      return data;
    } catch (error) {
      console.error('Error cargando datos de premium:', error);
      return this.getDefaultData();
    }
  }

  getDefaultData() {
    return {
      isPremium: false,
      messagesCount: 0,
      messagesLimit: 10,
      lastResetDate: new Date().toDateString(),
      subscriptionExpiry: null,
      subscriptionStart: null,
      plan: null, // 'monthly', 'yearly'
      features: {
        unlimitedMessages: false,
        allRecommendations: false,
        conversationalExpenses: false,
        advancedAnalysis: false,
        dataExport: false,
        prioritySupport: false
      },
      usage: {
        totalMessages: 0,
        totalRecommendationsViewed: 0,
        daysActive: 0
      }
    };
  }

  save(data = this.data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error guardando datos de premium:', error);
    }
  }

  // ========================================
  // GESTIÓN DE MENSAJES
  // ========================================
  canSendMessage() {
    if (this.data.isPremium) {
      return {
        allowed: true,
        reason: 'premium',
        remaining: '∞'
      };
    }

    const limit = this.data.messagesLimit;
    const remaining = limit - this.data.messagesCount;

    if (remaining > 0) {
      return {
        allowed: true,
        remaining: remaining,
        total: limit
      };
    }

    return {
      allowed: false,
      message: `Has alcanzado el límite de ${limit} mensajes gratis hoy. ¿Quieres Premium? 🌟`,
      nextReset: this.getNextResetTime()
    };
  }

  incrementMessageCount() {
    if (!this.data.isPremium) {
      this.data.messagesCount++;
      this.data.usage.totalMessages++;
      this.save();
    }
  }

  getMessagesRemaining() {
    if (this.data.isPremium) return '∞';
    return Math.max(0, this.data.messagesLimit - this.data.messagesCount);
  }

  getMessagesUsedToday() {
    return this.data.messagesCount;
  }

  getNextResetTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const now = new Date();
    const diff = tomorrow - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  // ========================================
  // GESTIÓN DE PREMIUM
  // ========================================
  activatePremium(durationDays = 30, plan = 'monthly') {
    const now = new Date();
    const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    this.data.isPremium = true;
    this.data.subscriptionStart = now.toISOString();
    this.data.subscriptionExpiry = expiry.toISOString();
    this.data.plan = plan;

    // Activar todas las features
    this.data.features = {
      unlimitedMessages: true,
      allRecommendations: true,
      conversationalExpenses: true,
      advancedAnalysis: true,
      dataExport: true,
      prioritySupport: true
    };

    this.save();

    console.log(`✅ Premium activado hasta ${expiry.toLocaleDateString('es-CO')}`);
    return true;
  }

  deactivatePremium() {
    this.data.isPremium = false;
    this.data.subscriptionExpiry = null;
    this.data.plan = null;

    // Desactivar features premium
    Object.keys(this.data.features).forEach(key => {
      this.data.features[key] = false;
    });

    this.save();
    console.log('❌ Premium desactivado');
  }

  checkPremiumExpiry(data) {
    if (data.isPremium && data.subscriptionExpiry) {
      const expiry = new Date(data.subscriptionExpiry);
      const now = new Date();

      if (now > expiry) {
        console.log('⏰ Suscripción Premium expirada');
        this.deactivatePremium();
        return false;
      }
    }
    return data.isPremium;
  }

  isPremiumActive() {
    return this.checkPremiumExpiry(this.data);
  }

  getDaysUntilExpiry() {
    if (!this.data.isPremium || !this.data.subscriptionExpiry) {
      return 0;
    }

    const expiry = new Date(this.data.subscriptionExpiry);
    const now = new Date();
    const diff = expiry - now;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getSubscriptionInfo() {
    if (!this.data.isPremium) {
      return {
        active: false,
        message: 'Sin suscripción activa'
      };
    }

    const daysLeft = this.getDaysUntilExpiry();
    const expiry = new Date(this.data.subscriptionExpiry);

    return {
      active: true,
      plan: this.data.plan,
      daysLeft: daysLeft,
      expiryDate: expiry.toLocaleDateString('es-CO'),
      features: this.data.features
    };
  }

  // ========================================
  // VERIFICACIÓN DE FEATURES
  // ========================================
  hasFeature(featureName) {
    return this.data.isPremium && this.data.features[featureName] === true;
  }

  canAccessFeature(featureName) {
    if (!this.hasFeature(featureName)) {
      return {
        allowed: false,
        message: `Esta función es exclusiva de Premium`,
        feature: featureName
      };
    }

    return {
      allowed: true,
      feature: featureName
    };
  }

  // ========================================
  // ESTADÍSTICAS Y ANALYTICS
  // ========================================
  getUsageStats() {
    return {
      messagesUsedToday: this.data.messagesCount,
      messagesLimit: this.data.isPremium ? '∞' : this.data.messagesLimit,
      totalMessagesAllTime: this.data.usage.totalMessages,
      recommendationsViewed: this.data.usage.totalRecommendationsViewed,
      daysActive: this.data.usage.daysActive,
      isPremium: this.data.isPremium
    };
  }

  incrementRecommendationsViewed() {
    this.data.usage.totalRecommendationsViewed++;
    this.save();
  }

  incrementDaysActive() {
    this.data.usage.daysActive++;
    this.save();
  }

  // ========================================
  // UI HELPERS
  // ========================================
  getStatusBadge() {
    if (this.data.isPremium) {
      return {
        text: 'PREMIUM',
        class: 'badge-premium',
        icon: 'fa-crown',
        color: '#FFD700'
      };
    }

    return {
      text: 'GRATIS',
      class: 'badge-free',
      icon: 'fa-star',
      color: '#999'
    };
  }

  getMessagesStatusText() {
    if (this.data.isPremium) {
      return '∞ mensajes disponibles';
    }

    const remaining = this.getMessagesRemaining();
    const total = this.data.messagesLimit;

    if (remaining === 0) {
      return `Límite alcanzado. Resetea en ${this.getNextResetTime()}`;
    }

    return `${remaining}/${total} mensajes disponibles hoy`;
  }

  shouldShowUpgradePrompt() {
    // Mostrar prompt si:
    // 1. No es premium
    // 2. Ha usado 7+ mensajes (70% del límite)
    // 3. O ha alcanzado el límite

    if (this.data.isPremium) return false;

    const usagePercent = (this.data.messagesCount / this.data.messagesLimit) * 100;

    return usagePercent >= 70;
  }

  // ========================================
  // RESET Y LIMPIEZA
  // ========================================
  resetDailyLimits() {
    this.data.messagesCount = 0;
    this.data.lastResetDate = new Date().toDateString();
    this.save();
    console.log('🔄 Límites diarios reseteados');
  }

  clearAllData() {
    localStorage.removeItem(this.storageKey);
    this.data = this.getDefaultData();
    console.log('🗑️ Datos de premium eliminados');
  }
}

// ========================================
// INSTANCIA GLOBAL
// ========================================
window.PremiumManager = PremiumManager;

// Crear instancia global si financeApp existe
if (window.financeApp && window.financeApp.currentUser) {
  window.premiumManager = new PremiumManager(window.financeApp.currentUser);
  console.log('✅ PremiumManager inicializado para:', window.financeApp.currentUser);
}

console.log('✅ PremiumManager loaded');
