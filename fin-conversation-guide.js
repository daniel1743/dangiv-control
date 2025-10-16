// ========================================
// FIN CONVERSATION GUIDE
// Sistema de conversación dirigida con opciones específicas
// ========================================

class FinConversationGuide {
  constructor() {
    this.conversationFlows = {
      greeting: {
        message: (name) => `¡Hola ${name}! Soy Fin, tu coach financiero. Estoy aquí para ayudarte a mejorar tus finanzas`,
        options: [
          { text: '💰 Quiero ahorrar más', action: 'savings' },
          { text: '🛍️ Controlar compras impulsivas', action: 'impulse' },
          { text: '🎯 Crear una meta financiera', action: 'goal' },
          { text: '📊 Analizar mis gastos', action: 'analysis' }
        ]
      },

      savings: {
        message: (name) => `Perfecto ${name}. ¿Cuánto puedes ahorrar mensualmente?`,
        options: [
          { text: '$100,000 - $300,000', action: 'savings_low', value: 200000 },
          { text: '$300,000 - $500,000', action: 'savings_mid', value: 400000 },
          { text: '$500,000 - $1,000,000', action: 'savings_high', value: 750000 },
          { text: 'No estoy seguro', action: 'savings_calculate' }
        ]
      },

      savings_calculate: {
        message: (name) => `${name}, para calcular tu capacidad de ahorro necesito saber:`,
        options: [
          { text: '📥 Registrar mi ingreso mensual', action: 'input_income' },
          { text: '📤 Registrar mis gastos actuales', action: 'input_expenses' },
          { text: '🔙 Volver', action: 'savings' }
        ]
      },

      impulse: {
        message: (name) => `${name}, las compras impulsivas son el enemigo #1 del ahorro. ¿Dónde gastas más impulsivamente?`,
        options: [
          { text: '🛒 Ropa y accesorios', action: 'impulse_clothes', category: 'Compras' },
          { text: '🍔 Comida y restaurantes', action: 'impulse_food', category: 'Alimentación' },
          { text: '🎮 Entretenimiento', action: 'impulse_entertainment', category: 'Entretenimiento' },
          { text: '📦 Compras online variadas', action: 'impulse_online', category: 'Compras' }
        ]
      },

      impulse_clothes: {
        message: (name) => `${name}, te ayudaré con las compras de ropa. ¿Cuál de estas te funciona mejor?`,
        options: [
          { text: '⏰ Regla de 24 horas (esperar antes de comprar)', action: 'strategy_wait' },
          { text: '💵 Presupuesto mensual fijo para ropa', action: 'strategy_budget' },
          { text: '📝 Lista de necesidades vs deseos', action: 'strategy_list' },
          { text: '🚫 Bloquear apps de compras', action: 'strategy_block' }
        ]
      },

      impulse_food: {
        message: (name) => `${name}, ahorrar en comida es más fácil de lo que crees:`,
        options: [
          { text: '🏠 Cocinar en casa (ahorra 60%)', action: 'strategy_cook' },
          { text: '📅 Planificar comidas semanales', action: 'strategy_meal_plan' },
          { text: '💳 Límite diario para comida fuera', action: 'strategy_daily_limit' },
          { text: '☕ Llevar café/snacks de casa', action: 'strategy_bring' }
        ]
      },

      goal: {
        message: (name) => `Excelente ${name}. ¿Qué meta quieres alcanzar?`,
        options: [
          { text: '✈️ Viaje o vacaciones', action: 'goal_travel' },
          { text: '🏠 Comprar casa/apartamento', action: 'goal_house' },
          { text: '🚗 Comprar vehículo', action: 'goal_car' },
          { text: '💼 Fondo de emergencia', action: 'goal_emergency' },
          { text: '📚 Educación/curso', action: 'goal_education' }
        ]
      },

      goal_travel: {
        message: (name) => `${name}, ¿cuánto necesitas para tu viaje?`,
        options: [
          { text: '$1M - $3M (nacional)', action: 'goal_amount', amount: 2000000 },
          { text: '$3M - $8M (internacional)', action: 'goal_amount', amount: 5500000 },
          { text: '$8M+ (destino premium)', action: 'goal_amount', amount: 10000000 },
          { text: 'No estoy seguro', action: 'goal_research' }
        ]
      },

      analysis: {
        message: (name) => `${name}, voy a analizar tus finanzas. ¿Qué quieres revisar primero?`,
        options: [
          { text: '📊 ¿Dónde gasto más?', action: 'analysis_categories' },
          { text: '📈 ¿Cómo va mi ahorro?', action: 'analysis_savings' },
          { text: '⚠️ ¿Tengo gastos innecesarios?', action: 'analysis_unnecessary' },
          { text: '🎯 ¿Cumpliré mis metas?', action: 'analysis_goals' }
        ]
      },

      strategy_wait: {
        message: (name) => `Perfecto ${name}. La regla de 24h: cuando quieras comprar algo, espera 24h. El 80% de compras impulsivas se evitan así`,
        options: [
          { text: '✅ Activar recordatorio en app', action: 'activate_reminder' },
          { text: '📊 Ver cuánto ahorraría', action: 'calculate_savings' },
          { text: '🔙 Ver otras estrategias', action: 'impulse_clothes' }
        ]
      },

      strategy_budget: {
        message: (name) => `${name}, basado en tu ingreso, te recomiendo máximo $200,000/mes en ropa (5% de ingresos)`,
        options: [
          { text: '✅ Crear presupuesto de $200K', action: 'create_budget', amount: 200000 },
          { text: '✏️ Ajustar monto', action: 'adjust_budget' },
          { text: '🔙 Ver otras estrategias', action: 'impulse_clothes' }
        ]
      }
    };
  }

