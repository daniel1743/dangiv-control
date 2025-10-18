// ========================================
// CONVERSATIONAL EXPENSE SYSTEM
// Registro de gastos conversacional con IA
// ========================================

class ConversationalExpense {
  constructor(financeApp) {
    this.app = financeApp;
    this.geminiApiKey = window.FB?.geminiApiKey || null;
    this.conversationState = 'idle'; // idle, collecting, confirming, saved
    this.currentExpense = {};
    this.missingFields = [];
    this.conversationHistory = [];
    this.customCategoryMode = false;
  }

  // ========================================
  // INICIAR CONVERSACIÓN
  // ========================================
  async start() {
    this.conversationState = 'collecting';
    this.currentExpense = {
      amount: null,
      category: null,
      description: '',
      necessity: null,
      date: new Date().toISOString().split('T')[0],
      user: this.app.userProfile?.name || 'Usuario'
    };
    this.conversationHistory = [];

    const userName = this.app.userProfile?.name || 'Usuario';

    return {
      message: `¡Hola ${userName}! 👋\n\n¿En qué gastaste?`,
      suggestions: [],
      progress: this.getProgress(),
      placeholder: 'Ejemplo: Almuerzo, Uber, Ropa...'
    };
  }

  // ========================================
  // PROCESAR MENSAJE CON IA
  // ========================================
  async processMessage(userMessage) {
    this.conversationHistory.push({ role: 'user', message: userMessage });

    // Si no hay API key, usar parser básico
    if (!this.geminiApiKey) {
      return this.processMessageBasic(userMessage);
    }

    const prompt = this.buildExtractionPrompt(userMessage);

    try {
      const result = await this.callGeminiAPI(prompt);

      // Actualizar datos extraídos
      if (result.extractedData) {
        Object.keys(result.extractedData).forEach(key => {
          if (result.extractedData[key] !== null && result.extractedData[key] !== undefined) {
            this.currentExpense[key] = result.extractedData[key];
          }
        });
      }

      this.missingFields = result.missingFields || [];

      // Verificar si está completo
      if (result.isComplete) {
        return this.confirmExpense(result.sentiment || 'neutral');
      }

      return {
        message: result.response,
        suggestions: this.getSuggestionsForField(result.missingFields[0]),
        progress: this.getProgress(),
        isComplete: false
      };

    } catch (error) {
      console.error('Error procesando con IA:', error);
      return this.processMessageBasic(userMessage);
    }
  }

  // ========================================
  // PARSER BÁSICO (SIN IA)
  // ========================================
  processMessageBasic(userMessage) {
    const userName = this.app.userProfile?.name || 'Usuario';

    // PASO 1: Si no hay descripción, guardarla
    if (!this.currentExpense.description) {
      this.currentExpense.description = userMessage;

      // Intentar detectar categoría por palabras clave
      const categoryKeywords = {
        'Alimentación': ['comida', 'almuerzo', 'cena', 'desayuno', 'restaurante', 'hamburguesa', 'pizza', 'café', 'comí', 'comer'],
        'Transporte': ['uber', 'taxi', 'bus', 'gasolina', 'transporte', 'metro', 'cabify', 'didi'],
        'Compras': ['ropa', 'zapatos', 'compré', 'tienda', 'ropa', 'vestido', 'pantalón'],
        'Entretenimiento': ['cine', 'juego', 'netflix', 'concierto', 'fiesta', 'bar'],
        'Servicios': ['internet', 'luz', 'agua', 'celular', 'teléfono'],
        'Salud': ['doctor', 'medicina', 'farmacia', 'hospital', 'consulta']
      };

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(kw => userMessage.toLowerCase().includes(kw))) {
          this.currentExpense.category = category;
          break;
        }
      }

