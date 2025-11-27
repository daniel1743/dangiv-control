// ========================================
// AI RECOMMENDATIONS MANAGER
// Sistema de recomendaciones personalizadas con IA
// ========================================

class AIRecommendationsManager {
  constructor(financeApp) {
    this.app = financeApp;
    this.geminiApiKey = null;
    this.cacheKey = 'aiRecommendationsCache';
    this.cacheExpiryHours = 48; // Actualizar cada 48 horas
    this.isLoadingMore = false;
    this.displayedRecommendations = [];
    this.allRecommendations = [];
    this.currentIndex = 0;
    this.recommendationsPerLoad = 3;

    this.init();
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================
  init() {
    // Obtener API key desde window.FB
    if (window.FB && window.FB.geminiApiKey) {
      this.geminiApiKey = window.FB.geminiApiKey;
    }

    // Cargar recomendaciones desde caché o generar nuevas
    this.loadRecommendations();
  }

  // ========================================
  // GESTIÓN DE CACHÉ
  // ========================================
  getCachedRecommendations() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();
      const expiryTime = this.cacheExpiryHours * 60 * 60 * 1000; // 48 horas en ms

      // Verificar si el caché ha expirado
      if (now - data.timestamp > expiryTime) {
        console.log('⏰ Caché de recomendaciones expirado (48h)');
        return null;
      }

      // Verificar si los datos del usuario han cambiado significativamente
      if (!this.isCacheStillValid(data.userSnapshot)) {
        console.log('📊 Datos del usuario cambiaron, regenerando recomendaciones');
        return null;
      }

      console.log('✅ Usando recomendaciones en caché');
      return data.recommendations;

    } catch (error) {
      console.error('Error leyendo caché:', error);
      return null;
    }
  }

  saveCachedRecommendations(recommendations) {
    try {
      const data = {
        timestamp: Date.now(),
        recommendations: recommendations,
        userSnapshot: this.getUserSnapshot()
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(data));
      console.log('💾 Recomendaciones guardadas en caché (válido por 48h)');

    } catch (error) {
      console.error('Error guardando caché:', error);
    }
  }

  getUserSnapshot() {
    // Crear snapshot de los datos relevantes del usuario
    return {
      expenseCount: this.app.expenses.length,
      goalCount: this.app.goals.length,
      monthlyIncome: this.app.monthlyIncome,
      totalExpenses: this.app.expenses.reduce((sum, exp) => sum + exp.amount, 0),
      userName: this.app.userProfile.name
    };
  }

  isCacheStillValid(cachedSnapshot) {
    if (!cachedSnapshot) return false;

    const currentSnapshot = this.getUserSnapshot();

    // Considerar caché inválido si hay cambios significativos
    const expensesDiff = Math.abs(currentSnapshot.expenseCount - cachedSnapshot.expenseCount);
    const goalsDiff = Math.abs(currentSnapshot.goalCount - cachedSnapshot.goalCount);
    const incomeDiff = Math.abs(currentSnapshot.monthlyIncome - cachedSnapshot.monthlyIncome);

    // Invalidar si hay más de 10 gastos nuevos, 2 metas nuevas, o cambio de ingreso
    return expensesDiff < 10 && goalsDiff < 2 && incomeDiff < 100000;
  }

  clearCache() {
    localStorage.removeItem(this.cacheKey);
    console.log('🗑️ Caché de recomendaciones limpiado');
  }

  // ========================================
  // CARGA DE RECOMENDACIONES
  // ========================================
  async loadRecommendations() {
    // Intentar cargar desde caché primero
    const cached = this.getCachedRecommendations();

    if (cached && cached.length > 0) {
      this.allRecommendations = cached;
      this.renderRecommendations();
      return;
    }

    // Si no hay caché válido, generar nuevas recomendaciones
    await this.generateRecommendations();
  }

  async generateRecommendations() {
    // Verificar si hay datos del usuario
    const hasData = this.app.expenses.length > 0 || this.app.goals.length > 0;

    if (!hasData || !this.geminiApiKey) {
      // Usar recomendaciones genéricas si no hay datos o API key
      this.allRecommendations = this.getGenericRecommendations();
      this.renderRecommendations();
      return;
    }

    // Generar recomendaciones personalizadas con IA
    try {
      const recommendations = await this.generateAIRecommendations();

      if (recommendations && recommendations.length > 0) {
        this.allRecommendations = recommendations;
        this.saveCachedRecommendations(recommendations);
      } else {
        // Fallback a recomendaciones genéricas
        this.allRecommendations = this.getGenericRecommendations();
      }

      this.renderRecommendations();

    } catch (error) {
      console.error('Error generando recomendaciones con IA:', error);
      this.allRecommendations = this.getGenericRecommendations();
      this.renderRecommendations();
    }
  }

  // ========================================
  // GENERACIÓN CON IA (GEMINI)
  // ========================================
  async generateAIRecommendations() {
    if (!this.geminiApiKey) {
      console.warn('⚠️ No hay API Key de Gemini disponible');
      return null;
    }

    // Preparar contexto del usuario
    const context = this.prepareUserContext();

    const prompt = `Eres Fin, coach financiero experto y empático de ${this.app.userProfile.name || 'Usuario'}.

Analiza los datos y genera 10 recomendaciones de ahorro. Las 3 PRIMERAS deben ser las MÁS VALIOSAS e IMPACTANTES.

DATOS DEL USUARIO:
${context}

ORDEN DE PRIORIDAD (CRÍTICO):

Recomendaciones 1-3 (GRATIS - Las mejores):
- ✅ Problemas URGENTES o gastos muy altos
- ✅ Oportunidades de ahorro GRANDE (>$100,000/mes)
- ✅ Alertas críticas sobre presupuesto
- ✅ Metas próximas a vencer
Ejemplo: "${this.app.userProfile.name}, gastas $850K en Alimentación (40% sobre promedio). Reducir 25% = $212K/mes ahorrados 🎯"

Recomendaciones 4-7 (PREMIUM - Importantes):
- Optimizaciones significativas
- Mejoras en categorías medianas
- Consejos sobre metas a largo plazo

Recomendaciones 8-10 (PREMIUM - Útiles):
- Tips generales
- Hábitos financieros
- Motivación

FORMATO:
- Máximo 2 líneas por recomendación
- Usa el nombre: "${this.app.userProfile.name}"
- Incluye números específicos ($, %, fechas)
- Un emoji relevante al final

IMPORTANTE: Responde SOLO con el array JSON (sin markdown, sin \`\`\`json):
[
  "Recomendación crítica 1...",
  "Recomendación crítica 2...",
  "Recomendación crítica 3...",
  ...
]`;

    try {
      const result = await this.callGeminiAPI(prompt);

      if (Array.isArray(result) && result.length > 0) {
        console.log(`✅ IA generó ${result.length} recomendaciones personalizadas`);
        return result;
      }

      console.warn('⚠️ IA no devolvió array válido');
      return null;

    } catch (error) {
      console.error('Error en generateAIRecommendations:', error);
      return null;
    }
  }

  prepareUserContext() {
    const userName = this.app.userProfile.name || 'Usuario';
    const monthlyIncome = this.app.monthlyIncome || 0;
    const expenses = this.app.expenses || [];
    const goals = this.app.goals || [];

    // Calcular estadísticas
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const availableBalance = monthlyIncome - totalExpenses;
    const savingsRate = monthlyIncome > 0 ? ((availableBalance / monthlyIncome) * 100).toFixed(1) : 0;

    // Categorías principales
    const categoryTotals = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, total]) => `${cat}: $${total.toLocaleString('es-CO')}`);

    // Metas activas
    const activeGoals = goals.filter(g => !g.completed).length;

    return `
- Nombre: ${userName}
- Ingreso mensual: $${monthlyIncome.toLocaleString('es-CO')}
- Total gastos registrados: ${expenses.length}
- Gasto total: $${totalExpenses.toLocaleString('es-CO')}
- Gasto promedio: $${avgExpense.toLocaleString('es-CO')}
- Balance disponible: $${availableBalance.toLocaleString('es-CO')}
- Tasa de ahorro actual: ${savingsRate}%
- Categorías principales: ${topCategories.join(', ') || 'Sin datos'}
- Metas activas: ${activeGoals}
`.trim();
  }

  async callGeminiAPI(prompt) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let text = data.candidates[0].content.parts[0].text;

      // Limpiar la respuesta
      text = text.trim();
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      // Buscar el array JSON
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        text = arrayMatch[0];
      }

      // Parsear JSON
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed;
      }

      return null;

    } catch (error) {
      console.error('Error llamando a Gemini API:', error);
      throw error;
    }
  }

  // ========================================
  // RECOMENDACIONES GENÉRICAS (FALLBACK)
  // ========================================
  getGenericRecommendations() {
    const userName = this.app.userProfile.name || 'Usuario';

    return [
      `${userName}, registra todos tus gastos diarios, incluso los pequeños. ¡Cada peso cuenta! 💰`,
      `Establece una meta de ahorro mensual del 20% de tus ingresos, ${userName}. Tu yo futuro te lo agradecerá. 🎯`,
      `Revisa tus gastos semanalmente para identificar patrones, ${userName}. El conocimiento es poder financiero. 📊`,
      `Crea un fondo de emergencia de 3-6 meses de gastos, ${userName}. La tranquilidad no tiene precio. 🛡️`,
      `${userName}, antes de comprar algo, espera 24 horas. Evitarás compras impulsivas y ahorrarás más. ⏰`,
      `Automatiza tus ahorros configurando transferencias automáticas, ${userName}. ¡Ahorra sin pensar! 🤖`,
      `Reduce gastos hormiga como café diario o suscripciones no usadas, ${userName}. Pequeños cambios, grandes resultados. ☕`,
      `${userName}, negocia tus facturas de servicios cada año. Podrías ahorrar hasta un 30%. 📱`,
      `Cocina en casa más seguido, ${userName}. Ahorrarás dinero y comerás más saludable. 🍳`,
      `Celebra tus logros financieros, ${userName}. ¡La motivación es clave para el éxito! 🎉`
    ];
  }

  // ========================================
  // RENDERIZADO CON SCROLL INFINITO
  // ========================================
  renderRecommendations() {
    const container = document.getElementById('aiRecommendations');
    if (!container) return;

    // Limpiar contenedor
    container.innerHTML = '';

    // Resetear índices
    this.currentIndex = 0;
    this.displayedRecommendations = [];

    // Crear contenedor de scroll
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'ai-recommendations-scroll';
    scrollContainer.id = 'aiRecommendationsScroll';

    container.appendChild(scrollContainer);

    // Verificar si es usuario Premium
    const isPremium = window.premiumManager?.data?.isPremium || false;
    const freeCount = 3;

    // Renderizar solo las 3 recomendaciones gratis (primeras 3)
    const freeRecommendations = this.allRecommendations.slice(0, freeCount);
    freeRecommendations.forEach((rec, index) => {
      setTimeout(() => {
        const card = this.createRecommendationCard(rec, index);
        scrollContainer.appendChild(card);
        setTimeout(() => card.classList.add('visible'), 50);
      }, index * 100);
    });

    // Si es premium, mostrar todas normalmente con scroll infinito
    if (isPremium && this.allRecommendations.length > freeCount) {
      this.currentIndex = freeCount;
      this.setupInfiniteScroll(scrollContainer);
    }
    
    // NOTA: Las cards premium bloqueadas ya no se muestran
    // Solo se muestran las 3 recomendaciones gratuitas

    // Mostrar tarjeta padre
    const parentCard = container.closest('.card');
    if (parentCard) {
      parentCard.classList.remove('hidden');
    }
  }

  loadMoreRecommendations() {
    if (this.isLoadingMore) return;
    if (this.currentIndex >= this.allRecommendations.length) {
      // Ya mostramos todas, volver al inicio (scroll infinito circular)
      this.currentIndex = 0;
    }

    this.isLoadingMore = true;

    const scrollContainer = document.getElementById('aiRecommendationsScroll');
    if (!scrollContainer) return;

    // Obtener siguiente batch de recomendaciones
    const batch = this.allRecommendations.slice(
      this.currentIndex,
      this.currentIndex + this.recommendationsPerLoad
    );

    // Si llegamos al final, agregar del inicio
    if (batch.length < this.recommendationsPerLoad) {
      const remaining = this.recommendationsPerLoad - batch.length;
      const fromStart = this.allRecommendations.slice(0, remaining);
      batch.push(...fromStart);
    }

    // Renderizar cada recomendación con animación
    batch.forEach((recommendation, index) => {
      setTimeout(() => {
        const card = this.createRecommendationCard(recommendation, this.currentIndex + index);
        scrollContainer.appendChild(card);

        // Animar entrada
        setTimeout(() => {
          card.classList.add('visible');
        }, 50);

      }, index * 100); // Delay escalonado
    });

    this.currentIndex += batch.length;
    this.isLoadingMore = false;
  }

  createRecommendationCard(recommendation, index) {
    const card = document.createElement('div');
    card.className = 'ai-recommendation-card';
    card.setAttribute('data-index', index);

    card.innerHTML = `
      <div class="ai-rec-icon">
        <img src="img/FIN.png" alt="Fin" class="fin-avatar">
      </div>
      <div class="ai-rec-content">
        <div class="ai-rec-header">
          <h5>Consejo Personalizado #${index + 1}</h5>
          <span class="ai-badge">IA</span>
        </div>
        <p>${recommendation}</p>
      </div>
    `;

    return card;
  }

  createLockedCard(recommendation, index) {
    const card = document.createElement('div');
    card.className = 'ai-recommendation-card locked';
    card.setAttribute('data-index', index);

    // Ofuscar el texto de la recomendación
    const preview = recommendation.substring(0, 30) + '...';

    card.innerHTML = `
      <div class="ai-rec-icon locked">
        <i class="fas fa-lock"></i>
      </div>
      <div class="ai-rec-content blurred">
        <div class="ai-rec-header">
          <h5>Consejo Premium #${index + 1}</h5>
          <span class="ai-badge premium">PRO</span>
        </div>
        <p>${preview}</p>
      </div>
      <button class="unlock-btn" onclick="showPremiumUpgradeModal()">
        <i class="fas fa-crown"></i> Desbloquear
      </button>
    `;

    return card;
  }

  setupInfiniteScroll(scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      // Detectar si llegamos al final
      const scrollPosition = scrollContainer.scrollTop + scrollContainer.clientHeight;
      const scrollHeight = scrollContainer.scrollHeight;

      // Cargar más cuando estamos a 100px del final
      if (scrollHeight - scrollPosition < 100 && !this.isLoadingMore) {
        this.loadMoreRecommendations();
      }
    });
  }

  // ========================================
  // MÉTODOS PÚBLICOS
  // ========================================
  refresh() {
    this.clearCache();
    this.loadRecommendations();
  }

  async forceRegenerate() {
    this.clearCache();
    await this.generateRecommendations();
  }
}

// Exponer globalmente
window.AIRecommendationsManager = AIRecommendationsManager;