  // ========================================
  // OBTENER FLUJO DE CONVERSACIÓN
  // ========================================
  getFlow(flowName, userData = {}) {
    const flow = this.conversationFlows[flowName];
    if (!flow) {
      return this.conversationFlows.greeting;
    }

    // Generar mensaje personalizado
    const message = typeof flow.message === 'function'
      ? flow.message(userData.name || 'Usuario')
      : flow.message;

    return {
      message,
      options: flow.options,
      flowName
    };
  }

  // ========================================
  // GENERAR PROMPT PARA GEMINI
  // ========================================
  generatePromptWithOptions(flowName, userName, userContext = '') {
    const flow = this.getFlow(flowName, { name: userName });

    const prompt = `Eres Fin, coach financiero de ${userName}.

CONVERSACIÓN DIRIGIDA:
Tu trabajo es guiar a ${userName} con opciones ESPECÍFICAS, NO preguntas abiertas.

MENSAJE BASE:
${flow.message}

OPCIONES QUE DEBES DAR (elige estas EXACTAMENTE):
${flow.options.map((opt, i) => `${i + 1}. ${opt.text}`).join('\n')}

CONTEXTO DEL USUARIO:
${userContext}

IMPORTANTE:
- Respuesta: máximo 2 líneas
- Menciona el nombre: ${userName}
- Termina con: "¿Cuál opción prefieres?" o "¿Qué te gustaría hacer?"
- NO preguntes cosas abiertas como "¿Qué quieres hacer?"

RESPONDE SOLO CON EL MENSAJE (sin JSON):`;

    return prompt;
  }

  // ========================================
  // FORMATEAR OPCIONES PARA UI
  // ========================================
  formatOptionsForUI(options) {
    return options.map((opt, index) => ({
      id: index + 1,
      text: opt.text,
      action: opt.action,
      emoji: opt.text.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '•',
      data: {
        category: opt.category,
        amount: opt.amount,
        value: opt.value
      }
    }));
  }

  // ========================================
  // SISTEMA DE SUGERENCIAS RÁPIDAS
  // ========================================
  getQuickSuggestions(context = 'general') {
    const suggestions = {
      general: [
        { text: '💰 Quiero ahorrar', action: 'savings' },
        { text: '🛍️ Controlar gastos', action: 'impulse' },
        { text: '🎯 Crear meta', action: 'goal' }
      ],
      savings: [
        { text: '$200K/mes', action: 'savings_low' },
        { text: '$400K/mes', action: 'savings_mid' },
        { text: '$750K/mes', action: 'savings_high' }
      ],
      impulse: [
        { text: '🛒 Ropa', action: 'impulse_clothes' },
        { text: '🍔 Comida', action: 'impulse_food' },
        { text: '🎮 Entretenimiento', action: 'impulse_entertainment' }
      ],
      goal: [
        { text: '✈️ Viaje', action: 'goal_travel' },
        { text: '🏠 Casa', action: 'goal_house' },
        { text: '🚗 Auto', action: 'goal_car' }
      ]
    };

    return suggestions[context] || suggestions.general;
  }