      return {
        message: `Perfecto! ¿Cuál fue el valor?`,
        suggestions: [],
        progress: this.getProgress(),
        isComplete: false,
        placeholder: 'Ejemplo: 50000 o $50.000'
      };
    }

    // PASO 2: Capturar monto
    if (!this.currentExpense.amount) {
      const moneyMatch = userMessage.match(/\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
      if (moneyMatch) {
        this.currentExpense.amount = parseFloat(moneyMatch[1].replace(/[.,]/g, ''));

        // Si aún no hay categoría, pedirla
        if (!this.currentExpense.category) {
          return {
            message: `$${this.currentExpense.amount.toLocaleString('es-CO')} - ¿En qué categoría fue?`,
            suggestions: this.getSuggestionsForField('category'),
            progress: this.getProgress(),
            isComplete: false
          };
        }

        // Si ya hay categoría, pedir necesidad
        return {
          message: `$${this.currentExpense.amount.toLocaleString('es-CO')} en ${this.currentExpense.category}\n\n¿Qué tan necesario era?`,
          suggestions: this.getSuggestionsForField('necessity'),
          progress: this.getProgress(),
          isComplete: false
        };
      } else {
        return {
          message: `No detecté el monto. Por favor ingresa un número.\n\nEjemplo: 50000`,
          suggestions: [],
          progress: this.getProgress(),
          isComplete: false,
          placeholder: 'Ejemplo: 50000'
        };
      }
    }

    // PASO 3: Capturar categoría si falta
    if (!this.currentExpense.category) {
      // Verificar si quiere categoría personalizada
      if (userMessage.trim() === 'CUSTOM_CATEGORY' || userMessage.toLowerCase().includes('personalizada')) {
        return {
          message: `¿Qué nombre quieres para la categoría personalizada?`,
          suggestions: [],
          progress: this.getProgress(),
          isComplete: false,
          placeholder: 'Ejemplo: Mascotas, Educación, Hobbies...',
          customCategoryMode: true
        };
      }

      // Si viene de modo personalizado, guardar la categoría
      if (this.customCategoryMode) {
        this.currentExpense.category = userMessage.trim();
        this.customCategoryMode = false;

        return {
          message: `Categoría "${this.currentExpense.category}" - ¿Qué tan necesario era?`,
          suggestions: this.getSuggestionsForField('necessity'),
          progress: this.getProgress(),
          isComplete: false
        };
      }

      // Buscar en sugerencias
      const categories = ['Alimentación', 'Transporte', 'Entretenimiento', 'Salud', 'Servicios', 'Compras', 'Otros'];
      const foundCategory = categories.find(cat =>
        userMessage.toLowerCase().includes(cat.toLowerCase()) ||
        userMessage.includes(cat)
      );

      if (foundCategory) {
        this.currentExpense.category = foundCategory;

        return {
          message: `${this.currentExpense.category} - ¿Qué tan necesario era?`,
          suggestions: this.getSuggestionsForField('necessity'),
          progress: this.getProgress(),
          isComplete: false
        };
      } else {
        return {
          message: `No detecté la categoría. Selecciona una:`,
          suggestions: this.getSuggestionsForField('category'),
          progress: this.getProgress(),
          isComplete: false
        };
      }
    }

    // PASO 4: Capturar necesidad
    if (!this.currentExpense.necessity) {
      const necessities = {
        'Muy Necesario': ['muy necesario', 'indispensable', 'muy indispensable'],
        'Necesario': ['necesario', 'muy necesario'],
        'Poco Necesario': ['poco necesario', 'necesario'],
        'No Necesario': ['poco necesario', 'no necesario'],
        'Compra por Impulso': ['nada necesario', 'impulso'],
        'Malgasto': ['malgasto', 'arrepentimiento']
      };

      for (const [necessity, keywords] of Object.entries(necessities)) {
        if (keywords.some(kw => userMessage.toLowerCase().includes(kw))) {
          this.currentExpense.necessity = necessity;
          break;
        }
      }

      if (this.currentExpense.necessity) {
        return this.confirmExpense('neutral');
      } else {
        return {
          message: `Selecciona el nivel de necesidad:`,
          suggestions: this.getSuggestionsForField('necessity'),
          progress: this.getProgress(),
          isComplete: false
        };
      }
    }

    // Si llegamos aquí, está completo
    return this.confirmExpense('neutral');
  }

  // ========================================
  // PROMPT DE EXTRACCIÓN
  // ========================================
  buildExtractionPrompt(userMessage) {
    const userName = this.app.userProfile?.name || 'Usuario';

    return `Eres Fin, asistente de registro de gastos de ${userName}.

MENSAJE DEL USUARIO: "${userMessage}"

DATOS ACTUALES:
${JSON.stringify(this.currentExpense, null, 2)}

CAMPOS REQUERIDOS:
- amount (número): monto del gasto en COP
- category: Alimentación, Transporte, Entretenimiento, Salud, Servicios, Compras, Otros
- description (string): descripción breve
- necessity: Muy Necesario, Necesario, Poco Necesario, No Necesario, Compra por Impulso
- date (YYYY-MM-DD): fecha del gasto
- user: ${userName}

ANÁLISIS DE SENTIMIENTO:
- "positive": gasto necesario, buen uso del dinero
- "warning": gasto alto o en categoría con mucho consumo
- "neutral": gasto normal

TAREA:
1. Extraer datos del mensaje
2. Identificar qué falta
3. Responder de forma natural (máximo 2 líneas)

RESPONDE SOLO CON JSON:
{
  "extractedData": {
    "amount": 50000,
    "category": "Alimentación",
    "description": "Almuerzo",
    "necessity": "Necesario",
    "date": "2025-10-16",
    "user": "${userName}"
  },
  "missingFields": ["necessity"],
  "response": "${userName}, ¿este gasto era muy necesario, necesario, poco necesario o compra por impulso?",
  "isComplete": false,
  "sentiment": "neutral"
}`;
  }

  // ========================================
  // CONFIRMAR GASTO
  // ========================================
  confirmExpense(sentiment) {
    const { amount, category, description, necessity } = this.currentExpense;
    const userName = this.app.userProfile?.name || 'Usuario';

    // Analizar el gasto
    const analysis = this.analyzeExpense();

    let message = '';
    let emoji = '';

    if (sentiment === 'positive' || analysis.type === 'success') {
      message = `¡Perfecto ${userName}! 🎉 Registré $${amount.toLocaleString('es-CO')} en ${category}. ${analysis.message}`;
      emoji = '✅';
    } else if (sentiment === 'warning' || analysis.type === 'warning') {
      message = `${userName}, registré $${amount.toLocaleString('es-CO')} en ${category}. ⚠️ ${analysis.message}`;
      emoji = '⚠️';
    } else {
      message = `Listo ${userName}! Registré $${amount.toLocaleString('es-CO')} en ${category}. ${analysis.message}`;
      emoji = '📝';
    }

    this.conversationState = 'confirming';

    return {
      message: message,
      expenseData: this.currentExpense,
      analysis: analysis,
      emoji: emoji,
      actions: [
        { label: '✅ Confirmar', action: 'save' },
        { label: '✏️ Editar', action: 'edit' },
        { label: '❌ Cancelar', action: 'cancel' }
      ],
      isComplete: true
    };
  }

  // ========================================
  // ANALIZAR GASTO Y DAR FEEDBACK
  // ========================================
  analyzeExpense() {
    const { amount, category, necessity } = this.currentExpense;
    const userName = this.app.userProfile?.name || 'Usuario';

    // Calcular total de la categoría este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const categoryTotal = this.app.expenses
      .filter(e => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === currentMonth &&
               expDate.getFullYear() === currentYear &&
               e.category === category;
      })
      .reduce((sum, e) => sum + e.amount, 0) + amount; // Incluir el nuevo

    // Calcular % del ingreso mensual
    const percentOfIncome = this.app.monthlyIncome > 0
      ? ((categoryTotal / this.app.monthlyIncome) * 100).toFixed(1)
      : 0;

    // Analizar según necesidad
    if (necessity === 'Compra por Impulso') {
      return {
        message: `Has gastado $${categoryTotal.toLocaleString('es-CO')} en ${category} este mes. Intenta reducir compras impulsivas 💪`,
        type: 'warning',
        percentOfIncome: percentOfIncome
      };
    }

    if (percentOfIncome > 30) {
      return {
        message: `Llevas $${categoryTotal.toLocaleString('es-CO')} en ${category} (${percentOfIncome}% de tu ingreso). ¡Cuidado! 🚨`,
        type: 'alert',
        percentOfIncome: percentOfIncome
      };
    }

    if (percentOfIncome > 20) {
      return {
        message: `Llevas $${categoryTotal.toLocaleString('es-CO')} en ${category} (${percentOfIncome}% de tu ingreso). Aún estás bien 👍`,
        type: 'info',
        percentOfIncome: percentOfIncome
      };
    }

    return {
      message: `¡Excelente! Solo llevas $${categoryTotal.toLocaleString('es-CO')} en ${category} (${percentOfIncome}%). ¡Sigue así! 🌟`,
      type: 'success',
      percentOfIncome: percentOfIncome
    };
  }

  // ========================================
  // GUARDAR GASTO
  // ========================================
  async saveExpense() {
    // Generar ID único
    this.currentExpense.id = 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Agregar a expenses de la app
    this.app.expenses.push(this.currentExpense);

    // Guardar datos
    await this.app.saveData();

    // Actualizar UI
    if (typeof this.app.renderExpenses === 'function') {
      this.app.renderExpenses();
    }

    if (typeof this.app.renderDashboard === 'function') {
      this.app.renderDashboard();
    }

    this.conversationState = 'saved';

    const analysis = this.analyzeExpense();

    return {
      message: `✅ Gasto guardado exitosamente. ${analysis.message}`,
      success: true,
      expenseId: this.currentExpense.id
    };
  }

  // ========================================
  // UTILIDADES
  // ========================================
  getMissingFields() {
    const required = ['amount', 'category', 'necessity'];
    return required.filter(field =>
      this.currentExpense[field] === null ||
      this.currentExpense[field] === undefined ||
      this.currentExpense[field] === ''
    );
  }

  getProgress() {
    const required = ['amount', 'category', 'necessity'];
    const completed = required.filter(field =>
      this.currentExpense[field] !== null &&
      this.currentExpense[field] !== undefined &&
      this.currentExpense[field] !== ''
    );

    return {
      current: completed.length,
      total: required.length,
      percent: Math.round((completed.length / required.length) * 100)
    };
  }

  getSuggestionsForField(field) {
    const suggestions = {
      category: [
        { text: '🍔 Alimentación', value: 'Alimentación' },
        { text: '🚗 Transporte', value: 'Transporte' },
        { text: '🎬 Entretenimiento', value: 'Entretenimiento' },
        { text: '💊 Salud', value: 'Salud' },
        { text: '💡 Servicios', value: 'Servicios' },
        { text: '🛍️ Compras', value: 'Compras' },
        { text: '📁 Otros', value: 'Otros' },
        { text: '➕ Agregar categoría personalizada', value: 'CUSTOM_CATEGORY' }
      ],
      necessity: [
        { text: '⭐ Muy Necesario', value: 'Muy Necesario' },
        { text: '✔️ Necesario', value: 'Necesario' },
        { text: '❓ Poco Necesario', value: 'Poco Necesario' },
        { text: '❌ No Necesario', value: 'No Necesario' },
        { text: '😅 Compra por Impulso', value: 'Compra por Impulso' },
        { text: '😔 Malgasto/Arrepentimiento', value: 'Malgasto' }
      ],
      amount: [
        { text: '💵 Menos de $50K', value: 25000 },
        { text: '💰 $50K - $200K', value: 100000 },
        { text: '💸 Más de $200K', value: 300000 }
      ]
    };

    return suggestions[field] || [];
  }

  // ========================================
  // LLAMAR A GEMINI API
  // ========================================
  async callGeminiAPI(prompt) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 400
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;

    // Limpiar y parsear JSON
    text = text.trim().replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    return JSON.parse(text);
  }

  // ========================================
  // RESET
  // ========================================
  reset() {
    this.conversationState = 'idle';
    this.currentExpense = {};
    this.missingFields = [];
    this.conversationHistory = [];
    this.customCategoryMode = false;
  }
}

// Exponer globalmente
window.ConversationalExpense = ConversationalExpense;

console.log('✅ ConversationalExpense loaded');
