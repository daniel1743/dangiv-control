// ========================================
// BOOST MESSAGES MANAGER
// Sistema de mensajes motivacionales generados por IA
// Se actualiza cada 12 horas automáticamente
// ========================================

class BoostMessagesManager {
  constructor(financeApp) {
    this.app = financeApp;
    this.geminiApiKey = null;
    this.cacheKey = 'boostMessagesCache';
    this.cacheExpiryHours = 12; // Actualizar cada 12 horas
    this.updateInterval = null;

    // Temas para cada tarjeta
    this.cardThemes = {
      ai: {
        title: 'IA Financiera',
        topics: [
          'recomendaciones inteligentes',
          'análisis automático de gastos',
          'insights financieros personalizados',
          'optimización de presupuesto',
          'predicciones financieras'
        ]
      },
      achievements: {
        title: 'Sistema de Logros',
        topics: [
          'gamificación financiera',
          'logros y metas alcanzadas',
          'motivación para ahorrar',
          'recompensas por buen manejo financiero',
          'progreso y crecimiento'
        ]
      },
      security: {
        title: 'Seguridad Total',
        topics: [
          'protección de datos',
          'seguridad bancaria',
          'privacidad financiera',
          'encriptación de información',
          'confianza y tranquilidad'
        ]
      }
    };

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

    // Cargar mensajes desde caché o generar nuevos
    this.loadBoostMessages();

    // Configurar actualización automática cada 12 horas
    this.setupAutoUpdate();
  }

  // ========================================
  // GESTIÓN DE CACHÉ
  // ========================================
  getCachedMessages() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();
      const expiryTime = this.cacheExpiryHours * 60 * 60 * 1000; // 12 horas en ms

      // Verificar si el caché ha expirado
      if (now - data.timestamp > expiryTime) {
        console.log('⏰ Caché de boost messages expirado (12h)');
        return null;
      }

