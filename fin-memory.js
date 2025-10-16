// ========================================
// FIN MEMORY SYSTEM
// Sistema de memoria persistente para personalización
// ========================================

class FinMemory {
  constructor(userId) {
    this.userId = userId || 'anonymous';
    this.storageKey = `fin_memory_${this.userId}`;
    this.memory = this.load();
  }

  // ========================================
  // GESTIÓN DE ALMACENAMIENTO
  // ========================================
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : this.getDefaultMemory();
    } catch (error) {
      console.error('Error cargando memoria de Fin:', error);
      return this.getDefaultMemory();
    }
  }

  getDefaultMemory() {
    return {
      userName: '',
      preferences: {},
      conversationHistory: [],
      lastInteraction: null,
      topicsDiscussed: [],
      userGoals: [],
      financialInsights: [],
      interactionCount: 0
    };
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.memory));
    } catch (error) {
      console.error('Error guardando memoria de Fin:', error);
    }
  }

  // ========================================
  // GESTIÓN DE NOMBRE Y PERFIL
  // ========================================
  setUserName(name) {
    if (name && name !== 'Usuario' && name !== '') {
      this.memory.userName = name;
      this.save();
    }
  }

  getUserName() {
    return this.memory.userName || 'Usuario';
  }

  // ========================================
  // GESTIÓN DE CONVERSACIONES
  // ========================================
  addInteraction(userMessage, finResponse) {
    this.memory.conversationHistory.push({
      timestamp: Date.now(),
      user: userMessage,
      fin: finResponse
    });

    // Solo guardar últimas 20 interacciones (ahorro de espacio)
    if (this.memory.conversationHistory.length > 20) {
      this.memory.conversationHistory = this.memory.conversationHistory.slice(-20);
    }

    this.memory.lastInteraction = Date.now();
    this.memory.interactionCount++;
    this.save();
  }

  getLastInteraction() {
    if (this.memory.conversationHistory.length === 0) {
      return null;
    }
    return this.memory.conversationHistory[this.memory.conversationHistory.length - 1];
  }

  // ========================================
  // GENERACIÓN DE CONTEXTO PARA PROMPTS
  // ========================================
  getContextPrompt() {
    const userName = this.getUserName();
    const lastInteraction = this.memory.lastInteraction;
    const topicsDiscussed = this.memory.topicsDiscussed;

    let context = `Usuario: ${userName}\n`;

    // Determinar saludo según tiempo desde última interacción
    if (lastInteraction) {
      const hoursSince = (Date.now() - lastInteraction) / (1000 * 60 * 60);

      if (hoursSince > 24) {
        context += `Saludo: "¡${userName}! ¿Cómo has estado? 😊"\n`;
      } else if (hoursSince > 4) {
        context += `Saludo: "¡Hola de nuevo, ${userName}! 👋"\n`;
      } else if (this.memory.interactionCount > 0) {
        context += `Saludo: "${userName}, ¿en qué más te ayudo?"\n`;
      }
    } else {
      context += `Saludo: "¡Hola ${userName}! Soy Fin, tu coach financiero 🎯"\n`;
    }

    // Temas previos (para evitar repeticiones)
    if (topicsDiscussed.length > 0) {
      context += `Temas ya discutidos: ${topicsDiscussed.slice(-5).join(', ')}\n`;
    }

    // Número de interacciones (para ajustar tono)
    if (this.memory.interactionCount > 10) {
      context += `Nota: Usuario frecuente, tono más familiar\n`;
    } else if (this.memory.interactionCount === 0) {
      context += `Nota: Primera interacción, tono amigable pero profesional\n`;
    }

    return context;
  }

  // ========================================
  // GESTIÓN DE TEMAS DISCUTIDOS
  // ========================================
  markTopicDiscussed(topic) {
    if (!this.memory.topicsDiscussed.includes(topic)) {
      this.memory.topicsDiscussed.push(topic);

      // Limitar a últimos 10 temas
      if (this.memory.topicsDiscussed.length > 10) {
        this.memory.topicsDiscussed = this.memory.topicsDiscussed.slice(-10);
      }

      this.save();
    }
  }

  getTopicsDiscussed() {
    return this.memory.topicsDiscussed;
  }

  // ========================================
  // GESTIÓN DE INSIGHTS FINANCIEROS
  // ========================================
  addFinancialInsight(insight) {
    this.memory.financialInsights.push({
      timestamp: Date.now(),
      insight: insight
    });

    // Limitar a últimos 5 insights
    if (this.memory.financialInsights.length > 5) {
      this.memory.financialInsights = this.memory.financialInsights.slice(-5);
    }

    this.save();
  }

  getRecentInsights() {
    return this.memory.financialInsights.map(i => i.insight);
  }

  // ========================================
  // ESTADÍSTICAS
  // ========================================
  getStats() {
    return {
      interactionCount: this.memory.interactionCount,
      topicsCount: this.memory.topicsDiscussed.length,
      lastSeen: this.memory.lastInteraction ? new Date(this.memory.lastInteraction).toLocaleString('es-CO') : 'Nunca',
      daysSinceFirstInteraction: this.memory.conversationHistory.length > 0
        ? Math.floor((Date.now() - this.memory.conversationHistory[0].timestamp) / (1000 * 60 * 60 * 24))
        : 0
    };
  }

  // ========================================
  // LIMPIEZA Y RESET
  // ========================================
  clearHistory() {
    this.memory.conversationHistory = [];
    this.memory.topicsDiscussed = [];
    this.memory.lastInteraction = null;
    this.memory.interactionCount = 0;
    this.save();
  }

  reset() {
    localStorage.removeItem(this.storageKey);
    this.memory = this.getDefaultMemory();
  }

  // ========================================
  // ANÁLISIS DE COMPORTAMIENTO
  // ========================================
  isFrequentUser() {
    return this.memory.interactionCount > 10;
  }

  isNewUser() {
    return this.memory.interactionCount === 0;
  }

  getHoursSinceLastInteraction() {
    if (!this.memory.lastInteraction) return Infinity;
    return (Date.now() - this.memory.lastInteraction) / (1000 * 60 * 60);
  }

  shouldUseInformalTone() {
    // Usar tono informal si es usuario frecuente y ha interactuado recientemente
    return this.isFrequentUser() && this.getHoursSinceLastInteraction() < 4;
  }
}

// Exponer globalmente
window.FinMemory = FinMemory;

console.log('✅ FinMemory system loaded');