  // ========================================
  // RESPUESTA A ACCIÓN DEL USUARIO
  // ========================================
  handleUserAction(action, userData = {}) {
    // Buscar el siguiente flujo basado en la acción
    const nextFlow = this.getFlow(action, userData);

    // Generar respuesta de confirmación
    const confirmations = {
      savings_low: (name) => `Perfecto ${name}. Ahorrar $200K/mes = $2.4M/año 🎯`,
      savings_mid: (name) => `Excelente ${name}. Con $400K/mes alcanzarás $4.8M/año 💪`,
      savings_high: (name) => `¡Increíble ${name}! Ahorrar $750K/mes = $9M/año 🚀`,
      impulse_clothes: (name) => `Entiendo ${name}. La ropa es tentadora, pero te ayudaré`,
      impulse_food: (name) => `Muchos gastan demás en comida, ${name}. Vamos a controlarlo`,
      goal_travel: (name) => `Un viaje es gran motivación ${name}. Calculemos cuánto necesitas`,
      strategy_wait: (name) => `Muy bien ${name}. La paciencia ahorra dinero`
    };

    const confirmation = confirmations[action]
      ? confirmations[action](userData.name || 'Usuario')
      : '';

    return {
      confirmation,
      nextFlow
    };
  }

  // ========================================
  // VALIDAR SI RESPUESTA ES GUIADA
  // ========================================
  isGuidedResponse(response) {
    // Verificar que la respuesta NO contenga preguntas abiertas
    const openQuestions = [
      '¿qué quieres hacer?',
      '¿en qué puedo ayudarte?',
      '¿qué necesitas?',
      '¿algo más?',
      '¿qué te gustaría?'
    ];

    const hasOpenQuestion = openQuestions.some(q =>
      response.toLowerCase().includes(q)
    );

    // Debe tener opciones específicas
    const hasOptions = response.includes('1.') || response.includes('•') || response.includes('-');

    return !hasOpenQuestion && hasOptions;
  }

  // ========================================
  // MEJORAR RESPUESTA SI NO ES GUIADA
  // ========================================
  improveResponse(response, userName, currentFlow = 'greeting') {
    if (this.isGuidedResponse(response)) {
      return response;
    }

    // Si no es guiada, agregar opciones del flujo actual
    const flow = this.getFlow(currentFlow, { name: userName });

    const improved = `${response}

¿Qué te gustaría hacer ${userName}?

${flow.options.map((opt, i) => `${i + 1}. ${opt.text}`).join('\n')}`;

    return improved;
  }

  // ========================================
  // OBTENER SIGUIENTE PREGUNTA INTELIGENTE
  // ========================================
  getSmartFollowUp(action, userData = {}) {
    const followUps = {
      savings_low: {
        question: `${userData.name}, ¿en cuánto tiempo quieres ver resultados?`,
        options: [
          { text: '3 meses (meta corta)', months: 3 },
          { text: '6 meses (meta media)', months: 6 },
          { text: '1 año (meta larga)', months: 12 }
        ]
      },
      impulse_clothes: {
        question: `${userData.name}, ¿cuánto gastas en ropa al mes aproximadamente?`,
        options: [
          { text: 'Menos de $100K', amount: 50000 },
          { text: '$100K - $300K', amount: 200000 },
          { text: 'Más de $300K', amount: 400000 }
        ]
      },
      goal_travel: {
        question: `${userData.name}, ¿cuándo quieres viajar?`,
        options: [
          { text: 'En 3-6 meses', months: 4 },
          { text: 'En 6-12 meses', months: 9 },
          { text: 'En más de 1 año', months: 18 }
        ]
      }
    };

    return followUps[action] || null;
  }
}

// ========================================
// HELPER: RENDERIZAR OPCIONES EN UI
// ========================================
function renderFinOptions(options, onSelect) {
  const container = document.createElement('div');
  container.className = 'fin-options-container';

  options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'fin-option-btn';
    btn.innerHTML = `
      <span class="option-number">${index + 1}</span>
      <span class="option-text">${option.text}</span>
      <i class="fas fa-chevron-right"></i>
    `;

    btn.onclick = () => onSelect(option);
    container.appendChild(btn);
  });

  return container;
}

// Exponer globalmente
window.FinConversationGuide = FinConversationGuide;

console.log('✅ FinConversationGuide loaded');