      console.log('✅ Usando boost messages en caché');
      return data.messages;

    } catch (error) {
      console.error('Error leyendo caché de boost messages:', error);
      return null;
    }
  }

  saveCachedMessages(messages) {
    try {
      const data = {
        timestamp: Date.now(),
        messages: messages
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(data));
      console.log('💾 Boost messages guardados en caché (válido por 12h)');

    } catch (error) {
      console.error('Error guardando caché de boost messages:', error);
    }
  }

  clearCache() {
    localStorage.removeItem(this.cacheKey);
    console.log('🗑️ Caché de boost messages limpiado');
  }

  // ========================================
  // CARGA DE MENSAJES
  // ========================================
  async loadBoostMessages() {
    // Intentar cargar desde caché primero
    const cached = this.getCachedMessages();

    if (cached && Object.keys(cached).length === 3) {
      this.renderBoostMessages(cached);
      return;
    }

    // Si no hay caché válido, generar nuevos mensajes
    await this.generateBoostMessages();
  }

  // ========================================
  // GENERACIÓN CON IA (GEMINI)
  // ========================================
  async generateBoostMessages() {
    if (!this.geminiApiKey) {
      console.warn('⚠️ No hay API Key de Gemini disponible, usando mensajes genéricos');
      this.renderBoostMessages(this.getGenericMessages());
      return;
    }

    try {
      const messages = await this.generateAIBoostMessages();

      if (messages && Object.keys(messages).length === 3) {
        this.saveCachedMessages(messages);
        this.renderBoostMessages(messages);
      } else {
        // Fallback a mensajes genéricos
        this.renderBoostMessages(this.getGenericMessages());
      }

    } catch (error) {
      console.error('Error generando boost messages con IA:', error);
      this.renderBoostMessages(this.getGenericMessages());
    }
  }

  async generateAIBoostMessages() {
    const userName = this.app.userProfile?.name || 'Usuario';
    const userContext = this.prepareUserContext();

    const prompt = `Eres Fin, un coach financiero motivacional y empático.

Genera 3 mensajes motivacionales cortos (máximo 50 caracteres cada uno) para las siguientes tarjetas:

1. **IA Financiera**: Mensaje sobre inteligencia artificial financiera, análisis automático, recomendaciones inteligentes.
2. **Sistema de Logros**: Mensaje sobre gamificación, logros, motivación, progreso financiero.
3. **Seguridad Total**: Mensaje sobre protección, seguridad bancaria, privacidad, confianza.

CONTEXTO DEL USUARIO:
${userContext}

REQUISITOS:
- Cada mensaje debe ser motivacional e inspirador
- Máximo 50 caracteres por mensaje
- Usa el nombre del usuario: "${userName}"
- Incluye un emoji relevante al final
- Los mensajes deben ser diferentes y únicos
- Tono positivo y alentador

FORMATO: Responde SOLO con el JSON (sin markdown, sin \`\`\`json):
{
  "ai": "Mensaje para IA Financiera",
  "achievements": "Mensaje para Sistema de Logros",
  "security": "Mensaje para Seguridad Total"
}`;

    try {
      const result = await this.callGeminiAPI(prompt);

      if (result && typeof result === 'object' && result.ai && result.achievements && result.security) {
        console.log('✅ IA generó boost messages personalizados');
        return result;
      }

      console.warn('⚠️ IA no devolvió formato válido');
      return null;

    } catch (error) {
      console.error('Error en generateAIBoostMessages:', error);
      return null;
    }
  }

  prepareUserContext() {
    const userName = this.app.userProfile?.name || 'Usuario';
    const monthlyIncome = this.app.monthlyIncome || 0;
    const expenses = this.app.expenses || [];
    const goals = this.app.goals || [];

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const availableBalance = monthlyIncome - totalExpenses;
    const activeGoals = goals.filter(g => !g.completed).length;
    const completedGoals = goals.filter(g => g.completed).length;

    return `
- Nombre: ${userName}
- Ingreso mensual: $${monthlyIncome.toLocaleString('es-CO')}
- Total gastos: ${expenses.length}
- Balance disponible: $${availableBalance.toLocaleString('es-CO')}
- Metas activas: ${activeGoals}
- Metas completadas: ${completedGoals}
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
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
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

      // Buscar el objeto JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      // Parsear JSON
      const parsed = JSON.parse(text);

      if (parsed && typeof parsed === 'object') {
        return parsed;
      }

      return null;

    } catch (error) {
      console.error('Error llamando a Gemini API:', error);
      throw error;
    }
  }

  // ========================================
  // MENSAJES GENÉRICOS (FALLBACK)
  // ========================================
  getGenericMessages() {
    const userName = this.app.userProfile?.name || 'Usuario';
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'mañana' : hour < 18 ? 'tarde' : 'noche';

    // Mensajes variados según la hora del día
    const aiMessages = [
      `${userName}, tu IA analiza tus finanzas ahora 🤖`,
      `Insights inteligentes para ${userName} 💡`,
      `Análisis automático activo para ti 🧠`,
      `${userName}, tu asistente financiero está listo ⚡`
    ];

    const achievementMessages = [
      `${userName}, sigue alcanzando tus metas 🏆`,
      `¡Cada logro cuenta, ${userName}! 🎯`,
      `Progreso constante, ${userName} 📈`,
      `${userName}, estás construyendo tu futuro 💪`
    ];

    const securityMessages = [
      `Tus datos están protegidos, ${userName} 🛡️`,
      `Seguridad bancaria para ${userName} 🔒`,
      `Privacidad total garantizada 🔐`,
      `${userName}, tu información está segura ✅`
    ];

    // Seleccionar mensaje según índice basado en la hora
    const index = Math.floor(hour / 6) % 4;

    return {
      ai: aiMessages[index],
      achievements: achievementMessages[index],
      security: securityMessages[index]
    };
  }

  // ========================================
  // RENDERIZADO
  // ========================================
  renderBoostMessages(messages) {
    // Actualizar mensaje de IA Financiera
    const aiElement = document.getElementById('boostMessage-ai');
    if (aiElement && messages.ai) {
      aiElement.textContent = messages.ai;
      this.animateUpdate(aiElement);
    }

    // Actualizar mensaje de Sistema de Logros
    const achievementsElement = document.getElementById('boostMessage-achievements');
    if (achievementsElement && messages.achievements) {
      achievementsElement.textContent = messages.achievements;
      this.animateUpdate(achievementsElement);
    }

    // Actualizar mensaje de Seguridad
    const securityElement = document.getElementById('boostMessage-security');
    if (securityElement && messages.security) {
      securityElement.textContent = messages.security;
      this.animateUpdate(securityElement);
    }

    console.log('✨ Boost messages actualizados:', messages);
  }

  animateUpdate(element) {
    if (!element) return;

    // Agregar clase de animación
    element.style.opacity = '0';
    element.style.transform = 'translateY(-10px)';
    element.style.transition = 'all 0.3s ease';

    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 50);
  }

  // ========================================
  // ACTUALIZACIÓN AUTOMÁTICA
  // ========================================
  setupAutoUpdate() {
    // Limpiar intervalo anterior si existe
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    // Calcular tiempo hasta la próxima actualización (12 horas)
    const now = Date.now();
    const cached = this.getCachedMessages();
    
    let nextUpdateTime;
    if (cached) {
      // Si hay caché, actualizar 12 horas después de la última actualización
      try {
        const cacheData = JSON.parse(localStorage.getItem(this.cacheKey));
        nextUpdateTime = cacheData.timestamp + (this.cacheExpiryHours * 60 * 60 * 1000);
      } catch (e) {
        // Si hay error, actualizar en 12 horas desde ahora
        nextUpdateTime = now + (this.cacheExpiryHours * 60 * 60 * 1000);
      }
    } else {
      // Si no hay caché, actualizar en 12 horas desde ahora
      nextUpdateTime = now + (this.cacheExpiryHours * 60 * 60 * 1000);
    }

    const timeUntilUpdate = nextUpdateTime - now;

    // Si ya pasó el tiempo, actualizar inmediatamente
    if (timeUntilUpdate <= 0) {
      this.generateBoostMessages();
      // Configurar intervalo para próximas actualizaciones
      this.updateInterval = setInterval(() => {
        this.generateBoostMessages();
      }, this.cacheExpiryHours * 60 * 60 * 1000);
    } else {
      // Programar actualización para el momento correcto
      setTimeout(() => {
        this.generateBoostMessages();
        // Configurar intervalo para próximas actualizaciones
        this.updateInterval = setInterval(() => {
          this.generateBoostMessages();
        }, this.cacheExpiryHours * 60 * 60 * 1000);
      }, timeUntilUpdate);
    }

    const minutesUntilUpdate = Math.round(timeUntilUpdate / 1000 / 60);
    const hoursUntilUpdate = Math.round(minutesUntilUpdate / 60);
    
    if (hoursUntilUpdate > 0) {
      console.log(`⏰ Próxima actualización de boost messages en ${hoursUntilUpdate} horas`);
    } else {
      console.log(`⏰ Próxima actualización de boost messages en ${minutesUntilUpdate} minutos`);
    }
  }

  // ========================================
  // MÉTODOS PÚBLICOS
  // ========================================
  refresh() {
    this.clearCache();
    this.generateBoostMessages();
  }

  async forceRegenerate() {
    this.clearCache();
    await this.generateBoostMessages();
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Exponer globalmente
window.BoostMessagesManager = BoostMessagesManager;

