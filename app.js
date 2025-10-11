// Dan&Giv Control - Personal Finance Application
// Main JavaScript file with all functionality

class FinanceApp {
  // QuedarÃ¡ asÃ­ (reemplaza el constructor completo)
  constructor() {
    if (typeof TextDecoder !== 'undefined') {
      try {
        this._utf8Decoder = new TextDecoder('utf-8', { fatal: false });
      } catch {
        this._utf8Decoder = null;
      }
      try {
        this._latinDecoder = new TextDecoder('windows-1252', { fatal: false });
      } catch {
        this._latinDecoder = null;
      }
    } else {
      this._utf8Decoder = null;
      this._latinDecoder = null;
    }

    const rawData = JSON.parse(localStorage.getItem('financiaProData')) || {};

    const { cleaned: savedData, changed: hadEncodingIssues } =
      this.normalizePersistedData(rawData);

    if (hadEncodingIssues) {
      try {
        localStorage.setItem('financiaProData', JSON.stringify(savedData));
      } catch (error) {
        console.warn('No se pudo normalizar el almacenamiento local:', error);
      }
    }

    // Account system properties
    this.accountType =
      savedData.accountType ||
      localStorage.getItem('financia_account_type') ||
      'personal';
    this.currentUser = savedData.currentUser || 'anonymous';
    this.sharedAccountId = savedData.sharedAccountId || null; // ID of shared Firestore document
    this.accountOwner = savedData.accountOwner || null;
    this.accountUsers = savedData.accountUsers || [];
    this.inviteCodes = savedData.inviteCodes || {};
    this.currentInviteLink = savedData.currentInviteLink || null;
    this.activityLog = savedData.activityLog || [];
    this.auditLog = savedData.auditLog || []; // Sistema de auditoría
    this.customUsers = savedData.customUsers || []; // Usuarios personalizados para gastos
    this.savingsAccounts = savedData.savingsAccounts || []; // Cuentas de ahorro
    this.recurringPayments = savedData.recurringPayments || []; // Pagos recurrentes mensuales
    this.isRegistering = false; // Flag to prevent race condition during registration

    this.expenses = savedData.expenses || [];
    this.goals = savedData.goals || [];
    this.shoppingItems = savedData.shoppingItems || [];
    this.monthlyIncome = savedData.monthlyIncome || 2500;
    this.lastSalaryDate = savedData.lastSalaryDate || null; // Fecha del último sueldo registrado
    this.additionalIncomes = savedData.additionalIncomes || []; // Nuevos ingresos adicionales
    this.extraIncome = savedData.extraIncome || 0; // Ingresos extras acumulados (sin descripción)
    this.extraIncomeHistory = savedData.extraIncomeHistory || []; // Historial de entradas extras

    // Sistema de ahorro para metas
    this.availableBalance = savedData.availableBalance || 0; // Balance acumulado disponible
    this.freeBalance = savedData.freeBalance || 0; // Balance libre (no asignado a metas)
    this.lastBalanceUpdate = savedData.lastBalanceUpdate || null; // Última actualización de balance
    this.userCoins = savedData.userCoins || 100;
    this.ownedStyles = savedData.ownedStyles || ['classic'];
    this.currentStyle = savedData.currentStyle || 'classic';

    // Budget System (Envelope Budgeting)
    this.budgets = savedData.budgets || {};
    this.currentBudgetMonth = this.getCurrentMonthKey();

    // Expense Templates for Quick Entry
    this.expenseTemplates = savedData.expenseTemplates || [];

    // Expense Patterns Database for Smart Autocomplete
    this.expensePatterns = savedData.expensePatterns || {};

    // Default User Configuration
    this.defaultUser = savedData.defaultUser || '';

    // Motivational Messages System (Gemini API)
    this.motivationalMessages = savedData.motivationalMessages || [];
    this.lastMessageUpdate = savedData.lastMessageUpdate || null;

    // Sistema de mensajes sin repetición
    this.messageHistory = savedData.messageHistory || {
      saludos: [],
      principales: [],
      explicacion: [],
      cierre: [],
      accion: [],
    };
    this.allMessages = null; // Se cargará del JSON
    this.lastMorningMessage = savedData.lastMorningMessage || null; // Timestamp del último mensaje de mañana
    this.lastNightMessage = savedData.lastNightMessage || null; // Timestamp del último mensaje de noche
    this.dailyMessageScheduled = false;
    this.activeMessageNotifications =
      savedData.activeMessageNotifications || []; // Notificaciones activas de mensajes

    // Notification States (Map to track read/unread status)
    // Convert from object or array to Map
    if (savedData.notificationStates) {
      if (Array.isArray(savedData.notificationStates)) {
        // Old format: array of [key, value] pairs
        this.notificationStates = new Map(savedData.notificationStates);
      } else {
        // New format: object with key-value pairs
        this.notificationStates = new Map(
          Object.entries(savedData.notificationStates)
        );
      }
    } else {
      this.notificationStates = new Map();
    }

    // Chart Styles System
    this.chartStyles = [
      {
        id: 'classic',
        name: 'Clásico',
        price: 0,
        colors: ['#33808D', '#21616C', '#1D5460', '#194851', '#153C42'],
        options: {
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          textColor: '#374151',
        },
      },
      {
        id: 'neon',
        name: 'Neón',
        price: 50,
        colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'],
        options: {
          backgroundColor: '#1a1a2e',
          borderColor: '#16213e',
          textColor: '#ffffff',
        },
      },
      {
        id: 'pastel',
        name: 'Pastel',
        price: 30,
        colors: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff'],
        options: {
          backgroundColor: '#faf9f6',
          borderColor: '#f0f0f0',
          textColor: '#5a5a5a',
        },
      },
      {
        id: 'ocean',
        name: 'Océano',
        price: 40,
        colors: ['#006994', '#13293d', '#004e89', '#247ba0', '#70a9a1'],
        options: {
          backgroundColor: '#f0f8ff',
          borderColor: '#b8dce8',
          textColor: '#13293d',
        },
      },
      {
        id: 'sunset',
        name: 'Atardecer',
        price: 45,
        colors: ['#ff4d6d', '#c9184a', '#a4161a', '#800f2f', '#590d22'],
        options: {
          backgroundColor: '#fff3e0',
          borderColor: '#ffccbc',
          textColor: '#5d4037',
        },
      },
      {
        id: 'forest',
        name: 'Bosque',
        price: 35,
        colors: ['#355e3b', '#2d5016', '#4f7942', '#8fbc8f', '#228b22'],
        options: {
          backgroundColor: '#f1f8e9',
          borderColor: '#c8e6c9',
          textColor: '#2e7d32',
        },
      },
      {
        id: 'royal',
        name: 'Real',
        price: 60,
        colors: ['#4b0082', '#6a0dad', '#9370db', '#ba55d3', '#dda0dd'],
        options: {
          backgroundColor: '#f3e5f5',
          borderColor: '#e1bee7',
          textColor: '#4a148c',
        },
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        price: 70,
        colors: ['#ff073a', '#39ff14', '#00ffff', '#ff00ff', '#ffff00'],
        options: {
          backgroundColor: '#0a0a0a',
          borderColor: '#333333',
          textColor: '#00ff00',
        },
      },
      {
        id: 'vintage',
        name: 'Vintage',
        price: 25,
        colors: ['#8b4513', '#a0522d', '#cd853f', '#daa520', '#b8860b'],
        options: {
          backgroundColor: '#fdf5e6',
          borderColor: '#f5deb3',
          textColor: '#8b4513',
        },
      },
      {
        id: 'monochrome',
        name: 'Monocromático',
        price: 20,
        colors: ['#000000', '#2c2c2c', '#545454', '#7c7c7c', '#a4a4a4'],
        options: {
          backgroundColor: '#ffffff',
          borderColor: '#e0e0e0',
          textColor: '#212121',
        },
      },
    ];

    // Propiedades del Modo Demo
    this.demoIntervalId = null;
    this.currentDemoIndex = 0;
    // QuedarÃ¡ asÃ­ (reemplaza el array demoDataSets completo)
    this.demoDataSets = [
      // Escenario 1: "Mes Bueno"
      {
        title: 'Mes de Ahorro Exitoso',
        labels: [
          'Alimentación',
          'Transporte',
          'Entretenimiento',
          'Salud',
          'Servicios',
          'Compras',
        ],
        data: [35, 20, 15, 10, 12, 8], // % de gastos
        stats: {
          balance: 1300, // (Ingreso 3000 - Gasto 1700)
          expenses: 1700, // (17 transacciones @ ~100 c/u)
          savings: 2500,
          transactions: 17,
          balanceChange: { text: 'Balance final positivo', class: 'positive' },
          expensesChange: { text: '-15% vs mes anterior', class: 'positive' }, // Gastaste menos, es positivo
          savingsChange: { text: 'Meta: 95%', class: 'positive' },
        },
        goals: [
          { name: 'Fondo de Emergencia', current: 2500, target: 3000 },
          { name: 'Viaje', current: 800, target: 1200 },
        ],
      },
      // Escenario 2: "Mes Regular"
      {
        title: 'Gastos del Hogar',
        labels: [
          'Servicios',
          'Alimentación',
          'Transporte',
          'Salud',
          'Entretenimiento',
        ],
        data: [30, 35, 20, 10, 5], // % de gastos
        stats: {
          balance: 450, // (Ingreso 2800 - Gasto 2350)
          expenses: 2350, // (32 transacciones @ ~73 c/u)
          savings: 1200,
          transactions: 32,
          balanceChange: { text: 'Balance final ajustado', class: 'neutral' },
          expensesChange: { text: '+5% vs mes anterior', class: 'negative' }, // Gastaste mÃ¡s, es negativo
          savingsChange: { text: 'Meta: 60%', class: 'positive' },
        },
        goals: [
          { name: 'Fondo de Emergencia', current: 1200, target: 3000 },
          { name: 'TecnologÃ­a', current: 300, target: 900 },
        ],
      },
      // Escenario 3: "Mes DifÃ­cil"
      {
        title: 'Mes con Gastos Imprevistos',
        labels: ['Salud', 'Reparaciones', 'Alimentación', 'Servicios', 'Otros'],
        data: [35, 25, 20, 15, 5], // % de gastos
        stats: {
          balance: -450, // (Ingreso 2600 - Gasto 3050) Â¡BALANCE NEGATIVO!
          expenses: 3050, // (25 transacciones @ ~122 c/u)
          savings: 900,
          transactions: 25,
          balanceChange: { text: 'Balance final negativo', class: 'negative' },
          expensesChange: { text: '+28% vs mes anterior', class: 'negative' }, // Gastaste mucho mÃ¡s
          savingsChange: { text: 'Meta: 45%', class: 'negative' },
        },
        goals: [
          { name: 'Fondo de Emergencia', current: 900, target: 3000 },
          { name: 'Pago Deuda', current: 200, target: 1000 },
        ],
      },
    ];

    // 2. Propiedades de la aplicaciÃ³n
    this.categories = [
      'Alimentación',
      'Transporte',
      'Entretenimiento',
      'Salud',
      'Servicios',
      'Compras',
      'Otros',
    ];
    this.necessityLevels = [
      'Muy Necesario',
      'Necesario',
      'Poco Necesario',
      'No Necesario',
      'Compra por Impulso',
      'Malgasto',
    ];
    this.users = ['Daniel', 'Givonik', 'Otro'];

    // Tipos de servicios recurrentes para pagos
    this.paymentServiceTypes = [
      {
        id: 'electricity',
        name: 'Luz',
        icon: 'fas fa-lightbulb',
        color: '#f59e0b',
      },
      { id: 'water', name: 'Agua', icon: 'fas fa-tint', color: '#3b82f6' },
      { id: 'phone', name: 'Teléfono', icon: 'fas fa-phone', color: '#8b5cf6' },
      {
        id: 'internet',
        name: 'Internet/WiFi',
        icon: 'fas fa-wifi',
        color: '#06b6d4',
      },
      { id: 'tv', name: 'TV/Cable', icon: 'fas fa-tv', color: '#ec4899' },
      { id: 'rent', name: 'Alquiler', icon: 'fas fa-home', color: '#ef4444' },
      { id: 'gas', name: 'Gas', icon: 'fas fa-fire', color: '#f97316' },
      {
        id: 'insurance',
        name: 'Seguro',
        icon: 'fas fa-shield-alt',
        color: '#10b981',
      },
      {
        id: 'subscription',
        name: 'Suscripción',
        icon: 'fas fa-star',
        color: '#6366f1',
      },
      {
        id: 'other',
        name: 'Otros Servicios',
        icon: 'fas fa-receipt',
        color: '#64748b',
      },
    ];
    this.charts = {};
    this.currentSection = 'dashboard';
    this.currentUser = 'anonymous'; // Â¡CORRECCIÃƒâ€œN APLICADA!
    this.userPlan = 'free'; // free or pro
    this.userProfile = savedData.userProfile || {
      name: 'Usuario',
      email: '',
      avatar:
        'https://ui-avatars.com/api/?name=Usuario&background=21808D&color=fff&size=128',
      avatarType: 'default', // 'default' or 'custom'
      selectedAvatar: 0, // Index for default avatars
      quote: '', // Frase personal
      country: 'US', // Código de país
      countryFlag: '🇺🇸', // Bandera del país
      currency: 'USD', // Moneda
    };
    this.defaultAvatars = [
      'https://ui-avatars.com/api/?name=U1&background=21808D&color=fff&size=128&font-size=0.6', // Teal 500
      'https://ui-avatars.com/api/?name=U2&background=1D7480&color=fff&size=128&font-size=0.6', // Teal 600
      'https://ui-avatars.com/api/?name=U3&background=2DA6B2&color=fff&size=128&font-size=0.6', // Teal 400
      'https://ui-avatars.com/api/?name=U4&background=32B8C6&color=fff&size=128&font-size=0.6', // Teal 300
      'https://ui-avatars.com/api/?name=U5&background=1A6873&color=fff&size=128&font-size=0.6', // Teal 700
      'https://ui-avatars.com/api/?name=U6&background=E68161&color=fff&size=128&font-size=0.6', // Orange 400
      'https://ui-avatars.com/api/?name=U7&background=A84B2F&color=fff&size=128&font-size=0.6', // Orange 500
      'https://ui-avatars.com/api/?name=U8&background=C0152F&color=fff&size=128&font-size=0.6', // Red 500
      'https://ui-avatars.com/api/?name=U9&background=FF5459&color=fff&size=128&font-size=0.6', // Red 400
      'https://ui-avatars.com/api/?name=U10&background=2996A1&color=fff&size=128&font-size=0.6', // Teal 800
    ];
    this.pendingDeleteId = null;
    this.aiRecommendations = [];

    this.conversationHistory = []; // Para guardar el historial del chat
    this.conversationState = 'START'; // Para saber en quÃ© punto del chat estamos

    // Detectar enlace de invitación en la URL
    this.checkInvitationLink();
  }

  startDemoMode() {
    // Si la animaciÃ³n ya estÃ¡ corriendo, no hacemos nada.
    if (this.demoIntervalId) return;

    const updateDemo = () => {
      // Optimización: solo actualizar si el usuario está viendo la página
      if (document.hidden) return;

      const dataSet = this.demoDataSets[this.currentDemoIndex];

      // Usar requestAnimationFrame para suavizar las actualizaciones
      requestAnimationFrame(() => {
        this.updateStats(dataSet.stats);
        this.renderPremiumChart(dataSet);
        this.renderInteractiveSummary(dataSet);
        this.renderGoalsProgressChart();
      });

      // Pasamos al siguiente set de datos para la prÃ³xima vez
      this.currentDemoIndex =
        (this.currentDemoIndex + 1) % this.demoDataSets.length;
    };

    updateDemo(); // Ejecutamos una vez inmediatamente
    this.demoIntervalId = setInterval(updateDemo, 5000); // Aumentado a 5 segundos para reducir carga
  }

  stopDemoMode() {
    clearInterval(this.demoIntervalId);
    this.demoIntervalId = null;
    // También limpiar el intervalo de mensajes de metas
    if (this.goalsMessageInterval) {
      clearInterval(this.goalsMessageInterval);
      this.goalsMessageInterval = null;
    }
  }

  // Optimización sutil del scroll mediante throttling de eventos pesados
  setupScrollOptimization() {
    let ticking = false;
    const optimizeScroll = () => {
      // Solo ejecutar optimizaciones si hay demo activo
      if (this.demoIntervalId && document.hidden) {
        // Pausar demo temporalmente si la página no es visible
        clearInterval(this.demoIntervalId);
        this.demoIntervalId = null;

        // Reanudar cuando la página vuelva a ser visible
        const resumeDemo = () => {
          if (!document.hidden && this.currentUser === 'anonymous') {
            this.startDemoMode();
          }
        };

        document.addEventListener('visibilitychange', resumeDemo, {
          once: true,
        });
      }
      ticking = false;
    };

    // Throttling sutil para eventos de scroll
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(optimizeScroll);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  // Función para forzar la normalización de datos existentes
  forceDataNormalization() {
    try {
      const currentData = {
        expenses: this.expenses,
        goals: this.goals,
        shoppingItems: this.shoppingItems,
        monthlyIncome: this.monthlyIncome,
        securityPasswords: this.securityPasswords,
      };

      const { cleaned: normalizedData, changed } =
        this.normalizePersistedData(currentData);

      if (changed) {
        console.log(
          'Aplicando normalización de caracteres a datos existentes...'
        );
        this.expenses = normalizedData.expenses || [];
        this.goals = normalizedData.goals || [];
        this.shoppingItems = normalizedData.shoppingItems || [];
        this.monthlyIncome = normalizedData.monthlyIncome || 2500;
        this.securityPasswords =
          normalizedData.securityPasswords || this.securityPasswords;

        // Guardar los datos normalizados
        this.saveData();
        this.showToast(
          'Datos actualizados para mejorar la visualización',
          'success'
        );
      }
    } catch (error) {
      console.warn('Error al normalizar datos:', error);
    }
  }

  verifyPassword(userName, plainPassword) {
    // 1. Validar que el usuario y la contraseña existan.
    if (!this.securityPasswords[userName] || !plainPassword) {
      return false;
    }

    // 2. Hashear la contraseña de texto plano que nos pasan para compararla.
    const hashedPassword = CryptoJS.SHA256(plainPassword).toString();

    // 3. Comparar el hash guardado con el que acabamos de generar.
    return this.securityPasswords[userName] === hashedPassword;
  }

  normalizePersistedData(data) {
    if (!data || typeof data !== 'object') {
      return { cleaned: {}, changed: false };
    }

    const tracker = { changed: false };
    const cleaned = this.normalizeValue(data, tracker);
    return { cleaned, changed: tracker.changed };
  }

  normalizeValue(value, tracker) {
    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeValue(item, tracker));
    }

    if (value && typeof value === 'object') {
      const result = {};
      Object.entries(value).forEach(([key, nestedValue]) => {
        result[key] = this.normalizeValue(nestedValue, tracker);
      });
      return result;
    }

    if (typeof value === 'string') {
      const fixed = this.fixLegacyEncoding(value);
      if (fixed !== value) {
        tracker.changed = true;
      }
      return fixed;
    }

    return value;
  }

  fixLegacyEncoding(value) {
    if (typeof value !== 'string' || value.length === 0) {
      return value;
    }

    let result = value;

    if (/[ÃÂâ€™“”‘’–—¢ºª¡¿·•°Å¶]/.test(result)) {
      if (this._latinDecoder) {
        try {
          const bytes = new Uint8Array(result.length);
          for (let i = 0; i < result.length; i += 1) {
            bytes[i] = result.charCodeAt(i) & 0xff;
          }
          const decoded = this._latinDecoder.decode(bytes);
          if (decoded && !decoded.includes('�')) {
            result = decoded;
          }
        } catch (error) {
          console.warn(
            'No se pudo decodificar texto en windows-1252:',
            value,
            error
          );
        }
      }

      const replacements = [
        ['Ã¡', 'á'],
        ['Ã©', 'é'],
        ['Ã­', 'í'],
        ['Ã³', 'ó'],
        ['Ãº', 'ú'],
        ['Ãñ', 'ñ'],
        ['Ã±', 'ñ'],
        ['Ã�', 'Á'],
        ['Ã‰', 'É'],
        ['Ã�', 'Í'],
        ['Ã“', 'Ó'],
        ['Ãš', 'Ú'],
        ['Ãœ', 'Ü'],
        ['Ã¼', 'ü'],
        ['Ã ', 'à'],
        ['Ã¨', 'è'],
        ['Ãª', 'ê'],
        ['Ã¬', 'ì'],
        ['Ã²', 'ò'],
        ['Ã´', 'ô'],
        ['Ã¹', 'ù'],
        ['Ã»', 'û'],
        ['Ã§', 'ç'],
        ['Ã‘', 'Ñ'],
        ['Ã¢â‚¬Â¢', '•'],
        ['Ã¢â‚¬â€œ', '–'],
        ['Ã¢â‚¬â€', '—'],
        ['Ã¢â‚¬Ëœ', '‘'],
        ['Ã¢â‚¬â„¢', '’'],
        ['Ã¢â‚¬Å“', '“'],
        ['Ã¢â‚¬Â�', '”'],
        ['Ã¢â‚¬Â¦', '…'],
        ['Â¿', '¿'],
        ['Â¡', '¡'],
        ['Âº', 'º'],
        ['Âª', 'ª'],
        ['Â·', '·'],
        ['Â°', '°'],
        ['Â', ''],
      ];

      replacements.forEach(([from, to]) => {
        if (result.includes(from)) {
          result = result.split(from).join(to);
        }
      });
    }

    return result;
  }

  formatMetaLine(parts = []) {
    if (!Array.isArray(parts)) {
      return '';
    }

    return parts
      .filter((part) => {
        if (part === undefined || part === null) {
          return false;
        }
        const textPart = String(part).trim();
        return textPart.length > 0;
      })
      .map((part) => this.fixLegacyEncoding(String(part).trim()))
      .join(' • ');
  }

  // Método para guardar todo el estado relevante en LocalStorageÃ©todo para guardar todo el estado relevante en LocalStorage
  // REEMPLAZA TODA TU FUNCIÓN saveData CON ESTA
  async saveData() {
    const dataToSave = {
      accountType: this.accountType,
      currentUser: this.currentUser,
      userProfile: this.userProfile,
      sharedAccountId: this.sharedAccountId,
      accountOwner: this.accountOwner,
      accountUsers: this.accountUsers,
      inviteCodes: this.inviteCodes,
      currentInviteLink: this.currentInviteLink,
      activityLog: this.activityLog,
      auditLog: this.auditLog,
      customUsers: this.customUsers,
      savingsAccounts: this.savingsAccounts,
      recurringPayments: this.recurringPayments,
      expenses: this.expenses,
      goals: this.goals,
      shoppingItems: this.shoppingItems,
      monthlyIncome: this.monthlyIncome,
      lastSalaryDate: this.lastSalaryDate,
      additionalIncomes: this.additionalIncomes,
      extraIncome: this.extraIncome,
      extraIncomeHistory: this.extraIncomeHistory,
      availableBalance: this.availableBalance,
      freeBalance: this.freeBalance,
      lastBalanceUpdate: this.lastBalanceUpdate,
      userCoins: this.userCoins,
      ownedStyles: this.ownedStyles,
      currentStyle: this.currentStyle,
      budgets: this.budgets,
      expenseTemplates: this.expenseTemplates,
      expensePatterns: this.expensePatterns,
      defaultUser: this.defaultUser,
      motivationalMessages: this.motivationalMessages,
      lastMessageUpdate: this.lastMessageUpdate,
      messageHistory: this.messageHistory,
      lastMorningMessage: this.lastMorningMessage,
      lastNightMessage: this.lastNightMessage,
      activeMessageNotifications: this.activeMessageNotifications,
      notificationStates: this.notificationStates
        ? Object.fromEntries(this.notificationStates)
        : {},
      // lastUpdate: Date.now(), // <--- LÍNEA CRÍTICA ELIMINADA
    };

    // ... (el resto de tu función saveData sigue igual desde aquí) ...
    const { cleaned: normalizedData } = this.normalizePersistedData(dataToSave);

    let localSaveOk = false;
    try {
      const dataString = JSON.stringify(normalizedData);
      localStorage.setItem('financiaProData', dataString);
      localSaveOk = true;
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }

    if (!this.currentUser || this.currentUser === 'anonymous') {
      if (!localSaveOk)
        this.showToast(
          'No se pudieron guardar los datos en este dispositivo.',
          'error'
        );
      return;
    }

    try {
      const firestoreDocId = this.sharedAccountId || this.currentUser;
      const userDocRef = FB.doc(FB.db, 'usuarios', firestoreDocId);
      await FB.setDoc(userDocRef, normalizedData);
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      const message = localSaveOk
        ? 'Datos guardados localmente, pero falló la sincronización con la nube.'
        : 'No se pudieron guardar los datos.';
      this.showToast(message, 'error');
    }
  }

  // === MOTIVATIONAL MESSAGES SYSTEM (JSON LOCAL) ===

  /**
   * Cargar mensajes desde JSON local
   */
  async loadMessagesFromJSON() {
    try {
      const response = await fetch('mensaje-bienvenida.json');
      const data = await response.json();
      this.allMessages = data.mensajes;
      console.log(
        '✅ Mensajes cargados desde JSON:',
        data.metadata.total_mensajes
      );
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  }

  /**
   * Selecciona un mensaje aleatorio sin repetir de una categoría
   */
  getRandomMessage(category, categoryName) {
    if (!category || category.length === 0) return '';

    // Obtener historial de esta categoría
    const history = this.messageHistory[categoryName] || [];

    // Si ya usamos todos, resetear historial
    if (history.length >= category.length) {
      this.messageHistory[categoryName] = [];
      history.length = 0;
    }

    // Índices disponibles (no usados)
    const availableIndexes = [];
    for (let i = 0; i < category.length; i++) {
      if (!history.includes(i)) {
        availableIndexes.push(i);
      }
    }

    // Seleccionar índice aleatorio de los disponibles
    const randomIndex =
      availableIndexes[Math.floor(Math.random() * availableIndexes.length)];

    // Guardar en historial
    this.messageHistory[categoryName].push(randomIndex);
    this.saveData();

    return category[randomIndex];
  }

  /**
   * Genera un mensaje completo personalizado sin repetir
   */
  generatePersonalizedMessage() {
    if (!this.allMessages) {
      console.warn('Mensajes no cargados aún');
      return null;
    }

    const userName = this.userProfile.name || 'Usuario';

    const saludo = this.getRandomMessage(
      this.allMessages.saludos_iniciales,
      'saludos'
    );
    const principal = this.getRandomMessage(
      this.allMessages.mensajes_principales,
      'principales'
    );
    const explicacion = this.getRandomMessage(
      this.allMessages.explicacion_servicio,
      'explicacion'
    );
    const cierre = this.getRandomMessage(
      this.allMessages.cierre_motivacional,
      'cierre'
    );
    const accion = this.getRandomMessage(
      this.allMessages.llamado_accion,
      'accion'
    );

    // Construir mensaje completo
    const mensajeCompleto = `${saludo}\n\n${principal}\n\n${explicacion}\n\n${cierre}\n\n${accion}`;

    // Reemplazar {nombre} con el nombre real del usuario
    return mensajeCompleto.replace(/{nombre}/g, userName);
  }

  /**
   * Crea una notificación de mensaje personalizado (dura 8 horas)
   */
  createMessageNotification(messageType = 'general') {
    const message = this.generatePersonalizedMessage();
    if (!message) return;

    const titles = {
      morning: '☀️ Buenos Días',
      night: '🌙 Buenas Noches',
      welcome: '🎉 Bienvenido',
      general: '💡 Mensaje',
    };

    const icons = {
      morning: 'fa-sun',
      night: 'fa-moon',
      welcome: 'fa-hand-sparkles',
      general: 'fa-lightbulb',
    };

    const colors = {
      morning: '#f59e0b',
      night: '#6366f1',
      welcome: '#10b981',
      general: '#8b5cf6',
    };

    const notificationId = `msg-${Date.now()}`;
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 horas

    // Guardar en array de notificaciones activas
    this.activeMessageNotifications.push({
      id: notificationId,
      type: messageType,
      message: message,
      createdAt: Date.now(),
      expiresAt: expiresAt,
    });
    this.saveData();

    // Crear elemento de notificación
    const notificationHTML = `
      <div class="message-notification" id="${notificationId}" style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        max-width: 380px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideInRight 0.4s ease-out;
        border-left: 4px solid ${colors[messageType]};
      ">
        <div style="padding: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="
                width: 36px;
                height: 36px;
                background: ${colors[messageType]}20;
                color: ${colors[messageType]};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">
                <i class="fas ${icons[messageType]}"></i>
              </div>
              <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: #1e293b;">${titles[messageType]}</h4>
            </div>
            <button onclick="window.app.closeMessageNotification('${notificationId}')" style="
              background: none;
              border: none;
              cursor: pointer;
              color: #94a3b8;
              font-size: 20px;
              padding: 0;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: color 0.2s;
            ">&times;</button>
          </div>
          <div style="
            max-height: 200px;
            overflow-y: auto;
            white-space: pre-line;
            line-height: 1.6;
            font-size: 13px;
            color: #475569;
            padding-right: 8px;
          ">${message}</div>
        </div>
      </div>
    `;

    // Insertar en el body
    const container = document.createElement('div');
    container.innerHTML = notificationHTML;
    document.body.appendChild(container.firstElementChild);

    // Auto-eliminar después de 8 horas
    setTimeout(() => {
      this.closeMessageNotification(notificationId);
    }, 8 * 60 * 60 * 1000);
  }

  /**
   * Cierra una notificación de mensaje
   */
  closeMessageNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification) {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }

    // Eliminar del array de notificaciones activas
    this.activeMessageNotifications = this.activeMessageNotifications.filter(
      (n) => n.id !== notificationId
    );
    this.saveData();
  }

  /**
   * Limpia notificaciones expiradas (más de 8 horas)
   */
  cleanExpiredNotifications() {
    const now = Date.now();
    const expiredIds = [];

    this.activeMessageNotifications = this.activeMessageNotifications.filter(
      (notification) => {
        if (notification.expiresAt < now) {
          expiredIds.push(notification.id);
          return false;
        }
        return true;
      }
    );

    // Eliminar del DOM
    expiredIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.remove();
    });

    if (expiredIds.length > 0) {
      this.saveData();
    }
  }

  /**
   * Restaura notificaciones activas al cargar la página
   */
  restoreActiveNotifications() {
    this.cleanExpiredNotifications();

    this.activeMessageNotifications.forEach((notification) => {
      const titles = {
        morning: '☀️ Buenos Días',
        night: '🌙 Buenas Noches',
        welcome: '🎉 Bienvenido',
        general: '💡 Mensaje',
      };

      const icons = {
        morning: 'fa-sun',
        night: 'fa-moon',
        welcome: 'fa-hand-sparkles',
        general: 'fa-lightbulb',
      };

      const colors = {
        morning: '#f59e0b',
        night: '#6366f1',
        welcome: '#10b981',
        general: '#8b5cf6',
      };

      // Crear elemento de notificación
      const notificationHTML = `
        <div class="message-notification" id="${notification.id}" style="
          position: fixed;
          bottom: 24px;
          right: 24px;
          max-width: 380px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          border-left: 4px solid ${colors[notification.type]};
        ">
          <div style="padding: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="
                  width: 36px;
                  height: 36px;
                  background: ${colors[notification.type]}20;
                  color: ${colors[notification.type]};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                ">
                  <i class="fas ${icons[notification.type]}"></i>
                </div>
                <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: #1e293b;">${
                  titles[notification.type]
                }</h4>
              </div>
              <button onclick="window.app.closeMessageNotification('${
                notification.id
              }')" style="
                background: none;
                border: none;
                cursor: pointer;
                color: #94a3b8;
                font-size: 20px;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
              ">&times;</button>
            </div>
            <div style="
              max-height: 200px;
              overflow-y: auto;
              white-space: pre-line;
              line-height: 1.6;
              font-size: 13px;
              color: #475569;
              padding-right: 8px;
            ">${notification.message}</div>
          </div>
        </div>
      `;

      const container = document.createElement('div');
      container.innerHTML = notificationHTML;
      document.body.appendChild(container.firstElementChild);

      // Auto-eliminar cuando expire
      const remainingTime = notification.expiresAt - Date.now();
      if (remainingTime > 0) {
        setTimeout(() => {
          this.closeMessageNotification(notification.id);
        }, remainingTime);
      }
    });
  }

  /**
   * Verifica si debe mostrar mensaje de mañana (8 AM)
   */
  checkMorningMessage() {
    const now = new Date();
    const hour = now.getHours();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    // Si es las 8 AM (entre 8:00 y 8:59) y no se ha mostrado hoy
    if (
      hour === 8 &&
      (!this.lastMorningMessage || this.lastMorningMessage < today)
    ) {
      this.lastMorningMessage = Date.now();
      this.saveData();
      this.createMessageNotification('morning');
    }
  }

  /**
   * Verifica si debe mostrar mensaje de noche (8 PM)
   */
  checkNightMessage() {
    const now = new Date();
    const hour = now.getHours();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    // Si es las 8 PM (entre 20:00 y 20:59) y no se ha mostrado hoy
    if (
      hour === 20 &&
      (!this.lastNightMessage || this.lastNightMessage < today)
    ) {
      this.lastNightMessage = Date.now();
      this.saveData();
      this.createMessageNotification('night');
    }
  }

  /**
   * Inicia el sistema de verificación de mensajes programados
   */
  startMessageScheduler() {
    // Restaurar notificaciones activas al cargar
    this.restoreActiveNotifications();

    // Verificar inmediatamente
    this.checkMorningMessage();
    this.checkNightMessage();

    // Verificar cada minuto
    setInterval(() => {
      this.checkMorningMessage();
      this.checkNightMessage();
    }, 60000); // 60 segundos

    // Limpiar notificaciones expiradas cada hora
    setInterval(() => {
      this.cleanExpiredNotifications();
    }, 60 * 60 * 1000); // 1 hora
  }

  /**
   * Muestra mensaje de bienvenida al registrarse
   */
  showWelcomeMessage() {
    // Esperar 1 segundo para que se cargue la interfaz
    setTimeout(() => {
      this.createMessageNotification('welcome');
    }, 1000);
  }

  /**
   * Obtiene mensajes motivadores desde la API de Gemini
   * Solo funciona cuando el usuario está logueado
   */
  async fetchMotivationalMessages() {
    // Cargar mensajes del JSON si no están cargados
    if (!this.allMessages) {
      await this.loadMessagesFromJSON();
    }

    // Solo fetch si el usuario está logueado (no anónimo)
    if (this.currentUser === 'anonymous' || !this.firebaseUser) {
      console.log('Usuario anónimo - usando mensajes por defecto');
      return;
    }

    // Verificar si necesitamos actualizar (una vez al día)
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (this.lastMessageUpdate && now - this.lastMessageUpdate < oneDayMs) {
      console.log('Mensajes aún frescos, no es necesario actualizar');
      return;
    }

    try {
      const geminiApiKey = window.geminiApiKey || 'TU_API_KEY_DE_GEMINI';

      if (!geminiApiKey || geminiApiKey === 'TU_API_KEY_DE_GEMINI') {
        console.warn('API Key de Gemini no configurada');
        return;
      }

      const prompt = `Genera 8 mensajes motivadores cortos sobre finanzas personales y ahorro.
      Cada mensaje debe:
      - Ser inspirador y empático
      - Incluir emojis relevantes (💰, 📈, 💪, ✨, 🎯, etc)
      - Mencionar historias de éxito o consejos prácticos
      - Tener máximo 100 caracteres
      - Ser diferente cada vez
      - Enfocarse en: ahorro, metas cumplidas, disciplina financiera, libertad económica

      Formato: Devuelve SOLO un array JSON con objetos que tengan las propiedades: title (string), message (string), icon (string con clase de FontAwesome), gradient (string: blue, purple, green, orange, red, teal, pink, o indigo)

      Ejemplo:
      [
        {
          "title": "🌟 Historias de Éxito",
          "message": "María ahorró $50 al mes y en un año compró su auto 🚗✨",
          "icon": "fas fa-trophy",
          "gradient": "blue"
        }
      ]`;

      // Crear AbortController para timeout de 8 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Extraer JSON del texto
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const messages = JSON.parse(jsonMatch[0]);
        this.motivationalMessages = messages;
        this.lastMessageUpdate = now;
        await this.saveData();
        this.updateCarouselWithMessages();
        console.log('Mensajes motivadores actualizados desde Gemini API');

        // Actualizar notificaciones para mostrar la actualización de IA
        this.updateNotifications();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(
          '⏱️ Timeout al obtener mensajes de Gemini (8s) - usando mensajes guardados'
        );
      } else {
        console.error('Error al obtener mensajes de Gemini:', error);
      }
    }
  }

  /**
   * Actualiza el carrusel HTML con los mensajes motivadores
   */
  updateCarouselWithMessages() {
    if (
      this.currentUser === 'anonymous' ||
      this.motivationalMessages.length === 0
    ) {
      return; // Mantener mensajes por defecto para usuarios anónimos
    }

    const track = document.getElementById('brandCarouselTrack');
    if (!track) return;

    // Generar HTML de las tarjetas
    const cardsHTML = this.motivationalMessages
      .map(
        (msg) => `
      <div class="brand-card">
        <div class="brand-icon gradient-${msg.gradient || 'blue'}">
          <i class="${msg.icon || 'fas fa-star'}"></i>
        </div>
        <div class="brand-content">
          <h3>${msg.title}</h3>
          <p>${msg.message}</p>
        </div>
      </div>
    `
      )
      .join('');

    // Duplicar para scroll infinito
    track.innerHTML = cardsHTML + cardsHTML;
  }

  /**
   * NUEVO: Carga mensajes desde JSON local
   */
  async loadMessagesFromJSON() {
    try {
      // Cargar mensajes de mañana y noche
      const [morningResponse, nightResponse] = await Promise.all([
        fetch('mensajes-manana.json'),
        fetch('mensajes-noche.json'),
      ]);

      if (!morningResponse.ok || !nightResponse.ok) {
        console.error('Error al cargar archivos JSON de mensajes');
        return;
      }

      const morningData = await morningResponse.json();
      const nightData = await nightResponse.json();

      // Guardar en propiedades de la clase
      this.morningMessages = morningData;
      this.nightMessages = nightData;

      console.log('✅ Mensajes JSON cargados correctamente');
      console.log(
        `📅 Mañana (${morningData.libro.horario}):`,
        morningData.saludos_intro?.length || 0,
        'saludos'
      );
      console.log(
        `🌙 Noche (${nightData.libro.horario}):`,
        nightData.saludos_intro?.length || 0,
        'saludos'
      );

      // Inicializar contadores si no existen
      if (!this.currentMorningIndex) this.currentMorningIndex = 0;
      if (!this.currentNightIndex) this.currentNightIndex = 0;
    } catch (error) {
      console.error('Error al cargar mensajes JSON:', error);
    }
  }

  /**
   * NUEVO: Obtiene un mensaje aleatorio de mañana o noche
   */
  getRandomMessage(type = 'morning') {
    const data = type === 'morning' ? this.morningMessages : this.nightMessages;

    if (!data || !data.mensajes || data.mensajes.length === 0) {
      return {
        saludo: 'Hola',
        mensaje: 'Ten un excelente día',
        reflexion: 'La constancia es la clave del éxito',
        despedida: '¡Adelante!',
      };
    }

    // Seleccionar índice actual
    const currentIndex =
      type === 'morning' ? this.currentMorningIndex : this.currentNightIndex;
    const mensaje = data.mensajes[currentIndex % data.mensajes.length];

    // Incrementar índice para la próxima vez
    if (type === 'morning') {
      this.currentMorningIndex = (currentIndex + 1) % data.mensajes.length;
    } else {
      this.currentNightIndex = (currentIndex + 1) % data.mensajes.length;
    }

    // Personalizar con nombre del usuario
    const userName = this.userProfile?.name || 'Usuario';
    const saludoIndex = Math.floor(
      Math.random() * (data.saludos_intro?.length || 1)
    );
    const saludo = (data.saludos_intro?.[saludoIndex] || 'Hola').replace(
      '{nombre}',
      userName
    );

    return {
      saludo,
      ...mensaje,
      userName,
    };
  }

  /**
   * NUEVO: Programa notificaciones a las 8 AM y 8 PM
   */
  scheduleDailyMessages() {
    if (this.dailyMessageScheduled) return;

    const scheduleNotification = (hour, type) => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(hour, 0, 0, 0);

      // Si ya pasó la hora hoy, programar para mañana
      if (next.getTime() <= now.getTime()) {
        next.setDate(next.getDate() + 1);
      }

      const timeUntil = next.getTime() - now.getTime();

      setTimeout(() => {
        console.log(
          `⏰ ${type === 'morning' ? '🌅' : '🌙'} Activando notificación de ${
            type === 'morning' ? 'mañana' : 'noche'
          }`
        );
        this.createDailyMessageNotification(type);
        scheduleNotification(hour, type); // Reprogramar para el día siguiente
      }, timeUntil);

      console.log(
        `📅 Notificación de ${type} programada para: ${next.toLocaleString(
          'es-ES'
        )}`
      );
    };

    // Programar 8 AM (mañana)
    scheduleNotification(8, 'morning');

    // Programar 8 PM (noche)
    scheduleNotification(20, 'night');

    this.dailyMessageScheduled = true;
  }

  /**
   * NUEVO: Crea notificación con mensaje del día
   */
  createDailyMessageNotification(type) {
    const mensaje = this.getRandomMessage(type);
    const icon = type === 'morning' ? 'fa-sun' : 'fa-moon';
    const category = type === 'morning' ? 'morning' : 'night';
    const time = type === 'morning' ? '8:00 AM' : '8:00 PM';

    // Crear notificación visible
    const notification = {
      id: `daily-${type}-${Date.now()}`,
      type: 'daily_message',
      category,
      icon,
      title: `${type === 'morning' ? '🌅' : '🌙'} Mensaje ${
        type === 'morning' ? 'Matutino' : 'Nocturno'
      }`,
      subtitle: mensaje.saludo,
      message: mensaje.mensaje,
      time: 'Ahora',
      priority: 'high',
      isRead: false,
      data: { ...mensaje, type },
    };

    // Mostrar notificación
    this.showDailyMessageModal(mensaje, type);

    // Actualizar sistema de notificaciones
    this.updateNotifications();

    console.log(`✨ Notificación de ${type} creada:`, mensaje);
  }

  /**
   * NUEVO: Muestra modal con mensaje del día
   */
  showDailyMessageModal(mensaje, type) {
    const icon = type === 'morning' ? '🌅' : '🌙';
    const title = type === 'morning' ? 'Mensaje Matutino' : 'Mensaje Nocturno';

    const modalHTML = `
      <div class="daily-message-modal" id="dailyMessageModal">
        <div class="daily-message-overlay"></div>
        <div class="daily-message-content">
          <div class="daily-message-header ${type}">
            <span class="daily-message-icon">${icon}</span>
            <h2>${title}</h2>
            <button class="daily-message-close" onclick="document.getElementById('dailyMessageModal').remove()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="daily-message-body">
            <p class="daily-message-greeting">${mensaje.saludo}</p>
            <p class="daily-message-text">${mensaje.mensaje}</p>
            ${
              mensaje.reflexion
                ? `<p class="daily-message-reflection"><em>"${mensaje.reflexion}"</em></p>`
                : ''
            }
            ${
              mensaje.despedida
                ? `<p class="daily-message-farewell">${mensaje.despedida}</p>`
                : ''
            }
          </div>
        </div>
      </div>
    `;

    // Insertar en el DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Auto-cerrar después de 15 segundos
    setTimeout(() => {
      const modal = document.getElementById('dailyMessageModal');
      if (modal) modal.remove();
    }, 15000);
  }

  // Dentro de class FinanceApp { ... }

  openSecurityModal(mode = 'change') {
    const modal = document.getElementById('securityModal');
    if (!modal) return;

    // Limpiar campos
    [
      'curDaniel',
      'curGivonik',
      'newDaniel',
      'confirmDaniel',
      'newGivonik',
      'confirmGivonik',
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const newPassSection = document.getElementById('newPassSection');
    const saveBtn = document.getElementById('modalSavePasswordsBtn');
    const titleEl = modal.querySelector('.modal-title');

    const isChange = mode === 'change';
    if (newPassSection) newPassSection.style.display = isChange ? '' : 'none';
    if (saveBtn) saveBtn.textContent = isChange ? 'Guardar' : 'Eliminar';
    if (titleEl)
      titleEl.textContent = isChange
        ? 'Cambiar ContraseÃ±as'
        : 'Confirmar eliminaciÃ³n';

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  closeSecurityModal() {
    const modal = document.getElementById('securityModal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  // QUEDARÃ ASÃ (La Ãºnica y correcta funciÃ³n setupAuth)

  // === INICIO DE SECCIÃƒâ€œN: LÃƒâ€œGICA DE AUTENTICACIÃƒâ€œN DE FIREBASE ===
  setupAuth() {
    const FB = window.FB;
    if (!FB?.auth) return;

    const profileMenuContainer = document.getElementById(
      'profileMenuContainer'
    );

    FB.onAuthStateChanged(FB.auth, (user) => {
      const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
      const mobileProfileBtn = document.getElementById('mobileProfileBtn');
      const navbarLoginBtn = document.getElementById('navbarLoginBtn');

      // FOOTER Y HAMBURGUESA
      const footerLoginLink = document.getElementById('footerLoginLink');

      if (user) {
        this.currentUser = user.uid;
        this.firebaseUser = user; // Guardar usuario de Firebase
        this.userProfile.email = user.email || '';
        this.userProfile.name =
          user.displayName || user.email?.split('@')[0] || 'Usuario';

        // Marcar como autenticado
        localStorage.setItem('financia_auth_status', 'authenticated');

        // Show profile menu, hide login button
        if (navbarLoginBtn) navbarLoginBtn.style.display = 'none';
        if (profileMenuContainer) profileMenuContainer.style.display = 'block';

        // Show mobile buttons (CSS handles responsive visibility)
        if (mobileLogoutBtn) mobileLogoutBtn.classList.add('show');
        if (mobileProfileBtn) mobileProfileBtn.classList.add('show');

        // Footer: Ocultar link de login
        if (footerLoginLink) footerLoginLink.style.display = 'none';

        this.updateProfileDisplay();

        // USUARIO AUTENTICADO: Esperar a que los datos reales carguen
        // NO mostrar datos ficticios, solo los datos reales del usuario
        console.log('[Auth] Usuario autenticado, cargando datos reales...');

        // Sincronizar desde Firebase y esperar a que complete
        this.syncFromFirebase()
          .then(() => {
            // Ocultar loading solo cuando los datos reales estén cargados
            this.hideAppLoading();

            console.log(
              '[Auth] Datos reales cargados, renderizando dashboard...'
            );

            // Renderizar todo con datos sincronizados
            this.renderDashboard();
            this.renderSavingsAccountsList();
            this.updateDashboardSavings();
            this.renderRecurringPaymentsList();
            this.initTrendChart();
            this.updateDashboardWelcome();
            this.initAchievements();
            this.updateMenuRestrictions();

            // Inicializar menú móvil DESPUÉS de que todo esté listo
            setTimeout(() => {
              if (typeof this.initMobileMenu === 'function') {
                this.initMobileMenu();
              }
            }, 100);

            // Iniciar sistema de mensajes motivadores
            this.updateCarouselWithMessages();
            setTimeout(() => {
              // DESACTIVADO: Sistema Gemini
              // this.fetchMotivationalMessages();

              // NUEVO: Sistema JSON de mensajes personalizados
              this.loadMessagesFromJSON();
            }, 100);

            // NUEVO: Programar mensajes a las 8 AM y 8 PM
            this.scheduleDailyMessages();

            // Actualizar notificaciones
            this.updateNotifications();
          })
          .catch((err) => {
            console.error('[Auth] Error en sincronización:', err);
            clearTimeout(maxLoadingTime);
            this.hideAppLoading();

            // Renderizar con datos locales si falla
            this.renderDashboard();
            this.renderSavingsAccountsList();
            this.updateDashboardSavings();
            this.renderRecurringPaymentsList();
            //this.updateDashboardPayments();
            this.initTrendChart();
            this.updateDashboardWelcome();
            this.initAchievements();

            // Inicializar menú móvil aunque falle
            setTimeout(() => {
              if (typeof this.initMobileMenu === 'function') {
                this.initMobileMenu();
              }
            }, 100);
          });
      } else {
        this.currentUser = 'anonymous';
        this.firebaseUser = null;
        this.userPlan = 'free';
        this.userProfile.name = 'Usuario';
        this.userProfile.email = '';

        // Marcar como no autenticado
        localStorage.removeItem('financia_auth_status');

        // Show login button, hide profile menu
        if (navbarLoginBtn) navbarLoginBtn.style.display = 'inline-flex';
        if (profileMenuContainer) profileMenuContainer.style.display = 'none';

        // Hide mobile buttons
        if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('show');
        if (mobileProfileBtn) mobileProfileBtn.classList.remove('show');

        // Footer: Mostrar link de login
        if (footerLoginLink) footerLoginLink.style.display = 'block';

        // Para usuario anónimo, ocultar loading y renderizar inmediatamente
        this.hideAppLoading();
        this.updateDashboardWelcome();
        this.updateMenuRestrictions();
        this.renderDashboard();

        // Inicializar menú móvil para anónimo
        setTimeout(() => {
          if (typeof this.initMobileMenu === 'function') {
            this.initMobileMenu();
          }
        }, 100);
      }
    });

    // Setup profile menu functionality
    this.setupProfileMenu();
  }

  setupProfileMenu() {
    const profileAvatarBtn = document.getElementById('profileAvatarBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const viewProfileBtn = document.getElementById('viewProfileBtn');
    const profileSettingsBtn = document.getElementById('profileSettingsBtn');
    const profileLogoutBtn = document.getElementById('profileLogoutBtn');
    const profileUpgradeBtn = document.getElementById('profileUpgradeBtn');

    // Profile avatar click to toggle dropdown
    if (profileAvatarBtn && profileDropdown) {
      profileAvatarBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!profileDropdown.classList.contains('hidden')) {
          if (
            !profileAvatarBtn.contains(e.target) &&
            !profileDropdown.contains(e.target)
          ) {
            profileDropdown.classList.add('hidden');
          }
        }
      });

      // Prevent dropdown from closing when clicking inside
      profileDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Profile menu actions
    if (viewProfileBtn) {
      viewProfileBtn.addEventListener('click', () => {
        this.showSection('config');
        // Activar la pestaña de perfil en configuración
        const profileTab = document.querySelector(
          '[data-settings-tab="profile"]'
        );
        if (profileTab) {
          profileTab.click();
        }
        profileDropdown.classList.add('hidden');
      });
    }

    if (profileSettingsBtn) {
      profileSettingsBtn.addEventListener('click', () => {
        this.showSection('config');
        profileDropdown.classList.add('hidden');
      });
    }

    if (profileLogoutBtn) {
      profileLogoutBtn.addEventListener('click', () => {
        profileDropdown.classList.add('hidden');
        this.showLogoutConfirmModal();
      });
    }

    if (profileUpgradeBtn) {
      profileUpgradeBtn.addEventListener('click', () => {
        this.showUpgradeModal();
        profileDropdown.classList.add('hidden');
      });
    }

    // Initialize SVG gradient for profile ring
    this.initializeProfileRingGradient();

    // Mobile profile button
    const mobileProfileBtn = document.getElementById('mobileProfileBtn');
    if (mobileProfileBtn) {
      mobileProfileBtn.addEventListener('click', () => {
        this.showSection('config');
        // Activar la pestaña de perfil en configuración
        const profileTab = document.querySelector(
          '[data-settings-tab="profile"]'
        );
        if (profileTab) {
          profileTab.click();
        }
      });
    }

    // Mobile logout button
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', () => {
        this.showLogoutConfirmModal();
      });
    }
  }

  showLogoutConfirmModal() {
    const modal = document.getElementById('logoutConfirmModal');
    const closeBtn = document.getElementById('closeLogoutConfirmModal');
    const cancelBtn = document.getElementById('cancelLogoutBtn');
    const confirmBtn = document.getElementById('confirmLogoutBtn');

    if (!modal) return;

    // Show modal
    modal.classList.add('show');

    // Close handlers
    const closeModal = () => {
      modal.classList.remove('show');
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    // Confirm logout
    confirmBtn.onclick = async () => {
      closeModal();
      try {
        const FB = window.FB;

        // Cerrar sesión en Firebase
        await FB.signOut(FB.auth);

        // Limpiar datos del usuario
        this.clearUserData();

        // Mostrar mensaje de éxito
        this.showToast('Sesión cerrada correctamente 👋', 'success');

        // Esperar un momento para que se vea el mensaje y luego recargar
        setTimeout(() => {
          // Recargar la página para limpiar completamente la caché visual
          window.location.reload();
        }, 1000);
      } catch (e) {
        console.error('Error al cerrar sesión:', e);
        this.showToast('Error al cerrar sesión', 'error');
      }
    };

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };
  }

  showRegisterPrompt() {
    const modal = document.getElementById('registerPromptModal');
    const closeBtn = document.getElementById('closeRegisterPromptModal');
    const registerBtn = document.getElementById('registerPromptBtn');
    const loginBtn = document.getElementById('loginPromptBtn');

    if (!modal) return;

    // Show modal
    modal.classList.add('show');

    // Close handler
    const closeModal = () => {
      modal.classList.remove('show');
    };

    closeBtn.onclick = closeModal;

    // Register button
    registerBtn.onclick = () => {
      closeModal();
      this.openAuthModal();
      // Switch to register tab
      setTimeout(() => {
        const registerTab = document.querySelector(
          '[data-auth-tab="register"]'
        );
        if (registerTab) registerTab.click();
      }, 100);
    };

    // Login button
    loginBtn.onclick = () => {
      closeModal();
      this.openAuthModal();
      // Switch to login tab
      setTimeout(() => {
        const loginTab = document.querySelector('[data-auth-tab="login"]');
        if (loginTab) loginTab.click();
      }, 100);
    };

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };
  }

  updateMenuRestrictions() {
    const requiresAuthItems = document.querySelectorAll(
      '.nav-item.requires-auth'
    );
    const isAnonymous = this.currentUser === 'anonymous';

    requiresAuthItems.forEach((item) => {
      if (isAnonymous) {
        item.classList.add('locked');
        // Remover listener anterior si existe
        if (item._restrictionHandler) {
          item.removeEventListener('click', item._restrictionHandler);
        }
        // Crear nuevo handler que bloquea completamente el click
        item._restrictionHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.showRegisterPrompt();
          return false;
        };
        // Añadir con capture:true para interceptar antes que otros listeners
        item.addEventListener('click', item._restrictionHandler, true);
      } else {
        item.classList.remove('locked');
        if (item._restrictionHandler) {
          item.removeEventListener('click', item._restrictionHandler, true);
          item._restrictionHandler = null;
        }
      }
    });
  }

  clearUserData() {
    console.log('[Logout] Limpiando datos del usuario...');

    // Clear all user-specific data from memory
    this.expenses = [];
    this.goals = [];
    this.shoppingItems = [];
    this.monthlyIncome = 2500;
    this.additionalIncomes = [];
    this.budgets = {};
    this.expenseTemplates = [];
    this.savingsAccounts = [];
    this.recurringPayments = [];
    this.currentUser = 'anonymous';
    this.userPlan = 'free';
    this.userProfile = {
      name: 'Usuario',
      email: '',
      avatar: '',
      bannerCover: '',
      quote: '',
      avatarType: 'default',
      selectedAvatar: 0,
    };
    this.userCoins = 0;
    this.ownedStyles = ['default'];
    this.currentStyle = 'default';
    this.accountType = 'personal';
    this.sharedAccountId = null;
    this.accountOwner = null;
    this.accountUsers = [];
    this.inviteCodes = {};
    this.currentInviteLink = null;
    this.activityLog = [];
    this.auditLog = [];
    this.motivationalMessages = [];
    this.lastMessageUpdate = null;
    this.firebaseUser = null;

    // Clear localStorage except tour completion and theme
    const tourCompleted = localStorage.getItem('financia_tour_completed');
    const themePreference = localStorage.getItem('financia_theme');
    const cookieConsent = localStorage.getItem('cookieConsent');

    console.log('[Logout] Limpiando localStorage...');
    localStorage.clear();

    // Restaurar preferencias que queremos mantener
    if (tourCompleted) {
      localStorage.setItem('financia_tour_completed', tourCompleted);
    }
    if (themePreference) {
      localStorage.setItem('financia_theme', themePreference);
    }
    if (cookieConsent) {
      localStorage.setItem('cookieConsent', cookieConsent);
    }

    // Clear sessionStorage
    console.log('[Logout] Limpiando sessionStorage...');
    sessionStorage.clear();

    // Limpiar imágenes del banner y avatar del DOM
    const mobileBannerCover = document.getElementById('mobileBannerCover');
    if (mobileBannerCover) {
      mobileBannerCover.style.backgroundImage = '';
    }

    console.log('[Logout] Datos limpiados correctamente');
  }

  setupLogoRedirect() {
    const logo = document.querySelector('.navbar__logo');
    if (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', () => {
        this.showSection('dashboard');
      });
    }
  }

  updateProfileDisplay() {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileHeaderImg = document.getElementById('profileHeaderImg');
    const mobileAvatar = document.getElementById('mobileAvatar');
    const profileName = document.getElementById('profileName');
    const profilePlan = document.getElementById('profilePlan');
    const profileAvatarWrapper = document.getElementById(
      'profileAvatarWrapper'
    );
    const profileDropdownHeader = document.querySelector(
      '.profile-dropdown-header'
    );
    const profileDropdownFooter = document.querySelector(
      '.profile-dropdown-footer'
    );

    // Update avatar images
    let avatarSrc;

    // Si el usuario no está autenticado, usar avatar genérico
    if (this.currentUser === 'anonymous' || !this.currentUser) {
      avatarSrc =
        'https://ui-avatars.com/api/?name=Usuario&background=21808D&color=fff&size=128&font-size=0.6';
    } else {
      // Usuario autenticado: usar su avatar personalizado o por defecto
      avatarSrc =
        this.userProfile.avatarType === 'custom'
          ? this.userProfile.avatar
          : this.defaultAvatars[this.userProfile.selectedAvatar];
    }

    if (profileAvatar) profileAvatar.src = avatarSrc;
    if (profileHeaderImg) profileHeaderImg.src = avatarSrc;
    if (mobileAvatar) mobileAvatar.src = avatarSrc;

    // Update profile info
    if (profileName) profileName.textContent = this.userProfile.name;

    // Update mobile profile info
    const mobileUsername = document.getElementById('mobileUsername');
    if (mobileUsername) mobileUsername.textContent = this.userProfile.name;

    // Update mobile user quote
    const mobileUserQuote = document.getElementById('mobileUserQuote');
    if (mobileUserQuote) {
      if (this.userProfile.quote && this.userProfile.quote.trim()) {
        mobileUserQuote.textContent = this.userProfile.quote;
        mobileUserQuote.style.opacity = '1';
      } else {
        mobileUserQuote.textContent = 'Agrega una frase inspiradora...';
        mobileUserQuote.style.opacity = '0.5';
      }
    }

    // Update avatar menu if exists
    if (typeof this.updateAvatarMenu === 'function') {
      this.updateAvatarMenu();
    }

    if (profilePlan) {
      profilePlan.textContent =
        this.userPlan === 'pro' ? 'Plan Pro' : 'Plan Free';
      profilePlan.className = `profile-plan ${
        this.userPlan === 'pro' ? 'plan-pro' : ''
      }`;
    }

    // Update Pro/Free visual states
    if (profileAvatarWrapper) {
      profileAvatarWrapper.className = `profile-avatar-wrapper ${
        this.userPlan === 'pro' ? 'user-pro' : ''
      }`;
    }

    if (profileDropdownHeader) {
      profileDropdownHeader.className = `profile-dropdown-header ${
        this.userPlan === 'pro' ? 'user-pro' : ''
      }`;
    }

    if (profileDropdownFooter) {
      profileDropdownFooter.className = `profile-dropdown-footer ${
        this.userPlan === 'pro' ? 'user-pro' : ''
      }`;
    }

    // Load saved banner cover
    const mobileBannerCover = document.getElementById('mobileBannerCover');
    if (mobileBannerCover && this.userProfile.bannerCover) {
      mobileBannerCover.style.backgroundImage = `url(${this.userProfile.bannerCover})`;
      mobileBannerCover.style.backgroundSize = 'cover';
      mobileBannerCover.style.backgroundPosition = 'center';
    }
  }

  /**
   * SOLUCIÓN: Actualiza la información del avatar sidebar
   * Sincroniza el avatar, nombre y email en el menú lateral
   */
  updateAvatarMenu() {
    const avatarSidebarImage = document.getElementById('avatarSidebarImage');
    const avatarSidebarName = document.getElementById('avatarSidebarName');
    const avatarSidebarEmail = document.getElementById('avatarSidebarEmail');

    // Obtener la fuente del avatar actual
    const avatarSrc =
      this.userProfile.avatarType === 'custom'
        ? this.userProfile.avatar
        : this.defaultAvatars[this.userProfile.selectedAvatar];

    // Actualizar imagen del avatar
    if (avatarSidebarImage) {
      avatarSidebarImage.src = avatarSrc;
      // Fallback en caso de error
      avatarSidebarImage.onerror = () => {
        avatarSidebarImage.src = this.defaultAvatars[0]; // Usar primer avatar por defecto
      };
    }

    // Actualizar nombre
    if (avatarSidebarName) {
      avatarSidebarName.textContent = this.userProfile.name || 'Usuario';
    }

    // Actualizar email
    if (avatarSidebarEmail) {
      avatarSidebarEmail.textContent =
        this.userProfile.email || 'email@ejemplo.com';
    }

    // Notificar al avatar-sidebar.js si existe
    // NOTA: Usamos avatarSidebarManager porque avatarSidebar es el elemento HTML
    if (
      window.avatarSidebarManager &&
      typeof window.avatarSidebarManager.updateUserInfo === 'function'
    ) {
      window.avatarSidebarManager.updateUserInfo();
    }
  }

  initializeProfileRingGradient() {
    const profileRingSvg = document.querySelector('.profile-ring-svg');
    if (!profileRingSvg) return;

    // Create gradient definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'linearGradient'
    );
    gradient.setAttribute('id', 'profileGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'stop'
    );
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ffd700');

    const stop2 = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'stop'
    );
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', '#ffa500');

    const stop3 = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'stop'
    );
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#ff6b35');

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);
    profileRingSvg.appendChild(defs);
  }

  showUpgradeModal() {
    // Create a simple upgrade modal
    const modalHtml = `
      <div class="modal upgrade-modal" id="upgradeModal">
        <div class="modal-content upgrade-modal-content">
          <div class="modal-header">
            <h2>🌟 Actualizar a Pro</h2>
            <button class="modal-close" onclick="document.getElementById('upgradeModal').remove()">×</button>
          </div>
          <div class="modal-body">
            <div class="upgrade-features">
              <h3>Características Pro:</h3>
              <ul>
                <li>✨ Foto de perfil personalizada</li>
                <li>🎨 Anillo de perfil animado</li>
                <li>✅ Insignia de verificación</li>
                <li>📊 Análisis avanzados</li>
                <li>🎯 Metas ilimitadas</li>
                <li>☁️ Sincronización prioritaria</li>
              </ul>
              <div class="upgrade-price">
                <span class="price">$4.99/mes</span>
                <span class="price-desc">Cancela cuando quieras</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn--primary" onclick="app.simulateUpgrade()">Actualizar Ahora</button>
            <button class="btn btn--secondary" onclick="document.getElementById('upgradeModal').remove()">Tal vez después</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.getElementById('upgradeModal');
    modal.classList.add('show');
  }

  simulateUpgrade() {
    // Bloquear upgrade - mostrar modal de "Estamos trabajando en ello"
    document.getElementById('upgradeModal')?.remove();
    this.showPremiumComingSoonModal();
  }

  showPremiumComingSoonModal() {
    const modal = document.getElementById('premiumComingSoonModal');
    if (modal) {
      modal.classList.add('show');
    }
  }

  changeAvatar(avatarIndex) {
    if (this.userPlan === 'free') {
      this.userProfile.selectedAvatar = avatarIndex;
      this.userProfile.avatarType = 'default';
      this.userProfile.avatar = this.defaultAvatars[avatarIndex];
    }
    this.updateProfileDisplay();
    this.saveData();
  }

  uploadCustomAvatar(file) {
    // Bloquear subida de avatar personalizado
    this.showPremiumComingSoonModal();
    return;
  }

  //
  // COPIA Y PEGA ESTA NUEVA FUNCIÓN SOBRE LA ANTIGUA
  //
  // REEMPLAZA TODA TU FUNCIÓN syncFromFirebase CON ESTA
  async syncFromFirebase() {
    if (!this.currentUser || this.currentUser === 'anonymous') {
      return;
    }
    if (this.isRegistering) {
      console.log('[Sync] Registro en proceso, saltando sincronización.');
      return;
    }
    console.log('[Sync-RT] 🔄 Suscribiéndose a cambios en tiempo real...');
    try {
      const firestoreDocId = this.sharedAccountId || this.currentUser;
      const userDocRef = FB.doc(FB.db, 'usuarios', firestoreDocId);

      FB.onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const cloudData = docSnap.data() || {};
            console.log(
              '[Sync-RT] ✅ Datos recibidos de Firestore en tiempo real.'
            );

            this.expenses = cloudData.expenses || [];
            this.goals = cloudData.goals || [];
            this.shoppingItems = cloudData.shoppingItems || [];
            this.monthlyIncome = cloudData.monthlyIncome || 2500;
            this.additionalIncomes = cloudData.additionalIncomes || [];
            this.extraIncome = cloudData.extraIncome || 0;
            if (cloudData.userProfile) this.userProfile = cloudData.userProfile;
            if (cloudData.savingsAccounts)
              this.savingsAccounts = cloudData.savingsAccounts;
            if (cloudData.recurringPayments)
              this.recurringPayments = cloudData.recurringPayments;
            this.budgets = cloudData.budgets || {};
            this.userCoins = cloudData.userCoins || 100;
            this.ownedStyles = cloudData.ownedStyles || ['classic'];
            this.currentStyle = cloudData.currentStyle || 'classic';
            this.customUsers = cloudData.customUsers || [];

            // --- CORRECCIÓN IMPORTANTE PARA notificationStates ---
            if (cloudData.notificationStates) {
              if (Array.isArray(cloudData.notificationStates)) {
                this.notificationStates = new Map(cloudData.notificationStates);
              } else {
                this.notificationStates = new Map(
                  Object.entries(cloudData.notificationStates)
                );
              }
            } else {
              this.notificationStates = new Map();
            }

            try {
              localStorage.setItem(
                'financiaProData',
                JSON.stringify(cloudData)
              );
            } catch (error) {
              console.warn(
                'No se pudo actualizar el almacenamiento local.',
                error
              );
            }

            console.log(
              '[Sync-RT] 🎨 Re-renderizando la interfaz con datos actualizados...'
            );
            if (this.currentSection === 'dashboard') {
              this.renderDashboard();
            }
            this.renderExpenses();
            this.renderGoals();
            this.renderShoppingList();
            this.renderConfig();
            this.updateProfileDisplay();
            this.updateUserSelectionDropdown();
            this.updateDashboardWelcome();
            this.renderSavingsAccountsList();
            this.updateDashboardSavings();
            this.renderRecurringPaymentsList();
            // this.updateDashboardPayments(); // <--- LÍNEA ELIMINADA
          } else {
            console.log(
              '[Sync-RT] Creando espacio en la nube para usuario nuevo.'
            );
            this.saveData();
          }
        },
        (error) => {
          console.error('Error en el listener de Firestore:', error);
          this.showToast(
            'Se perdió la conexión en tiempo real con la nube.',
            'error'
          );
        }
      );
    } catch (error) {
      console.error('Error al configurar el listener de Firestore:', error);
      this.showToast('No se pudo conectar a la nube en tiempo real.', 'error');
    }
  }
  // === VALIDACIÓN DE CONTRASEÑA ===
  validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push('mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('una mayúscula');
    if (!/[a-z]/.test(password)) errors.push('una minúscula');
    if (!/[0-9]/.test(password)) errors.push('un número');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('un símbolo (!@#$...)');
    }

    if (errors.length === 0) {
      return { isValid: true };
    }

    const errorMsg =
      errors.length === 1
        ? `Tu contraseña necesita ${errors[0]}`
        : `Tu contraseña necesita: ${errors.join(', ')}`;

    return {
      isValid: false,
      message: errorMsg,
      errors: errors,
    };
  }

  // === REGISTRO CON VALIDACIÓN ===
  async registerWithEmail(email, password) {
    try {
      // Validar email
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        this.showToast(emailValidation.error, 'error');
        return false;
      }

      // Validar contraseña
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        this.showToast(passwordValidation.message, 'error');
        return false;
      }

      console.log('Intentando registrar:', email);
      const userCredential = await FB.createUserWithEmailAndPassword(
        FB.auth,
        email,
        password
      );

      // Enviar email de verificación
      try {
        await userCredential.user.sendEmailVerification();
        this.showToast(
          '¡Bienvenido! 🎉 Enviamos un correo de verificación a tu bandeja',
          'success',
          5000
        );
      } catch (emailError) {
        console.warn('No se pudo enviar email de verificación:', emailError);
        this.showToast('¡Bienvenido a Dan&Giv Control! 🎉', 'success', 4000);
      }

      // Cerrar modal y redirigir al dashboard
      this.closeAuthModal();
      this.showSection('dashboard');

      // Mostrar mensaje de bienvenida personalizado
      if (this.allMessages) {
        this.showWelcomeMessage();
      }

      // Iniciar tour después de redirigir
      setTimeout(() => {
        this.startTour();
      }, 1500);

      return true;
    } catch (error) {
      console.error('[Auth] Error de registro:', error.code, error.message);

      // Mensajes amigables según el error
      const errorMessages = {
        'auth/weak-password':
          'La contraseña debe tener al menos 8 caracteres con mayúsculas, números y símbolos.',
        'auth/email-already-in-use':
          'Este correo ya está registrado. ¿Quieres iniciar sesión?',
        'auth/invalid-email': 'El formato del correo no es válido.',
        'auth/network-request-failed':
          'Error de conexión. Verifica tu internet e intenta de nuevo.',
        'auth/too-many-requests':
          'Demasiados intentos. Por favor espera un momento.',
        'auth/operation-not-allowed':
          'El registro está temporalmente deshabilitado.',
      };

      const message =
        errorMessages[error.code] ||
        'No pudimos crear tu cuenta. Por favor, intenta de nuevo en unos momentos.';
      this.showToast(message, 'error');
      return false;
    }
  }

  // === VALIDACIÓN DE EMAIL ===
  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Formato de correo inválido' };
    }

    const disposableDomains = [
      'tempmail.com',
      'guerrillamail.com',
      'mailinator.com',
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return { isValid: false, error: 'No se permiten correos temporales' };
    }

    return { isValid: true };
  }

  // === RECUPERAR CONTRASEÑA ===
  async resetPassword(email) {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        this.showToast(emailValidation.error, 'error');
        return false;
      }

      await FB.auth.sendPasswordResetEmail(email);
      this.showToast(
        '📧 Correo de recuperación enviado. Revisa tu bandeja.',
        'success'
      );
      return true;
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);

      if (error.code === 'auth/user-not-found') {
        this.showToast('No existe una cuenta con este correo.', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        this.showToast('Demasiados intentos. Intenta más tarde.', 'error');
      } else {
        this.showToast('Error al enviar correo de recuperación.', 'error');
      }
      return false;
    }
  }
  async loginWithEmail(email, password) {
    // Limpiar espacios en blanco y normalizar
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    console.log('[Login] Intentando login con:', cleanEmail);

    try {
      const userCredential = await FB.signInWithEmailAndPassword(
        FB.auth,
        cleanEmail,
        cleanPassword
      );

      console.log('[Login] Login exitoso:', userCredential.user.uid);

      this.showToast(
        `¡Bienvenido de nuevo, ${userCredential.user.email}!`,
        'success'
      );

      // Cerrar modal y redirigir al dashboard
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.classList.remove('show');
      this.showSection('dashboard');
      return true;
    } catch (error) {
      console.error('[Login] Error completo:', {
        code: error.code,
        message: error.message,
        email: cleanEmail,
        passwordLength: cleanPassword.length,
      });

      // Mensajes de error más específicos
      const errorMessages = {
        'auth/wrong-password':
          'Contraseña incorrecta. Verifica e intenta nuevamente.',
        'auth/user-not-found':
          'No existe una cuenta con este correo. Verifica el correo o regístrate.',
        'auth/invalid-credential':
          'Credenciales inválidas. Verifica tu correo y contraseña.',
        'auth/invalid-email': 'El formato del correo no es válido.',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
        'auth/too-many-requests':
          'Demasiados intentos fallidos. Espera unos minutos e intenta de nuevo.',
        'auth/network-request-failed':
          'Error de conexión. Verifica tu internet e intenta de nuevo.',
        'auth/operation-not-allowed':
          'El inicio de sesión con email/password no está habilitado.',
      };

      const message =
        errorMessages[error.code] || `Error al iniciar sesión: ${error.code}`;
      this.showToast(message, 'error');

      return false;
    }
  }

  // === INICIO DE SECCIÃƒâ€œN: INICIALIZACIÃƒâ€œN DE LA APP ===
  init() {
    // Esta función ahora solo llama directamente a los métodos de configuración.
    this.setupAuth();
    this.setupEventListeners(); // ¡CORRECCIÓN! Llamamos a la función correcta.
    this.setupLogoRedirect(); // Logo redirect to dashboard
    this.setupAuditListeners(); // Sistema de auditoría
    this.setupSavingsListeners(); // Sistema de ahorros
    this.setupPaymentsListeners(); // Sistema de pagos recurrentes
    this.setupExpensesModalListener(); // Modal de detalle de gastos
    this.setupNotificationBell();
    this.setupScrollOptimization();
    this.initQuickAccess(); // Optimización sutil del scroll

    // NEW: Budget & Quick Expense Systems
    this.setupBudgetListeners(); // Sistema de presupuesto
    this.setupQuickExpenseListeners(); // Entrada rápida de gastos
    this.setupInstagramQuickActions(); // Instagram-style quick actions (mobile)
    this.setupMobileBannerListeners(); // Mobile banner and avatar listeners
    this.setupPremiumSettings(); // Premium Settings Navigation
    this.checkMonthlyReset();
    // Forzar normalización de datos existentes al inicio
    this.forceDataNormalization();

    // El loading spinner ya está visible desde el HTML
    // Solo se ocultará cuando Firebase termine de sincronizar

    // NO renderizar nada aquí - esperar a que Firebase termine de sincronizar
    // this.renderDashboard(); // MOVIDO a setupAuth después de syncFromFirebase

    // Solo inicializar componentes que no dependen de datos
    this.initSidebarScrollBehavior();
    this.initLazyLoading();
    this.initScrollAnimations();
    // initMobileMenu() se llama después de Firebase sync
  }
  // CORRECCIÃƒâ€œN: Se eliminÃ³ la referencia a 'savedData' y se asignan los valores por defecto directamente.
  resetPasswords() {
    // CORRECCIÃƒâ€œN: Se eliminÃ³ la referencia a 'savedData' y se asignan los valores por defecto directamente.
    this.securityPasswords = {
      Daniel: CryptoJS.SHA256('1234').toString(),
      Givonik: CryptoJS.SHA256('5678').toString(),
    };
    this.saveData();
    this.showToast('Contraseñas reseteadas a valores por defecto', 'success');
  }

  // QuedarÃ¡ asÃ­
  setupEventListeners() {
    // === FORMULARIOS PRINCIPALES ===setupEventListeners() {
    // === LÃƒâ€œGICA DE ONBOARDING HÃBRIDO (NUEVO) ===
    // === USER SYSTEM EVENT LISTENERS ===
    this.setupUserSystemListeners();

    // Setup modal close functionality
    this.setupModalCloseFunctionality();

    // Setup store functionality
    this.setupStore();

    const onboardingChoiceContainer = document.getElementById(
      'onboardingChoiceContainer'
    );
    const aiSetupContainer = document.getElementById('aiSetupContainer');
    const manualSetupContainer = document.getElementById(
      'manualSetupContainer'
    );

    const startAISetupBtn = document.getElementById('startAISetupBtn');
    const startManualSetupBtn = document.getElementById('startManualSetupBtn');

    if (startAISetupBtn) {
      startAISetupBtn.addEventListener('click', () => {
        if (onboardingChoiceContainer)
          onboardingChoiceContainer.classList.add('hidden');
        if (aiSetupContainer) aiSetupContainer.classList.remove('hidden');
      });
    }

    if (startManualSetupBtn) {
      startManualSetupBtn.addEventListener('click', () => {
        if (onboardingChoiceContainer)
          onboardingChoiceContainer.classList.add('hidden');
        if (manualSetupContainer)
          manualSetupContainer.classList.remove('hidden');
      });
    }
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
      expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addExpense(e);
      });
    }

    // Clear expense form button
    const clearExpenseFormBtn = document.getElementById('clearExpenseForm');
    if (clearExpenseFormBtn) {
      clearExpenseFormBtn.addEventListener('click', () => {
        document.getElementById('amount').value = '';
        document.getElementById('description').value = '';
        document.getElementById('category').value = '';
        document.getElementById('necessity').value = '';
        document.getElementById('date').value = new Date()
          .toISOString()
          .split('T')[0];
        document.getElementById('user').value = '';
        document.getElementById('amount').focus();
        this.showToast('Formulario limpiado', 'info');
      });
    }

    // Update expense stats on page load
    this.updateExpenseStats();

    // Manejo del selector de usuarios
    const userSelect = document.getElementById('user');
    const newUserGroup = document.getElementById('newUserGroup');
    const newUserNameInput = document.getElementById('newUserName');

    if (userSelect) {
      userSelect.addEventListener('change', (e) => {
        if (e.target.value === '__add_new__') {
          newUserGroup?.classList.remove('hidden');
          newUserNameInput?.focus();
        } else {
          newUserGroup?.classList.add('hidden');
        }
      });
    }

    // Función para guardar nuevo usuario
    const saveNewUser = () => {
      const newUserName = newUserNameInput.value.trim();

      if (newUserName && !this.customUsers.includes(newUserName)) {
        this.customUsers.push(newUserName);
        this.saveData();
        this.updateUserSelectionDropdown();
        this.updateDefaultUserDropdown(); // Update settings dropdown too

        // Seleccionar el usuario recién creado
        userSelect.value = newUserName;
        newUserGroup.classList.add('hidden');
        newUserNameInput.value = '';

        this.showToast(`Usuario "${newUserName}" añadido`, 'success');
      } else if (this.customUsers.includes(newUserName)) {
        this.showToast('Este usuario ya existe', 'error');
      } else {
        this.showToast('Ingresa un nombre de usuario', 'error');
      }
    };

    if (newUserNameInput) {
      // Guardar con Enter
      newUserNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveNewUser();
        }
      });
    }

    // Guardar con botón
    const saveNewUserBtn = document.getElementById('saveNewUserBtn');
    if (saveNewUserBtn) {
      saveNewUserBtn.addEventListener('click', () => {
        saveNewUser();
      });
    }

    // Setup onboarding tour system
    this.setupOnboardingTour();

    // Setup new configuration handlers
    this.setupConfigurationHandlers();

    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addGoal(e);
      });
    }

    // Botón de ahorrar en dashboard
    const btnSaveToGoals = document.getElementById('btnSaveToGoals');
    if (btnSaveToGoals) {
      btnSaveToGoals.addEventListener('click', () => {
        this.showSavingsModal();
      });
    }

    // Tarjeta de transacciones clickeable
    const transactionsCard = document.getElementById('transactionsCard');
    if (transactionsCard) {
      transactionsCard.addEventListener('click', () => {
        this.showTransactionsModal();
      });
    }

    const budgetCard = document.getElementById('budgetCard');
    if (budgetCard) {
      budgetCard.addEventListener('click', () => {
        this.showBudgetModal();
      });
    }

    const shoppingForm = document.getElementById('shoppingForm');
    if (shoppingForm) {
      shoppingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addShoppingItem(e);
      });
    }

    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
      incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.updateIncome(e);
      });
    }

    // === INGRESOS ADICIONALES ===
    const addAdditionalIncomeBtn = document.getElementById(
      'addAdditionalIncomeBtn'
    );
    if (addAdditionalIncomeBtn) {
      addAdditionalIncomeBtn.addEventListener('click', () => {
        this.addAdditionalIncome();
      });
    }

    // === ASISTENTE DE IA ===
    const aiOnboardingForm = document.getElementById('aiOnboardingForm');
    if (aiOnboardingForm) {
      aiOnboardingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAIOnboarding();
      });
    }

    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendChatMessage();
      });
    }

    // === NAVEGACIÃƒâ€œN Y UI GENERAL ===
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const section = e.currentTarget.getAttribute('data-section');
        this.showSection(section);
      });
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
    }

    // === SELECTORES DE TEMA EN CONFIGURACIÃƒâ€œN ===
    document.querySelectorAll('.theme-option').forEach((option) => {
      option.addEventListener('click', (e) => {
        const theme = e.currentTarget.getAttribute('data-theme');
        this.applyTheme(theme);

        // Actualizar clase active
        document.querySelectorAll('.theme-option').forEach((opt) => {
          opt.classList.remove('active');
        });
        e.currentTarget.classList.add('active');

        // Guardar preferencia
        localStorage.setItem('financia_theme', theme);

        this.showToast(
          `Tema ${
            theme === 'light'
              ? 'claro'
              : theme === 'dark'
              ? 'oscuro'
              : 'automático'
          } aplicado`,
          'success'
        );
      });
    });

    // === SELECTORES DE AVATAR EN TIENDA ===
    document.querySelectorAll('.avatar-option').forEach((option) => {
      option.addEventListener('click', (e) => {
        const avatarId = e.currentTarget.getAttribute('data-avatar');
        this.selectAvatar(avatarId);

        // Actualizar clase selected
        document.querySelectorAll('.avatar-option').forEach((opt) => {
          opt.classList.remove('selected');
        });
        e.currentTarget.classList.add('selected');

        this.showToast('Avatar seleccionado correctamente', 'success');
      });
    });

    // === MODALES DE GESTIÓn FINANCIERA ===
    // Modal de Ahorros
    const addSavingsBtn = document.getElementById('addSavingsBtn');
    const addSavingsBtnEmpty = document.getElementById('addSavingsBtnEmpty');
    const addSavingsModal = document.getElementById('addSavingsModal');
    const closeSavingsModal = document.getElementById('closeSavingsModal');
    const cancelSavingsBtn = document.getElementById('cancelSavingsBtn');

    if (addSavingsBtn && addSavingsModal) {
      addSavingsBtn.addEventListener('click', () => {
        addSavingsModal.classList.add('show');
      });
    }

    if (addSavingsBtnEmpty && addSavingsModal) {
      addSavingsBtnEmpty.addEventListener('click', () => {
        addSavingsModal.classList.add('show');
      });
    }

    if (closeSavingsModal && addSavingsModal) {
      closeSavingsModal.addEventListener('click', () => {
        addSavingsModal.classList.remove('show');
      });
    }

    if (cancelSavingsBtn && addSavingsModal) {
      cancelSavingsBtn.addEventListener('click', () => {
        addSavingsModal.classList.remove('show');
      });
    }

    // Cerrar modal al hacer clic fuera
    if (addSavingsModal) {
      addSavingsModal.addEventListener('click', (e) => {
        if (e.target === addSavingsModal) {
          addSavingsModal.classList.remove('show');
        }
      });
    }

    // Modal de Pagos Recurrentes
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    const addPaymentBtnEmpty = document.getElementById('addPaymentBtnEmpty');
    const addPaymentModal = document.getElementById('addPaymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');

    if (addPaymentBtn && addPaymentModal) {
      addPaymentBtn.addEventListener('click', () => {
        addPaymentModal.classList.add('show');
      });
    }

    if (addPaymentBtnEmpty && addPaymentModal) {
      addPaymentBtnEmpty.addEventListener('click', () => {
        addPaymentModal.classList.add('show');
      });
    }

    if (closePaymentModal && addPaymentModal) {
      closePaymentModal.addEventListener('click', () => {
        addPaymentModal.classList.remove('show');
      });
    }

    if (cancelPaymentBtn && addPaymentModal) {
      cancelPaymentBtn.addEventListener('click', () => {
        addPaymentModal.classList.remove('show');
      });
    }

    // Cerrar modal al hacer clic fuera
    if (addPaymentModal) {
      addPaymentModal.addEventListener('click', (e) => {
        if (e.target === addPaymentModal) {
          addPaymentModal.classList.remove('show');
        }
      });
    }

    // === LÓGICA PARA EL MENÚ HAMBURGUESA (MÓVIL) ===
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    if (hamburgerBtn && sidebar) {
      let overlay = document.querySelector('.overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
      }

      // Función para cerrar el sidebar
      const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      };

      hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });

      // NOTA: El botón mobileHamburgerBtn es manejado por avatar-sidebar.js
      // No agregamos listener aquí para evitar duplicados

      overlay.addEventListener('click', closeSidebar);

      document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            closeSidebar();
          }
        });
      });

      // SOLUCIÓN: Cerrar sidebar automáticamente al cambiar a desktop
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (window.innerWidth > 768) {
            closeSidebar();
            // Forzar limpieza de estilos inline que puedan interferir
            sidebar.style.transform = '';
            overlay.style.display = '';
          }
        }, 100);
      });
    }

    // === FORMATEO AUTOMÁTICO DE INPUTS NUMÉRICOS ===
    this.setupAllNumberInputs();

    // === MODALES Y SEGURIDAD ===
    this.setupAuthModalListeners();

    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showSection('config'));
    }

    const resetBtn = document.getElementById('resetPasswordsBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetPasswords());
    }

    const changePassBtn = document.getElementById('changePasswordsBtn');
    if (changePassBtn) {
      changePassBtn.addEventListener('click', () =>
        this.openSecurityModal('change')
      );
    }

    const modalSaveBtn = document.getElementById('modalSavePasswordsBtn');
    if (modalSaveBtn) {
      modalSaveBtn.addEventListener('click', (e) => {
        e.preventDefault(); // AÃ±adido para consistencia
        this.savePasswordsFromModal();
      });
    }

    // === ACCIONES ESPECÃFICAS ===
    const generateListBtn = document.getElementById('generateList');
    if (generateListBtn) {
      generateListBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.generateShoppingList();
      });
    }

    // Inicializar la fecha en el formulario de gastos
    this.setupCurrentDate();
  }

  setupCurrentDate() {
    const dateField = document.getElementById('date');
    if (dateField) {
      const today = new Date().toISOString().split('T')[0];
      dateField.value = today;

      // Opcional: TambiÃ©n puedes aÃ±adir el atributo max para no permitir fechas futuras
      dateField.max = today;
    }
  }

  setupModalCloseFunctionality() {
    // Setup close functionality for all modals with data-close-modal attribute
    document.addEventListener('click', (e) => {
      const closeButton = e.target.closest('[data-close-modal]');
      if (closeButton) {
        const modalId = closeButton.getAttribute('data-close-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = 'none';
        }
      }
    });

    // Close modal when clicking on backdrop
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const visibleModal = document.querySelector('.modal[style*="block"]');
        if (visibleModal) {
          visibleModal.style.display = 'none';
        }
      }
    });
  }

  // Store System Methods
  setupStore() {
    this.renderStore();
    this.setupStyleManager();
    this.updateCoinsDisplay();
  }

  renderStore() {
    const storeGrid = document.getElementById('storeGrid');
    if (!storeGrid) return;

    storeGrid.innerHTML = '';

    this.chartStyles.forEach((style) => {
      const isOwned = this.ownedStyles.includes(style.id);
      const canAfford = this.userCoins >= style.price;

      const productCard = document.createElement('div');
      productCard.className = `product-card ${isOwned ? 'owned' : ''} ${
        !canAfford && !isOwned ? 'unaffordable' : ''
      }`;

      productCard.innerHTML = `
        <div class="product-preview">
          <div class="mini-chart-preview" style="background: ${
            style.options.backgroundColor
          }">
            ${style.colors
              .map(
                (color, index) =>
                  `<div class="color-bar" style="background: ${color}; height: ${
                    20 + index * 10
                  }px;"></div>`
              )
              .join('')}
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${style.name}</h3>
          <div class="product-price">
            ${style.price === 0 ? 'Gratis' : `${style.price} monedas`}
          </div>
          <button class="product-btn ${
            isOwned ? 'owned-btn' : canAfford ? 'buy-btn' : 'disabled-btn'
          }"
                  onclick="app.${
                    isOwned
                      ? `applyStyle('${style.id}')`
                      : `purchaseStyle('${style.id}')`
                  }"
                  ${!canAfford && !isOwned ? 'disabled' : ''}>
            ${
              isOwned
                ? 'Aplicar'
                : canAfford
                ? 'Comprar'
                : 'Insuficientes monedas'
            }
          </button>
        </div>
      `;

      storeGrid.appendChild(productCard);
    });
  }

  purchaseStyle(styleId) {
    // Bloquear compras - mostrar modal premium coming soon
    this.showPremiumComingSoonModal();
    return;
  }

  applyStyle(styleId) {
    if (!this.ownedStyles.includes(styleId)) return;

    this.currentStyle = styleId;
    this.saveData();

    this.refreshAllCharts();
    this.setupStyleManager();

    const style = this.chartStyles.find((s) => s.id === styleId);
    this.showToast(`Estilo "${style.name}" aplicado`, 'success');
  }

  setupStyleManager() {
    const ownedStylesGrid = document.getElementById('ownedStylesGrid');
    const currentStyleName = document.getElementById('currentStyleName');

    if (!ownedStylesGrid) return;

    // Update current style display
    const currentStyleObj = this.chartStyles.find(
      (s) => s.id === this.currentStyle
    );
    if (currentStyleName && currentStyleObj) {
      currentStyleName.textContent = currentStyleObj.name;
    }

    // Render owned styles
    ownedStylesGrid.innerHTML = '';

    this.ownedStyles.forEach((styleId) => {
      const style = this.chartStyles.find((s) => s.id === styleId);
      if (!style) return;

      const styleCard = document.createElement('div');
      styleCard.className = `owned-style-card ${
        this.currentStyle === styleId ? 'active' : ''
      }`;

      styleCard.innerHTML = `
        <div class="owned-style-preview" style="background: ${
          style.options.backgroundColor
        }">
          ${style.colors
            .slice(0, 3)
            .map(
              (color, index) =>
                `<div class="mini-color-dot" style="background: ${color};"></div>`
            )
            .join('')}
        </div>
        <div class="owned-style-info">
          <span class="owned-style-name">${style.name}</span>
          ${
            this.currentStyle === styleId
              ? '<span class="active-badge">Activo</span>'
              : ''
          }
        </div>
      `;

      styleCard.addEventListener('click', () => {
        if (this.currentStyle !== styleId) {
          this.applyStyle(styleId);
        }
      });

      ownedStylesGrid.appendChild(styleCard);
    });
  }

  updateCoinsDisplay() {
    const coinsDisplay = document.getElementById('userCoins');
    if (coinsDisplay) {
      coinsDisplay.textContent = this.userCoins;
    }
  }

  getCurrentStyleColors() {
    const currentStyleObj = this.chartStyles.find(
      (s) => s.id === this.currentStyle
    );
    return currentStyleObj
      ? currentStyleObj.colors
      : this.chartStyles[0].colors;
  }

  refreshAllCharts() {
    // Destroy existing charts
    if (this.charts.expenseChart) {
      this.charts.expenseChart.destroy();
    }
    if (this.charts.necessityChart) {
      this.charts.necessityChart.destroy();
    }
    if (this.charts.userChart) {
      this.charts.userChart.destroy();
    }
    if (this.charts.trendChart) {
      this.charts.trendChart.destroy();
    }

    // Re-render all charts with new style
    this.renderExpenseChart();
    this.renderNecessityChart();
    this.renderUserChart();
    this.initTrendChart();
  }

  showPremiumFeatures() {
    const storeButton = document.querySelector('[data-section="store"]');
    const styleManagerCard = document.getElementById('styleManagerCard');

    if (storeButton) {
      storeButton.style.display = 'flex';
    }
    if (styleManagerCard) {
      styleManagerCard.style.display = 'block';
    }
  }

  // Premium Form Methods
  setupPremiumForm() {
    this.setupFormAutoFill();
    this.setupNecessitySelector();
    this.setupPremiumSubmitButton();
    this.setupFormValidation();
  }

  setupFormAutoFill() {
    // Auto-fill date
    const dateField = document.getElementById('date');
    if (dateField) {
      const today = new Date().toISOString().split('T')[0];
      dateField.value = today;
      dateField.classList.add('auto-filled');
      dateField.max = today;
    }

    // Auto-fill or hide user selector based on account type
    const userGroup = document.querySelector('.form-group-premium:has(#user)');
    const userField = document.getElementById('user');

    if (this.accountType === 'personal') {
      // Hide user selector for personal accounts
      if (userGroup) {
        userGroup.classList.add('user-selector-hidden');
      }
      if (userField) {
        userField.value = this.currentUser || 'Personal';
      }
    } else if (this.accountType === 'shared') {
      // Show user selector with current users
      if (userGroup) {
        userGroup.classList.remove('user-selector-hidden');
      }
      if (userField && this.currentUser) {
        userField.value = this.currentUser;
        userField.classList.add('auto-filled');
      }
    }
  }

  setupNecessitySelector() {
    const necessityButtons = document.querySelectorAll('.necessity-btn');
    const necessityField = document.getElementById('necessity');

    necessityButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all buttons
        necessityButtons.forEach((b) => b.classList.remove('active'));

        // Add active class to clicked button
        btn.classList.add('active');

        // Update hidden field value
        if (necessityField) {
          necessityField.value = btn.dataset.value;
        }

        // Add visual feedback
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          btn.style.transform = '';
        }, 150);
      });
    });
  }

  setupPremiumSubmitButton() {
    const submitBtn = document.querySelector('.btn-premium');
    const form = document.getElementById('expenseForm');

    if (submitBtn && form) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handlePremiumSubmit(submitBtn);
      });
    }
  }

  async handlePremiumSubmit(btn) {
    // Validate form first
    if (!this.validatePremiumForm()) {
      return;
    }

    // Show loading state
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      // Simulate processing time for UX
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Call the original addExpense method
      const mockEvent = { preventDefault: () => {} };
      this.addExpense(mockEvent);

      // Show success state
      btn.classList.remove('loading');
      btn.classList.add('success');

      // Reset button after delay
      setTimeout(() => {
        btn.classList.remove('success');
        btn.disabled = false;
        this.resetPremiumForm();
      }, 2000);
    } catch (error) {
      // Handle error
      btn.classList.remove('loading');
      btn.disabled = false;
      this.showToast('Error al registrar el gasto', 'error');
    }
  }

  validatePremiumForm() {
    const requiredFields = [
      { id: 'description', name: 'Descripción' },
      { id: 'amount', name: 'Monto' },
      { id: 'category', name: 'Categoría' },
      { id: 'necessity', name: 'Nivel de necesidad' },
      { id: 'date', name: 'Fecha' },
    ];

    // Add user field validation for shared accounts
    if (this.accountType === 'shared') {
      requiredFields.push({ id: 'user', name: 'Usuario' });
    }

    let isValid = true;

    requiredFields.forEach((field) => {
      const element = document.getElementById(field.id);
      const wrapper = element?.closest('.form-group-premium');

      if (element && wrapper) {
        // Remove previous error state
        element.classList.remove('error', 'success');
        const errorMsg = wrapper.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();

        // Validate field
        let fieldValid = true;
        let errorMessage = '';

        if (!element.value.trim()) {
          fieldValid = false;
          errorMessage = `${field.name} es requerido`;
        } else if (field.id === 'amount') {
          const amount = parseFloat(element.value);
          if (isNaN(amount) || amount <= 0) {
            fieldValid = false;
            errorMessage = 'El monto debe ser mayor a 0';
          }
        }

        // Apply validation state
        if (!fieldValid) {
          element.classList.add('error');
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${errorMessage}`;
          wrapper.appendChild(errorDiv);
          isValid = false;
        } else {
          element.classList.add('success');
        }
      }
    });

    return isValid;
  }

  setupFormValidation() {
    const form = document.getElementById('expenseForm');
    if (!form) return;

    // Real-time validation for amount field
    const amountField = document.getElementById('amount');
    if (amountField) {
      amountField.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const wrapper = e.target.closest('.form-group-premium');

        // Remove previous validation state
        e.target.classList.remove('error', 'success');
        const errorMsg = wrapper?.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();

        if (e.target.value && !isNaN(value) && value > 0) {
          e.target.classList.add('success');
        } else if (e.target.value) {
          e.target.classList.add('error');
        }
      });
    }

    // Real-time validation for description field
    const descField = document.getElementById('description');
    if (descField) {
      descField.addEventListener('input', (e) => {
        e.target.classList.remove('error', 'success');
        if (e.target.value.trim().length >= 3) {
          e.target.classList.add('success');
        }
      });
    }
  }

  resetPremiumForm() {
    const form = document.getElementById('expenseForm');
    if (form) {
      form.reset();

      // Remove validation classes
      form.querySelectorAll('.form-control-premium').forEach((field) => {
        field.classList.remove('error', 'success', 'auto-filled');
      });

      // Remove error messages
      form.querySelectorAll('.error-message').forEach((msg) => msg.remove());

      // Reset necessity selector
      document.querySelectorAll('.necessity-btn').forEach((btn) => {
        btn.classList.remove('active');
      });

      // Re-setup auto-fill
      this.setupFormAutoFill();
    }
  }

  showSection(sectionId) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.remove('active');
    });

    const activeNavItem = document.querySelector(
      `[data-section="${sectionId}"]`
    );
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }

    // Update sections
    document.querySelectorAll('.section').forEach((section) => {
      section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Scroll to top of page when changing sections
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    this.currentSection = sectionId;

    // Show/hide Instagram FAB based on section
    const fabInstagram = document.getElementById('fabInstagram');
    if (fabInstagram) {
      if (sectionId === 'config' || sectionId === 'store') {
        fabInstagram.style.display = 'none';
      } else {
        fabInstagram.style.display = 'flex';
      }
    }

    // Start/stop inspiration images for goals
    if (sectionId === 'goals') {
      this.startInspirationRotation();
    } else {
      this.stopInspirationRotation();
    }

    // Render section-specific content
    setTimeout(() => {
      if (sectionId === 'analysis') {
        this.renderAnalysis();
        this.renderRadarChart();
      } else if (sectionId === 'dashboard') {
        this.renderDashboard();
      } else if (sectionId === 'achievements') {
        this.renderAchievements();
      } else if (sectionId === 'audit') {
        this.renderAuditLog();
      } else if (sectionId === 'budget') {
        this.renderBudgetSection();
      }
    }, 100);
  }

  /**
   * Maneja las acciones del avatar sidebar
   * Conecta los botones del menú lateral con las funcionalidades de la app
   */
  handleMenuAction(action) {
    console.log(`[FinanceApp] Manejando acción del menú: ${action}`);

    switch (action) {
      case 'change-photo':
        // Ir a configuración y abrir modal de cambio de avatar
        this.showSection('config');
        setTimeout(() => {
          const changeAvatarBtn = document.getElementById('changeAvatarBtn');
          if (changeAvatarBtn) {
            changeAvatarBtn.click();
          } else {
            this.showToast(
              'Abrir la sección de Configuración para cambiar foto',
              'info'
            );
          }
        }, 300);
        break;

      case 'change-name':
        // Abrir modal para cambiar nombre
        this.openChangeNameModal();
        break;

      case 'edit-quote':
        // Abrir modal para editar frase personal
        this.openEditQuoteModal();
        break;

      case 'my-achievements':
        // Ir a la sección de logros
        this.showSection('achievements');
        break;

      case 'go-premium':
        // Mostrar modal de "en desarrollo"
        this.showPremiumComingSoonModal();
        break;

      case 'report-problem':
        // Mostrar información de soporte
        this.showToast('Envía un email a soporte@dangivcontrol.com', 'info');
        break;

      case 'logout':
        // Cerrar sesión del usuario
        this.showLogoutConfirmModal();
        break;

      default:
        console.warn(`[FinanceApp] Acción no reconocida: ${action}`);
        this.showToast('Función en desarrollo', 'info');
    }
  }

  /**
   * Abre modal para cambiar el nombre del usuario
   */
  openChangeNameModal() {
    const currentName = this.userProfile.name || 'Usuario';
    const newName = prompt('Ingresa tu nuevo nombre:', currentName);

    if (newName && newName.trim() !== '' && newName !== currentName) {
      this.userProfile.name = newName.trim();
      this.saveUserProfile();
      this.updateProfileDisplay();
      this.showToast('Nombre actualizado correctamente', 'success');
    } else if (newName !== null && newName.trim() === '') {
      this.showToast('El nombre no puede estar vacío', 'error');
    }
  }

  /**
   * Muestra modal de Premium próximamente
   */
  showPremiumComingSoonModal() {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'daily-message-modal';
    modal.innerHTML = `
      <div class="daily-message-overlay"></div>
      <div class="daily-message-content">
        <div class="daily-message-header" style="background: linear-gradient(135deg, #667EEA, #764BA2, #F093FB); color: white;">
          <span class="daily-message-icon">👑</span>
          <h2>Dan&Giv Premium</h2>
          <button class="daily-message-close" onclick="this.closest('.daily-message-modal').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="daily-message-body">
          <p class="daily-message-greeting">¡Estamos trabajando en algo especial! ✨</p>
          <p class="daily-message-text">
            Dan&Giv Control Premium está en desarrollo y pronto estará disponible con características increíbles:
          </p>
          <div class="daily-message-reflection">
            <strong>🎯 Próximamente:</strong><br><br>
            • Análisis avanzado con IA personalizada<br>
            • Sincronización multi-dispositivo<br>
            • Reportes financieros profesionales<br>
            • Metas ilimitadas y categorías personalizadas<br>
            • Soporte prioritario 24/7<br>
            • Y muchas sorpresas más...
          </div>
          <p class="daily-message-farewell">
            Mientras tanto, sigue disfrutando de todas las funciones actuales. ¡Gracias por tu interés! 💙
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Cerrar al hacer click en overlay
    const overlay = modal.querySelector('.daily-message-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => modal.remove());
    }

    // Cerrar con ESC
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  /**
   * Abre modal para editar la frase personal
   */
  openEditQuoteModal() {
    const currentQuote = this.userProfile.quote || '';
    const newQuote = prompt('Ingresa tu frase personal:', currentQuote);

    if (newQuote !== null) {
      this.userProfile.quote = newQuote.trim();
      this.saveUserProfile();
      this.updateProfileDisplay();
      this.showToast('Frase personal actualizada', 'success');
    }
  }

  // Dashboard Methods
  // QuedarÃ¡ asÃ­
  // QuedarÃ¡ asÃ­
  // QuedarÃ¡ asÃ­
  renderDashboard() {
    // El Modo Demo ahora solo se activa si el usuario es 'anonymous'
    if (
      this.currentUser === 'anonymous' &&
      this.expenses.length === 0 &&
      this.goals.length === 0
    ) {
      this.startDemoMode();
      return; // AÃ±adimos un return para claridad
    }

    // Para un usuario real (incluso sin datos), detenemos el demo y mostramos su dashboard.
    this.stopDemoMode();
    this.updateStats();
    this.updateDashboardSavings(); // Actualizar total de ahorros
    this.renderPremiumChart();
    this.renderInteractiveSummary();
    this.renderGoalsProgress();
    this.renderGoalsProgressChart();
    this.renderAIRecommendations();
    this.renderRecentTransactions();
    this.updateNotifications();
  }

  // NEW DASHBOARD FUNCTIONS
  renderNewDashboard() {
    this.updateNewStats();
    this.renderNewPremiumChart();
    this.renderNewTrendChart();
    this.renderNewAIRecommendations();
    this.renderNewRecentTransactions();
    this.setupNewQuickActions();
    this.updateNewLastTransaction();
  }

  updateNewStats() {
    const totalExpenses = this.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const monthlyIncome = this.getTotalIncome();
    const balance = monthlyIncome - totalExpenses;
    const savings = balance > 0 ? balance : 0;
    const activeGoals = this.goals.filter(
      (goal) => goal.current < goal.target
    ).length;
    const goalsProgress =
      this.goals.length > 0
        ? Math.round(
            this.goals.reduce(
              (sum, goal) => sum + (goal.current / goal.target) * 100,
              0
            ) / this.goals.length
          )
        : 0;

    // Update DOM elements
    document.getElementById(
      'newTotalBalance'
    ).textContent = `$${this.formatCurrency(balance)}`;
    document.getElementById(
      'newTotalExpenses'
    ).textContent = `$${this.formatCurrency(totalExpenses)}`;
    document.getElementById('newSavings').textContent = `$${this.formatCurrency(
      savings
    )}`;
    document.getElementById('newActiveGoals').textContent = activeGoals;
    document.getElementById(
      'newGoalsProgress'
    ).textContent = `${goalsProgress}% completado`;

    // Update trends
    const expensesChange = this.calculateExpensesChange();
    const expensesChangeEl = document.getElementById('newExpensesChange');
    if (expensesChangeEl) {
      expensesChangeEl.textContent = `${
        expensesChange >= 0 ? '+' : ''
      }${expensesChange}% vs anterior`;
      expensesChangeEl.className = `stat-trend ${
        expensesChange >= 0 ? 'negative' : 'positive'
      }`;
    }
  }

  renderNewPremiumChart() {
    const canvas = document.getElementById('newPremiumChart');
    const legendContainer = document.getElementById('newChartLegend');
    const totalAmountEl = document.getElementById('newTotalAmount');

    if (!canvas || !legendContainer || !totalAmountEl) return;

    // Clear previous chart
    if (this.newPremiumChart) {
      this.newPremiumChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const categoryData = this.getCategoryData();
    const totalExpenses = categoryData.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    totalAmountEl.textContent = `$${this.formatCurrency(totalExpenses)}`;

    if (categoryData.length === 0) {
      // Show demo data
      const demoData = [
        { category: 'Alimentación', amount: 450, color: '#FF6384' },
        { category: 'Transporte', amount: 200, color: '#36A2EB' },
        { category: 'Entretenimiento', amount: 150, color: '#FFCE56' },
      ];

      this.newPremiumChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: demoData.map((item) => item.category),
          datasets: [
            {
              data: demoData.map((item) => item.amount),
              backgroundColor: demoData.map((item) => item.color),
              borderWidth: 0,
              hoverBorderWidth: 3,
              hoverBorderColor: '#fff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) =>
                  `${context.label}: $${this.formatCurrency(context.raw)}`,
              },
            },
          },
          cutout: '84%', // Grosor más fino y elegante
        },
      });

      // Update legend
      legendContainer.innerHTML = demoData
        .map(
          (item) => `
        <div class="legend-item demo-item">
          <span class="legend-color" style="background-color: ${
            item.color
          }"></span>
          <span class="legend-label">${item.category}</span>
          <span class="legend-amount">$${this.formatCurrency(
            item.amount
          )}</span>
        </div>
      `
        )
        .join('');

      totalAmountEl.textContent = `$${this.formatCurrency(800)}`;
      return;
    }

    // Real data chart
    this.newPremiumChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryData.map((item) => item.category),
        datasets: [
          {
            data: categoryData.map((item) => item.amount),
            backgroundColor: categoryData.map((item) => item.color),
            borderWidth: 0,
            hoverBorderWidth: 3,
            hoverBorderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.label}: $${this.formatCurrency(context.raw)}`,
            },
          },
        },
        cutout: '84%', // Grosor más fino y elegante
      },
    });

    // Update legend
    legendContainer.innerHTML = categoryData
      .map(
        (item) => `
      <div class="legend-item">
        <span class="legend-color" style="background-color: ${
          item.color
        }"></span>
        <span class="legend-label">${item.category}</span>
        <span class="legend-amount">$${this.formatCurrency(item.amount)}</span>
      </div>
    `
      )
      .join('');
  }

  renderNewTrendChart() {
    const canvas = document.getElementById('newTrendChart');
    if (!canvas) return;

    // Clear previous chart
    if (this.newTrendChart) {
      this.newTrendChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const trendData = this.getTrendData();

    this.newTrendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [
          {
            label: 'Gastos Diarios',
            data: trendData.data,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#007bff',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: {
              callback: (value) => `$${this.formatCurrency(value)}`,
            },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  }

  renderNewAIRecommendations() {
    const container = document.getElementById('newAiRecommendations');
    if (!container) return;

    container.innerHTML = '';

    let recommendations = [];

    if (this.expenses.length > 0) {
      const totalExpenses = this.expenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const avgDailySpend = totalExpenses / Math.max(1, this.expenses.length);

      recommendations = [
        `💡 Tu gasto promedio diario es $${this.formatNumber(
          avgDailySpend
        )}. Considera establecer un presupuesto diario.`,
        `📊 Has registrado ${this.expenses.length} transacciones. ¡Mantén el control de tus finanzas!`,
        `🎯 Revisa tus gastos semanalmente para identificar oportunidades de ahorro.`,
      ];
    } else {
      recommendations = [
        `💡 Comienza registrando todos tus gastos, incluso los pequeños. Todo suma.`,
        `🎯 Establece metas financieras específicas y alcanzables para mantenerte motivado.`,
        `📊 Revisa tus gastos semanalmente para identificar patrones y oportunidades.`,
      ];
    }

    recommendations.forEach((recommendation, index) => {
      const recEl = document.createElement('div');
      recEl.className = 'ai-recommendation-card';
      recEl.innerHTML = `
        <div class="ai-rec-icon">
          <i class="fas fa-robot"></i>
        </div>
        <div class="ai-rec-content">
          <h5>Consejo ${index + 1}</h5>
          <p>${recommendation}</p>
        </div>
      `;
      container.appendChild(recEl);
    });
  }

  renderNewRecentTransactions() {
    const container = document.getElementById('newRecentTransactions');
    if (!container) return;

    container.innerHTML = '';

    const recentExpenses = this.expenses.slice(-5).reverse();

    if (recentExpenses.length === 0) {
      const demoTransactions = [
        {
          description: 'Almuerzo en restaurante',
          amount: 25.5,
          category: 'Alimentación',
          date: new Date(),
        },
        {
          description: 'Combustible',
          amount: 45.0,
          category: 'Transporte',
          date: new Date(Date.now() - 86400000),
        },
        {
          description: 'Supermercado',
          amount: 67.3,
          category: 'Alimentación',
          date: new Date(Date.now() - 172800000),
        },
      ];

      container.innerHTML = `
        <div class="demo-notice">
          <i class="fas fa-lightbulb"></i>
          <p>Datos de ejemplo - Comienza registrando tus gastos</p>
        </div>
      `;

      demoTransactions.forEach((expense) => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item demo-item';
        transactionEl.innerHTML = `
          <div class="transaction-info">
            <h4>${expense.description}</h4>
            <div class="transaction-meta">
              <span class="transaction-category">${expense.category}</span>
              <span class="transaction-date">${expense.date.toLocaleDateString()}</span>
            </div>
          </div>
          <div class="transaction-amount">-$${this.formatNumber(
            expense.amount
          )}</div>
        `;
        container.appendChild(transactionEl);
      });
      return;
    }

    recentExpenses.forEach((expense) => {
      const transactionEl = document.createElement('div');
      transactionEl.className = 'transaction-item';
      transactionEl.innerHTML = `
        <div class="transaction-info">
          <h4>${expense.description}</h4>
          <div class="transaction-meta">
            <span class="transaction-category">${expense.category}</span>
            <span class="transaction-date">${new Date(
              expense.date
            ).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="transaction-amount">-$${this.formatCurrency(
          expense.amount
        )}</div>
      `;
      container.appendChild(transactionEl);
    });
  }

  setupNewQuickActions() {
    const addExpenseBtn = document.getElementById('newQuickAddExpense');
    const addGoalBtn = document.getElementById('newQuickAddGoal');
    const viewAnalysisBtn = document.getElementById('newQuickViewAnalysis');
    const viewGoalsBtn = document.getElementById('newQuickViewGoals');

    if (addExpenseBtn) {
      addExpenseBtn.addEventListener('click', () =>
        this.showSection('expenses')
      );
    }
    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => this.showSection('goals'));
    }
    if (viewAnalysisBtn) {
      viewAnalysisBtn.addEventListener('click', () =>
        this.showSection('analysis')
      );
    }
    if (viewGoalsBtn) {
      viewGoalsBtn.addEventListener('click', () => this.showSection('goals'));
    }
  }

  updateNewLastTransaction() {
    const detailEl = document.getElementById('newLastTransactionDetail');
    if (!detailEl) return;

    if (this.expenses.length === 0) {
      detailEl.innerHTML = `
        <span class="transaction-desc">Sin transacciones</span>
        <span class="transaction-amount">$0</span>
      `;
      return;
    }

    const lastExpense = this.expenses[this.expenses.length - 1];
    detailEl.innerHTML = `
      <span class="transaction-desc">${lastExpense.description}</span>
      <span class="transaction-amount">-$${this.formatCurrency(
        lastExpense.amount
      )}</span>
    `;
  }

  setupNotificationBell() {
    const area = document.getElementById('notificationArea');
    const dropdown = document.getElementById('notificationDropdown');
    const badge = document.getElementById('notificationCount');

    if (area && dropdown) {
      area.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');

        if (!dropdown.classList.contains('hidden')) {
          if (badge) badge.style.display = 'none';
        }
      });

      dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      document.addEventListener('click', (e) => {
        if (!dropdown.classList.contains('hidden')) {
          if (!area.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
          }
        }
      });
    }

    // ===== CAMPANA DE NOTIFICACIONES DEL BANNER MÓVIL =====
    const bannerArea = document.getElementById('bannerNotificationArea');
    const bannerBadge = document.getElementById('bannerNotificationCount');

    if (bannerArea && dropdown) {
      bannerArea.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');

        // Ocultar badge al abrir
        if (!dropdown.classList.contains('hidden')) {
          if (bannerBadge) bannerBadge.style.display = 'none';
          if (badge) badge.style.display = 'none';
        }
      });
    }
  }

  updateNotifications() {
    // Notification tracking is already initialized in constructor
    // No need to reinitialize here

    let notifications = [];
    const today = new Date();

    // === NOTIFICACIONES DESDE AUDIT LOG ===
    // Solo cambios SENSIBLES: eliminaciones, modificaciones de montos, cambios de ingresos
    const sensitiveTypes = [
      'expense_deleted',
      'expense_modified',
      'income_config',
      'goal_deleted',
      'goal_modified',
      'budget_modified',
      'budget_deleted',
    ];

    const sensitiveChanges = (this.auditLog || [])
      .filter((entry) => sensitiveTypes.includes(entry.type))
      .slice(0, 10); // Últimos 10 cambios sensibles

    sensitiveChanges.forEach((change, index) => {
      const changeDate = new Date(change.timestamp);
      const actionIcons = {
        added: 'fa-plus-circle',
        modified: 'fa-edit',
        deleted: 'fa-trash-alt',
        updated: 'fa-sync-alt',
      };

      const actionLabels = {
        added: 'Creado',
        modified: 'Modificado',
        deleted: 'Eliminado',
        updated: 'Actualizado',
      };

      // Determinar categoría y título desde el tipo de auditoría
      let category = 'warning';
      let priority = 'medium';
      let title = change.description || 'Cambio registrado';
      let subtitle = change.reason || '';
      let amount = '';

      // Categorías específicas por tipo
      if (change.type.includes('deleted')) {
        category = 'danger';
        priority = 'high';
      } else if (
        change.type.includes('modified') ||
        change.type.includes('config')
      ) {
        category = 'warning';
        priority = 'medium';
      }

      // Extraer monto si existe en details
      if (change.details && change.details.amount) {
        amount = `$${this.formatNumber(change.details.amount)}`;
      }

      notifications.push({
        id: `audit-${change.id}`,
        type: 'change',
        category: category,
        icon: actionIcons[change.action] || 'fa-exclamation-circle',
        title: title,
        subtitle: subtitle,
        amount: amount,
        time: this.getRelativeTime(changeDate),
        priority: priority,
        data: { auditId: change.id },
        isRead: this.notificationStates.get(`audit-${change.id}`) || false,
        isProtected: true,
      });
    });

    // === NOTIFICACIÓN DE MENSAJES MOTIVADORES (1 AM) ===
    if (this.lastMessageUpdate && this.currentUser !== 'anonymous') {
      const lastUpdate = new Date(this.lastMessageUpdate);
      const hoursSinceUpdate =
        (Date.now() - this.lastMessageUpdate) / (1000 * 60 * 60);

      // Mostrar notificación si la actualización fue reciente (menos de 6 horas)
      if (hoursSinceUpdate < 6) {
        notifications.push({
          id: 'ai_messages_update',
          type: 'ai',
          category: 'ai',
          icon: 'fa-robot',
          title: '🌟 Mensajes Motivadores Actualizados',
          subtitle: 'La IA generó nuevos mensajes inspiradores para ti',
          amount: '8 mensajes',
          time: this.getRelativeTime(lastUpdate),
          priority: 'low',
          data: { section: 'dashboard' },
          isRead: this.notificationStates.get('ai_messages_update') || false,
        });
      }
    }

    // Add invite link notification if exists
    if (this.currentInviteLink && !this.currentInviteLink.used) {
      console.log('DEBUG: Agregando notificación de enlace a la lista');
      console.log('DEBUG: currentInviteLink:', this.currentInviteLink);
      const isExpired = Date.now() > this.currentInviteLink.expiresAt;
      const timeRemaining = this.currentInviteLink.expiresAt - Date.now();
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

      notifications.push({
        id: 'invite_link_current',
        type: 'invite_link',
        category: 'link',
        title: isExpired
          ? '❌ Enlace de Invitación Expirado'
          : '🔗 Creaste un Enlace de Invitación',
        subtitle: isExpired
          ? 'Este enlace ya no es válido'
          : `Haz clic para copiar • Expira en ${hoursRemaining}h`,
        amount: '',
        time: this.getRelativeTime(new Date(this.currentInviteLink.createdAt)),
        priority: isExpired ? 'low' : 'high',
        data: {
          link: this.currentInviteLink.link,
          section: 'invite',
          expired: isExpired,
        },
        isRead: this.notificationStates.get('invite_link_current') || false,
        link: this.currentInviteLink.link,
        expired: isExpired,
      });
    }

    // === NOTIFICACIONES DE METAS (Solo urgentes) ===
    this.goals.forEach((goal, index) => {
      const deadline = new Date(goal.deadline);
      const diff = (deadline - today) / (1000 * 60 * 60 * 24);
      const progress = (goal.current / goal.target) * 100;

      // Solo mostrar metas muy urgentes (2 días o menos) o cercanas al vencimiento (7 días)
      if (diff <= 7 && goal.current < goal.target) {
        const priority = diff <= 2 ? 'high' : 'medium';
        const urgencyText = diff <= 1 ? 'mañana' : `${Math.ceil(diff)} días`;

        notifications.push({
          id: `goal-${index}-deadline`,
          type: 'goal',
          category: 'goal',
          icon: 'fa-bullseye',
          title: `⚠️ Meta: ${goal.name}`,
          subtitle: `Vence en ${urgencyText}`,
          amount: `$${this.formatCurrency(
            goal.target - goal.current
          )} restantes`,
          time: this.getRelativeTime(deadline),
          priority: priority,
          data: { goalId: index, section: 'goals' },
          isRead:
            this.notificationStates.get(`goal-${index}-deadline`) || false,
        });
      }
    });

    // === NOTIFICACIONES DE GASTOS Y COMPRAS DESHABILITADAS ===
    // NO se muestran notificaciones de gastos recientes ni compras
    // Solo se muestran cambios sensibles (modificaciones, borrados)

    // Update badge count (only unread notifications)
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    this.updateNotificationBadge(unreadCount);

    // Render notifications
    this.renderNotificationList(notifications);

    // Setup event listeners for new notifications
    this.setupNotificationEventListeners();
  }

  getCategoryIcon(category) {
    const iconMap = {
      Alimentación: 'food',
      Transporte: 'transport',
      Entretenimiento: 'entertainment',
      Salud: 'health',
      Servicios: 'services',
      Compras: 'shopping',
      Otros: 'shopping',
    };
    return iconMap[category] || 'shopping';
  }

  getCategoryEmoji(category) {
    const emojiMap = {
      food: '🍔',
      transport: '🚗',
      entertainment: '🎬',
      health: '🏥',
      services: '⚡',
      shopping: '🛒',
      goal: '🎯',
      protected: '🔒',
    };
    return emojiMap[category] || '📝';
  }

  updateNotificationBadge(count) {
    const badge = document.getElementById('notificationCount');
    const bannerBadge = document.getElementById('bannerNotificationCount');

    if (badge) {
      if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count > 99 ? '99+' : count.toString();
      } else {
        badge.style.display = 'none';
      }
    }

    // Sincronizar badge del banner móvil
    if (bannerBadge) {
      if (count > 0) {
        bannerBadge.style.display = 'flex';
      } else {
        bannerBadge.style.display = 'none';
      }
    }
  }

  renderNotificationList(notifications) {
    const list = document.getElementById('notificationList');
    const emptyState = document.getElementById('notificationEmpty');

    if (!list || !emptyState) return;

    // Filtrar solo notificaciones NO leídas
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    // Show/hide empty state
    if (unreadNotifications.length === 0) {
      list.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    list.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Sort notifications by priority
    const sortedNotifications = unreadNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Render notification items
    list.innerHTML = '';
    sortedNotifications.forEach((notification) => {
      const item = this.createNotificationItem(notification);
      list.appendChild(item);
    });
  }

  createNotificationItem(notification) {
    const item = document.createElement('div');
    item.className = `notification-item priority-${notification.priority}${
      notification.isRead ? ' read' : ''
    }`;
    item.dataset.notificationId = notification.id;

    // Si tiene icono de FontAwesome, usarlo; si no, usar emoji
    const iconContent = notification.icon
      ? `<i class="fas ${notification.icon}"></i>`
      : this.getCategoryEmoji(notification.category);

    // Badge especial para cambios protegidos
    const protectedBadge = notification.isProtected
      ? '<span class="notification-protected-badge"><i class="fas fa-shield-alt"></i></span>'
      : '';

    item.innerHTML = `
      <div class="notification-icon category-${notification.category}">
        ${iconContent}
      </div>

      <div class="notification-content">
        <h6 class="notification-title">
          ${notification.title}
          ${protectedBadge}
        </h6>
        <p class="notification-subtitle">
          ${notification.subtitle}
          ${
            notification.amount
              ? `<span class="notification-amount">${notification.amount}</span>`
              : ''
          }
        </p>
        <div class="notification-time">${notification.time}</div>
      </div>

      <div class="notification-actions">
        <button class="notification-action-btn" data-action="read" title="Marcar como leída">
          <i class="fas fa-check"></i>
        </button>
        ${
          notification.type !== 'ai'
            ? `
        <button class="notification-action-btn" data-action="view" title="Ver detalles">
          <i class="fas fa-external-link-alt"></i>
        </button>
        `
            : ''
        }
      </div>
    `;

    return item;
  }

  setupNotificationEventListeners() {
    // Mark all as read button
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
      markAllBtn.replaceWith(markAllBtn.cloneNode(true)); // Remove old listeners
      document
        .getElementById('markAllReadBtn')
        .addEventListener('click', () => {
          this.markAllNotificationsAsRead();
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('notificationSettingsBtn');
    if (settingsBtn) {
      settingsBtn.replaceWith(settingsBtn.cloneNode(true)); // Remove old listeners
      document
        .getElementById('notificationSettingsBtn')
        .addEventListener('click', () => {
          this.showToast(
            'Configuración de notificaciones próximamente',
            'info'
          );
        });
    }

    // Individual notification actions
    const actionBtns = document.querySelectorAll('.notification-action-btn');
    actionBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const notificationId =
          btn.closest('.notification-item').dataset.notificationId;

        if (action === 'read') {
          this.markNotificationAsRead(notificationId);
        } else if (action === 'view') {
          this.handleNotificationClick(notificationId);
        }
      });
    });

    // Notification item clicks
    const notificationItems = document.querySelectorAll('.notification-item');
    notificationItems.forEach((item) => {
      item.addEventListener('click', () => {
        const notificationId = item.dataset.notificationId;
        this.handleNotificationClick(notificationId);
      });
    });
  }

  markNotificationAsRead(notificationId) {
    this.notificationStates.set(notificationId, true);
    this.saveData(); // Save state

    const item = document.querySelector(
      `[data-notification-id="${notificationId}"]`
    );
    if (item) {
      item.classList.add('read');
      item.classList.add('removing');

      setTimeout(() => {
        this.updateNotifications(); // Refresh the list and update badge
      }, 200);
    } else {
      // If item doesn't exist in DOM, still update badge
      this.updateNotifications();
    }
  }

  markAllNotificationsAsRead() {
    const items = document.querySelectorAll('.notification-item:not(.read)');
    items.forEach((item) => {
      const notificationId = item.dataset.notificationId;
      this.notificationStates.set(notificationId, true);
    });

    this.saveData();
    this.updateNotifications();
    this.showToast('Todas las notificaciones marcadas como leídas', 'success');
  }

  handleNotificationClick(notificationId) {
    // Mark as read when clicked
    this.markNotificationAsRead(notificationId);

    // Handle invite link notification
    if (notificationId === 'invite_link_current' && this.currentInviteLink) {
      if (
        !this.currentInviteLink.expired &&
        Date.now() < this.currentInviteLink.expiresAt
      ) {
        // Copy link to clipboard
        const tempInput = document.createElement('input');
        tempInput.value = this.currentInviteLink.link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        this.showToast(
          'Enlace de invitación copiado al portapapeles',
          'success'
        );
      } else {
        this.showToast('Este enlace ha expirado', 'error');
      }
    } else {
      // Navigate to relevant section (placeholder for future implementation)
      this.showToast('Navegación a sección específica próximamente', 'info');
    }

    // Close dropdown
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
  }

  getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days} días`;
    return date.toLocaleDateString();
  }

  // QuedarÃ¡ asÃ­ (updateStats)
  updateStats(demoStats = null) {
    console.log('📊 updateStats ejecutándose...');
    let stats;
    if (demoStats) {
      stats = {
        availableBalance: demoStats.balance,
        totalExpenses: demoStats.expenses,
        totalSavings: demoStats.savings,
        transactionCount: demoStats.transactions,
      };
    } else {
      const totalExpenses = this.expenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const totalSavings = this.goals.reduce(
        (sum, goal) => sum + goal.current,
        0
      );
      const totalIncome = this.getTotalIncome(); // Incluye base + extras
      stats = {
        availableBalance: totalIncome - totalExpenses,
        totalExpenses: totalExpenses,
        totalSavings: totalSavings,
        transactionCount: this.expenses.length,
      };
    }

    const totalBalanceEl = document.getElementById('totalBalance');
    const assignedToGoals = this.goals.reduce(
      (sum, g) => sum + (g.current || 0),
      0
    );

    console.log('📊 Renderizando Dashboard Balance:', {
      monthlyIncome: this.monthlyIncome,
      extraIncome: this.extraIncome,
      getTotalIncome: this.getTotalIncome(),
      totalExpenses: stats.totalExpenses,
      availableBalance: stats.availableBalance,
      assignedToGoals: assignedToGoals
    });

    // Permitir balance negativo - NO usar Math.max(0, ...)
    const trueAvailable = stats.availableBalance - assignedToGoals;

    // Formatear con signo negativo si corresponde
    const formattedBalance =
      trueAvailable < 0
        ? `-$${Math.abs(trueAvailable).toLocaleString()}`
        : `$${trueAvailable.toLocaleString()}`;

    totalBalanceEl.textContent = formattedBalance;

    // Agregar clase para balance negativo (color rojo)
    const statCard = totalBalanceEl.closest('.stat-card');
    if (statCard) {
      if (trueAvailable < 0) {
        statCard.classList.add('balance-negative');
      } else {
        statCard.classList.remove('balance-negative');
      }
    }

    // Update mobile user stats
    const mobileUserStats = document.getElementById('mobileUserStats');
    if (mobileUserStats) {
      mobileUserStats.textContent = `Balance: ${formattedBalance}`;
    }

    // Agregar tooltip con breakdown completo
    if (this.extraIncome > 0) {
      const totalIncome = this.getTotalIncome();
      totalBalanceEl.title = `Ingresos: $${totalIncome.toLocaleString()} (Base: $${this.monthlyIncome.toLocaleString()} + Extras: $${this.extraIncome.toLocaleString()})\nGastos: $${stats.totalExpenses.toLocaleString()}\nAsignado a Metas: $${assignedToGoals.toLocaleString()}\nDisponible: ${formattedBalance}`;
    } else {
      totalBalanceEl.title = `Ingresos: $${this.monthlyIncome.toLocaleString()}\nGastos: $${stats.totalExpenses.toLocaleString()}\nAsignado a Metas: $${assignedToGoals.toLocaleString()}\nDisponible: ${formattedBalance}`;
    }

    document.getElementById(
      'totalExpenses'
    ).textContent = `$${stats.totalExpenses.toLocaleString()}`;

    // Progreso mensual
    const totalIncome = this.getTotalIncome();
    const usedPercent =
      totalIncome > 0
        ? ((stats.totalExpenses / totalIncome) * 100).toFixed(0)
        : 0;
    const remaining = Math.max(
      0,
      totalIncome - stats.totalExpenses - assignedToGoals
    );

    const monthlyProgressEl = document.getElementById('monthlyProgress');
    const monthlyProgressTextEl = document.getElementById(
      'monthlyProgressText'
    );

    if (monthlyProgressEl) {
      monthlyProgressEl.textContent = `${usedPercent}%`;
    }

    if (monthlyProgressTextEl) {
      monthlyProgressTextEl.textContent = `Comenzaste con $${totalIncome.toLocaleString()} • Te queda $${remaining.toLocaleString()}`;
      monthlyProgressTextEl.className =
        usedPercent > 80 ? 'stat-change negative' : 'stat-change positive';
    }

    // Tarjeta de Presupuesto (Solo gastos extras/no esenciales)
    const currentMonth = this.getCurrentMonthKey();
    const currentBudget = this.budgets[currentMonth] || {
      totalLimit: 0,
      totalSpent: 0,
    };
    const budgetLimit = currentBudget.totalLimit || 0;

    // Calcular solo gastos no esenciales (Poco Necesario, No Necesario, Compra por Impulso)
    const extraExpenses = this.expenses.filter(
      (e) =>
        e.necessity === 'Poco Necesario' ||
        e.necessity === 'No Necesario' ||
        e.necessity === 'Compra por Impulso'
    );
    const budgetSpent = extraExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetRemaining = Math.max(0, budgetLimit - budgetSpent);
    const budgetUsedPercent =
      budgetLimit > 0 ? ((budgetSpent / budgetLimit) * 100).toFixed(0) : 0;

    console.log('💰 Debug Presupuesto de Extras:', {
      currentMonth,
      budgetLimit,
      extraExpensesCount: extraExpenses.length,
      budgetSpent,
      budgetRemaining,
      budgetUsedPercent: budgetUsedPercent + '%',
    });

    const budgetValueEl = document.getElementById('budgetValue');
    const budgetRemainingEl = document.getElementById('budgetRemaining');

    if (budgetValueEl) {
      budgetValueEl.textContent =
        budgetLimit > 0
          ? `$${this.formatNumber(budgetLimit)}`
          : 'No configurado';
      console.log('✅ Budget Value actualizado:', budgetValueEl.textContent);
    } else {
      console.error('❌ No se encontró elemento budgetValue');
    }

    if (budgetRemainingEl) {
      if (budgetLimit > 0) {
        budgetRemainingEl.textContent = `Para gustos: $${this.formatNumber(
          budgetRemaining
        )}`;
        budgetRemainingEl.className =
          budgetUsedPercent > 90
            ? 'stat-change negative'
            : budgetUsedPercent > 70
            ? 'stat-change warning'
            : 'stat-change positive';
      } else {
        budgetRemainingEl.textContent = 'Configura extras';
        budgetRemainingEl.className = 'stat-change';
      }
      console.log(
        '✅ Budget Remaining actualizado:',
        budgetRemainingEl.textContent
      );
    } else {
      console.error('❌ No se encontró elemento budgetRemaining');
    }

    document.getElementById(
      'totalSavings'
    ).textContent = `$${stats.totalSavings.toLocaleString()}`;
    document.getElementById('totalTransactions').textContent =
      stats.transactionCount.toString();

    // Update savings progress visualization
    this.updateSavingsProgress(stats.totalSavings, demoStats);
    const expensesChangeEl = document.getElementById('expensesChange');
    const savingsChangeEl = document.getElementById('savingsChange');

    if (demoStats && expensesChangeEl && savingsChangeEl) {
      expensesChangeEl.textContent = demoStats.expensesChange.text;
      expensesChangeEl.className = `stat-change ${demoStats.expensesChange.class}`;

      savingsChangeEl.textContent = demoStats.savingsChange.text;
      savingsChangeEl.className = `stat-change ${demoStats.savingsChange.class}`;
    }
  }

  updateSavingsProgress(totalSavings, demoStats = null) {
    // Calculate total goals target
    const totalGoalsTarget = this.goals.reduce(
      (sum, goal) => sum + goal.target,
      0
    );

    // Calculate progress percentage
    let progressPercentage = 0;
    if (totalGoalsTarget > 0) {
      progressPercentage = Math.min(
        (totalSavings / totalGoalsTarget) * 100,
        100
      );
    } else if (demoStats && demoStats.savingsProgress) {
      progressPercentage = demoStats.savingsProgress;
    }

    // Determine progress level
    const progressLevel = this.getSavingsProgressLevel(progressPercentage);
    const checkStatus = this.getSavingsCheckStatus(progressPercentage);

    // Update circular progress ring
    const progressRing = document.getElementById('savingsProgressRing');
    const progressCircle = document.getElementById('savingsProgressCircle');
    const savingsCheck = document.getElementById('savingsCheck');
    const savingsProgressText = document.getElementById('savingsProgressText');

    if (progressRing && progressCircle && savingsCheck && savingsProgressText) {
      // Update ring progress
      const circumference = 125.6; // 2 * π * 20 (radius)
      const offset = circumference - (progressPercentage / 100) * circumference;

      progressRing.setAttribute('data-progress', progressLevel);
      progressCircle.style.strokeDashoffset = offset;

      // Update check status
      savingsCheck.setAttribute('data-status', checkStatus);

      // Update progress text with dynamic color
      const progressText =
        totalGoalsTarget > 0
          ? `${Math.round(progressPercentage)}% de la meta`
          : demoStats
          ? `${Math.round(progressPercentage)}% de la meta`
          : 'Define tus metas';

      savingsProgressText.textContent = progressText;
      savingsProgressText.setAttribute('data-level', progressLevel);
    }
  }

  getSavingsProgressLevel(percentage) {
    if (percentage >= 100) return 'complete';
    if (percentage >= 70) return 'high';
    if (percentage >= 30) return 'medium';
    return 'low';
  }

  getSavingsCheckStatus(percentage) {
    if (percentage >= 100) return 'complete';
    if (percentage >= 70) return 'high';
    if (percentage >= 30) return 'progress';
    return 'initial';
  }

  // QuedarÃ¡ asÃ­ (renderExpenseChart)
  // QuedarÃ¡ asÃ­ (reemplaza la funciÃ³n completa)
  renderPremiumChart(demoData = null) {
    const canvas = document.getElementById('premiumChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Paleta de colores vibrantes para modo oscuro
    const pastelelColors = [
      '#00E676', // Verde vibrante
      '#FF6D00', // Naranja vibrante
      '#E91E63', // Rosa vibrante
      '#2196F3', // Azul vibrante
      '#9C27B0', // Púrpura vibrante
      '#00BCD4', // Cian vibrante
      '#FFEB3B', // Amarillo vibrante
      '#FF5722', // Rojo-naranja vibrante
    ];

    let chartData;
    let totalAmount = 0;

    if (demoData) {
      chartData = {
        labels: demoData.labels,
        datasets: [
          {
            data: demoData.data,
            backgroundColor: pastelelColors,
            borderWidth: 0,
            hoverBorderWidth: 3,
            hoverBorderColor: '#ffffff',
            hoverOffset: 6,
          },
        ],
      };
      totalAmount = demoData.data.reduce((a, b) => a + b, 0);
    } else {
      const categoryData = this.getCategoryData();
      const values = Object.values(categoryData);

      // Si no hay datos, mostrar un estado vacío elegante
      if (values.length === 0 || values.every((v) => v === 0)) {
        chartData = {
          labels: ['Comienza agregando gastos'],
          datasets: [
            {
              data: [1],
              backgroundColor: ['rgba(168, 230, 207, 0.3)'],
              borderWidth: 2,
              borderColor: pastelelColors[0],
              borderDash: [5, 5],
              hoverBorderWidth: 3,
              hoverBorderColor: pastelelColors[0],
              hoverOffset: 4,
            },
          ],
        };
        totalAmount = 0;
      } else {
        chartData = {
          labels: Object.keys(categoryData),
          datasets: [
            {
              data: values,
              backgroundColor: pastelelColors,
              borderWidth: 0,
              hoverBorderWidth: 3,
              hoverBorderColor: '#ffffff',
              hoverOffset: 6,
            },
          ],
        };
        totalAmount = values.reduce((a, b) => a + b, 0);
      }
    }

    // Actualizar el total en el centro
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
      this.animateValue(totalElement, 0, totalAmount, 1500, '$');
    }

    // Crear leyenda elegante
    this.createPremiumLegend(chartData, pastelelColors);

    // Destruir gráfico existente
    if (this.charts.premiumChart) {
      this.charts.premiumChart.destroy();
    }

    // Guardar referencia a this para usar en callbacks
    const self = this;

    // Crear nuevo gráfico tipo "hamburguesa"
    this.charts.premiumChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: false,
        maintainAspectRatio: false,
        cutout: '88%', // Grosor más fino y elegante
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            cornerRadius: 12,
            padding: 16,
            boxPadding: 8,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return ` ${label}: $${self.formatNumber(
                  value
                )} (${percentage}%)`;
              },
            },
          },
        },
        animation: {
          duration: 2000,
          easing: 'easeInOutCubic',
          animateRotate: true,
          animateScale: true,
        },
        onHover: (event, elements) => {
          canvas.style.cursor = 'pointer'; // Siempre pointer para indicar que es clickeable
        },
        onClick: (event, elements) => {
          // Abrir modal de estadísticas al hacer click
          console.log('🎯 Chart clicked! Opening stats modal...');
          self.openChartStatsModal();
        },
      },
    });

    // Animar keywords después del gráfico
    setTimeout(() => this.animateKeywords(), 500);
    // Actualizar insights
    setTimeout(() => this.updateInsights(demoData), 1000);
  }

  createPremiumLegend(chartData, colors) {
    const legendContainer = document.getElementById('chartLegend');
    if (!legendContainer) return;

    const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);

    legendContainer.innerHTML = '';

    // Crear leyendas solo para categorías con datos

    chartData.labels.forEach((label, index) => {
      const value = chartData.datasets[0].data[index];

      // Solo mostrar categorías con datos > 0
      if (value > 0) {
        const percentage = ((value / total) * 100).toFixed(1);

        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.style.animationDelay = `${index * 100}ms`;

        legendItem.innerHTML = `
          <div class="legend-color" style="background-color: ${
            colors[index] || colors[0]
          }"></div>
          <span class="legend-text">${label}</span>
          <span class="legend-percentage">${percentage}%</span>
        `;

        legendContainer.appendChild(legendItem);
      }
    });
  }

  animateKeywords() {
    const keywords = document.querySelectorAll('.keyword');
    keywords.forEach((keyword, index) => {
      const delay = parseInt(keyword.getAttribute('data-delay')) || 0;
      setTimeout(() => {
        keyword.style.setProperty('--delay', delay + 'ms');
        keyword.classList.add('animated');
      }, delay);
    });
  }

  updateInsights(demoData) {
    // Insights para usuarios nuevos sin datos
    const welcomeInsights = [
      {
        tip: '¡Bienvenido! Comienza registrando tu primer gasto',
        progress: 'Estás a punto de tomar el control de tus finanzas',
        goal: 'Agrega tu ingreso mensual en la sección de configuración',
      },
      {
        tip: 'Establece tu primera meta financiera para mantenerte motivado',
        progress: 'Cada gran viaje comienza con un pequeño paso',
        goal: 'Categoriza tus gastos para un mejor análisis',
      },
      {
        tip: 'Revisa la sección de análisis para entender tus patrones',
        progress: 'La constancia es clave para el éxito financiero',
        goal: 'Configura recordatorios para revisar tus gastos',
      },
    ];

    const regularInsights = [
      {
        tip: 'Revisa tus gastos semanalmente para mantener el control',
        progress: 'Vas por buen camino hacia tus metas financieras',
        goal: 'Continúa ahorrando para alcanzar tu objetivo',
      },
      {
        tip: 'Reduce gastos innecesarios para aumentar tu ahorro',
        progress: 'Tu disciplina financiera está mejorando constantemente',
        goal: 'Establece una meta de ahorro mensual realista',
      },
      {
        tip: 'Considera invertir tus ahorros para generar rendimientos',
        progress: 'Has logrado controlar tus gastos este mes',
        goal: 'Planifica un fondo de emergencia sólido',
      },
    ];

    // Usar insights de bienvenida si no hay datos reales y no estamos en demo
    const hasRealData = this.expenses.length > 0 || this.goals.length > 0;
    const isDemo = demoData !== null;
    const insights = hasRealData || isDemo ? regularInsights : welcomeInsights;

    const currentInsights = insights[this.currentDemoIndex % insights.length];

    const dailyTip = document.getElementById('dailyTip');
    const progressInsight = document.getElementById('progressInsight');
    const nextGoal = document.getElementById('nextGoal');

    if (dailyTip) dailyTip.textContent = currentInsights.tip;
    if (progressInsight) progressInsight.textContent = currentInsights.progress;
    if (nextGoal) nextGoal.textContent = currentInsights.goal;
  }

  animateValue(element, start, end, duration, prefix = '') {
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(start + (end - start) * easeProgress);
      element.textContent = `${prefix}${current.toLocaleString()}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  renderInteractiveSummary(demoData = null) {
    this.renderCashFlow(demoData);
    this.renderUpcomingPayments(demoData);
    this.renderGoalsProgress(demoData);
  }

  renderCashFlow(demoData = null) {
    let necessaryAmount = 0;
    let unnecessaryAmount = 0;

    if (demoData) {
      // Generar valores dinámicos aleatorios en modo demo
      const baseNecessary = 800 + Math.random() * 800; // 800-1600
      const baseUnnecessary = 400 + Math.random() * 800; // 400-1200
      necessaryAmount = Math.round(baseNecessary / 50) * 50; // Redondear a 50
      unnecessaryAmount = Math.round(baseUnnecessary / 50) * 50;
    } else {
      this.expenses.forEach((expense) => {
        if (
          expense.necessity === 'Muy Necesario' ||
          expense.necessity === 'Necesario'
        ) {
          necessaryAmount += expense.amount;
        } else {
          unnecessaryAmount += expense.amount;
        }
      });
    }

    const total = necessaryAmount + unnecessaryAmount;

    // Actualizar valores con animación de conteo
    const cashFlowTotal = document.getElementById('cashFlowTotal');
    const necessaryValue = document.getElementById('necessaryValue');
    const unnecessaryValue = document.getElementById('unnecessaryValue');

    // Función para animar números
    const animateNumber = (element, start, end, duration) => {
      if (!element) return;
      const startTime = performance.now();
      const difference = end - start;

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (easeOutCubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = start + difference * easeProgress;

        element.textContent = `$${Math.round(currentValue).toLocaleString()}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          element.textContent = `$${end.toLocaleString()}`;
        }
      };

      requestAnimationFrame(step);
    };

    // Obtener valores actuales o empezar desde 0
    const getCurrentValue = (element) => {
      if (!element || !element.textContent) return 0;
      return parseInt(element.textContent.replace(/\$|,/g, '')) || 0;
    };

    const currentTotal = getCurrentValue(cashFlowTotal);
    const currentNecessary = getCurrentValue(necessaryValue);
    const currentUnnecessary = getCurrentValue(unnecessaryValue);

    // Animar los números
    animateNumber(cashFlowTotal, currentTotal, total, 1200);
    animateNumber(necessaryValue, currentNecessary, necessaryAmount, 1000);
    animateNumber(
      unnecessaryValue,
      currentUnnecessary,
      unnecessaryAmount,
      1000
    );

    // Animar barras de progreso con patrones variados
    const necessaryProgress = document.getElementById('necessaryProgress');
    const unnecessaryProgress = document.getElementById('unnecessaryProgress');

    if (necessaryProgress && unnecessaryProgress && total > 0) {
      const targetNecessary = (necessaryAmount / total) * 100;
      const targetUnnecessary = (unnecessaryAmount / total) * 100;

      // Generar patrón de animación aleatorio
      const patterns = [
        // Patrón 1: Verde primero, luego rojo
        {
          necessaryDelay: 100,
          unnecessaryDelay: 700,
          necessaryDuration: 1000,
          unnecessaryDuration: 800,
        },
        // Patrón 2: Rojo primero, luego verde
        {
          necessaryDelay: 800,
          unnecessaryDelay: 100,
          necessaryDuration: 900,
          unnecessaryDuration: 1100,
        },
        // Patrón 3: Ambos simultáneos pero diferentes velocidades
        {
          necessaryDelay: 150,
          unnecessaryDelay: 200,
          necessaryDuration: 1400,
          unnecessaryDuration: 800,
        },
        // Patrón 4: Verde lento, rojo rápido
        {
          necessaryDelay: 100,
          unnecessaryDelay: 500,
          necessaryDuration: 1600,
          unnecessaryDuration: 600,
        },
        // Patrón 5: Secuencial con pausa
        {
          necessaryDelay: 100,
          unnecessaryDelay: 1000,
          necessaryDuration: 800,
          unnecessaryDuration: 900,
        },
        // Patrón 6: Inicio simultáneo, velocidades variadas
        {
          necessaryDelay: 100,
          unnecessaryDelay: 100,
          necessaryDuration: 1100,
          unnecessaryDuration: 1400,
        },
      ];

      const randomPattern =
        patterns[Math.floor(Math.random() * patterns.length)];

      // Animar barra verde (necesario)
      necessaryProgress.style.transition = 'none';
      necessaryProgress.style.width = '0%';

      setTimeout(() => {
        necessaryProgress.style.transition = `width ${randomPattern.necessaryDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        necessaryProgress.style.width = `${targetNecessary}%`;
      }, randomPattern.necessaryDelay);

      // Animar barra roja (innecesario)
      unnecessaryProgress.style.transition = 'none';
      unnecessaryProgress.style.width = '0%';

      setTimeout(() => {
        unnecessaryProgress.style.transition = `width ${randomPattern.unnecessaryDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        unnecessaryProgress.style.width = `${targetUnnecessary}%`;
      }, randomPattern.unnecessaryDelay);
    }
  }

  renderUpcomingPayments(demoData = null) {
    const paymentsList = document.getElementById('paymentsList');
    const paymentCount = document.getElementById('paymentCount');

    if (!paymentsList) return;

    // Datos demo para próximos pagos
    const demoPayments = [
      {
        description: 'Electricidad',
        date: '15 Dic',
        amount: 85,
        status: 'urgent',
      },
      {
        description: 'Internet',
        date: '20 Dic',
        amount: 45,
        status: 'warning',
      },
      {
        description: 'Suscripción Netflix',
        date: '25 Dic',
        amount: 15,
        status: 'normal',
      },
    ];

    const payments = demoData ? demoPayments : [];

    if (paymentCount) {
      paymentCount.textContent = `${payments.length} pendientes`;
    }

    paymentsList.innerHTML = '';

    payments.forEach((payment, index) => {
      const paymentItem = document.createElement('div');
      paymentItem.className = `payment-item ${payment.status}`;
      paymentItem.style.opacity = '0';
      paymentItem.style.transform = 'translateY(10px)';

      paymentItem.innerHTML = `
        <div class="payment-info">
          <div class="payment-description">${payment.description}</div>
          <div class="payment-date">${payment.date}</div>
        </div>
        <div class="payment-amount">$${payment.amount}</div>
      `;

      paymentsList.appendChild(paymentItem);

      // Animar entrada
      setTimeout(() => {
        paymentItem.style.transition = 'all 0.4s ease';
        paymentItem.style.opacity = '1';
        paymentItem.style.transform = 'translateY(0)';
      }, 200 * (index + 1));
    });
  }

  renderGoalsProgress(demoData = null) {
    const goalsProgressRing = document.getElementById('goalsProgressRing');
    const goalsProgressText = document.getElementById('goalsProgressText');
    const goalsProgressPercentage = document.getElementById(
      'goalsProgressPercentage'
    );

    let current = 0;
    let target = 0;
    let percentage = 0;

    if (demoData) {
      // Generar porcentaje aleatorio dinámico (10% - 100%)
      const randomPercentage = 10 + Math.random() * 90;
      percentage = Math.round(randomPercentage);

      // Calcular valores basados en el porcentaje
      target = 5000 + Math.round(Math.random() * 5000); // $5,000 - $10,000
      current = Math.round((target * percentage) / 100);
    } else {
      // Calcular datos reales de metas
      if (this.goals.length > 0) {
        const totalTarget = this.goals.reduce(
          (sum, goal) => sum + goal.target,
          0
        );
        const totalCurrent = this.goals.reduce(
          (sum, goal) => sum + goal.current,
          0
        );
        current = totalCurrent;
        target = totalTarget;
        percentage = target > 0 ? Math.round((current / target) * 100) : 0;
      }
    }

    // Determinar color según porcentaje
    let strokeColor = '#ef4444'; // Rojo por defecto (bajo)
    if (percentage >= 100) {
      strokeColor = '#10b981'; // Verde (completado)
    } else if (percentage >= 50) {
      strokeColor = '#f97316'; // Naranja (medio)
    }

    // Actualizar textos con animación
    const animateNumber = (
      element,
      start,
      end,
      duration,
      isPercentage = false
    ) => {
      if (!element) return;
      const startTime = performance.now();
      const difference = end - start;

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = start + difference * easeProgress;

        if (isPercentage) {
          element.textContent = `${Math.round(currentValue)}%`;
        } else {
          element.textContent = `$${Math.round(currentValue).toLocaleString()}`;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    // Obtener valores actuales
    const getCurrentValue = (element) => {
      if (!element || !element.textContent) return 0;
      return parseInt(element.textContent.replace(/\$|,|%/g, '')) || 0;
    };

    if (goalsProgressText) {
      const currentDisplayed = getCurrentValue(goalsProgressText);
      animateNumber(goalsProgressText, currentDisplayed, current, 1000);

      // Actualizar también el target (no animado)
      setTimeout(() => {
        goalsProgressText.textContent = `$${current.toLocaleString()} / $${target.toLocaleString()}`;
      }, 1000);
    }

    if (goalsProgressPercentage) {
      const currentPercentage = getCurrentValue(goalsProgressPercentage);
      animateNumber(
        goalsProgressPercentage,
        currentPercentage,
        percentage,
        1200,
        true
      );
    }

    // Animar anillo de progreso con color dinámico
    if (goalsProgressRing) {
      const circumference = 2 * Math.PI * 35; // r=35
      const offset = circumference - (percentage / 100) * circumference;

      // Reset y animar
      goalsProgressRing.style.transition = 'none';
      goalsProgressRing.style.strokeDashoffset = circumference;
      goalsProgressRing.style.stroke = strokeColor;

      setTimeout(() => {
        goalsProgressRing.style.transition =
          'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease';
        goalsProgressRing.style.strokeDashoffset = offset;
      }, 200);
    }

    // Configurar botón CTA
    const addGoalBtn = document.getElementById('addGoalBtn');
    if (addGoalBtn) {
      addGoalBtn.onclick = () => this.showSection('goals');
    }
  }

  renderExpenseChart(demoData = null) {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let chartData;
    let chartTitle = 'Gastos por CategorÃ­a';

    // --- INICIO: Paleta de colores moderna ampliada ---
    const modernColors = this.getCurrentStyleColors();
    // --- FIN: Paleta de colores moderna ampliada ---

    if (demoData) {
      chartData = {
        labels: demoData.labels,
        datasets: [
          {
            data: demoData.data,
            backgroundColor: modernColors,
            borderWidth: 0,
            borderColor: 'transparent',
            hoverOffset: 15,
            hoverBorderWidth: 0,
          },
        ],
      };
      chartTitle = demoData.title;
    } else {
      const categoryData = this.getCategoryData();
      chartData = {
        labels: Object.keys(categoryData),
        datasets: [
          {
            data: Object.values(categoryData),
            backgroundColor: modernColors,
            borderWidth: 0,
            borderColor: 'transparent',
            hoverOffset: 15,
            hoverBorderWidth: 0,
          },
        ],
      };
    }

    if (this.charts.expenseChart) {
      this.charts.expenseChart.data.labels = chartData.labels;
      this.charts.expenseChart.data.datasets[0].data =
        chartData.datasets[0].data;
      this.charts.expenseChart.data.datasets[0].backgroundColor = modernColors;
      this.charts.expenseChart.options.plugins.title.text = chartTitle;
      this.charts.expenseChart.update('active');
    } else {
      // Registrar el plugin globalmente si no está registrado
      if (
        typeof ChartDataLabels !== 'undefined' &&
        !Chart.registry.plugins.get('datalabels')
      ) {
        Chart.register(ChartDataLabels);
      }

      this.charts.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '94%', // Grosor más fino y elegante
          layout: {
            padding: {
              top: 40,
              bottom: 80,
              left: 40,
              right: 40,
            },
          },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1800,
            easing: 'easeInOutCubic',
            onProgress: function (animation) {
              const centerValue = document.getElementById('chartCenterValue');
              if (centerValue && animation.currentStep === animation.numSteps) {
                centerValue.style.opacity = '1';
              }
            },
          },
          onHover: (event, activeElements) => {
            const canvas = event.native.target;
            canvas.style.cursor =
              activeElements.length > 0 ? 'pointer' : 'default';

            if (activeElements.length > 0) {
              const index = activeElements[0].index;
              const value = chartData.datasets[0].data[index];
              const categoryLabel = chartData.labels[index];
              const centerValue = document.getElementById('chartCenterValue');
              const centerLabel = document.getElementById('chartCenterLabel');

              if (centerValue && centerLabel) {
                const total = chartData.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = ((value / total) * 100).toFixed(1);

                centerValue.textContent = `$${value.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}`;

                let labelText = '';
                let colorValue = '#10b981';

                const categoryLower = categoryLabel.toLowerCase();
                if (
                  categoryLower.includes('ganancia') ||
                  categoryLower.includes('ingreso')
                ) {
                  labelText = 'Ganancias';
                  colorValue = '#10b981';
                } else if (categoryLower.includes('ahorro')) {
                  labelText = 'Ahorros';
                  colorValue = '#10b981';
                } else if (
                  categoryLower.includes('meta') ||
                  categoryLower.includes('objetivo')
                ) {
                  labelText = 'Metas';
                  colorValue = '#f97316';
                } else if (
                  categoryLower.includes('pérdida') ||
                  categoryLower.includes('perdida') ||
                  categoryLower.includes('deuda')
                ) {
                  labelText = 'Pérdidas';
                  colorValue = '#ef4444';
                } else {
                  labelText = categoryLabel;
                  if (percentage >= 30) {
                    colorValue = '#ef4444';
                  } else if (percentage >= 15) {
                    colorValue = '#f97316';
                  } else {
                    colorValue = '#10b981';
                  }
                }

                centerLabel.textContent = labelText;
                centerValue.style.color = colorValue;

                centerValue.style.transform = 'scale(1.1)';
                setTimeout(() => {
                  centerValue.style.transform = 'scale(1)';
                }, 200);
              }
            } else {
              const centerValue = document.getElementById('chartCenterValue');
              const centerLabel = document.getElementById('chartCenterLabel');
              if (centerValue && centerLabel) {
                const total = chartData.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                centerValue.textContent = `$${total.toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}`;
                centerLabel.textContent = 'Total Gastos';
                centerValue.style.color = '#1e293b';
              }
            }
          },
          plugins: {
            title: {
              display: false,
            },
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 18,
                font: {
                  size: 12,
                  family: 'Inter, sans-serif',
                  weight: '500',
                },
                color: '#64748b',
                generateLabels: function (chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const dataset = data.datasets[0];
                      const backgroundColor = dataset.backgroundColor[i];
                      const total = dataset.data.reduce((a, b) => a + b, 0);
                      const value = dataset.data[i];
                      const percentage = ((value / total) * 100).toFixed(1);

                      return {
                        text: `${label} ${percentage}%`,
                        fillStyle: backgroundColor,
                        strokeStyle: backgroundColor,
                        lineWidth: 0,
                        pointStyle: 'circle',
                        hidden: false,
                        index: i,
                      };
                    });
                  }
                  return [];
                },
              },
              onHover: function (event, legendItem, legend) {
                legend.chart.canvas.style.cursor = 'pointer';
                const legendItems =
                  document.querySelectorAll('#expenseChart').length > 0
                    ? document.querySelectorAll('.chartjs-legend li')
                    : [];
                legendItems.forEach((item, index) => {
                  if (index === legendItem.index) {
                    item.style.transform = 'translateX(5px)';
                    item.style.transition = 'transform 0.3s ease';
                  }
                });
              },
              onLeave: function (event, legendItem, legend) {
                legend.chart.canvas.style.cursor = 'default';
                const legendItems =
                  document.querySelectorAll('#expenseChart').length > 0
                    ? document.querySelectorAll('.chartjs-legend li')
                    : [];
                legendItems.forEach((item) => {
                  item.style.transform = 'translateX(0)';
                });
              },
              onClick: function (e, legendItem, legend) {
                const index = legendItem.index;
                const chart = legend.chart;
                const meta = chart.getDatasetMeta(0);

                meta.data[index].hidden = !meta.data[index].hidden;
                chart.update('active');
              },
            },
            datalabels: {
              display: false,
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleColor: '#f1f5f9',
              bodyColor: '#cbd5e1',
              borderColor: 'rgba(148, 163, 184, 0.3)',
              borderWidth: 1,
              padding: 16,
              cornerRadius: 12,
              displayColors: true,
              boxPadding: 8,
              titleFont: {
                size: 14,
                weight: 'bold',
                family: 'Inter, sans-serif',
              },
              bodyFont: {
                size: 13,
                family: 'Inter, sans-serif',
              },
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.chart.getDatasetMeta(0).total;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return ` ${label}: $${value.toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })} (${percentage}%)`;
                },
              },
            },
          },
        },
        plugins: [
          {
            id: 'centerText',
            beforeDraw: function (chart) {
              const ctx = chart.ctx;
              const width = chart.width;
              const height = chart.height;
              const centerX = width / 2;
              const centerY = height / 2 - 20;

              ctx.restore();

              const total = chart.data.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              );

              ctx.font = 'bold 28px Inter, sans-serif';
              ctx.fillStyle = '#1e293b';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';

              const centerValue = document.getElementById('chartCenterValue');
              const valueText = centerValue
                ? centerValue.textContent
                : `$${total.toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                  })}`;
              ctx.fillText(valueText, centerX, centerY);

              ctx.font = '500 13px Inter, sans-serif';
              ctx.fillStyle = '#64748b';
              const centerLabel = document.getElementById('chartCenterLabel');
              const labelText =
                centerLabel && centerLabel.textContent !== 'Total Gastos'
                  ? centerLabel.textContent
                  : 'Total Gastos';
              ctx.fillText(labelText, centerX, centerY + 30);

              ctx.save();
            },
          },
        ],
      });

      const chartContainer = canvas.parentElement;
      if (!document.getElementById('chartCenterValue')) {
        const centerDiv = document.createElement('div');
        centerDiv.style.cssText =
          'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; z-index: 10;';

        const valueSpan = document.createElement('span');
        valueSpan.id = 'chartCenterValue';
        valueSpan.style.cssText =
          'display: block; font-size: 28px; font-weight: bold; color: #1e293b; transition: all 0.3s ease; opacity: 0;';
        const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
        valueSpan.textContent = `$${total.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
        })}`;

        const labelSpan = document.createElement('span');
        labelSpan.id = 'chartCenterLabel';
        labelSpan.style.cssText =
          'display: block; font-size: 13px; color: #64748b; margin-top: 8px; font-weight: 500;';
        labelSpan.textContent = 'Total Gastos';

        centerDiv.appendChild(valueSpan);
        centerDiv.appendChild(labelSpan);

        if (
          chartContainer.style.position !== 'relative' &&
          chartContainer.style.position !== 'absolute'
        ) {
          chartContainer.style.position = 'relative';
        }
        chartContainer.appendChild(centerDiv);
      }

      // Agregar evento click al canvas para abrir modal de estadísticas
      canvas.style.cursor = 'pointer';
      canvas.addEventListener('click', () => {
        this.openChartStatsModal();
      });
    }

    // También agregar click si ya existe el chart (para actualizaciones)
    if (this.charts.expenseChart && canvas) {
      canvas.style.cursor = 'pointer';
      canvas.addEventListener('click', () => {
        this.openChartStatsModal();
      });
    }
  }

  getCategoryData() {
    const categoryData = {};
    this.expenses.forEach((expense) => {
      categoryData[expense.category] =
        (categoryData[expense.category] || 0) + expense.amount;
    });
    return categoryData;
  }

  openChartStatsModal() {
    console.log('📊 openChartStatsModal called');

    // Calcular todas las estadísticas
    const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = this.getTotalIncome();
    const categoryData = this.getCategoryData();

    // Calcular gastos por necesidad
    const necessityData = {};
    const necessityTypes = [
      'Muy Necesario',
      'Necesario',
      'Poco Necesario',
      'No Necesario',
      'Compra por Impulso',
    ];
    necessityTypes.forEach((type) => {
      necessityData[type] = this.expenses
        .filter((e) => e.necessity === type)
        .reduce((sum, e) => sum + e.amount, 0);
    });

    // Calcular porcentaje de innecesario (Poco Necesario + No Necesario + Compra por Impulso)
    const unnecessaryExpenses =
      (necessityData['Poco Necesario'] || 0) +
      (necessityData['No Necesario'] || 0) +
      (necessityData['Compra por Impulso'] || 0);
    const unnecessaryPercentage =
      totalExpenses > 0 ? (unnecessaryExpenses / totalExpenses) * 100 : 0;

    // Calcular gastos por usuario
    const userExpenses = {};
    this.expenses.forEach((e) => {
      const user = e.user || 'Otro';
      userExpenses[user] = (userExpenses[user] || 0) + e.amount;
    });

    // Crear HTML del modal
    const modal = document.getElementById('chartStatsModal');
    const modalBody = document.getElementById('chartStatsModalBody');

    if (!modal || !modalBody) return;

    let alertHtml = '';
    if (unnecessaryPercentage > 10) {
      alertHtml = `
        <div class="stats-alert stats-alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>⚠️ Cuidado!</strong>
            <p>Has malgastado <strong>${unnecessaryPercentage.toFixed(
              1
            )}%</strong> de tu presupuesto en gastos innecesarios.</p>
          </div>
        </div>
      `;
    }

    // Generar HTML de categorías
    const categoriesHtml = Object.entries(categoryData)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => {
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        const color = this.getCategoryColor(category);
        return `
          <div class="stat-card">
            <div class="stat-card-header">
              <span class="stat-category-badge" style="background: ${color}20; color: ${color}">
                ${this.getCategoryEmoji(category)} ${category}
              </span>
              <span class="stat-percentage">${percentage}%</span>
            </div>
            <div class="stat-card-amount">$${amount.toLocaleString()}</div>
            <div class="stat-progress-bar">
              <div class="stat-progress-fill" style="width: ${percentage}%; background: ${color}"></div>
            </div>
          </div>
        `;
      })
      .join('');

    // Generar HTML de necesidades
    const necessityHtml = Object.entries(necessityData)
      .filter(([, amount]) => amount > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([necessity, amount]) => {
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        const color = this.getNecessityColor(necessity);
        return `
          <div class="stat-card stat-card-compact">
            <div class="stat-card-header">
              <span class="stat-category-badge" style="background: ${color}20; color: ${color}">
                ${necessity}
              </span>
              <span class="stat-percentage">${percentage}%</span>
            </div>
            <div class="stat-card-amount-sm">$${amount.toLocaleString()}</div>
          </div>
        `;
      })
      .join('');

    // Generar HTML de usuarios
    const usersHtml = Object.entries(userExpenses)
      .sort(([, a], [, b]) => b - a)
      .map(([user, amount]) => {
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        const color = this.getUserColor(user);
        return `
          <div class="stat-card stat-card-compact">
            <div class="stat-card-header">
              <span class="stat-category-badge" style="background: ${color}20; color: ${color}">
                <i class="fas fa-user"></i> ${user}
              </span>
              <span class="stat-percentage">${percentage}%</span>
            </div>
            <div class="stat-card-amount-sm">$${amount.toLocaleString()}</div>
          </div>
        `;
      })
      .join('');

    modalBody.innerHTML = `
      ${alertHtml}

      <div class="stats-summary">
        <div class="summary-item summary-item-primary">
          <div class="summary-icon"><i class="fas fa-wallet"></i></div>
          <div class="summary-content">
            <div class="summary-label">Ingresos</div>
            <div class="summary-value">$${totalIncome.toLocaleString()}</div>
          </div>
        </div>
        <div class="summary-item summary-item-danger">
          <div class="summary-icon"><i class="fas fa-shopping-cart"></i></div>
          <div class="summary-content">
            <div class="summary-label">Gastos</div>
            <div class="summary-value">$${totalExpenses.toLocaleString()}</div>
          </div>
        </div>
        <div class="summary-item summary-item-success">
          <div class="summary-icon"><i class="fas fa-piggy-bank"></i></div>
          <div class="summary-content">
            <div class="summary-label">Balance</div>
            <div class="summary-value">$${(
              totalIncome - totalExpenses
            ).toLocaleString()}</div>
          </div>
        </div>
        <div class="summary-item summary-item-info">
          <div class="summary-icon"><i class="fas fa-receipt"></i></div>
          <div class="summary-content">
            <div class="summary-label">Transacciones</div>
            <div class="summary-value">${this.expenses.length}</div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h3 class="stats-section-title">
          <i class="fas fa-chart-pie"></i> Gastos por Categoría
        </h3>
        <div class="stats-grid">
          ${categoriesHtml}
        </div>
      </div>

      <div class="stats-section">
        <h3 class="stats-section-title">
          <i class="fas fa-exclamation-circle"></i> Nivel de Necesidad
        </h3>
        <div class="stats-grid stats-grid-compact">
          ${necessityHtml}
        </div>
      </div>

      <div class="stats-section">
        <h3 class="stats-section-title">
          <i class="fas fa-users"></i> Gastos por Usuario
        </h3>
        <div class="stats-grid stats-grid-compact">
          ${usersHtml}
        </div>
      </div>
    `;

    console.log('✅ Modal HTML generated, adding active class...');
    console.log('Modal element:', modal);
    console.log('Modal classes before:', modal.className);

    modal.classList.add('active');

    console.log('Modal classes after:', modal.className);
    console.log('Modal should now be visible!');
  }

  getCategoryColor(category) {
    const colors = {
      Alimentación: '#10b981',
      Transporte: '#3b82f6',
      Entretenimiento: '#8b5cf6',
      Salud: '#ec4899',
      Servicios: '#f59e0b',
      Compras: '#06b6d4',
      Otros: '#6b7280',
    };
    return colors[category] || '#6b7280';
  }

  getNecessityColor(necessity) {
    const colors = {
      'Muy Necesario': '#10b981',
      Necesario: '#3b82f6',
      'Poco Necesario': '#f59e0b',
      'No Necesario': '#ef4444',
      'Compra por Impulso': '#dc2626',
    };
    return colors[necessity] || '#6b7280';
  }

  getUserColor(user) {
    const colors = {
      Daniel: '#3b82f6',
      Givonik: '#8b5cf6',
      Otro: '#6b7280',
    };
    return colors[user] || '#6b7280';
  }

  renderGoalsProgress() {
    const container = document.getElementById('goalsProgress');
    if (!container) return;

    container.innerHTML = '';

    if (this.goals.length === 0) {
      this.renderEmptyGoalsState(container);
      return;
    }

    this.goals.forEach((goal) => {
      const progress = Math.min((goal.current / goal.target) * 100, 100);
      const goalEl = document.createElement('div');
      goalEl.className = 'goal-progress';
      goalEl.innerHTML = `
        <div class="goal-name">${goal.name}</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <div class="goal-percentage">${progress.toFixed(1)}% completado</div>
      `;
      container.appendChild(goalEl);
    });
  }

  renderGoalsProgressChart() {
    const canvas = document.getElementById('goalsProgressChart');
    const valueElement = document.getElementById('goalsProgressValue');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let chartData;
    let chartLabels;
    let finalValue;

    if (!this.currentUser || this.goals.length === 0) {
      // Datos de demostración que varían según el índice actual
      chartLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
      const baseData = [1000, 1500, 2200, 2800, 3500, 4200];
      const variations = [
        [1000, 1500, 2200, 2800, 3500, 4200], // Escenario 1
        [800, 1200, 1800, 2400, 3200, 3800], // Escenario 2
        [1200, 1800, 2500, 3100, 3900, 4600], // Escenario 3
      ];
      chartData =
        variations[this.currentDemoIndex % variations.length] || baseData;
      finalValue = chartData[chartData.length - 1];
    } else {
      // Datos reales basados en el progreso de metas del usuario
      const monthlyData = this.calculateMonthlySavings();
      chartLabels = monthlyData.labels;
      chartData = monthlyData.values;
      finalValue = chartData[chartData.length - 1] || 0;
    }

    // Actualizar valor numérico de forma suave
    if (valueElement) {
      const currentValue =
        parseInt(valueElement.textContent.replace(/[^0-9]/g, '')) || 0;
      this.animateValue(valueElement, currentValue, finalValue, 800);

      valueElement.className = 'goals-progress-value';
      if (finalValue > 3000) {
        valueElement.classList.add('positive');
      } else if (finalValue < 2000) {
        valueElement.classList.add('negative');
      }
    }

    // Crear gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(33, 128, 141, 0.3)');
    gradient.addColorStop(1, 'rgba(33, 128, 141, 0.05)');

    if (this.goalsChart) {
      // Actualizar datos existentes sin destruir el gráfico
      this.goalsChart.data.datasets[0].data = chartData;
      this.goalsChart.update('none');
    } else {
      // Crear nuevo gráfico
      this.goalsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartLabels,
          datasets: [
            {
              data: chartData,
              borderColor: 'var(--color-primary)',
              backgroundColor: gradient,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointHoverRadius: 8,
              pointBackgroundColor: this.getCurrentStyleColors()[0],
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointHoverBackgroundColor: 'var(--color-primary)',
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              display: false,
              grid: {
                display: false,
              },
            },
            y: {
              display: false,
              grid: {
                display: false,
              },
            },
          },
          animation: {
            duration: 1500,
            easing: 'easeInOutQuart',
          },
        },
      });
    }
  }

  animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(start + (end - start) * easeProgress);
      element.textContent = `$${current.toLocaleString()}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  calculateMonthlySavings() {
    const currentDate = new Date();
    const labels = [];
    const values = [];

    // Generar últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthName = date.toLocaleDateString('es-ES', { month: 'short' });
      labels.push(monthName);

      // Calcular ahorro acumulativo basado en ingresos menos gastos
      const monthlyExpenses = this.getMonthlyExpenses(date);
      const monthlySavings = (this.monthlyIncome || 0) - monthlyExpenses;
      const previousValue = i === 5 ? 0 : values[values.length - 1] || 0;
      values.push(Math.max(0, previousValue + monthlySavings));
    }

    return { labels, values };
  }

  getMonthlyExpenses(date) {
    return this.expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((total, expense) => total + expense.amount, 0);
  }

  renderEmptyGoalsState(container) {
    const motivationalMessages = [
      {
        icon: 'fas fa-rocket',
        title: '¡Comienza tu viaje financiero!',
        subtitle: 'Establece tu primera meta y ve cómo tu dinero crece',
        color: '#3b82f6',
      },
      {
        icon: 'fas fa-star',
        title: 'Las metas te acercan al éxito',
        subtitle: 'Cada gran logro comienza con una decisión de intentarlo',
        color: '#f59e0b',
      },
      {
        icon: 'fas fa-chart-line',
        title: 'Visualiza tu progreso',
        subtitle: 'Transforma tus sueños en objetivos medibles',
        color: '#10b981',
      },
      {
        icon: 'fas fa-gem',
        title: 'Construye tu futuro',
        subtitle: 'Cada peso ahorrado es un paso hacia tu libertad financiera',
        color: '#8b5cf6',
      },
      {
        icon: 'fas fa-trophy',
        title: 'Alcanza tus sueños',
        subtitle: 'Las metas claras son el camino hacia el éxito',
        color: '#ef4444',
      },
    ];

    let currentMessageIndex = 0;

    const createMessageElement = (message) => {
      return `
        <div class="empty-goals-state">
          <div class="floating-icon" style="color: ${message.color}">
            <i class="${message.icon}"></i>
          </div>
          <h3 class="animated-title">${message.title}</h3>
          <p class="animated-subtitle">${message.subtitle}</p>
          <div class="progress-dots">
            ${motivationalMessages
              .map(
                (_, index) =>
                  `<span class="dot ${
                    index === currentMessageIndex ? 'active' : ''
                  }" style="background-color: ${
                    index === currentMessageIndex ? message.color : '#cbd5e1'
                  }"></span>`
              )
              .join('')}
          </div>
          <button class="create-goal-btn" style="background: linear-gradient(135deg, ${
            message.color
          }, ${message.color}99)">
            <i class="fas fa-plus"></i> Crear primera meta
          </button>
        </div>
      `;
    };

    container.innerHTML = createMessageElement(
      motivationalMessages[currentMessageIndex]
    );

    // Configurar el botón para crear meta
    const createBtn = container.querySelector('.create-goal-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.showSection('goals');
        document.querySelector('#goalForm input[name="name"]')?.focus();
      });
    }

    // Animación automática de mensajes
    const animateMessages = () => {
      currentMessageIndex =
        (currentMessageIndex + 1) % motivationalMessages.length;

      const state = container.querySelector('.empty-goals-state');
      if (state) {
        state.style.animation = 'fadeOutUp 0.5s ease-in-out forwards';

        setTimeout(() => {
          container.innerHTML = createMessageElement(
            motivationalMessages[currentMessageIndex]
          );

          // Reconfigurar el botón
          const newCreateBtn = container.querySelector('.create-goal-btn');
          if (newCreateBtn) {
            newCreateBtn.addEventListener('click', () => {
              this.showSection('goals');
              document.querySelector('#goalForm input[name="name"]')?.focus();
            });
          }

          const newState = container.querySelector('.empty-goals-state');
          if (newState) {
            newState.style.animation = 'fadeInDown 0.5s ease-in-out forwards';
          }
        }, 500);
      }
    };

    // Cambiar mensaje cada 4 segundos
    this.goalsMessageInterval = setInterval(animateMessages, 4000);
  }

  // QuedarÃ¡ asÃ­
  renderAIRecommendations() {
    const container = document.getElementById('aiRecommendations');
    if (!container) return;

    // Find the parent card container
    const parentCard = container.closest('.card');

    container.innerHTML = ''; // Limpiamos el contenedor

    // Recomendaciones inteligentes basadas en datos reales o consejos útiles
    let recommendations = [];

    if (this.expenses.length > 0) {
      // Análisis basado en datos reales
      const totalExpenses = this.expenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      const avgDailySpend = totalExpenses / Math.max(1, this.expenses.length);

      recommendations = [
        `Tu gasto promedio diario es $${avgDailySpend.toFixed(
          2
        )}. Considera establecer un presupuesto diario.`,
        `Has registrado ${this.expenses.length} transacciones. ¡Mantén el control de tus finanzas!`,
        'Revisa tus gastos semanalmente para identificar oportunidades de ahorro.',
      ];
    } else {
      // Consejos útiles para usuarios nuevos
      recommendations = [
        '💡 Comienza registrando todos tus gastos, incluso los pequeños. Todo suma.',
        '🎯 Establece metas financieras específicas y alcanzables para mantenerte motivado.',
        '📊 Revisa tus gastos semanalmente para identificar patrones y oportunidades.',
        '💰 Ahorra al menos el 20% de tus ingresos mensuales para emergencias.',
        '📱 Usa esta app diariamente para desarrollar buenos hábitos financieros.',
      ];
    }

    // Mostrar máximo 3 recomendaciones
    const selectedRecommendations = recommendations.slice(0, 3);

    selectedRecommendations.forEach((recommendation, index) => {
      const recEl = document.createElement('div');
      recEl.className = 'ai-recommendation-card';
      recEl.innerHTML = `
        <div class="ai-rec-icon">
          <i class="fas fa-robot"></i>
        </div>
        <div class="ai-rec-content">
          <h5>Consejo ${index + 1}</h5>
          <p>${recommendation}</p>
        </div>
      `;
      container.appendChild(recEl);
    });

    // Show or hide the parent card based on content
    if (parentCard) {
      if (selectedRecommendations.length > 0) {
        parentCard.classList.remove('hidden');
      } else {
        parentCard.classList.add('hidden');
      }
    }
  }

  renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    // Find the parent card container
    const parentCard = container.closest('.card');

    container.innerHTML = '';

    const recentExpenses = this.expenses.slice(-5).reverse();

    if (recentExpenses.length === 0) {
      // Mostrar transacciones de ejemplo en lugar de espacio vacío
      const demoTransactions = [
        {
          description: 'Almuerzo en restaurante',
          amount: 25.5,
          category: 'Alimentación',
          date: new Date(),
        },
        {
          description: 'Combustible',
          amount: 45.0,
          category: 'Transporte',
          date: new Date(Date.now() - 86400000),
        },
        {
          description: 'Supermercado',
          amount: 67.3,
          category: 'Alimentación',
          date: new Date(Date.now() - 172800000),
        },
        {
          description: 'Cine',
          amount: 15.0,
          category: 'Entretenimiento',
          date: new Date(Date.now() - 259200000),
        },
        {
          description: 'Farmacia',
          amount: 12.8,
          category: 'Salud',
          date: new Date(Date.now() - 345600000),
        },
      ];

      container.innerHTML = `
        <div class="demo-notice">
          <i class="fas fa-lightbulb"></i>
          <p>Datos de ejemplo - Comienza registrando tus gastos</p>
        </div>
      `;

      demoTransactions.forEach((expense) => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item demo-item';
        transactionEl.innerHTML = `
          <div class="transaction-info">
            <h4>${expense.description}</h4>
            <div class="transaction-meta">
              <span class="transaction-category">${expense.category}</span>
              <span class="transaction-date">${expense.date.toLocaleDateString()}</span>
            </div>
          </div>
          <div class="transaction-amount">-$${this.formatNumber(
            expense.amount
          )}</div>
        `;
        container.appendChild(transactionEl);
      });
      return;
    }

    recentExpenses.forEach((expense) => {
      const transactionEl = document.createElement('div');
      transactionEl.className = 'transaction-item';
      const metaLine = this.formatMetaLine([
        expense.date,
        expense.user,
        expense.category,
      ]);
      transactionEl.innerHTML = `
        <div class="transaction-info">
          <h4>${this.fixLegacyEncoding(expense.description)}</h4>
          <div class="transaction-meta">${metaLine}</div>
        </div>
        <div class="transaction-amount expense">-$${expense.amount}</div>
      `;
      container.appendChild(transactionEl);
    });

    // Show or hide the parent card based on content
    if (parentCard) {
      const hasContent =
        recentExpenses.length > 0 || container.children.length > 0;
      if (hasContent) {
        parentCard.classList.remove('hidden');
      } else {
        parentCard.classList.add('hidden');
      }
    }
  }

  // Expense Methods
  addExpense(e) {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const amountInput = document.getElementById('amount');
    const amount = this.unformatNumber(amountInput.value);
    const category = document.getElementById('category').value;
    const necessity = document.getElementById('necessity').value;
    const date = document.getElementById('date').value;
    const user = document.getElementById('user').value;

    if (
      !description ||
      !amount ||
      amount <= 0 ||
      !category ||
      !necessity ||
      !date
    ) {
      this.showToast(
        'Por favor completa todos los campos correctamente',
        'error'
      );
      return;
    }

    const expense = {
      id: Date.now(),
      description: description,
      amount: amount,
      category: category,
      necessity: necessity,
      date: date,
      user: user || 'Sin usuario',
      protected: false,
    };

    this.expenses.push(expense);

    // Registrar en auditoría
    this.logAudit(
      'expense_added',
      'added',
      `Nuevo gasto: $${amount} - ${description}`,
      '',
      { amount, category, description, user }
    );
    this.updateSpecificField('expenses', this.expenses);

    this.saveData();

    // Update budget if exists for current month
    const currentMonth = this.getCurrentMonthKey();
    if (this.budgets[currentMonth]) {
      this.updateBudgetSpending(currentMonth);

      // Check for budget alerts
      const alerts = this.checkBudgetAlerts(currentMonth);
      alerts.forEach((alert) => {
        this.showToast(alert.message, alert.type);
      });
    }

    this.renderDashboard();
    this.renderExpenses();
    this.updateTrendChart();
    this.updateLastTransaction();
    this.checkAchievements();
    this.updateExpenseStats(); // Update expense form stats

    // Toast personalizado con el monto
    this.showToast(`💰 Gasto de $${amount.toLocaleString()} registrado correctamente`, 'success');

    document.getElementById('expenseForm').reset();
    this.setupCurrentDate();
  }

  renderExpenses() {
    const container = document.getElementById('expenseList');
    if (!container) return;

    container.innerHTML = '';

    if (this.expenses.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-receipt"></i><h3>No hay gastos registrados</h3></div>';
      return;
    }

    const sortedExpenses = [...this.expenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedExpenses.forEach((expense) => {
      const expenseEl = document.createElement('div');
      expenseEl.className = 'transaction-item';
      const metaLine = this.formatMetaLine([
        expense.date,
        expense.user,
        expense.category,
        expense.necessity,
      ]);
      expenseEl.innerHTML = `
        <div class="transaction-info">
          <h4>${this.fixLegacyEncoding(expense.description)}</h4>
          <div class="transaction-meta">${metaLine}</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="transaction-amount expense">$${expense.amount}</div>
          <button type="button" class="btn btn-danger btn-delete" data-id="${
            expense.id
          }">
            Eliminar
          </button>
        </div>
      `;

      container.appendChild(expenseEl);

      const delBtn = expenseEl.querySelector('.btn-delete');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.deleteExpense(expense.id);
        });
      }
    });
  }

  deleteExpense(id) {
    const idx = this.expenses.findIndex((expense) => expense.id === id);
    if (idx === -1) {
      this.showToast('Gasto no encontrado', 'error');
      return;
    }

    const expense = this.expenses[idx];

    // Abrir modal de confirmación
    this.openDeleteConfirmModal(expense);
  }

  openDeleteConfirmModal(expense) {
    const modal = document.getElementById('deleteConfirmModal');
    const amountEl = document.getElementById('deleteExpenseAmount');
    const categoryEl = document.getElementById('deleteExpenseCategory');
    const descriptionEl = document.getElementById('deleteExpenseDescription');
    const reasonInput = document.getElementById('deleteReasonInput');

    // Llenar información del gasto
    if (amountEl) amountEl.textContent = this.formatCurrency(expense.amount);
    if (categoryEl) categoryEl.textContent = expense.category;
    if (descriptionEl)
      descriptionEl.textContent = expense.description || 'Sin descripción';
    if (reasonInput) reasonInput.value = '';

    // Mostrar modal
    modal?.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Guardar ID temporalmente
    this.pendingDeleteExpenseId = expense.id;
  }

  confirmDeleteExpense() {
    const idx = this.expenses.findIndex(
      (exp) => exp.id === this.pendingDeleteExpenseId
    );
    if (idx === -1) return;

    const expense = this.expenses[idx];
    const reasonInput = document.getElementById('deleteReasonInput');
    const deleteReason = reasonInput?.value.trim() || 'Sin motivo especificado';

    // Registrar en auditoría antes de eliminar
    this.logAudit(
      'expense_deleted',
      'deleted',
      `Gasto eliminado: $${expense.amount} - ${expense.description}`,
      deleteReason,
      {
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        reason: deleteReason,
      }
    );

    // La notificación se crea automáticamente desde logAudit
    // El sistema de notificaciones leerá el auditLog y mostrará la eliminación

    // Eliminar gasto
    this.expenses.splice(idx, 1);
    this.saveData();
    this.renderDashboard();
    this.renderExpenses();

    // Cerrar modal
    this.closeDeleteConfirmModal();

    // Mostrar notificación de éxito
    this.showToast('Gasto eliminado correctamente', 'success');
  }

  closeDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    modal?.classList.remove('show');
    document.body.style.overflow = '';
    this.pendingDeleteExpenseId = null;
  }

  // DESHABILITADO - Sistema de gastos protegidos
  // openDeleteModal(expenseId) {
  //   const modal = document.getElementById('securityModal');
  //   const titleEl = modal.querySelector('.modal-title');
  //   const saveBtn = document.getElementById('modalSavePasswordsBtn');
  //   const newPassSection = document.getElementById('newPassSection');
  //
  //   if (titleEl)
  //     titleEl.innerHTML = `<i class="fas fa-key"></i> Confirmar eliminación`;
  //   if (saveBtn) saveBtn.textContent = 'Eliminar';
  //   if (newPassSection) newPassSection.style.display = 'none';
  //
  //   const curDanielEl = document.getElementById('curDaniel');
  //   const curGivonikEl = document.getElementById('curGivonik');
  //   if (curDanielEl) curDanielEl.value = '';
  //   if (curGivonikEl) curGivonikEl.value = '';
  //
  //   this.pendingDeleteId = expenseId;
  //   modal.classList.add('show');
  // }

  // confirmDeleteFromModal() {
  //   const curDanielEl = document.getElementById('curDaniel');
  //   const curGivonikEl = document.getElementById('curGivonik');
  //
  //   if (!curDanielEl || !curGivonikEl) return;
  //
  //   const curDaniel = curDanielEl.value || '';
  //   const curGivonik = curGivonikEl.value || '';
  //
  //   if (!this.verifyPassword('Daniel', curDaniel)) {
  //     this.showToast('Contraseña actual de Daniel incorrecta', 'error');
  //     return;
  //   }
  //   if (!this.verifyPassword('Givonik', curGivonik)) {
  //     this.showToast('Contraseña actual de Givonik incorrecta', 'error');
  //     return;
  //   }
  //
  //   const idx = this.expenses.findIndex((e) => e.id === this.pendingDeleteId);
  //   if (idx !== -1) {
  //     const item = this.expenses[idx];
  //
  //     this.logAudit(
  //       'expense_deleted',
  //       'deleted',
  //       `Gasto protegido eliminado: $${item.amount} - ${item.description}`,
  //       'Eliminación autorizada con doble contraseña',
  //       { amount: item.amount, category: item.category, description: item.description, protected: true }
  //     );
  //
  //     this.expenses.splice(idx, 1);
  //     this.saveData();
  //     this.renderDashboard();
  //     this.renderExpenses();
  //     this.showToast('Gasto eliminado', 'success');
  //   }
  //
  //   document.getElementById('securityModal').classList.remove('show');
  //   this.pendingDeleteId = null;
  // }

  // Recomendado: soporta modos 'change' y 'delete' y bloquea el scroll
  openSecurityModal(mode = 'change') {
    const modal = document.getElementById('securityModal');
    if (!modal) return;

    // Limpiar campos
    [
      'curDaniel',
      'curGivonik',
      'newDaniel',
      'confirmDaniel',
      'newGivonik',
      'confirmGivonik',
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    const newPassSection = document.getElementById('newPassSection');
    const saveBtn = document.getElementById('modalSavePasswordsBtn');
    const titleEl = modal.querySelector('.modal-title');

    // Configurar UI segÃºn el modo
    const isChange = mode === 'change';
    if (newPassSection) newPassSection.style.display = isChange ? '' : 'none';
    if (saveBtn) saveBtn.textContent = isChange ? 'Guardar' : 'Eliminar';
    if (titleEl)
      titleEl.textContent = isChange
        ? 'Cambiar ContraseÃ±as'
        : 'Confirmar eliminaciÃ³n';

    // Mantener pendingDeleteId si ya fue seteado antes por el flujo de eliminar
    // (No se toca aquÃ­; sÃ³lo se usa cuando mode==='delete')

    // Abrir modal y bloquear scroll
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  // Cierre coherente en un solo lugar
  closeSecurityModal() {
    const modal = document.getElementById('securityModal');
    if (modal) modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  // === SECCIÓN: MANEJO DEL MODAL DE AUTENTICACIÓN (LOGIN/REGISTRO) ===

  openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      // Limpiar estado anterior
      modal.classList.remove('show');
      modal.style.removeProperty('display');
      document.body.style.overflow = '';

      // Forzar reflow del DOM
      void modal.offsetHeight;

      // Mostrar modal con formulario de login
      switchToLogin();
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  setupAuthModalListeners() {
    // Solo configurar una vez
    if (this.authModalListenersSetup) return;
    this.authModalListenersSetup = true;

    const modal = document.getElementById('authModal');
    if (!modal) return;

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const closeButtons = modal.querySelectorAll('[data-close-modal]');

    // Crear handlers nombrados para poder removerlos si es necesario
    const forgotPasswordHandler = (e) => {
      e.preventDefault();
      this.closeAuthModal();
      const resetModal = document.getElementById('resetPasswordModal');
      if (resetModal) resetModal.classList.add('show');
    };

    const resetPasswordHandler = async (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value;
      const success = await this.resetPassword(email);
      if (success) {
        const resetModal = document.getElementById('resetPasswordModal');
        if (resetModal) resetModal.classList.remove('show');
        document.getElementById('resetEmail').value = '';
      }
    };

    const closeModalHandler = () => this.closeAuthModal();

    const backdropClickHandler = (e) => {
      if (e.target.id === 'authModal') {
        this.closeAuthModal();
      }
    };

    // Remover listeners anteriores si existen
    if (this._forgotPasswordHandler && forgotPasswordLink) {
      forgotPasswordLink.removeEventListener(
        'click',
        this._forgotPasswordHandler
      );
    }
    if (this._resetPasswordHandler && resetPasswordForm) {
      resetPasswordForm.removeEventListener(
        'submit',
        this._resetPasswordHandler
      );
    }
    if (this._backdropClickHandler) {
      modal.removeEventListener('click', this._backdropClickHandler);
    }

    // Añadir nuevos listeners
    if (forgotPasswordLink) {
      this._forgotPasswordHandler = forgotPasswordHandler;
      forgotPasswordLink.addEventListener('click', forgotPasswordHandler);
    }

    if (resetPasswordForm) {
      this._resetPasswordHandler = resetPasswordHandler;
      resetPasswordForm.addEventListener('submit', resetPasswordHandler);
    }

    closeButtons.forEach((btn) => {
      btn.addEventListener('click', closeModalHandler);
    });

    this._backdropClickHandler = backdropClickHandler;
    modal.addEventListener('click', backdropClickHandler);
  }

  async savePasswordsFromModal() {
    const currentPasswordEl = document.getElementById('currentPassword');
    const newPasswordEl = document.getElementById('newPassword');
    const confirmPasswordEl = document.getElementById('confirmPassword');

    if (!currentPasswordEl || !newPasswordEl || !confirmPasswordEl) {
      this.showToast('Campos del modal incompletos', 'error');
      return;
    }

    const currentPassword = currentPasswordEl.value || '';
    const newPassword = newPasswordEl.value || '';
    const confirmPassword = confirmPasswordEl.value || '';

    // Validar campos
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.showToast('Por favor completa todos los campos', 'error');
      return;
    }

    if (newPassword.length < 6) {
      this.showToast(
        'La nueva contraseña debe tener al menos 6 caracteres',
        'error'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    // Verificar con Firebase Authentication si está logueado
    const FB = window.FB;
    if (FB?.auth && this.firebaseUser) {
      try {
        // Reautenticar usuario
        const credential = FB.EmailAuthProvider.credential(
          this.firebaseUser.email,
          currentPassword
        );
        await FB.reauthenticateWithCredential(this.firebaseUser, credential);

        // Cambiar contraseña
        await FB.updatePassword(this.firebaseUser, newPassword);

        // Actualizar en Firestore
        const userDocRef = FB.doc(FB.db, 'usuarios', this.firebaseUser.uid);
        await FB.updateDoc(userDocRef, {
          passwordUpdatedAt: Date.now(),
        });

        document.getElementById('securityModal').classList.remove('show');
        document.body.style.overflow = '';
        this.showToast('Contraseña actualizada correctamente', 'success');
      } catch (error) {
        console.error('Error changing password:', error);
        if (error.code === 'auth/wrong-password') {
          this.showToast('Contraseña actual incorrecta', 'error');
        } else {
          this.showToast(
            'Error al cambiar contraseña: ' + error.message,
            'error'
          );
        }
      }
    } else {
      this.showToast(
        'Debes iniciar sesión para cambiar tu contraseña',
        'error'
      );
    }
  }

  // Goals Methods
  addGoal(e) {
    e.preventDefault();

    const name = document.getElementById('goalName').value.trim();
    const targetInput = document.getElementById('goalTarget');
    const target = this.unformatNumber(targetInput.value);
    const deadline = document.getElementById('goalDeadline').value;

    if (!name || !target || target <= 0 || !deadline) {
      this.showToast(
        'Por favor completa todos los campos correctamente',
        'error'
      );
      return;
    }

    const goal = {
      id: Date.now(),
      name: name,
      target: target,
      current: 0,
      deadline: deadline,
    };

    this.goals.push(goal);

    // Registrar en auditoría
    this.logAudit(
      'goal_added',
      'added',
      `Nueva meta: ${name} - $${target}`,
      '',
      { name, target, deadline }
    );

    this.saveData();
    this.renderGoals();
    this.renderGoalsProgress();
    this.checkAchievements();
    this.showToast('Meta creada exitosamente', 'success');
    document.getElementById('goalForm').reset();
  }

  renderGoals() {
    const container = document.getElementById('goalsList');
    if (!container) return;

    container.innerHTML = '';

    if (this.goals.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-target"></i><h3>No hay metas establecidas</h3></div>';
      return;
    }

    this.goals.forEach((goal) => {
      const progress = Math.min((goal.current / goal.target) * 100, 100);
      const goalEl = document.createElement('div');

      // Determine progress level and status
      const progressLevel = this.getProgressLevel(progress);
      const checkStatus = this.getCheckStatus(progress);
      const progressData = this.getProgressData(progress);

      // Set dynamic attributes
      goalEl.className = 'goal-card';
      goalEl.setAttribute('data-progress', progress.toFixed(0));
      goalEl.setAttribute('data-progress-level', progressLevel);

      // Create motivational message
      const motivationMessage =
        progress >= 75 && progress < 100
          ? `<div class="goal-motivation-message">¡Ya casi lo logras!</div>`
          : progress >= 100
          ? `<div class="goal-motivation-message">🎉 ¡Meta alcanzada!</div>`
          : '';

      goalEl.innerHTML = `
        <div class="goal-header">
          <div class="goal-check-wrapper">
            <i class="fas fa-check goal-check" data-status="${checkStatus}"></i>
          </div>
          <h3 class="goal-title">${goal.name}</h3>
        </div>

        <div class="goal-body">
          <div class="goal-progress-container">
            <div class="goal-progress-bar" data-progress="${progressData}">
              <div class="goal-progress-fill" style="width: ${progress}%"></div>
              <span class="goal-progress-percentage">${progress.toFixed(
                0
              )}%</span>
            </div>
            ${motivationMessage}
          </div>
        </div>

        <div class="goal-footer">
          <div class="goal-meta-info">
            <span class="goal-target">Meta: $${this.formatCurrency(
              goal.target
            )}</span>
            <span class="goal-saved">Ahorrado: $${this.formatCurrency(
              goal.current
            )}</span>
          </div>
        </div>
      `;

      container.appendChild(goalEl);
    });
  }

  getProgressLevel(progress) {
    if (progress >= 100) return 'complete';
    if (progress >= 71) return 'high';
    if (progress >= 31) return 'medium';
    return 'low';
  }

  getCheckStatus(progress) {
    if (progress >= 100) return 'achieved';
    if (progress >= 31) return 'progress';
    return 'initial';
  }

  getProgressData(progress) {
    if (progress >= 100) return 'complete';
    if (progress >= 71) return 'high';
    if (progress >= 31) return 'medium';
    return 'low';
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES').format(amount);
  }

  // Analysis Methods
  renderAnalysis() {
    setTimeout(() => {
      this.renderUserExpenseChart();
      this.renderNecessityChart();
    }, 200);
    this.renderUnnecessaryExpenses();
  }

  renderUserExpenseChart() {
    const canvas = document.getElementById('userExpenseChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (this.charts.userExpenseChart) {
      this.charts.userExpenseChart.destroy();
    }

    const userData = this.getUserData();

    this.charts.userExpenseChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(userData),
        datasets: [
          {
            label: 'Gastos por Usuario',
            data: Object.values(userData),
            backgroundColor: [
              '#21808D',
              '#E68161',
              '#C0152F',
              '#2DA6B2',
              '#A84B2F',
              '#32B8C6',
            ],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '$' + value;
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  getUserData() {
    const userData = {};
    this.expenses.forEach((expense) => {
      userData[expense.user] = (userData[expense.user] || 0) + expense.amount;
    });
    return userData;
  }

  // === SISTEMA DE AHORRO HACIA METAS ===

  getAvailableBalance() {
    const totalIncome = this.getTotalIncome();
    const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);
    const currentBalance = totalIncome - totalExpenses;
    const assignedToGoals = this.goals.reduce(
      (sum, g) => sum + (g.current || 0),
      0
    );
    return Math.max(0, currentBalance - assignedToGoals);
  }

  transferToGoal(goalId, amount) {
    const availableBalance = this.getAvailableBalance();

    if (amount <= 0) {
      this.showToast('El monto debe ser mayor a cero', 'error');
      return false;
    }

    if (amount > availableBalance) {
      this.showToast(
        `Solo tienes $${availableBalance.toLocaleString()} disponibles`,
        'error'
      );
      return false;
    }

    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal) {
      this.showToast('Meta no encontrada', 'error');
      return false;
    }

    const remaining = goal.target - goal.current;
    const transferAmount = Math.min(amount, remaining);

    goal.current += transferAmount;

    this.logAudit(
      'goal_deposit',
      'modified',
      `Transferencia a meta: ${goal.name}`,
      '',
      { goalName: goal.name, amount: transferAmount }
    );

    this.saveData();
    this.renderGoals();
    this.renderGoalsProgress();
    this.renderDashboard();

    this.showToast(
      `$${transferAmount.toLocaleString()} transferidos a "${goal.name}"`,
      'success'
    );
    return true;
  }

  autoDistributeToGoals() {
    const availableBalance = this.getAvailableBalance();

    if (availableBalance <= 0) {
      this.showToast('No hay balance disponible para distribuir', 'info');
      return;
    }

    const activeGoals = this.goals.filter((g) => g.current < g.target);

    if (activeGoals.length === 0) {
      this.showToast('No hay metas activas', 'info');
      return;
    }

    const totalRemaining = activeGoals.reduce(
      (sum, g) => sum + (g.target - g.current),
      0
    );
    let distributed = 0;

    activeGoals.forEach((goal, index) => {
      const remaining = goal.target - goal.current;
      const proportion = remaining / totalRemaining;
      const amount =
        index === activeGoals.length - 1
          ? availableBalance - distributed
          : Math.floor(availableBalance * proportion);

      goal.current += amount;
      distributed += amount;
    });

    this.logAudit(
      'auto_distribute',
      'modified',
      `Distribución automática de $${availableBalance.toLocaleString()}`,
      '',
      { amount: availableBalance, goalsCount: activeGoals.length }
    );

    this.saveData();
    this.renderGoals();
    this.renderGoalsProgress();
    this.renderDashboard();

    this.showToast(
      `$${availableBalance.toLocaleString()} distribuidos entre ${
        activeGoals.length
      } metas`,
      'success'
    );
  }

  withdrawFromGoal(goalId, amount) {
    const goal = this.goals.find((g) => g.id === goalId);

    if (!goal) {
      this.showToast('Meta no encontrada', 'error');
      return false;
    }

    if (amount <= 0 || amount > goal.current) {
      this.showToast('Monto inválido', 'error');
      return false;
    }

    const confirmed = confirm(
      `¿Retirar $${amount.toLocaleString()} de "${goal.name}"?\n\n` +
        `Esto reducirá tu progreso en esta meta.`
    );

    if (!confirmed) return false;

    goal.current -= amount;

    this.logAudit(
      'goal_withdrawal',
      'modified',
      `Retiro de meta: ${goal.name}`,
      '',
      { goalName: goal.name, amount }
    );

    this.saveData();
    this.renderGoals();
    this.renderGoalsProgress();
    this.renderDashboard();

    this.showToast(
      `$${amount.toLocaleString()} retirados de "${goal.name}"`,
      'info'
    );
    return true;
  }

  showTransactionsModal() {
    console.log(
      'showTransactionsModal called, expenses:',
      this.expenses.length
    );
    if (this.expenses.length === 0) {
      this.showToast('No hay transacciones registradas', 'info');
      return;
    }

    // Agrupar por fecha
    const groupedByDate = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      expenseDate.setHours(0, 0, 0, 0);
      const dateKey = expenseDate.getTime();

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: expenseDate,
          expenses: [],
          total: 0,
          necessary: 0,
          unnecessary: 0,
        };
      }

      groupedByDate[dateKey].expenses.push(expense);
      groupedByDate[dateKey].total += expense.amount;

      // Clasificar necesidad
      if (
        expense.necessity === 'Muy Necesario' ||
        expense.necessity === 'Necesario'
      ) {
        groupedByDate[dateKey].necessary += expense.amount;
      } else {
        groupedByDate[dateKey].unnecessary += expense.amount;
      }
    });

    // Ordenar por fecha descendente
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => b - a);

    // Generar HTML de días
    const daysHtml = sortedDates
      .map((dateKey) => {
        const dayData = groupedByDate[dateKey];
        const date = dayData.date;
        const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

        let dayLabel;
        if (diffDays === 0) dayLabel = 'Hoy';
        else if (diffDays === 1) dayLabel = 'Ayer';
        else if (diffDays < 7) {
          const dayNames = [
            'Domingo',
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
          ];
          dayLabel = dayNames[date.getDay()];
        } else {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          dayLabel = `${day}/${month}`;
        }

        const necessaryPercent =
          dayData.total > 0
            ? ((dayData.necessary / dayData.total) * 100).toFixed(0)
            : 0;
        const unnecessaryPercent =
          dayData.total > 0
            ? ((dayData.unnecessary / dayData.total) * 100).toFixed(0)
            : 0;

        return `
        <div class="day-group" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s;"
             onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'"
             onclick="document.getElementById('dayDetails_${dateKey}').style.display = document.getElementById('dayDetails_${dateKey}').style.display === 'none' ? 'block' : 'none'">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 1rem;">${dayLabel}</strong>
              <span style="color: #6b7280; font-size: 0.875rem; margin-left: 8px;">${
                dayData.expenses.length
              } transacciones</span>
            </div>
            <strong style="color: var(--color-primary);">$${dayData.total.toLocaleString()}</strong>
          </div>

          <div id="dayDetails_${dateKey}" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
              <div style="flex: 1; padding: 8px; background: #ecfdf5; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.75rem; color: #059669;">Necesario</div>
                <div style="font-weight: bold; color: #059669;">${necessaryPercent}%</div>
              </div>
              <div style="flex: 1; padding: 8px; background: #fef2f2; border-radius: 6px; text-align: center;">
                <div style="font-size: 0.75rem; color: #dc2626;">Innecesario</div>
                <div style="font-weight: bold; color: #dc2626;">${unnecessaryPercent}%</div>
              </div>
            </div>

            <div style="max-height: 300px; overflow-y: auto;">
              ${dayData.expenses
                .map(
                  (exp) => `
                <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #f3f4f6;">
                  <div>
                    <div style="font-weight: 500;">${exp.description}</div>
                    <div style="font-size: 0.75rem; color: #6b7280;">${
                      exp.category
                    } • ${exp.necessity}</div>
                  </div>
                  <div style="font-weight: 600; color: #dc2626;">$${exp.amount.toLocaleString()}</div>
                </div>
              `
                )
                .join('')}
            </div>

            <div style="margin-top: 12px; padding: 8px; background: #f9fafb; border-radius: 6px; text-align: center;">
              <strong>Total gastado: $${dayData.total.toLocaleString()}</strong>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    const modalHtml = `
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 16px;"><i class="fas fa-receipt"></i> Historial de Transacciones</h3>
        <p style="color: #6b7280; margin-bottom: 20px;">Haz clic en un día para ver detalles</p>
        <div style="max-height: 60vh; overflow-y: auto;">
          ${daysHtml}
        </div>
        <button onclick="document.getElementById('transactionsModalOverlay').remove();"
                style="width: 100%; padding: 12px; margin-top: 16px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer;">
          Cerrar
        </button>
      </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'transactionsModalOverlay';
    overlay.style.cssText =
      'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    overlay.innerHTML = `<div style="background: white; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">${modalHtml}</div>`;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  showBudgetModal() {
    const currentMonth = this.getCurrentMonthKey();
    const currentBudget = this.budgets[currentMonth] || {
      totalLimit: 0,
      totalSpent: 0,
      leisureItems: [],
    };
    const budgetLimit = currentBudget.totalLimit || 0;
    const leisureItems = currentBudget.leisureItems || [];

    console.log('🎉 Modal - Budget info:', {
      currentMonth,
      budgetLimit,
      leisureItemsCount: leisureItems.length,
      leisureItems,
    });

    // Calcular solo gastos extras/no esenciales
    const extraExpenses = this.expenses.filter(
      (e) =>
        e.necessity === 'Poco Necesario' ||
        e.necessity === 'No Necesario' ||
        e.necessity === 'Compra por Impulso'
    );
    const budgetSpent = extraExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budgetRemaining = Math.max(0, budgetLimit - budgetSpent);
    const budgetUsedPercent =
      budgetLimit > 0 ? ((budgetSpent / budgetLimit) * 100).toFixed(0) : 0;

    const modalHtml = `
      <div style="padding: 24px;">
        <h3 style="margin: 0 0 20px 0; font-size: 1.5rem; color: var(--color-text);">
          🎉 Presupuesto de Ocio
        </h3>

        ${
          budgetLimit === 0
            ? `
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 0; color: #92400e;">
              ⚠️ No has configurado un presupuesto de ocio. Ve a <strong>Configuración → Presupuesto de Ocio</strong> para apartar dinero para tus gustos y caprichos.
            </p>
          </div>
        `
            : `
          <div style="background: var(--color-surface); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 4px;">Presupuesto Total de Ocio</div>
                <div style="font-size: 2rem; font-weight: 700; color: var(--color-primary);">$${budgetLimit.toLocaleString()}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 4px;">Usado</div>
                <div style="font-size: 1.5rem; font-weight: 600; color: ${
                  budgetUsedPercent > 90
                    ? '#dc2626'
                    : budgetUsedPercent > 70
                    ? '#f59e0b'
                    : '#10b981'
                };">${budgetUsedPercent}%</div>
              </div>
            </div>

            <div style="background: var(--color-background); border-radius: 8px; height: 12px; overflow: hidden; margin-bottom: 16px;">
              <div style="background: ${
                budgetUsedPercent > 90
                  ? '#dc2626'
                  : budgetUsedPercent > 70
                  ? '#f59e0b'
                  : '#10b981'
              }; height: 100%; width: ${Math.min(
                budgetUsedPercent,
                100
              )}%; transition: width 0.3s;"></div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div style="background: #fef2f2; padding: 12px; border-radius: 8px;">
                <div style="font-size: 0.75rem; color: #dc2626; margin-bottom: 4px;">Gastado en Ocio</div>
                <div style="font-size: 1.25rem; font-weight: 600; color: #dc2626;">$${budgetSpent.toLocaleString()}</div>
              </div>
              <div style="background: #f0fdf4; padding: 12px; border-radius: 8px;">
                <div style="font-size: 0.75rem; color: #10b981; margin-bottom: 4px;">Para Gustos</div>
                <div style="font-size: 1.25rem; font-weight: 600; color: #10b981;">$${budgetRemaining.toLocaleString()}</div>
              </div>
            </div>
          </div>

          ${
            leisureItems.length > 0
              ? `
            <div style="background: var(--color-surface); border-radius: 12px; padding: 20px;">
              <h4 style="margin: 0 0 16px 0; font-size: 1rem; color: var(--color-text);">🎊 Gastos de Ocio Planeados</h4>
              <div style="max-height: 400px; overflow-y: auto;">
                ${leisureItems
                  .map((item, index) => {
                    const isUsed = item.used || false;

                    return `
                    <div style="padding: 16px; border: 2px solid var(--color-border); border-radius: 8px; margin-bottom: 12px; background: ${
                      isUsed
                        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05))'
                        : 'linear-gradient(135deg, rgba(20, 184, 166, 0.03), rgba(168, 85, 247, 0.03))'
                    }; opacity: ${isUsed ? '0.6' : '1'};">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                        <div style="flex: 1;">
                          <div style="font-weight: 600; font-size: 1rem; color: var(--color-text); margin-bottom: 4px;">
                            <i class="fas ${
                              isUsed ? 'fa-check-circle' : 'fa-star'
                            }" style="color: ${
                      isUsed ? '#10b981' : 'var(--color-primary)'
                    }; margin-right: 8px;"></i>${item.description}
                          </div>
                          <div style="font-size: 0.875rem; color: var(--color-text-secondary); margin-bottom: 8px;">
                            Monto apartado: <strong>$${item.amount.toLocaleString()}</strong>
                          </div>
                          ${
                            isUsed
                              ? `
                            <div style="display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                              ✓ Ya se usó este presupuesto
                            </div>
                          `
                              : ''
                          }
                        </div>
                        ${
                          !isUsed
                            ? `
                          <button
                            onclick="window.app.markLeisureItemAsUsed('${currentMonth}', ${index})"
                            style="padding: 8px 16px; background: linear-gradient(135deg, var(--color-primary), var(--color-teal-700)); color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(var(--color-teal-500-rgb), 0.3);"
                            onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 4px 12px rgba(var(--color-teal-500-rgb), 0.4)';"
                            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 2px 8px rgba(var(--color-teal-500-rgb), 0.3)';">
                            ¿Usado? ✓
                          </button>
                        `
                            : ''
                        }
                      </div>
                    </div>
                  `;
                  })
                  .join('')}
              </div>
            </div>
          `
              : ''
          }
        `
        }

        <div style="margin-top: 20px; text-align: center;">
          <button onclick="document.getElementById('budgetModalOverlay').remove();"
                  style="padding: 12px 32px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: opacity 0.2s;"
                  onmouseover="this.style.opacity='0.9'"
                  onmouseout="this.style.opacity='1'">
            Cerrar
          </button>
        </div>
      </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'budgetModalOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--color-background);
      border-radius: 16px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s;
    `;
    modal.innerHTML = modalHtml;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  showSavingsModal() {
    const availableBalance = this.getAvailableBalance();

    if (availableBalance <= 0) {
      this.showToast('No tienes balance disponible para ahorrar', 'info');
      return;
    }

    const activeGoals = this.goals.filter((g) => g.current < g.target);

    if (activeGoals.length === 0) {
      this.showToast('Crea metas primero para poder ahorrar', 'info');
      this.showSection('goals');
      return;
    }

    const goalsOptions = activeGoals
      .map(
        (g) =>
          `<option value="${g.id}">${g.name} (${(
            (g.current / g.target) *
            100
          ).toFixed(0)}%)</option>`
      )
      .join('');

    const modalHtml = `
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 16px;">💰 Ahorrar a Metas</h3>
        <p style="margin-bottom: 16px;">Balance disponible: <strong>$${availableBalance.toLocaleString()}</strong></p>

        <div style="margin-bottom: 20px;">
          <button onclick="window.app.autoDistributeToGoals(); document.getElementById('savingsModalOverlay').remove();"
                  style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; margin-bottom: 12px;">
            ⚡ Distribuir Automáticamente
          </button>
          <p style="font-size: 0.85rem; color: #666; margin: 0;">Distribuye proporcionalmente entre todas las metas activas</p>
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

        <div>
          <h4 style="margin-bottom: 12px;">O transferir a meta específica:</h4>
          <select id="savingsGoalSelect" style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px;">
            ${goalsOptions}
          </select>
          <input type="number" id="savingsAmount" placeholder="Monto a ahorrar"
                 style="width: 100%; padding: 10px; margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px;"
                 min="1" max="${availableBalance}">
          <button onclick="
            const goalId = parseInt(document.getElementById('savingsGoalSelect').value);
            const amount = parseFloat(document.getElementById('savingsAmount').value);
            if (window.app.transferToGoal(goalId, amount)) {
              document.getElementById('savingsModalOverlay').remove();
            }
          " style="width: 100%; padding: 12px; background: var(--color-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
            Transferir
          </button>
        </div>

        <button onclick="document.getElementById('savingsModalOverlay').remove();"
                style="width: 100%; padding: 10px; margin-top: 12px; background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer;">
          Cancelar
        </button>
      </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'savingsModalOverlay';
    overlay.style.cssText =
      'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    overlay.innerHTML = `<div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">${modalHtml}</div>`;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  renderNecessityChart() {
    const canvas = document.getElementById('necessityChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (this.charts.necessityChart) {
      this.charts.necessityChart.destroy();
    }

    const necessaryExpenses = this.expenses
      .filter(
        (exp) =>
          exp.necessity === 'Muy Necesario' || exp.necessity === 'Necesario'
      )
      .reduce((sum, exp) => sum + exp.amount, 0);

    const unnecessaryExpenses = this.expenses
      .filter(
        (exp) =>
          exp.necessity === 'Poco Necesario' ||
          exp.necessity === 'No Necesario' ||
          exp.necessity === 'Compra por Impulso' ||
          exp.necessity === 'Malgasto'
      )
      .reduce((sum, exp) => sum + exp.amount, 0);

    this.charts.necessityChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Necesario', 'No Necesario'],
        datasets: [
          {
            data: [necessaryExpenses, unnecessaryExpenses],
            backgroundColor: [
              '#33808D', // Verde azulado para necesario
              '#C0152F', // Rojo para no necesario
            ],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '84%', // Grosor más fino y elegante
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  renderUnnecessaryExpenses() {
    const container = document.getElementById('unnecessaryExpenses');
    if (!container) return;

    container.innerHTML = '';

    const unnecessary = this.expenses.filter(
      (exp) =>
        exp.necessity === 'No Necesario' ||
        exp.necessity === 'Compra por Impulso' ||
        exp.necessity === 'Malgasto'
    );

    if (unnecessary.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-thumbs-up"></i><h3>¡Excelente!</h3><p>No tienes gastos innecesarios este mes</p></div>';
      return;
    }

    unnecessary.forEach((expense) => {
      const expenseEl = document.createElement('div');
      expenseEl.className = 'unnecessary-expense';
      const metaLine = this.formatMetaLine([
        expense.date,
        expense.user,
        expense.necessity,
      ]);
      expenseEl.innerHTML = `
        <div class="unnecessary-info">
          <h4>${this.fixLegacyEncoding(expense.description)}</h4>
          <div class="unnecessary-meta">${metaLine}</div>
        </div>
        <div class="unnecessary-amount">$${expense.amount}</div>
      `;
      container.appendChild(expenseEl);
    });

    const totalUnnecessary = unnecessary.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const summaryEl = document.createElement('div');
    summaryEl.className = 'mt-16 p-16 text-center';
    summaryEl.style.backgroundColor = 'rgba(var(--color-error-rgb), 0.1)';
    summaryEl.style.borderRadius = 'var(--radius-base)';
    summaryEl.innerHTML = `
      <h4 style="color: var(--color-error); margin-bottom: var(--space-8);">
        Total en gastos innecesarios: $${totalUnnecessary}
      </h4>
      <p style="color: var(--color-text-secondary);">
        PodrÃ­as haber ahorrado este dinero para tus metas financieras
      </p>
    `;
    container.appendChild(summaryEl);
  }

  // Shopping List Methods
  addShoppingItem(e) {
    e.preventDefault();

    const product = document.getElementById('product').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);
    const necessary = document.getElementById('necessary').value;

    if (!product || !quantity || quantity <= 0 || necessary === '') {
      this.showToast(
        'Por favor completa todos los campos correctamente',
        'error'
      );
      return;
    }

    const item = {
      id: Date.now(),
      product: product,
      quantity: quantity,
      necessary: necessary === 'true',
      selected: false,
    };

    this.shoppingItems.push(item);

    // Registrar en auditoría
    this.logAudit(
      'shopping_added',
      'added',
      `Producto añadido: ${product} (x${quantity})`,
      '',
      { product, quantity, necessary: necessary === 'true' }
    );

    this.saveData();
    this.renderShoppingList();
    this.showToast('Producto agregado a la lista', 'success');
    document.getElementById('shoppingForm').reset();
  }

  renderShoppingList() {
    const container = document.getElementById('shoppingList');
    if (!container) return;

    container.innerHTML = '';

    if (this.shoppingItems.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-shopping-cart"></i><h3>Lista vacÃ­a</h3><p>Agrega productos a tu lista de compras</p></div>';
      return;
    }

    this.shoppingItems.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'shopping-item';
      itemEl.innerHTML = `
        <input type="checkbox" class="shopping-checkbox" ${
          item.selected ? 'checked' : ''
        } data-index="${index}">
        <div class="shopping-content">
          <div class="shopping-product">${this.fixLegacyEncoding(
            item.product
          )}</div>
          <div class="shopping-details">
            <span>Cantidad: ${item.quantity}</span>
            <span class="shopping-separator">•</span>
            <span class="necessity-badge ${
              item.necessary ? 'necessary' : 'not-necessary'
            }">
              ${item.necessary ? 'Necesario' : 'No Necesario'}
            </span>
          </div>
        </div>
      `;
      container.appendChild(itemEl);

      const checkbox = itemEl.querySelector('.shopping-checkbox');
      checkbox.addEventListener('change', () => {
        this.toggleShoppingItem(index);
      });
    });
  }

  toggleShoppingItem(index) {
    if (this.shoppingItems[index]) {
      this.shoppingItems[index].selected = !this.shoppingItems[index].selected;
      this.saveData();
    }
  }

  generateShoppingList() {
    const selectedItems = this.shoppingItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      this.showToast('Selecciona al menos un producto', 'error');
      return;
    }

    let listContent = 'LISTA DE COMPRAS - Dan&Giv Control\n';
    listContent += '===================================\n\n';

    selectedItems.forEach((item) => {
      const cleanProduct = this.fixLegacyEncoding(item.product);
      listContent += `• ${cleanProduct} (${item.quantity})\n`;
    });

    listContent += '\n===================================\n';
    listContent += `Total de productos: ${selectedItems.length}\n`;
    listContent += `Generado: ${new Date().toLocaleDateString('es-ES')}`;

    const blob = new Blob([listContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lista-compras-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showToast('Lista de compras descargada', 'success');
  }

  // Configuration Methods
  updateIncome(e) {
    e.preventDefault();

    const incomeInput = document.getElementById('monthlyIncome');
    const income = this.unformatNumber(incomeInput.value);

    if (!income || income <= 0) {
      this.showToast('Por favor ingresa un monto válido', 'error');
      return;
    }

    this.monthlyIncome = income;
    this.saveData();
    this.renderConfig();
    this.updateStats();
    this.showToast('Ingresos actualizados', 'success');
  }

  // Additional Incomes Methods
  addAdditionalIncome() {
    const descriptionInput = document.getElementById(
      'additionalIncomeDescription'
    );
    const amountInput = document.getElementById('additionalIncomeAmount');

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!description || !amount || amount <= 0) {
      this.showToast('Completa descripción y monto válido', 'error');
      return;
    }

    const newIncome = {
      id: Date.now(),
      description: description,
      amount: amount,
    };

    this.additionalIncomes.push(newIncome);
    this.saveData();
    this.renderAdditionalIncomes();
    this.updateStats();

    // Limpiar campos
    descriptionInput.value = '';
    amountInput.value = '';
    descriptionInput.focus();

    this.showToast('Ingreso adicional agregado', 'success');
  }

  deleteAdditionalIncome(id) {
    this.additionalIncomes = this.additionalIncomes.filter(
      (income) => income.id !== id
    );
    this.saveData();
    this.renderAdditionalIncomes();
    this.updateStats();
    this.showToast('Ingreso eliminado', 'success');
  }

  getTotalAdditionalIncome() {
    return this.additionalIncomes.reduce(
      (sum, income) => sum + income.amount,
      0
    );
  }

  getTotalIncome() {
    return this.monthlyIncome + this.getTotalAdditionalIncome();
  }

  renderAdditionalIncomes() {
    const listContainer = document.getElementById('additionalIncomesList');
    const totalContainer = document.getElementById('totalAdditionalIncome');

    if (!listContainer || !totalContainer) return;

    const totalAdditional = this.getTotalAdditionalIncome();

    // Renderizar lista
    if (this.additionalIncomes.length === 0) {
      listContainer.innerHTML =
        '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-12);">No hay ingresos adicionales</p>';
    } else {
      listContainer.innerHTML = this.additionalIncomes
        .map(
          (income) => `
        <div class="additional-income-item">
          <div class="additional-income-info">
            <span class="additional-income-description">${
              income.description
            }</span>
            <span class="additional-income-amount">$${income.amount.toLocaleString()}</span>
          </div>
          <button class="additional-income-delete" onclick="app.deleteAdditionalIncome(${
            income.id
          })" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `
        )
        .join('');
    }

    // Actualizar total
    totalContainer.querySelector(
      '.amount'
    ).textContent = `$${totalAdditional.toLocaleString()}`;
  }

  renderConfig() {
    const incomeField = document.getElementById('monthlyIncome');
    if (incomeField) {
      incomeField.value = this.monthlyIncome;
    }

    // Renderizar ingresos adicionales
    this.renderAdditionalIncomes();

    const container = document.getElementById('monthSummary');
    if (!container) return;

    const totalExpenses = this.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalIncome = this.getTotalIncome();
    const available = totalIncome - totalExpenses;
    const savingsGoal = this.goals.reduce(
      (sum, goal) => sum + (goal.target - goal.current),
      0
    );

    const additionalTotal = this.getTotalAdditionalIncome();

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <h3>Ingresos Totales</h3>
            <p class="stat-value">$${totalIncome.toLocaleString()}</p>
            ${
              additionalTotal > 0
                ? `<span class="form-hint" style="margin-top: 4px;">Base: $${this.monthlyIncome.toLocaleString()} + Adicionales: $${additionalTotal.toLocaleString()}</span>`
                : ''
            }
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-content">
            <h3>Gastos Totales</h3>
            <p class="stat-value">$${totalExpenses.toLocaleString()}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-content">
            <h3>Dinero Disponible</h3>
            <p class="stat-value" style="color: ${
              available >= 0 ? 'var(--color-success)' : 'var(--color-error)'
            }">
              $${available.toLocaleString()}
            </p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-content">
            <h3>Falta para Metas</h3>
            <p class="stat-value">$${savingsGoal.toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Utility Methods
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');

    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle',
    };

    if (icon) icon.className = `toast-icon ${icons[type]}`;
    if (messageEl) messageEl.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.className = 'toast hidden';
    }, 3000);
  }

  // ... (cÃ³digo de la funciÃ³n toggleTheme) ...
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);

    const icon = document.querySelector('#themeToggle i');
    if (icon) {
      icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Guardar preferencia
    localStorage.setItem('financia_theme', newTheme);
  }

  applyTheme(theme) {
    if (theme === 'auto') {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    // Actualizar icono del toggle en navbar
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  loadThemePreference() {
    const savedTheme = localStorage.getItem('financia_theme') || 'light';
    this.applyTheme(savedTheme);

    // Actualizar botón activo en config
    document.querySelectorAll('.theme-option').forEach((opt) => {
      if (opt.getAttribute('data-theme') === savedTheme) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  selectAvatar(avatarId) {
    // Guardar avatar seleccionado
    localStorage.setItem('financia_avatar', avatarId);

    // Actualizar avatar en todas las ubicaciones
    this.updateAvatarDisplay(avatarId);
  }

  updateAvatarDisplay(avatarId) {
    // Encontrar el avatar seleccionado
    const selectedOption = document.querySelector(
      `[data-avatar="${avatarId}"]`
    );
    if (!selectedOption) return;

    const avatarIcon = selectedOption.querySelector('.avatar-icon');
    if (!avatarIcon) return;

    // Clonar el icono y gradiente
    const iconClone = avatarIcon.cloneNode(true);

    // Actualizar en configuración (perfil)
    const profileAvatar = document.getElementById('currentProfileAvatar');
    if (profileAvatar) {
      const avatarPreview = profileAvatar.querySelector('.avatar-preview');
      if (avatarPreview) {
        avatarPreview.innerHTML = '';
        avatarPreview.appendChild(iconClone.cloneNode(true));
      }
    }

    // Actualizar en sidebar si existe
    const sidebarAvatar = document.querySelector('.sidebar .user-avatar');
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = '';
      sidebarAvatar.appendChild(iconClone.cloneNode(true));
    }
  }

  loadAvatarPreference() {
    const savedAvatar = localStorage.getItem('financia_avatar') || 'avatar-1';

    // Actualizar display
    this.updateAvatarDisplay(savedAvatar);

    // Actualizar selección en tienda
    document.querySelectorAll('.avatar-option').forEach((opt) => {
      if (opt.getAttribute('data-avatar') === savedAvatar) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });
  }

  // PEGA EL NUEVO CÃƒâ€œDIGO JS AQUÃ
  // REEMPLAZA TU FUNCIÃƒâ€œN handleAIOnboarding CON ESTA:
  async handleAIOnboarding() {
    const nickname = document.getElementById('userNickname').value;
    const goal = document.getElementById('mainGoal').value;
    const amount = document.getElementById('goalAmount').value;
    const submitButton = document.getElementById('startAIPlanBtn');

    if (!nickname || !goal || !amount) {
      this.showToast('Por favor, completa todos los campos del plan.', 'error');
      return;
    }

    // Guardamos los datos iniciales
    this.tempUserData = { nickname, goal, amount };

    // Preparamos la primera pregunta
    this.conversationState = 'ASKING_INCOME';
    this.conversationHistory = [
      {
        role: 'user',
        content: `El usuario ${nickname} quiere ahorrar $${amount} para ${goal}.`,
      },
      {
        role: 'assistant',
        content: `¡Hola, ${nickname}! ¡Qué excelente meta! Para empezar a crear tu plan, necesito saber, ¿cuál es tu ingreso mensual aproximado? 💰`,
      },
    ];

    // Actualizamos la UI
    document.getElementById('aiOnboardingContainer').classList.add('hidden');
    document.getElementById('chatInterface').classList.remove('hidden');
    this.renderChatHistory();
    submitButton.disabled = false;
    submitButton.innerHTML = `<i class="fas fa-check"></i> Crear mi Primer Plan`;
  }

  renderChatHistory() {
    const container = document.getElementById('chatHistory');
    if (!container) return;

    container.innerHTML = '';

    this.conversationHistory.forEach((message) => {
      const roleClass = message.role === 'user' ? 'user' : 'ai';
      const messageEl = document.createElement('div');
      messageEl.className = `chat-message ${roleClass}`;
      messageEl.innerHTML = `<div class="chat-bubble">${message.content}</div>`;
      container.appendChild(messageEl);
    });

    container.scrollTop = container.scrollHeight;
  }

  async sendChatMessage() {
    const input = document.getElementById('chatInput');
    const messageText = input ? input.value.trim() : '';
    if (!messageText) return;

    this.conversationHistory.push({ role: 'user', content: messageText });
    this.renderChatHistory();
    if (input) input.value = '';

    const chatHistoryContainer = document.getElementById('chatHistory');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message ai';
    typingIndicator.innerHTML = `<div class="chat-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    chatHistoryContainer.appendChild(typingIndicator);
    chatHistoryContainer.scrollTop = chatHistoryContainer.scrollHeight;

    try {
      const response = await fetch('http://localhost:3000/api/perplexity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3-sonar-large-32k-online',
          messages: this.conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content;
      if (aiMessage) {
        this.conversationHistory.push({
          role: 'assistant',
          content: aiMessage,
        });
      } else {
        throw new Error('Respuesta vacía de la IA');
      }

      this.renderChatHistory();
    } catch (error) {
      console.error('Error al enviar mensaje de chat:', error);
      this.showToast('Hubo un error en la conversación con la IA.', 'error');
      this.conversationHistory.push({
        role: 'assistant',
        content: 'Lo siento, tuve un problema para procesar tu respuesta.',
      });
      this.renderChatHistory();
    }
  }
  async updateSpecificField(fieldName, data) {
    if (!this.currentUser || this.currentUser === 'anonymous') return;

    const firestoreDocId = this.sharedAccountId || this.currentUser;
    const userDocRef = FB.doc(FB.db, 'usuarios', firestoreDocId);

    try {
      // updateDoc solo envía el campo especificado. ¡Mucho más eficiente!
      await FB.updateDoc(userDocRef, {
        [fieldName]: data,
      });
      console.log(`✅ Campo '${fieldName}' actualizado eficientemente.`);
    } catch (error) {
      console.error(`Error al actualizar el campo '${fieldName}':`, error);
      // Si falla, puedes intentar un guardado completo como respaldo
      await this.saveData();
    }
  }
} // <-- FIN DE LA CLASE FINANCEAPP

// === SISTEMA DE CONSENTIMIENTO DE COOKIES ===
class CookieConsent {
  constructor() {
    this.consentKey = 'cookie_consent';
    this.preferences = this.loadPreferences();
    this.init();
  }

  loadPreferences() {
    const saved = localStorage.getItem(this.consentKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      essential: true, // Siempre true
      analytics: false,
      functional: false,
      timestamp: null,
    };
  }

  savePreferences() {
    this.preferences.timestamp = Date.now();
    localStorage.setItem(this.consentKey, JSON.stringify(this.preferences));
  }

  hasConsent() {
    return this.preferences.timestamp !== null;
  }

  init() {
    const banner = document.getElementById('cookieBanner');
    const modal = document.getElementById('cookieModal');

    // Verificar si el usuario está autenticado
    const isAuthenticated =
      localStorage.getItem('financia_auth_status') === 'authenticated';

    // SOLUCIÓN: Ocultar banner por defecto y solo mostrar si corresponde
    if (banner) {
      // Siempre empezar con el banner oculto
      banner.classList.add('hidden');

      // Mostrar solo si no hay consentimiento Y no está autenticado
      if (!this.hasConsent() && !isAuthenticated) {
        banner.classList.remove('hidden');
      }
    }

    // Botones del banner
    document.getElementById('cookieAccept')?.addEventListener('click', () => {
      this.acceptAll();
    });

    document.getElementById('cookieReject')?.addEventListener('click', () => {
      this.rejectAll();
    });

    document.getElementById('cookieSettings')?.addEventListener('click', () => {
      this.openModal();
    });

    // Modal
    document
      .getElementById('cookieModalClose')
      ?.addEventListener('click', () => {
        this.closeModal();
      });

    document
      .getElementById('cookieModalOverlay')
      ?.addEventListener('click', () => {
        this.closeModal();
      });

    document
      .getElementById('cookieRejectAll')
      ?.addEventListener('click', () => {
        this.rejectAll();
        this.closeModal();
      });

    document
      .getElementById('cookieSavePreferences')
      ?.addEventListener('click', () => {
        this.saveCustomPreferences();
      });

    // Cargar preferencias actuales en el modal
    this.loadModalState();
  }

  acceptAll() {
    this.preferences = {
      essential: true,
      analytics: true,
      functional: true,
      timestamp: Date.now(),
    };
    this.savePreferences();
    this.hideBanner();
    this.applyConsent();

    const app = window.app;
    if (app && app.showToast) {
      app.showToast('Preferencias de cookies guardadas', 'success');
    }
  }

  rejectAll() {
    this.preferences = {
      essential: true,
      analytics: false,
      functional: false,
      timestamp: Date.now(),
    };
    this.savePreferences();
    this.hideBanner();
    this.applyConsent();

    const app = window.app;
    if (app && app.showToast) {
      app.showToast('Solo cookies esenciales activadas', 'info');
    }
  }

  saveCustomPreferences() {
    this.preferences = {
      essential: true,
      analytics: document.getElementById('cookieAnalytics')?.checked || false,
      functional: document.getElementById('cookieFunctional')?.checked || false,
      timestamp: Date.now(),
    };
    this.savePreferences();
    this.hideBanner();
    this.closeModal();
    this.applyConsent();

    const app = window.app;
    if (app && app.showToast) {
      app.showToast('Preferencias de cookies guardadas', 'success');
    }
  }

  loadModalState() {
    const analyticsCheckbox = document.getElementById('cookieAnalytics');
    const functionalCheckbox = document.getElementById('cookieFunctional');

    if (analyticsCheckbox) {
      analyticsCheckbox.checked = this.preferences.analytics;
    }
    if (functionalCheckbox) {
      functionalCheckbox.checked = this.preferences.functional;
    }
  }

  openModal() {
    const modal = document.getElementById('cookieModal');
    if (modal) {
      this.loadModalState();
      modal.classList.remove('hidden');
    }
  }

  closeModal() {
    const modal = document.getElementById('cookieModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  hideBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.add('hidden');
    }
  }

  applyConsent() {
    // Aquí se aplicarían las preferencias
    // Por ejemplo, inicializar Google Analytics solo si analytics: true

    if (this.preferences.analytics) {
      console.log('✅ Analytics cookies enabled');
      // Inicializar Google Analytics, Firebase Analytics, etc.
      this.initAnalytics();
    } else {
      console.log('❌ Analytics cookies disabled');
    }

    if (this.preferences.functional) {
      console.log('✅ Functional cookies enabled');
      // Inicializar funcionalidades extra
    } else {
      console.log('❌ Functional cookies disabled');
    }
  }

  initAnalytics() {
    // Firebase Analytics (si está disponible)
    const FB = window.FB;
    if (FB && FB.analytics) {
      console.log('🔥 Firebase Analytics initialized');
      // FB.logEvent(FB.analytics, 'cookie_consent', { analytics: true });
    }

    // Google Analytics (si está disponible)
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  }

  // Método público para abrir configuración desde menú
  openSettings() {
    this.openModal();
  }
}

// Inicializar sistema de cookies cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();

    // Conectar botón de configuración
    const openCookieSettingsBtn = document.getElementById('openCookieSettings');
    if (openCookieSettingsBtn) {
      openCookieSettingsBtn.addEventListener('click', () => {
        window.cookieConsent.openSettings();
      });
    }
  });
} else {
  window.cookieConsent = new CookieConsent();

  // Conectar botón de configuración
  const openCookieSettingsBtn = document.getElementById('openCookieSettings');
  if (openCookieSettingsBtn) {
    openCookieSettingsBtn.addEventListener('click', () => {
      window.cookieConsent.openSettings();
    });
  }
}

// === FUNCIÓN GLOBAL DE LIMPIEZA DE FIRESTORE ===
// Usar desde consola: window.cleanFirestoreData()
window.cleanFirestoreData = async function () {
  const FB = window.FB;
  const app = window.app;

  if (!FB || !app || !app.currentUser || app.currentUser === 'anonymous') {
    console.error('No hay sesión activa de Firebase');
    return;
  }

  try {
    const firestoreDocId = app.sharedAccountId || app.currentUser;
    const userDocRef = FB.doc(FB.db, 'usuarios', firestoreDocId);

    console.log('🧹 Limpiando datos de Firestore para:', firestoreDocId);

    // Limpiar solo las imágenes, mantener el resto de datos
    await FB.updateDoc(userDocRef, {
      'userProfile.avatar': '',
      'userProfile.bannerCover': '',
      updatedAt: Date.now(),
    });

    console.log('✅ Datos limpiados exitosamente');
    console.log('🔄 Recarga la página para aplicar cambios');

    if (app.showToast) {
      app.showToast('Datos limpiados. Recarga la página.', 'success');
    }
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error);
  }
};

// === INICIO DE SECCIÃƒâ€œN: INICIALIZACIÃƒâ€œN GLOBAL DE LA APP ===

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa la aplicaciÃ³n principal una sola vez.
  if (!window.app) {
    window.app = new FinanceApp();
    window.app.init();
    // Cargar preferencias guardadas
    window.app.loadThemePreference();
    window.app.loadAvatarPreference();
    // Cargar mensajes personalizados del JSON
    window.app.loadMessagesFromJSON().then(() => {
      // Iniciar sistema de mensajes programados
      window.app.startMessageScheduler();
    });
  }

  // 2. Configurar event delegation para el enlace de cambio de formulario auth
  // Usar event delegation porque el contenido del enlace se recrea dinámicamente
  const authSwitchLinkContainer = document.getElementById('authSwitchLink');
  if (authSwitchLinkContainer) {
    authSwitchLinkContainer.addEventListener('click', function (e) {
      // Verificar si el click fue en el enlace
      if (e.target.tagName === 'A' || e.target.closest('a')) {
        e.preventDefault();
        const link = e.target.closest('a') || e.target;
        const linkText = link.textContent.trim();

        // Determinar qué función ejecutar basándose en el texto del enlace
        if (
          linkText.includes('Regístrate') ||
          linkText.includes('Registrate')
        ) {
          switchToRegister();
        } else if (
          linkText.includes('Inicia sesión') ||
          linkText.includes('sesión')
        ) {
          switchToLogin();
        }
      }
    });
  }

  // 2b. Configurar botones de tabs de gastos (Rápido y Recurrente)
  const expenseTabButtons = document.querySelectorAll(
    '.expense-tab-btn[data-tab="quick"], .expense-tab-btn[data-tab="recurring"]'
  );
  expenseTabButtons.forEach((button) => {
    button.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openComingSoonModal();
    });
  });

  // 2c. Cerrar modal "Coming Soon" al hacer click en el overlay
  const comingSoonModal = document.getElementById('comingSoonModal');
  if (comingSoonModal) {
    comingSoonModal.addEventListener('click', function (e) {
      // Solo cerrar si el click es en el overlay (no en el contenido del modal)
      if (e.target === comingSoonModal) {
        closeComingSoonModal();
      }
    });
  }

  // 2d. Manejo del botón de retroceso del móvil
  let backPressCount = 0;
  let backPressTimer = null;

  // Agregar estado inicial al historial
  history.pushState({ page: 'current' }, '', '');

  window.addEventListener('popstate', function (event) {
    backPressCount++;

    // Si es la primera vez que presiona atrás
    if (backPressCount === 1) {
      // Verificar si NO está en el dashboard
      const currentSection = document.querySelector('.section.active');
      const dashboardSection = document.getElementById('dashboard');

      if (currentSection && currentSection !== dashboardSection) {
        // Ir al dashboard
        window.app.showSection('dashboard');
        window.app.showToast('📱 Presiona atrás de nuevo para salir', 'info');

        // Resetear el contador después de 2 segundos
        backPressTimer = setTimeout(() => {
          backPressCount = 0;
        }, 2000);

        // Agregar estado de nuevo para capturar el siguiente "atrás"
        history.pushState({ page: 'current' }, '', '');
      } else {
        // Ya está en dashboard, mostrar mensaje de salida
        window.app.showToast('📱 Presiona atrás de nuevo para salir', 'info');

        // Resetear el contador después de 2 segundos
        backPressTimer = setTimeout(() => {
          backPressCount = 0;
        }, 2000);

        // Agregar estado de nuevo para capturar el siguiente "atrás"
        history.pushState({ page: 'current' }, '', '');
      }
    }
    // Si es la segunda vez (dentro de 2 segundos)
    else if (backPressCount === 2) {
      // Cerrar la app (volver atrás en el historial del navegador)
      clearTimeout(backPressTimer);
      window.app.showToast('👋 Hasta pronto!', 'success');

      // En móviles, esto cerrará la app si es una PWA o volverá a la página anterior
      setTimeout(() => {
        history.back();
      }, 500);
    }
  });

  // 2e. Configurar modal de estadísticas del gráfico
  const chartStatsModal = document.getElementById('chartStatsModal');
  const closeChartStatsModal = document.getElementById('closeChartStatsModal');

  if (closeChartStatsModal) {
    closeChartStatsModal.addEventListener('click', () => {
      chartStatsModal.classList.remove('active');
    });
  }

  if (chartStatsModal) {
    chartStatsModal.addEventListener('click', (e) => {
      if (e.target === chartStatsModal) {
        chartStatsModal.classList.remove('active');
      }
    });
  }

  // 3. Configura las animaciones de scroll.
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    },
    { threshold: 0.1 }
  );
  reveals.forEach((el) => observer.observe(el));
});

// === FIN DE SECCIÃƒâ€œN: INICIALIZACIÃƒâ€œN GLOBAL DE LA APP ===

// === INICIO DE SECCIÃƒâ€œN: HELPERS GLOBALES (EVENTOS Y CONSOLA) ===

// 1. Funcionalidad para mostrar/ocultar contraseÃ±as (toggle pass)
// Password visibility toggle
function togglePasswordVisibility(inputId, icon) {
  const input = document.getElementById(inputId);
  if (input) {
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

// Unsplash API for goal inspiration
// PROTEGIDA: Configura en variables de entorno o backend/.env
const UNSPLASH_ACCESS_KEY = window.unsplashApiKey || '';
const goalCategories = [
  'vacation',
  'beach',
  'travel',
  'shopping',
  'luxury fashion',
  'technology gadgets',
];
let currentCategoryIndex = 0;

FinanceApp.prototype.loadInspirationImage = async function () {
  const img = document.getElementById('inspirationImage');
  const overlay = document.querySelector('.inspiration-text');

  if (!img) return;

  // Si no hay API key de Unsplash, usar imágenes estáticas
  if (!UNSPLASH_ACCESS_KEY) {
    const staticImages = [
      // Vacaciones & Playa
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
      // Viajes
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80',
      // Compras & Lujo
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea91c7ef?w=800&q=80',
      // Tecnología
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      // Naturaleza & Inspiración
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
    ];

    img.style.opacity = '0';
    setTimeout(() => {
      img.src = staticImages[currentCategoryIndex % staticImages.length];

      // Aplicar efecto zoom + pan aleatorio
      const zoomLevel = 1.05 + Math.random() * 0.1; // 1.05 a 1.15
      const panX = (Math.random() - 0.5) * 8; // -4% a 4%
      const panY = (Math.random() - 0.5) * 8; // -4% a 4%

      setTimeout(() => {
        img.style.transform = `translate(-50%, -50%) scale(${zoomLevel}) translate(${panX}%, ${panY}%)`;
        img.style.opacity = '1';
      }, 50);

      // Actualizar texto según categoría
      const categories = [
        'Vacaciones',
        'Playa',
        'Viajes',
        'Compras',
        'Moda de lujo',
        'Tecnología',
      ];
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.textContent = `✨ ${
            categories[Math.floor(currentCategoryIndex / 3) % categories.length]
          }`;
          overlay.style.transition = 'opacity 1s ease-in-out';
          overlay.style.opacity = '1';
        }, 800);
      }

      currentCategoryIndex = (currentCategoryIndex + 1) % staticImages.length;
    }, 1500);
    return;
  }

  const category = goalCategories[currentCategoryIndex];
  currentCategoryIndex = (currentCategoryIndex + 1) % goalCategories.length;

  try {
    // Intentar usar backend proxy primero
    const backendUrl = 'http://localhost:3000';
    let response;
    let data;

    try {
      // Opción 1: Usar backend proxy (más seguro)
      response = await fetch(
        `${backendUrl}/api/unsplash/random?query=${encodeURIComponent(
          category
        )}&orientation=landscape`
      );

      if (!response.ok) {
        throw new Error('Backend no disponible');
      }

      data = await response.json();
    } catch (backendError) {
      console.warn(
        '⚠️ Backend no disponible, intentando directo a Unsplash...',
        backendError.message
      );

      // Opción 2: Fallback directo a Unsplash (solo si hay API key)
      if (!UNSPLASH_ACCESS_KEY) {
        throw new Error('No hay API key de Unsplash configurada');
      }

      response = await fetch(
        `https://api.unsplash.com/photos/random?query=${category}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      data = await response.json();
    }

    if (!data || !data.urls || !data.urls.regular) {
      throw new Error('Invalid response from Unsplash API');
    }

    img.style.opacity = '0';
    setTimeout(() => {
      img.src = data.urls.regular;

      // Aplicar efecto zoom + pan aleatorio
      const zoomLevel = 1.05 + Math.random() * 0.1; // 1.05 a 1.15
      const panX = (Math.random() - 0.5) * 8; // -4% a 4%
      const panY = (Math.random() - 0.5) * 8; // -4% a 4%

      setTimeout(() => {
        img.style.transform = `translate(-50%, -50%) scale(${zoomLevel}) translate(${panX}%, ${panY}%)`;
        img.style.opacity = '1';
      }, 50);

      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.textContent = `✨ ${
            category === 'luxury fashion'
              ? 'Moda de lujo'
              : category === 'technology gadgets'
              ? 'Tecnología'
              : category === 'vacation'
              ? 'Vacaciones'
              : category === 'beach'
              ? 'Playa'
              : category === 'travel'
              ? 'Viajes'
              : 'Compras'
          }`;
          overlay.style.transition = 'opacity 1s ease-in-out';
          overlay.style.opacity = '1';
        }, 800);
      }
    }, 1500);
  } catch (error) {
    console.error('Error loading inspiration:', error);
    img.src =
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
  }
};

FinanceApp.prototype.startInspirationRotation = function () {
  if (this.inspirationInterval) clearInterval(this.inspirationInterval);

  this.loadInspirationImage();
  this.inspirationInterval = setInterval(() => {
    this.loadInspirationImage();
  }, 8000); // Cambiado de 5000 a 8000ms (8 segundos)
};

FinanceApp.prototype.stopInspirationRotation = function () {
  if (this.inspirationInterval) {
    clearInterval(this.inspirationInterval);
    this.inspirationInterval = null;
  }
};

// Social login methods
FinanceApp.prototype.loginWithGoogle = async function () {
  const FB = window.FB;
  if (!FB?.auth) {
    this.showToast('Firebase no está configurado correctamente', 'error');
    return;
  }

  try {
    const provider = new FB.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const result = await FB.signInWithPopup(FB.auth, provider);

    this.showToast(
      `¡Bienvenido, ${result.user.displayName || 'Usuario'}! 🎉`,
      'success'
    );
    this.closeAuthModal();

    // Iniciar tour para nuevos usuarios
    if (result.additionalUserInfo?.isNewUser) {
      setTimeout(() => {
        this.startTour();
      }, 2000);
    }
  } catch (error) {
    console.error('[Auth] Error Google login:', error.code, error.message);

    const errorMessages = {
      'auth/popup-closed-by-user': 'Cancelaste el inicio de sesión',
      'auth/popup-blocked':
        'El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.',
      'auth/account-exists-with-different-credential':
        'Ya existe una cuenta con este correo usando otro método de inicio de sesión.',
      'auth/cancelled-popup-request': 'Se canceló la solicitud anterior',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
    };

    const message =
      errorMessages[error.code] ||
      'No pudimos iniciar sesión con Google. Intenta de nuevo.';
    this.showToast(message, 'error');
  }
};

FinanceApp.prototype.loginWithFacebook = async function () {
  const FB = window.FB;
  if (!FB?.auth) {
    this.showToast('Firebase no está configurado correctamente', 'error');
    return;
  }

  try {
    const provider = new FB.FacebookAuthProvider();
    provider.setCustomParameters({
      display: 'popup',
    });

    const result = await FB.signInWithPopup(FB.auth, provider);

    this.showToast(
      `¡Bienvenido, ${result.user.displayName || 'Usuario'}! 🎉`,
      'success'
    );
    this.closeAuthModal();

    // Iniciar tour para nuevos usuarios
    if (result.additionalUserInfo?.isNewUser) {
      setTimeout(() => {
        this.startTour();
      }, 2000);
    }
  } catch (error) {
    console.error('[Auth] Error Facebook login:', error.code, error.message);

    const errorMessages = {
      'auth/popup-closed-by-user': 'Cancelaste el inicio de sesión',
      'auth/popup-blocked':
        'El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio.',
      'auth/account-exists-with-different-credential':
        'Ya existe una cuenta con este correo usando otro método de inicio de sesión.',
      'auth/cancelled-popup-request': 'Se canceló la solicitud anterior',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet.',
      'auth/auth-domain-config-required':
        'La configuración de Facebook no está completa en Firebase Console.',
    };

    const message =
      errorMessages[error.code] ||
      'No pudimos iniciar sesión con Facebook. Intenta de nuevo.';
    this.showToast(message, 'error');
  }
};
// 2. Publicar una funciÃ³n global para verificar contraseÃ±as desde la consola.
window.verificarPassword = function (userName, plainPassword) {
  if (window.app && typeof window.app.verifyPassword === 'function') {
    const ok = window.app.verifyPassword(userName, plainPassword);
    console.log(`VerificaciÃ³n para '${userName}':`, ok);
    return ok;
  } else {
    console.warn('App no inicializada o mÃ©todo no disponible');
    return false;
  }
};

// === QUICK ACCESS CARD FUNCTIONALITY ===

// Quick Access Card functionality
FinanceApp.prototype.initQuickAccess = function () {
  this.updateQuickAccessGreeting();
  this.updateLastTransaction();

  const quickAddBtn = document.getElementById('quickAddExpenseBtn');
  if (quickAddBtn) {
    quickAddBtn.addEventListener('click', () => {
      this.showSection('expenses');
    });
  }
};

FinanceApp.prototype.updateQuickAccessGreeting = function () {
  const greetingEl = document.getElementById('quickAccessGreeting');
  if (greetingEl) {
    const now = new Date();
    const hour = now.getHours();
    let greeting = '¡Hola';

    if (hour < 12) greeting = '¡Buenos días';
    else if (hour < 18) greeting = '¡Buenas tardes';
    else greeting = '¡Buenas noches';

    console.log('🔍 Debug Quick Access Greeting:');
    console.log('  currentUser:', this.currentUser);
    console.log('  userProfile:', this.userProfile);
    console.log('  userProfile.name:', this.userProfile.name);

    if (this.currentUser && this.currentUser !== 'anonymous') {
      // Usar nombre personalizado del perfil, no el UID
      const userName = this.userProfile.name || this.currentUser;
      console.log('  userName usado:', userName);
      greeting += `, ${userName}!`;
    } else {
      greeting += ', Usuario!';
    }

    console.log('  greeting final:', greeting);
    greetingEl.textContent = greeting;
  }
};

FinanceApp.prototype.updateLastTransaction = function () {
  const detailEl = document.getElementById('lastTransactionDetail');
  if (detailEl) {
    if (this.expenses.length > 0) {
      const lastExpense = this.expenses[this.expenses.length - 1];
      detailEl.innerHTML = `
        <span class="transaction-desc">${lastExpense.description}</span>
        <span class="transaction-amount">$${lastExpense.amount}</span>
      `;
    } else {
      detailEl.innerHTML = `
        <span class="transaction-desc">Sin transacciones</span>
        <span class="transaction-amount">$0</span>
      `;
    }
  }
};

// === TREND CHART FUNCTIONALITY ===

FinanceApp.prototype.initTrendChart = function () {
  const canvas = document.getElementById('trendChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (this.charts.trendChart) {
    this.charts.trendChart.destroy();
  }

  let chartData;

  if (!this.currentUser || this.currentUser === 'anonymous') {
    // Demo mode with animated data
    chartData = this.getTrendDemoData();
  } else {
    // Real user data
    chartData = this.getTrendUserData();
  }

  this.charts.trendChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          cornerRadius: 8,
        },
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: { color: 'var(--color-text-secondary)' },
        },
        y: {
          display: true,
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
          ticks: { color: 'var(--color-text-secondary)' },
        },
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 3,
        },
        point: {
          radius: 4,
          hoverRadius: 6,
        },
      },
      animation: {
        duration: this.currentUser === 'anonymous' ? 2000 : 1000,
        easing: 'easeInOutQuart',
      },
    },
  });

  if (this.currentUser === 'anonymous') {
    this.startTrendAnimation();
  }
};

FinanceApp.prototype.getTrendDemoData = function () {
  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const baseData = [120, 190, 300, 500, 200, 300, 450];

  return {
    labels: labels,
    datasets: [
      {
        data: baseData,
        borderColor: this.getCurrentStyleColors()[0],
        backgroundColor: this.getCurrentStyleColors()[0] + '20',
        fill: true,
        pointBackgroundColor: this.getCurrentStyleColors()[0],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };
};

FinanceApp.prototype.getTrendUserData = function () {
  const last7Days = [];
  const dailyExpenses = {};

  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last7Days.push(dateStr);
    dailyExpenses[dateStr] = 0;
  }

  // Calculate daily expenses
  this.expenses.forEach((expense) => {
    const expenseDate = expense.date;
    if (dailyExpenses.hasOwnProperty(expenseDate)) {
      dailyExpenses[expenseDate] += expense.amount;
    }
  });

  const labels = last7Days.map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', { weekday: 'short' });
  });

  const data = last7Days.map((date) => dailyExpenses[date]);

  return {
    labels: labels,
    datasets: [
      {
        data: data,
        borderColor: this.getCurrentStyleColors()[0],
        backgroundColor: this.getCurrentStyleColors()[0] + '20',
        fill: true,
        pointBackgroundColor: this.getCurrentStyleColors()[0],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };
};

FinanceApp.prototype.startTrendAnimation = function () {
  if (this.trendAnimationInterval) {
    clearInterval(this.trendAnimationInterval);
  }

  this.trendAnimationInterval = setInterval(() => {
    if (this.charts.trendChart && this.currentUser === 'anonymous') {
      const dataset = this.charts.trendChart.data.datasets[0];

      // Generate new animated data
      dataset.data = dataset.data.map(
        () => Math.floor(Math.random() * 400) + 100
      );

      this.charts.trendChart.update('none');
    }
  }, 3000);
};

FinanceApp.prototype.updateTrendChart = function () {
  if (this.charts.trendChart) {
    const newData =
      this.currentUser === 'anonymous'
        ? this.getTrendDemoData()
        : this.getTrendUserData();

    this.charts.trendChart.data = newData;
    this.charts.trendChart.update();
  }
};

// === ACHIEVEMENTS SYSTEM ===

FinanceApp.prototype.initAchievements = function () {
  this.achievements = [
    {
      id: 'first_expense',
      title: 'Primer Paso',
      description: 'Registra tu primer gasto y comienza tu viaje financiero',
      icon: 'fas fa-baby',
      unlocked: false,
      unlockedDate: null,
    },
    {
      id: 'expense_streak_7',
      title: 'Constancia',
      description: 'Registra gastos durante 7 días consecutivos',
      icon: 'fas fa-fire',
      unlocked: false,
      unlockedDate: null,
    },
    {
      id: 'first_goal',
      title: 'Visionario',
      description: 'Crea tu primera meta financiera',
      icon: 'fas fa-bullseye',
      unlocked: false,
      unlockedDate: null,
    },
    {
      id: 'budget_master',
      title: 'Maestro del Presupuesto',
      description: 'Mantente dentro del presupuesto por un mes completo',
      icon: 'fas fa-crown',
      unlocked: false,
      unlockedDate: null,
    },
    {
      id: 'savings_hero',
      title: 'Héroe del Ahorro',
      description: 'Ahorra más del 20% de tus ingresos mensuales',
      icon: 'fas fa-piggy-bank',
      unlocked: false,
      unlockedDate: null,
    },
    {
      id: 'expense_categorizer',
      title: 'Organizador Pro',
      description: 'Registra gastos en todas las categorías disponibles',
      icon: 'fas fa-tags',
      unlocked: false,
      unlockedDate: null,
    },
  ];

  // Cargar logros desde localStorage
  const savedAchievements = localStorage.getItem('achievements');
  if (savedAchievements) {
    this.achievements = JSON.parse(savedAchievements);
  }
};

FinanceApp.prototype.checkAchievements = function () {
  let newUnlocks = [];

  // Logro: Primer gasto
  if (
    !this.achievements.find((a) => a.id === 'first_expense').unlocked &&
    this.expenses.length > 0
  ) {
    this.unlockAchievement('first_expense');
    newUnlocks.push('Primer Paso');
  }

  // Logro: Primera meta
  if (
    !this.achievements.find((a) => a.id === 'first_goal').unlocked &&
    this.goals.length > 0
  ) {
    this.unlockAchievement('first_goal');
    newUnlocks.push('Visionario');
  }

  // Logro: Organizador Pro (gastos en todas las categorías)
  const expenseCategories = [...new Set(this.expenses.map((e) => e.category))];
  const allCategories = [
    'Alimentación',
    'Transporte',
    'Entretenimiento',
    'Salud',
    'Servicios',
    'Compras',
    'Otros',
  ];
  if (
    !this.achievements.find((a) => a.id === 'expense_categorizer').unlocked &&
    expenseCategories.length >= allCategories.length
  ) {
    this.unlockAchievement('expense_categorizer');
    newUnlocks.push('Organizador Pro');
  }

  // Logro: Héroe del Ahorro
  const totalExpenses = this.expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  );
  const savingsRate =
    this.monthlyIncome > 0
      ? ((this.monthlyIncome - totalExpenses) / this.monthlyIncome) * 100
      : 0;
  if (
    !this.achievements.find((a) => a.id === 'savings_hero').unlocked &&
    savingsRate >= 20
  ) {
    this.unlockAchievement('savings_hero');
    newUnlocks.push('Héroe del Ahorro');
  }

  // Mostrar notificaciones para nuevos logros
  newUnlocks.forEach((title) => {
    setTimeout(() => {
      this.showToast(`🏆 ¡Logro desbloqueado: ${title}!`, 'success');
    }, 500);
  });

  // Actualizar vista si estamos en la sección de logros
  if (document.querySelector('#achievements.active')) {
    this.renderAchievements();
  }
};

FinanceApp.prototype.unlockAchievement = function (achievementId) {
  const achievement = this.achievements.find((a) => a.id === achievementId);
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true;
    achievement.unlockedDate = new Date().toLocaleDateString();

    // Guardar en localStorage
    localStorage.setItem('achievements', JSON.stringify(this.achievements));
  }
};

FinanceApp.prototype.renderAchievements = function () {
  const grid = document.getElementById('achievementsGrid');
  const unlockedCountEl = document.getElementById('unlockedCount');
  const progressPercentageEl = document.getElementById('progressPercentage');

  if (!grid) return;

  // Calcular estadísticas
  const unlockedCount = this.achievements.filter((a) => a.unlocked).length;
  const totalCount = this.achievements.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Actualizar estadísticas
  if (unlockedCountEl)
    unlockedCountEl.textContent = `${unlockedCount}/${totalCount}`;
  if (progressPercentageEl)
    progressPercentageEl.textContent = `${progressPercentage}%`;

  // Renderizar tarjetas de logros
  grid.innerHTML = this.achievements
    .map(
      (achievement) => `
    <div class="achievement-card ${
      achievement.unlocked ? 'unlocked' : 'locked'
    }">
      <div class="achievement-icon">
        <i class="${achievement.icon}"></i>
      </div>
      <h3 class="achievement-title">${achievement.title}</h3>
      <p class="achievement-description">${achievement.description}</p>
      <div class="achievement-date">
        ${achievement.unlocked ? achievement.unlockedDate : 'Sin desbloquear'}
      </div>
    </div>
  `
    )
    .join('');
};

FinanceApp.prototype.renderRadarChart = function () {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Destruir gráfico existente si existe
  if (this.radarChart) {
    this.radarChart.destroy();
  }

  // Procesar datos de gastos
  const categories = {
    necesarios: 0,
    ocio: 0,
    ahorro: 0,
    metas: 0,
    impulso: 0,
    servicios: 0,
  };

  const totalIncome = this.monthlyIncome || 0;

  this.expenses.forEach((expense) => {
    const amount = parseFloat(expense.amount) || 0;

    // Categorizar por necesidad
    switch (expense.necessity) {
      case 'Muy Necesario':
      case 'Necesario':
        categories.necesarios += amount;
        break;
      case 'Poco Necesario':
        categories.ocio += amount;
        break;
      case 'No Necesario':
        categories.ocio += amount;
        break;
      case 'Compra por Impulso':
        categories.impulso += amount;
        break;
      case 'Malgasto':
        categories.impulso += amount;
        break;
    }

    // Categorizar por tipo
    if (expense.category === 'Servicios') {
      categories.servicios += amount;
    }
  });

  // Calcular ahorro (ingresos - gastos totales)
  const totalExpenses = Object.values(categories).reduce(
    (sum, val) => sum + val,
    0
  );
  categories.ahorro = Math.max(0, totalIncome - totalExpenses);

  // Simular progreso de metas (basado en ahorro)
  categories.metas = categories.ahorro * 0.7; // 70% del ahorro hacia metas

  // Normalizar datos (convertir a porcentajes del ingreso)
  const normalizedData = Object.values(categories).map((value) =>
    totalIncome > 0 ? (value / totalIncome) * 100 : 0
  );

  // Guardar referencia a this para callbacks
  const self = this;

  // Configuración del gráfico
  const config = {
    type: 'radar',
    data: {
      labels: [
        'Gastos Necesarios',
        'Ocio & Entretenimiento',
        'Ahorro Disponible',
        'Progreso de Metas',
        'Compras Impulsivas',
        'Servicios Básicos',
      ],
      datasets: [
        {
          label: 'Tu Perfil Financiero (%)',
          data: normalizedData,
          borderColor: 'rgba(45, 166, 178, 1)',
          backgroundColor: 'rgba(45, 166, 178, 0.2)',
          borderWidth: 3,
          pointBackgroundColor: 'rgba(45, 166, 178, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgba(45, 166, 178, 1)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--color-text')
              .trim(),
            font: {
              size: 12,
              weight: 'bold',
            },
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(45, 166, 178, 1)',
          borderWidth: 1,
          callbacks: {
            label: function (context) {
              const value = context.parsed.r.toFixed(1);
              const amount = Object.values(categories)[context.dataIndex];
              return `${context.label}: ${value}% ($${self.formatNumber(
                amount
              )})`;
            },
          },
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          angleLines: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--color-border')
              .trim(),
          },
          grid: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--color-border')
              .trim(),
          },
          pointLabels: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--color-text')
              .trim(),
            font: {
              size: 11,
              weight: 'bold',
            },
          },
          ticks: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--color-text-secondary')
              .trim(),
            backdropColor: 'transparent',
            stepSize: 20,
            callback: function (value) {
              return value + '%';
            },
          },
        },
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutCubic',
      },
      interaction: {
        intersect: false,
        mode: 'point',
      },
    },
  };

  this.radarChart = new Chart(ctx, config);
};

// Update dashboard welcome message based on user authentication
FinanceApp.prototype.updateDashboardWelcome = function () {
  const titleElement = document.querySelector('#dashboard .section-header h1');
  const subtitleElement = document.querySelector(
    '#dashboard .section-header p'
  );

  if (!titleElement || !subtitleElement) return;

  if (this.currentUser && this.currentUser !== 'anonymous') {
    const userName = this.userProfile.name || 'Usuario';

    // Mensajes personalizados y amigables
    const welcomeMessages = [
      `¡Échale un vistazo a tus finanzas, ${userName}!`,
      `Aquí está tu resumen financiero, ${userName}`,
      `¿Cómo van tus finanzas hoy, ${userName}?`,
      `Tu control financiero te espera, ${userName}`,
    ];

    const friendlySubtitles = [
      'Revisa tus gastos, metas y progreso en un solo lugar',
      'Mantén el control de tu dinero de forma simple',
      'Todo tu panorama financiero al alcance de tu mano',
      'Visualiza cómo avanzas hacia tus objetivos',
      'Tu centro personal de finanzas',
    ];

    // Select random messages to keep it fresh
    const randomWelcome =
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const randomSubtitle =
      friendlySubtitles[Math.floor(Math.random() * friendlySubtitles.length)];

    titleElement.textContent = randomWelcome;
    subtitleElement.textContent = randomSubtitle;
  } else {
    // Default message for anonymous users
    titleElement.textContent = '¡Bienvenido a tu asistente financiero!';
    subtitleElement.textContent =
      'Gestiona tus finanzas de manera inteligente y alcanza tus metas';
  }
};

// === SIDEBAR SCROLL BEHAVIOR ===

FinanceApp.prototype.initSidebarScrollBehavior = function () {
  const body = document.body;

  // Only execute on desktop screens (> 768px)
  if (window.innerWidth <= 768) {
    if (body) {
      body.classList.add('sidebar-collapsed');
    }
    return;
  }

  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) {
    return;
  }

  // Keep sidebar always visible for better dashboard UX
  sidebar.classList.add('sidebar-visible');
  sidebar.classList.remove('sidebar-hidden');

  if (body) {
    body.classList.remove('sidebar-collapsed');
  }
};

// === LAZY LOADING FUNCTIONALITY ===

FinanceApp.prototype.initLazyLoading = function () {
  // Lazy loading para imágenes
  this.initImageLazyLoading();

  // Lazy loading para secciones y componentes pesados
  this.initComponentLazyLoading();

  // Lazy loading para gráficos
  this.initChartLazyLoading();
};

FinanceApp.prototype.initImageLazyLoading = function () {
  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');

          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy-load');
            img.classList.add('lazy-loaded');
          }

          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.1,
    }
  );

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
};

FinanceApp.prototype.initComponentLazyLoading = function () {
  const componentObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const component = entry.target;

          // Carousel lazy loading
          if (component.classList.contains('onboarding-carousel')) {
            this.lazyLoadCarousel(component);
          }

          // Footer lazy loading
          if (component.classList.contains('footer')) {
            this.lazyLoadFooter(component);
          }

          componentObserver.unobserve(component);
        }
      });
    },
    {
      rootMargin: '100px 0px',
      threshold: 0.1,
    }
  );

  // Observar componentes pesados
  document
    .querySelectorAll('.onboarding-carousel, .footer')
    .forEach((component) => {
      componentObserver.observe(component);
    });
};

FinanceApp.prototype.initChartLazyLoading = function () {
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const chartContainer = entry.target;
          const chartId = chartContainer.querySelector('canvas')?.id;

          if (chartId && !this.charts[chartId]) {
            this.lazyLoadChart(chartId);
          }

          chartObserver.unobserve(chartContainer);
        }
      });
    },
    {
      rootMargin: '200px 0px',
      threshold: 0.1,
    }
  );

  // Observar contenedores de gráficos
  document
    .querySelectorAll('.chart-container-premium, .burger-chart-wrapper')
    .forEach((container) => {
      chartObserver.observe(container);
    });
};

FinanceApp.prototype.lazyLoadCarousel = function (carousel) {
  // Activar animaciones del carousel solo cuando es visible
  const track = carousel.querySelector('.carousel-track');
  if (track) {
    track.style.animationPlayState = 'running';
  }
};

FinanceApp.prototype.lazyLoadFooter = function (footer) {
  // Activar formulario de newsletter solo cuando el footer es visible
  const newsletterForm = footer.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener(
      'submit',
      this.handleNewsletterSubmit.bind(this)
    );
  }
};

FinanceApp.prototype.lazyLoadChart = function (chartId) {
  // Cargar gráficos bajo demanda
  switch (chartId) {
    case 'premiumChart':
      if (!this.charts.premiumChart) {
        this.renderPremiumChart();
      }
      break;
    case 'trendChart':
      if (!this.charts.trendChart) {
        this.initTrendChart();
      }
      break;
    default:
      break;
  }
};

FinanceApp.prototype.handleNewsletterSubmit = function (e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;

  if (email) {
    this.showToast(
      '¡Gracias por suscribirte! Te mantendremos informado.',
      'success'
    );
    e.target.reset();
  }
};

// Optimización de performance para scroll
FinanceApp.prototype.debounce = function (func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// === SCROLL ANIMATIONS FUNCTIONALITY ===

FinanceApp.prototype.initScrollAnimations = function () {
  // Configuración del Intersection Observer para animaciones
  const animationObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animation =
            element.getAttribute('data-animation') || 'fadeInUp';
          const delay = parseInt(element.getAttribute('data-delay')) || 0;

          // Aplicar delay
          setTimeout(() => {
            this.triggerAnimation(element, animation);
          }, delay);

          // Una vez animado, no observar más
          animationObserver.unobserve(element);
        }
      });
    },
    {
      rootMargin: '0px 0px -100px 0px', // Triggear antes de que sea completamente visible
      threshold: 0.1,
    }
  );

  // Observar todos los elementos con animación
  document.querySelectorAll('.animate-on-scroll').forEach((element) => {
    animationObserver.observe(element);
  });

  // Animaciones especiales para números/contadores
  this.initCounterAnimations();
};

FinanceApp.prototype.triggerAnimation = function (element, animation) {
  // Agregar clase de animación
  element.classList.add('animated');
  element.classList.add(`animate-${animation}`);

  // Efectos especiales para diferentes tipos de elementos
  if (element.classList.contains('stat-card')) {
    this.animateStatCard(element);
  }

  if (element.classList.contains('chart-container-premium')) {
    this.animateChart(element);
  }

  if (element.classList.contains('onboarding-carousel')) {
    this.animateCarousel(element);
  }

  // Trigger custom event para otros listeners
  element.dispatchEvent(
    new CustomEvent('animated', {
      detail: { animation: animation },
    })
  );
};

FinanceApp.prototype.animateStatCard = function (card) {
  // Animar el valor numérico
  const valueElement = card.querySelector('.stat-value');
  if (valueElement) {
    const finalValue = valueElement.textContent;
    const numericValue = parseFloat(finalValue.replace(/[^0-9.-]/g, '')) || 0;

    if (numericValue > 0) {
      this.animateCountUp(valueElement, 0, numericValue, finalValue);
    }
  }

  // Animar el icono
  const icon = card.querySelector('.stat-icon');
  if (icon) {
    setTimeout(() => {
      icon.style.transform = 'scale(1.1)';
      icon.style.transition = 'transform 0.3s ease';

      setTimeout(() => {
        icon.style.transform = 'scale(1)';
      }, 300);
    }, 300);
  }
};

FinanceApp.prototype.animateChart = function (chartContainer) {
  // Agregar efecto de reveal al gráfico
  const canvas = chartContainer.querySelector('canvas');
  if (canvas) {
    canvas.style.opacity = '0';
    canvas.style.transform = 'scale(0.8)';

    setTimeout(() => {
      canvas.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      canvas.style.opacity = '1';
      canvas.style.transform = 'scale(1)';
    }, 200);
  }
};

FinanceApp.prototype.animateCarousel = function (carousel) {
  // Animar cards del carousel secuencialmente
  const cards = carousel.querySelectorAll('.onboarding-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0) scale(1)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    }, index * 100);
  });
};

FinanceApp.prototype.animateCountUp = function (
  element,
  start,
  end,
  originalText
) {
  const duration = 1000; // 1 segundo
  const increment = end / (duration / 16); // 60 FPS
  let current = start;

  const isMonetary = originalText.includes('$');
  const hasComma = originalText.includes(',');

  const timer = setInterval(() => {
    current += increment;

    if (current >= end) {
      current = end;
      clearInterval(timer);
    }

    // Formatear número
    let displayValue = Math.round(current);

    if (isMonetary) {
      displayValue = `$${displayValue.toLocaleString()}`;
    } else if (hasComma) {
      displayValue = displayValue.toLocaleString();
    }

    element.textContent = displayValue;
  }, 16);
};

FinanceApp.prototype.initCounterAnimations = function () {
  // Configurar observer para contadores especiales
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;

          if (counter.classList.contains('stat-value')) {
            // Ya se maneja en animateStatCard
            return;
          }

          // Para otros contadores personalizados
          const finalValue = counter.getAttribute('data-count');
          if (finalValue) {
            this.animateCountUp(counter, 0, parseInt(finalValue), finalValue);
            counterObserver.unobserve(counter);
          }
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  // Observar elementos con data-count
  document.querySelectorAll('[data-count]').forEach((counter) => {
    counterObserver.observe(counter);
  });
};

// Utilidad para crear animaciones personalizadas
FinanceApp.prototype.createCustomAnimation = function (
  element,
  keyframes,
  options = {}
) {
  const defaultOptions = {
    duration: 800,
    easing: 'ease-out',
    fill: 'forwards',
  };

  const animationOptions = { ...defaultOptions, ...options };

  return element.animate(keyframes, animationOptions);
};

// Función para revelar elementos secuencialmente
FinanceApp.prototype.revealSequentially = function (elements, delay = 100) {
  elements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add('animated', 'animate-fadeInUp');
    }, index * delay);
  });
};

// === FIN DE SECCIÃƒâ€œN: HELPERS GLOBALES (EVENTOS Y CONSOLA) ===

// === NEW USER SYSTEM METHODS ===

// DESHABILITADO - Solo usuarios individuales
// function selectAccountType(type) {
//   console.log('DEBUG: selectAccountType llamado con:', type);
//   window.selectedAccountType = type;
//   console.log('DEBUG: window.selectedAccountType establecido a:', window.selectedAccountType);
//
//   document.getElementById('accountTypeModal').classList.remove('show');
//   document.body.style.overflow = '';
//
//   // Show registration form with account type pre-selected
//   document.getElementById('authModal').classList.add('show');
//   document.getElementById('authModalTitle').textContent =
//     type === 'personal' ? 'Crear Cuenta Personal' : 'Crear Cuenta Compartida';
//
//   // Show register form
//   document.getElementById('loginForm').classList.add('hidden');
//   document.getElementById('registerForm').classList.remove('hidden');
//   document.getElementById('authSwitchLink').innerHTML =
//     '¿Ya tienes una cuenta? <a href="#" onclick="switchToLogin()">Inicia sesión aquí</a>';
//
//   // Nota: Ya no hay campo inviteCode, se eliminó según requisitos
//   console.log('DEBUG: Formulario de registro mostrado para tipo:', type);
// }

function switchToLogin() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('authModalTitle').textContent =
    '¡Bienvenido de vuelta!';
  document.getElementById('authSwitchLink').innerHTML =
    '¿No tienes una cuenta? <a href="#">Regístrate aquí</a>';
}

function switchToRegister() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('authModalTitle').textContent = 'Crear nueva cuenta';
  document.getElementById('authSwitchLink').innerHTML =
    '¿Ya tienes una cuenta? <a href="#">Inicia sesión aquí</a>';
}

// Exportar funciones inmediatamente para que estén disponibles
if (typeof window !== 'undefined') {
  window.switchToLogin = switchToLogin;
  window.switchToRegister = switchToRegister;
}

function showAccountTypeSelection() {
  document.getElementById('authModal').classList.remove('show');
  document.getElementById('accountTypeModal').classList.add('show');
}

// Funciones para el modal "Coming Soon"
function openComingSoonModal() {
  const modal = document.getElementById('comingSoonModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeComingSoonModal() {
  const modal = document.getElementById('comingSoonModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function closePremiumComingSoonModal() {
  const modal = document.getElementById('premiumComingSoonModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Exportar funciones globalmente
if (typeof window !== 'undefined') {
  window.openComingSoonModal = openComingSoonModal;
  window.closeComingSoonModal = closeComingSoonModal;
  window.closePremiumComingSoonModal = closePremiumComingSoonModal;
}

FinanceApp.prototype.setupUserSystemListeners = function () {
  // Auth form switch - Manejar cambio entre login y registro
  const authSwitchLink = document.getElementById('authSwitchLink');
  if (authSwitchLink) {
    authSwitchLink.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();

        const loginForm = document.getElementById('loginForm');

        // Si está en login, cambiar a registro
        if (!loginForm.classList.contains('hidden')) {
          switchToRegister();
        }
        // Si está en registro, cambiar a login
        else {
          switchToLogin();
        }
      }
    });
  }

  // Registration form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegistration();
    });
  }

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
  }

  // Account management buttons
  const inviteUserBtn = document.getElementById('inviteUserBtn');
  if (inviteUserBtn) {
    inviteUserBtn.addEventListener('click', () => {
      this.showInvitationModal();
    });
  }

  const changePasswordBtn = document.getElementById('changePasswordBtn');
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      this.showChangePasswordModal();
    });
  }

  const switchAccountTypeBtn = document.getElementById('switchAccountTypeBtn');
  if (switchAccountTypeBtn) {
    switchAccountTypeBtn.addEventListener('click', () => {
      this.showAccountTypeSwitch();
    });
  }

  // Invitation form
  const generateInviteForm = document.getElementById('generateInviteForm');
  if (generateInviteForm) {
    generateInviteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateInviteCode();
    });
  }

  // Copy invite code
  const copyInviteCode = document.getElementById('copyInviteCode');
  if (copyInviteCode) {
    copyInviteCode.addEventListener('click', () => {
      this.copyInviteCodeToClipboard();
    });
  }

  // Botón de login usando delegación de eventos
  if (this._documentClickHandler) {
    document.removeEventListener('click', this._documentClickHandler);
  }

  this._documentClickHandler = (e) => {
    if (e.target.closest('#navbarLoginBtn')) {
      e.preventDefault();
      e.stopPropagation();
      this.openAuthModal();
    }
  };

  document.addEventListener('click', this._documentClickHandler);

  // Footer login link
  const footerLoginLink = document.getElementById('footerLoginLink');
  if (footerLoginLink) {
    footerLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openAuthModal();
    });
  }

  // Update user selection dropdown
  this.updateUserSelectionDropdown();
};

FinanceApp.prototype.handleRegistration = async function () {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!name || !email || !password) {
    this.showToast('Todos los campos son obligatorios', 'error');
    return;
  }

  // DESHABILITADO - Modo invitación
  // if (window.isJoiningSharedAccount && window.invitationData) {
  //   console.log('DEBUG: Modo invitación detectado, uniendo a cuenta existente...');
  //   const { code, accountId } = window.invitationData;
  //   await this.joinSharedAccountWithInvite(name, email, password, code, accountId);
  //   return;
  // }

  // Flujo normal de registro - siempre personal
  const accountType = 'personal';
  console.log('DEBUG: Iniciando registro normal con Firebase Auth...');

  try {
    // Activar bandera para prevenir race condition con syncFromFirebase
    this.isRegistering = true;
    console.log('DEBUG: Bandera isRegistering activada');

    // Primero registrar en Firebase Auth
    const userCredential = await FB.createUserWithEmailAndPassword(
      FB.auth,
      email,
      password
    );

    console.log(
      'DEBUG: Usuario creado en Firebase Auth:',
      userCredential.user.uid
    );

    // Ahora crear la cuenta con el UID de Firebase
    await this.createNewAccount(
      name,
      email,
      password,
      accountType,
      userCredential.user.uid
    );

    // Desactivar bandera después de completar el registro
    this.isRegistering = false;
    console.log('DEBUG: Bandera isRegistering desactivada');
  } catch (error) {
    // Desactivar bandera en caso de error
    this.isRegistering = false;
    console.log('DEBUG: Bandera isRegistering desactivada (error)');

    console.error('Error en registro:', error);

    if (error.code === 'auth/email-already-in-use') {
      this.showToast('Este email ya está registrado', 'error');
    } else if (error.code === 'auth/weak-password') {
      this.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
    } else if (error.code === 'auth/invalid-email') {
      this.showToast('Email inválido', 'error');
    } else {
      this.showToast('Error al registrar: ' + error.message, 'error');
    }
  }
};

FinanceApp.prototype.createNewAccount = async function (
  name,
  email,
  password,
  accountType,
  firebaseUid
) {
  // Usar el UID de Firebase si se proporciona, sino generar uno local
  const userId = firebaseUid || this.generateUserId();
  console.log('DEBUG: Creando cuenta con userId:', userId);

  this.accountType = accountType;
  this.currentUser = userId;
  this.accountOwner = userId;

  // For shared accounts, use the owner's ID as the shared document ID
  if (accountType === 'shared') {
    this.sharedAccountId = userId;
    console.log(
      'DEBUG: Cuenta compartida - sharedAccountId establecido a:',
      userId
    );
  } else {
    this.sharedAccountId = null;
  }

  this.accountUsers = [
    {
      id: userId,
      name: name,
      email: email,
      role: 'owner',
      joinedAt: Date.now(),
    },
  ];

  this.logActivity('account_created', `Cuenta ${accountType} creada`, userId);

  // Guardar datos (ahora con autenticación correcta)
  await this.saveData();

  this.updateAccountDisplay();
  this.updateUserSelectionDropdown();

  this.closeAuthModal();
  this.showToast(`Cuenta ${accountType} creada exitosamente`, 'success');

  console.log('DEBUG: Cuenta creada con tipo:', accountType);

  // Si es cuenta mancomunada, generar enlace de invitación automáticamente
  if (accountType === 'shared') {
    console.log('DEBUG: ✅ Es cuenta mancomunada! Preparando modal...');
    console.log('DEBUG: Esperando 300ms para cerrar modal de auth...');

    // Pequeño delay para asegurar que el modal de auth se cierre primero
    setTimeout(() => {
      console.log(
        'DEBUG: 300ms transcurridos. Llamando a showSharedAccountInviteModal...'
      );
      this.showSharedAccountInviteModal();
    }, 300);
  } else {
    console.log('DEBUG: ❌ NO es cuenta mancomunada (es:', accountType, ')');
  }
};

FinanceApp.prototype.joinSharedAccount = function (
  name,
  email,
  password,
  inviteCode
) {
  const inviteData = this.inviteCodes[inviteCode];
  const userId = this.generateUserId();

  this.currentUser = userId;
  this.accountUsers.push({
    id: userId,
    name: name,
    email: email,
    role: 'member',
    joinedAt: Date.now(),
  });

  // Remove used invite code
  delete this.inviteCodes[inviteCode];

  this.logActivity('user_joined', `${name} se unió a la cuenta`, userId);

  this.saveData();
  this.updateAccountDisplay();
  this.updateUserSelectionDropdown();

  this.closeAuthModal();
  this.showToast('Te has unido a la cuenta compartida exitosamente', 'success');
};

FinanceApp.prototype.handleLogin = async function () {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    this.showToast('Email y contraseña son obligatorios', 'error');
    return;
  }

  // Usar Firebase Auth para login
  await this.loginWithEmail(email, password);
};

// DESHABILITADO - Ya no se usa showInvitationModal
FinanceApp.prototype.showInvitationModal = function () {
  return; // Deshabilitado
  if (
    this.accountType !== 'shared' ||
    Object.keys(this.accountUsers).length >= 2
  ) {
    this.showToast(
      'Solo las cuentas compartidas pueden tener invitaciones',
      'info'
    );
    return;
  }

  document.getElementById('invitationModal').classList.add('show');
  document.body.style.overflow = 'hidden';

  // Reset modal to step 1
  document.querySelectorAll('.step-item').forEach((step) => {
    step.classList.remove('active');
  });
  document.querySelector('.step-item[data-step="1"]').classList.add('active');
};

FinanceApp.prototype.generateInviteCode = function () {
  const inviteeName = document.getElementById('inviteeName').value.trim();

  if (!inviteeName) {
    this.showToast('Ingresa el nombre de la persona a invitar', 'error');
    return;
  }

  const code = this.generateRandomCode();
  this.inviteCodes[code] = {
    inviteeName: inviteeName,
    createdBy: this.currentUser,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  this.saveData();
  this.logActivity(
    'invite_created',
    `Invitación creada para ${inviteeName}`,
    this.currentUser
  );

  // Show step 2
  document.querySelectorAll('.step-item').forEach((step) => {
    step.classList.remove('active');
  });
  document.querySelector('.step-item[data-step="2"]').classList.add('active');

  // Display code
  document.getElementById('generatedInviteCode').textContent = code;
  document
    .getElementById('generatedInviteCode')
    .classList.add('invite-code-generated');

  this.showToast('Código de invitación generado', 'success');
};

FinanceApp.prototype.copyInviteCodeToClipboard = function () {
  const code = document.getElementById('generatedInviteCode').textContent;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => {
      this.showToast('Código copiado al portapapeles', 'success');
      const copyBtn = document.getElementById('copyInviteCode');
      copyBtn.classList.add('copied');
      setTimeout(() => copyBtn.classList.remove('copied'), 1000);
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    this.showToast('Código copiado al portapapeles', 'success');
  }
};

FinanceApp.prototype.updateAccountDisplay = function () {
  const accountTypeBadge = document.getElementById('accountTypeBadge');
  const accountTypeText = document.getElementById('accountTypeText');
  const currentUserName = document.getElementById('currentUserName');
  const invitedUserInfo = document.getElementById('invitedUserInfo');
  const invitedUserName = document.getElementById('invitedUserName');
  const inviteUserBtn = document.getElementById('inviteUserBtn');
  const activityLogSection = document.getElementById('activityLogSection');

  // Validar que los elementos existen antes de manipularlos
  if (!accountTypeBadge || !accountTypeText) {
    console.log(
      'DEBUG: Elementos de account display no encontrados en DOM, saltando actualización'
    );
    return;
  }

  if (this.accountType === 'shared') {
    accountTypeBadge.classList.add('shared');
    accountTypeText.innerHTML =
      '<i class="fas fa-users"></i> Cuenta Mancomunada';

    if (this.accountUsers.length === 1) {
      if (inviteUserBtn) inviteUserBtn.classList.remove('hidden');
    } else {
      if (inviteUserBtn) inviteUserBtn.classList.add('hidden');
      if (invitedUserInfo) invitedUserInfo.classList.remove('hidden');
      const otherUser = this.accountUsers.find(
        (u) => u.id !== this.currentUser
      );
      if (otherUser && invitedUserName) {
        invitedUserName.textContent = otherUser.name;
      }
    }

    if (activityLogSection) {
      activityLogSection.classList.remove('hidden');
      this.updateActivityLog();
    }
  } else {
    accountTypeBadge.classList.remove('shared');
    accountTypeText.innerHTML = '<i class="fas fa-user"></i> Cuenta Personal';
    if (inviteUserBtn) inviteUserBtn.classList.add('hidden');
    if (invitedUserInfo) invitedUserInfo.classList.add('hidden');
    if (activityLogSection) activityLogSection.classList.add('hidden');
  }

  const currentUser = this.accountUsers.find((u) => u.id === this.currentUser);
  if (currentUser && currentUserName) {
    currentUserName.textContent = currentUser.name;
  }
};

FinanceApp.prototype.updateUserSelectionDropdown = function () {
  const userSelect = document.getElementById('user');
  if (!userSelect) return;

  // Limpiar y agregar opciones base
  userSelect.innerHTML = '<option value="">Sin usuario asignado</option>';

  // Agregar usuario del perfil si existe
  if (this.userProfile.name && this.userProfile.name !== 'Usuario') {
    const option = document.createElement('option');
    option.value = this.userProfile.name;
    option.textContent = this.userProfile.name;
    userSelect.appendChild(option);
  }

  // Agregar usuarios personalizados
  this.customUsers.forEach((userName) => {
    const option = document.createElement('option');
    option.value = userName;
    option.textContent = userName;
    userSelect.appendChild(option);
  });

  // Opción para añadir nuevo usuario
  const addNewOption = document.createElement('option');
  addNewOption.value = '__add_new__';
  addNewOption.textContent = '+ Añadir nuevo usuario';
  userSelect.appendChild(addNewOption);
};

FinanceApp.prototype.updateActivityLog = function () {
  const activityList = document.getElementById('activityList');
  const activityCount = document.getElementById('activityCount');

  if (!activityList) return;

  const recentActivities = this.activityLog.slice(-20).reverse();
  activityCount.textContent = `${recentActivities.length} actividades`;

  activityList.innerHTML = '';

  recentActivities.forEach((activity) => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';

    const user = this.accountUsers.find((u) => u.id === activity.userId);
    const userName = user ? user.name : 'Usuario desconocido';

    activityItem.innerHTML = `
      <div class="activity-icon ${activity.type}">
        <i class="fas ${this.getActivityIcon(activity.type)}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${activity.description}</div>
        <div class="activity-description">${this.formatActivityTime(
          activity.timestamp
        )}</div>
      </div>
      <div class="activity-meta">
        <span class="activity-user">${userName}</span>
        <span class="activity-time">${this.formatRelativeTime(
          activity.timestamp
        )}</span>
      </div>
    `;

    activityList.appendChild(activityItem);
  });
};

FinanceApp.prototype.logActivity = function (type, description, userId = null) {
  this.activityLog.push({
    id: Date.now(),
    type: type,
    description: description,
    userId: userId || this.currentUser,
    timestamp: Date.now(),
  });

  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
};

FinanceApp.prototype.getActivityIcon = function (type) {
  const icons = {
    expense: 'fa-minus-circle',
    goal: 'fa-bullseye',
    edit: 'fa-edit',
    delete: 'fa-trash',
    account_created: 'fa-user-plus',
    user_joined: 'fa-user-friends',
    user_login: 'fa-sign-in-alt',
    invite_created: 'fa-envelope',
  };
  return icons[type] || 'fa-info-circle';
};

FinanceApp.prototype.formatActivityTime = function (timestamp) {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

FinanceApp.prototype.formatRelativeTime = function (timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'Hace un momento';
};

FinanceApp.prototype.generateUserId = function () {
  return (
    'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
  );
};

FinanceApp.prototype.generateRandomCode = function (length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const codeLength = length || 8; // Default 8 si no se especifica
  for (let i = 0; i < codeLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

FinanceApp.prototype.validateInviteCode = function (code) {
  const invite = this.inviteCodes[code];
  return invite && invite.expiresAt > Date.now();
};

FinanceApp.prototype.closeAuthModal = function () {
  document.getElementById('authModal').classList.remove('show');
  document.getElementById('accountTypeModal').classList.remove('show');
  document.body.style.overflow = '';
};

FinanceApp.prototype.showChangePasswordModal = function () {
  const modal = document.getElementById('securityModal');
  if (!modal) return;

  // Limpiar campos
  const currentPassword = document.getElementById('currentPassword');
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');

  if (currentPassword) currentPassword.value = '';
  if (newPassword) newPassword.value = '';
  if (confirmPassword) confirmPassword.value = '';

  // Configurar modal para cambio de contraseña
  const titleEl = document.getElementById('securityModalTitle');
  const saveBtn = document.getElementById('modalSavePasswordsBtn');
  const newPasswordSection = document.getElementById('newPasswordSection');

  if (titleEl) titleEl.textContent = 'Cambiar Contraseña';
  if (saveBtn) saveBtn.textContent = 'Guardar';
  if (newPasswordSection) newPasswordSection.style.display = 'block';

  // Abrir modal
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

FinanceApp.prototype.showAccountTypeSwitch = function () {
  const modal = document.getElementById('accountTypeModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
};

FinanceApp.prototype.changeAccountType = function (type) {
  this.accountType = type;
  localStorage.setItem('financia_account_type', type);
  this.saveData();

  this.updateConfigurationDisplay();

  const modal = document.getElementById('accountTypeModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  const message =
    type === 'shared'
      ? 'Cuenta cambiada a Mancomunada. Ahora puedes invitar a tu socio.'
      : 'Cuenta cambiada a Personal.';

  this.showToast(message, 'success');
};

// Override expense addition to include activity logging
FinanceApp.prototype.addExpenseOriginal = FinanceApp.prototype.addExpense;
FinanceApp.prototype.addExpense = function (e) {
  // Call original method with event parameter
  this.addExpenseOriginal(e);

  // Get values after successful registration
  const description = document.getElementById('description').value;
  const amountInput = document.getElementById('amount');
  const amount = this.unformatNumber(amountInput.value);
  const user = document.getElementById('user').value;

  // Add activity logging
  if (description && amount && user) {
    this.logActivity(
      'expense',
      `Gasto agregado: ${description} - $${amount}`,
      this.currentUser
    );

    if (this.accountType === 'shared' && this.accountUsers.length > 1) {
      // Notify other user
      const otherUser = this.accountUsers.find(
        (u) => u.id !== this.currentUser
      );
      if (otherUser) {
        this.addNotification({
          id: Date.now(),
          type: 'expense_added',
          title: 'Nuevo Gasto Registrado',
          message: `${user} registró un gasto: ${description} - $${amount}`,
          timestamp: Date.now(),
          read: false,
          priority: 'normal',
        });
      }
    }
  }

  // Mostrar modal de registro para usuarios anónimos después del primer gasto
  if (this.currentUser === 'anonymous' && this.expenses.length === 1) {
    setTimeout(() => {
      this.showRegisterPrompt();
    }, 2000);
  }
};

// Setup onboarding tour system
FinanceApp.prototype.setupOnboardingTour = function () {
  this.tourSteps = [
    {
      element: '.navbar__logo',
      title: '¡Bienvenido a Dan&Giv Control!',
      description:
        'Esta es tu nueva herramienta para el control financiero personal. Te guiaremos paso a paso por todas las funciones.',
      position: 'bottom',
    },
    {
      element: '[data-section="dashboard"]',
      title: '📊 Panel Principal',
      description:
        'Tu centro de control financiero. Aquí verás resúmenes, gráficos de gastos, metas activas y recomendaciones de IA.',
      position: 'bottom',
    },
    {
      element: '[data-section="expenses"]',
      title: '💰 Registro de Gastos',
      description:
        'Registra todos tus gastos de forma rápida. Categoriza por tipo (Alimentación, Transporte, etc.) y nivel de necesidad.',
      position: 'bottom',
    },
    {
      element: '[data-section="goals"]',
      title: '🎯 Metas Financieras',
      description:
        'Define objetivos de ahorro con fechas límite. Visualiza tu progreso y recibe notificaciones cuando estés cerca de cumplirlas.',
      position: 'bottom',
    },
    {
      element: '[data-section="analysis"]',
      title: '📈 Análisis Detallado',
      description:
        'Explora gráficos interactivos que muestran tus patrones de gasto por categoría, usuario y nivel de necesidad.',
      position: 'bottom',
    },
    {
      element: '[data-section="shopping"]',
      title: '🛒 Lista de Compras',
      description:
        'Crea listas de compras inteligentes. Marca productos como necesarios o por impulso para tomar mejores decisiones.',
      position: 'bottom',
    },
    {
      element: '[data-section="audit"]',
      title: '📋 Historial de Cambios',
      description:
        'Revisa todos los cambios realizados en tus finanzas: gastos añadidos, editados o eliminados con filtros por fecha y tipo.',
      position: 'bottom',
    },
    {
      element: '[data-section="savings"]',
      title: '🏦 Cuentas de Ahorro',
      description:
        'Gestiona múltiples cuentas de ahorro. Registra depósitos, retiros y visualiza el historial de cada cuenta.',
      position: 'bottom',
    },
    {
      element: '[data-section="payments"]',
      title: '🔄 Pagos Recurrentes',
      description:
        'Administra suscripciones y pagos mensuales. No olvides ningún pago importante con recordatorios automáticos.',
      position: 'bottom',
    },
    {
      element: '[data-section="store"]',
      title: '🎨 Tienda de Estilos',
      description:
        'Personaliza la apariencia de tus gráficos con temas exclusivos. Algunos estilos están disponibles para usuarios premium.',
      position: 'bottom',
    },
    {
      element: '[data-section="config"]',
      title: '⚙️ Configuración',
      description:
        'Administra tu perfil, seguridad, preferencias y configuración de cuenta. Cambia contraseñas y gestiona autenticación.',
      position: 'right',
    },
    {
      element: '.notification-bell',
      title: '🔔 Notificaciones',
      description:
        'Recibe alertas sobre metas próximas a cumplirse, gastos importantes y actualizaciones del sistema.',
      position: 'bottom',
    },
  ];

  this.currentTourStep = 0;
  this.tourActive = false;

  // Initialize tour elements
  this.tourOverlay = document.getElementById('tourOverlay');
  this.tourSpotlight = this.tourOverlay?.querySelector('.tour-spotlight');
  this.tourTooltip = this.tourOverlay?.querySelector('.tour-tooltip');
  this.tourStartBtn = document.getElementById('startTourBtn');

  // Setup event listeners
  this.setupTourEventListeners();

  // El botón del tour NO se muestra automáticamente
  // Solo se accede desde el enlace de ayuda en el footer
  this.setupHelpCenterLink();
};

FinanceApp.prototype.setupTourEventListeners = function () {
  // Tour start button
  if (this.tourStartBtn) {
    this.tourStartBtn.addEventListener('click', () => {
      this.startTour();
    });
  }

  if (!this.tourOverlay) return;

  // Tour navigation buttons
  const nextBtn = this.tourOverlay.querySelector('.tour-next');
  const prevBtn = this.tourOverlay.querySelector('.tour-prev');
  const skipBtns = this.tourOverlay.querySelectorAll(
    '.tour-skip, .tour-skip-prominent'
  );
  const finishBtn = this.tourOverlay.querySelector('.tour-finish');
  const closeBtn = this.tourOverlay.querySelector('.tour-close');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      this.nextTourStep();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      this.prevTourStep();
    });
  }

  // Vincular todos los botones de saltar
  skipBtns.forEach((skipBtn) => {
    skipBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.endTour();
    });
  });

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      this.endTour(true); // Show final options modal
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      this.endTour();
    });
  }

  // Close tour on backdrop click
  const backdrop = this.tourOverlay.querySelector('.tour-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      this.endTour();
    });
  }

  // Close tour on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && this.tourActive) {
      this.endTour();
    }
  });
};

FinanceApp.prototype.setupHelpCenterLink = function () {
  const helpLink = document.getElementById('helpCenterLink');
  if (helpLink) {
    helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Permitir repetir el tour removiendo el flag
      localStorage.removeItem('financia_tour_completed');
      this.startTour();
    });
  }
};

FinanceApp.prototype.startTour = function () {
  if (!this.tourOverlay || this.tourActive) return;

  this.tourActive = true;
  this.currentTourStep = 0;
  this.tourOverlay.classList.remove('hidden');

  // Hide tour start button
  if (this.tourStartBtn) {
    this.tourStartBtn.classList.remove('show');
  }

  // Start with first step
  this.showTourStep(0);
};

FinanceApp.prototype.showTourStep = function (stepIndex) {
  if (stepIndex < 0 || stepIndex >= this.tourSteps.length) return;

  const step = this.tourSteps[stepIndex];
  const targetElement = document.querySelector(step.element);

  if (!targetElement) {
    // Skip to next step if element not found
    if (stepIndex < this.tourSteps.length - 1) {
      this.showTourStep(stepIndex + 1);
    } else {
      this.endTour();
    }
    return;
  }

  // Update tour content
  const titleEl = this.tourOverlay.querySelector('.tour-title');
  const descEl = this.tourOverlay.querySelector('.tour-description');
  const counterEl = this.tourOverlay.querySelector('.tour-step-counter');
  const progressFill = this.tourOverlay.querySelector('.tour-progress-fill');

  if (titleEl) titleEl.textContent = step.title;
  if (descEl) descEl.textContent = step.description;
  if (counterEl)
    counterEl.textContent = `${stepIndex + 1} de ${this.tourSteps.length}`;
  if (progressFill) {
    const progress = ((stepIndex + 1) / this.tourSteps.length) * 100;
    progressFill.style.width = `${progress}%`;
  }

  // Update navigation buttons
  const prevBtn = this.tourOverlay.querySelector('.tour-prev');
  const nextBtn = this.tourOverlay.querySelector('.tour-next');
  const finishBtn = this.tourOverlay.querySelector('.tour-finish');

  if (prevBtn) {
    prevBtn.style.display = stepIndex === 0 ? 'none' : 'block';
  }

  const isLastStep = stepIndex === this.tourSteps.length - 1;
  if (nextBtn) {
    nextBtn.style.display = isLastStep ? 'none' : 'block';
  }
  if (finishBtn) {
    finishBtn.style.display = isLastStep ? 'block' : 'none';
  }

  // Position spotlight and tooltip
  this.positionTourElements(targetElement, step.position);

  // Highlight target element
  this.highlightElement(targetElement);

  // Show tooltip with animation
  setTimeout(() => {
    if (this.tourTooltip) {
      this.tourTooltip.classList.add('show');
    }
  }, 100);
};

FinanceApp.prototype.positionTourElements = function (targetElement, position) {
  if (!this.tourSpotlight || !this.tourTooltip) return;

  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    // En móvil: Tour estático centrado, sin spotlight
    this.tourSpotlight.style.display = 'none';

    // Centrar tooltip en la pantalla
    this.tourTooltip.style.position = 'fixed';
    this.tourTooltip.style.left = '50%';
    this.tourTooltip.style.top = '50%';
    this.tourTooltip.style.transform = 'translate(-50%, -50%)';
    this.tourTooltip.style.width = '90%';
    this.tourTooltip.style.maxWidth = '400px';

    return;
  }

  // En desktop: comportamiento normal con spotlight
  this.tourSpotlight.style.display = 'block';
  this.tourTooltip.style.transform = 'none';
  this.tourTooltip.style.width = 'auto';

  const rect = targetElement.getBoundingClientRect();
  const padding = 8;

  // Position spotlight
  this.tourSpotlight.style.left = `${rect.left - padding}px`;
  this.tourSpotlight.style.top = `${rect.top - padding}px`;
  this.tourSpotlight.style.width = `${rect.width + padding * 2}px`;
  this.tourSpotlight.style.height = `${rect.height + padding * 2}px`;

  // Position tooltip
  const tooltipRect = this.tourTooltip.getBoundingClientRect();
  let left, top;

  switch (position) {
    case 'top':
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      top = rect.top - tooltipRect.height - 20;
      break;
    case 'bottom':
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      top = rect.bottom + 20;
      break;
    case 'left':
      left = rect.left - tooltipRect.width - 20;
      top = rect.top + rect.height / 2 - tooltipRect.height / 2;
      break;
    case 'right':
      left = rect.right + 20;
      top = rect.top + rect.height / 2 - tooltipRect.height / 2;
      break;
    default:
      left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      top = rect.bottom + 20;
  }

  // Ensure tooltip stays within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (left < 10) left = 10;
  if (left + tooltipRect.width > viewportWidth - 10) {
    left = viewportWidth - tooltipRect.width - 10;
  }
  if (top < 10) top = 10;
  if (top + tooltipRect.height > viewportHeight - 10) {
    top = viewportHeight - tooltipRect.height - 10;
  }

  this.tourTooltip.style.position = 'fixed';
  this.tourTooltip.style.left = `${left}px`;
  this.tourTooltip.style.top = `${top}px`;
  this.tourTooltip.classList.remove(
    'position-top',
    'position-bottom',
    'position-left',
    'position-right'
  );
  this.tourTooltip.classList.add(`position-${position}`);
};

FinanceApp.prototype.highlightElement = function (element) {
  // Remove previous highlights
  const prevHighlighted = document.querySelector('.tour-highlighted');
  if (prevHighlighted) {
    prevHighlighted.classList.remove('tour-highlighted');
  }

  // Add highlight to current element
  element.classList.add('tour-highlighted');
};

FinanceApp.prototype.nextTourStep = function () {
  if (this.currentTourStep < this.tourSteps.length - 1) {
    this.tourTooltip?.classList.remove('show');
    setTimeout(() => {
      this.currentTourStep++;
      this.showTourStep(this.currentTourStep);
    }, 150);
  }
};

FinanceApp.prototype.prevTourStep = function () {
  if (this.currentTourStep > 0) {
    this.tourTooltip?.classList.remove('show');
    setTimeout(() => {
      this.currentTourStep--;
      this.showTourStep(this.currentTourStep);
    }, 150);
  }
};

FinanceApp.prototype.endTour = function (showFinalOptions = false) {
  if (!this.tourActive) return;

  this.tourActive = false;

  // Remove highlights
  const highlighted = document.querySelector('.tour-highlighted');
  if (highlighted) {
    highlighted.classList.remove('tour-highlighted');
  }

  // Hide tour overlay
  if (this.tourOverlay) {
    this.tourTooltip?.classList.remove('show');
    setTimeout(() => {
      this.tourOverlay.classList.add('hidden');
    }, 150);
  }

  // Mark tour as completed
  localStorage.setItem('financia_tour_completed', 'true');
  localStorage.setItem('financia_tour_date', new Date().toISOString());

  // Show final options modal if requested
  if (showFinalOptions) {
    setTimeout(() => {
      this.showTourCompletionModal();
    }, 300);
  } else {
    this.showToast(
      '¡Tour completado! Ya puedes comenzar a usar Dan&Giv Control.',
      'success'
    );
  }
};

FinanceApp.prototype.showTourCompletionModal = function () {
  const modalHTML = `
    <div class="modal tour-completion-modal" id="tourCompletionModal" style="display: flex;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title">🎉 ¡Tour Completado!</h2>
          </div>
          <div class="modal-body">
            <p style="margin-bottom: var(--space-20); text-align: center; color: var(--color-text-secondary);">
              Ya conoces todas las funciones de Dan&Giv Control. ¿Qué te gustaría hacer ahora?
            </p>
            <div class="tour-final-options">
              <button class="btn btn--primary btn--full-width" id="tourOptionExpense">
                <i class="fas fa-plus-circle"></i> Agregar mi primer gasto
              </button>
              <button class="btn btn--secondary btn--full-width" id="tourOptionConfig">
                <i class="fas fa-cog"></i> Ir a configuración
              </button>
              <button class="btn btn--outline btn--full-width" id="tourOptionRepeat">
                <i class="fas fa-redo"></i> Repetir tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Insert modal into DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('tourCompletionModal');
  const optionExpense = document.getElementById('tourOptionExpense');
  const optionConfig = document.getElementById('tourOptionConfig');
  const optionRepeat = document.getElementById('tourOptionRepeat');

  const closeModal = () => {
    modal.style.display = 'none';
    modal.remove();
  };

  optionExpense?.addEventListener('click', () => {
    closeModal();
    this.showSection('expenses');
    this.showToast('✨ ¡Registra tu primer gasto!', 'success');
  });

  optionConfig?.addEventListener('click', () => {
    closeModal();
    this.showSection('config');
    this.showToast('⚙️ Configura tu cuenta', 'success');
  });

  optionRepeat?.addEventListener('click', () => {
    closeModal();
    localStorage.removeItem('financia_tour_completed');
    setTimeout(() => {
      this.startTour();
    }, 300);
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
};

// Setup new configuration functionality
FinanceApp.prototype.setupConfigurationHandlers = function () {
  // Profile section handlers
  this.setupProfileHandlers();

  // Account section handlers
  this.setupAccountHandlers();

  // Appearance section handlers
  this.setupAppearanceHandlers();

  // Update config display with current data
  this.updateConfigurationDisplay();
};

FinanceApp.prototype.setupProfileHandlers = function () {
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const profileNameInput = document.getElementById('profileNameInput');
  const monthlyIncomeInput = document.getElementById('monthlyIncomeInput');

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      this.saveProfileSettings();
    });
  }

  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener('click', () => {
      this.openAvatarUploader();
    });
  }

  // Format monthly income with thousand separators while typing
  if (monthlyIncomeInput) {
    monthlyIncomeInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^\d]/g, '');
      if (value) {
        e.target.value = this.formatNumberWithSeparators(value);
      }
    });

    monthlyIncomeInput.addEventListener('blur', () => {
      this.saveProfileSettings();
    });
  }

  // Auto-save on name change
  if (profileNameInput) {
    profileNameInput.addEventListener('blur', () => {
      this.saveProfileSettings();
    });
  }

  // === SISTEMA DE INGRESOS EXTRAS ===
  const btnAddExtraIncome = document.getElementById('btnAddExtraIncome');
  const btnResetExtras = document.getElementById('btnResetExtras');

  if (btnAddExtraIncome) {
    btnAddExtraIncome.addEventListener('click', () => {
      this.promptAddExtraIncome();
    });
  }

  if (btnResetExtras) {
    btnResetExtras.addEventListener('click', () => {
      this.resetExtraIncome();
    });
  }

  // Actualizar display de extras al cargar
  this.updateExtraIncomeDisplay();
};

FinanceApp.prototype.setupAccountHandlers = function () {
  const invitePartnerBtn = document.getElementById('configInvitePartnerBtn');
  const changePasswordBtn = document.getElementById('configChangePasswordBtn');
  const switchAccountBtn = document.getElementById('configSwitchAccountBtn');

  if (invitePartnerBtn) {
    invitePartnerBtn.addEventListener('click', () => {
      this.showPartnerInviteModal();
    });
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
      this.showChangePasswordModal();
    });
  }

  if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', () => {
      this.showAccountTypeSwitch();
    });
  }

  // Setup modal handlers
  this.setupInviteModalHandlers();
};

FinanceApp.prototype.setupAppearanceHandlers = function () {
  const themeOptions = document.querySelectorAll('.theme-option');
  const changeChartStyleBtn = document.getElementById(
    'configChangeChartStyleBtn'
  );
  const animationsToggle = document.getElementById('animationsToggle');
  const goalNotificationsToggle = document.getElementById(
    'goalNotificationsToggle'
  );
  const demoModeToggle = document.getElementById('demoModeToggle');

  themeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      this.changeTheme(option.dataset.theme);
    });
  });

  if (changeChartStyleBtn) {
    changeChartStyleBtn.addEventListener('click', () => {
      this.showSection('store');
    });
  }

  if (animationsToggle) {
    animationsToggle.addEventListener('change', () => {
      this.toggleAnimations(animationsToggle.checked);
    });
  }

  if (goalNotificationsToggle) {
    goalNotificationsToggle.addEventListener('change', () => {
      this.toggleGoalNotifications(goalNotificationsToggle.checked);
    });
  }

  if (demoModeToggle) {
    demoModeToggle.addEventListener('change', () => {
      this.toggleDemoMode(demoModeToggle.checked);
    });
  }
};

FinanceApp.prototype.saveProfileSettings = async function () {
  const profileNameInput = document.getElementById('profileNameInput');
  const monthlyIncomeInput = document.getElementById('monthlyIncomeInput');

  let updated = false;

  if (profileNameInput && profileNameInput.value.trim()) {
    const newName = profileNameInput.value.trim();
    if (newName !== this.userProfile.name) {
      this.userProfile.name = newName;
      updated = true;

      // Add user to customUsers if not already there
      if (!this.customUsers.includes(newName)) {
        this.customUsers.push(newName);
      }

      // Set as default user automatically
      this.defaultUser = newName;
    }
  }

  if (monthlyIncomeInput && monthlyIncomeInput.value) {
    const cleanValue = monthlyIncomeInput.value.replace(/[^\d]/g, '');
    const newIncome = parseFloat(cleanValue);

    // VALIDACIÓN 1: No permitir valores vacíos o cero (protección contra eliminación)
    if (!newIncome || newIncome <= 0) {
      this.showToast(
        '⚠️ El ingreso mensual no puede estar vacío o ser cero. Solo puedes modificarlo.',
        'error'
      );
      monthlyIncomeInput.value = this.monthlyIncome;
      return;
    }

    // VALIDACIÓN 2: Confirmar cambios (mostrar información del sueldo actual)
    if (newIncome !== this.monthlyIncome) {
      // Preparar información de días desde último cambio
      let daysAgo = '';
      if (this.lastSalaryDate) {
        const lastDate = new Date(this.lastSalaryDate);
        const today = new Date();
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        daysAgo = diffDays === 1 ? '\n📅 Registrado: hace 1 día' : `\n📅 Registrado: hace ${diffDays} días`;
      }

      const changePercent = Math.abs(
        ((newIncome - this.monthlyIncome) / this.monthlyIncome) * 100
      );

      const confirmed = confirm(
        `⚠️ CAMBIO DE SUELDO\n\n` +
          `Ya tienes un sueldo establecido:\n` +
          `💰 Sueldo actual: $${this.monthlyIncome.toLocaleString()}${daysAgo}\n\n` +
          `Nuevo sueldo: $${newIncome.toLocaleString()}\n` +
          `Cambio: ${changePercent.toFixed(0)}%\n\n` +
          `¿Estás seguro de cambiar el sueldo?\n` +
          `Esto actualizará tu balance total.`
      );

      if (!confirmed) {
        monthlyIncomeInput.value = this.monthlyIncome;
        this.showToast('Cambio cancelado', 'info');
        return;
      }

      this.monthlyIncome = newIncome;
      this.lastSalaryDate = new Date().toISOString().split('T')[0]; // Actualizar fecha del último sueldo
      localStorage.setItem(
        'financia_monthly_income',
        this.monthlyIncome.toString()
      );
      updated = true;
    }
  }

  if (updated) {
    // Update local storage
    this.saveData();

    // Update Firebase if logged in
    const FB = window.FB;
    if (FB?.auth && this.firebaseUser) {
      try {
        const userDocRef = FB.doc(FB.db, 'usuarios', this.firebaseUser.uid);
        await FB.updateDoc(userDocRef, {
          userName: this.userProfile.name,
          monthlyIncome: this.monthlyIncome,
          updatedAt: Date.now(),
        });
      } catch (error) {
        console.error('Error updating Firebase:', error);
      }
    }

    // Update UI across the app
    this.updateConfigurationDisplay();
    this.updateProfileDisplay();
    this.updateUserSelectionDropdown();
    this.updateDashboardWelcome();
    this.updateQuickAccessGreeting(); // Actualizar saludo de accesos rápidos
    this.renderDashboard();

    this.showToast('Perfil actualizado correctamente', 'success');
  }
};

FinanceApp.prototype.showAvatarSelector = function () {
  // Navigate to store section for avatar selection
  this.showSection('store');
  this.showToast('Selecciona un nuevo avatar en la tienda', 'info');
};

FinanceApp.prototype.openAvatarUploader = function () {
  // Create file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('La imagen debe ser menor a 5MB', 'error');
      return;
    }

    // Show loading
    this.showToast('Subiendo avatar...', 'info');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target.result;

        // Update profile type
        this.userProfile.avatarType = 'custom';

        // Update UI temporarily with base64 (solo visual, no guardar)
        const tempAvatar = imageData;

        // Verificar plan del usuario
        const isPro = this.userPlan === 'pro';
        const FB = window.FB;
        const currentFirebaseUser = this.firebaseUser || FB.auth?.currentUser;
        const isLoggedIn =
          currentFirebaseUser &&
          this.currentUser &&
          this.currentUser !== 'anonymous';

        // Plan PRO: Subir a Firebase Storage (nube)
        if (isPro && FB?.auth && isLoggedIn) {
          try {
            // Subir a Firebase Storage
            const storageRef = FB.ref(
              FB.storage,
              `avatars/${currentFirebaseUser.uid}`
            );
            await FB.uploadString(storageRef, imageData, 'data_url');
            const downloadURL = await FB.getDownloadURL(storageRef);

            // Guardar URL en perfil
            this.userProfile.avatar = downloadURL;
            this.userProfile.avatarType = 'custom';

            // Guardar en localStorage (solo URL)
            this.saveData();

            // Update Firestore with image URL
            const userDocRef = FB.doc(
              FB.db,
              'usuarios',
              currentFirebaseUser.uid
            );
            await FB.updateDoc(userDocRef, {
              'userProfile.avatar': downloadURL,
              'userProfile.avatarType': 'custom',
              updatedAt: Date.now(),
            });

            // Update UI
            this.updateConfigurationDisplay();
            this.updateProfileDisplay();

            this.showToast('Avatar guardado en la nube ✓', 'success');
          } catch (error) {
            console.error('Error uploading to Firebase:', error);
            this.showToast('Error al subir avatar: ' + error.message, 'error');
          }
        }
        // Plan FREE: Guardar localmente (temporal)
        else if (isLoggedIn) {
          // Comprimir imagen para localStorage
          const maxSize = 100; // 100x100 px para plan free
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Resize
            canvas.width = maxSize;
            canvas.height = maxSize;
            ctx.drawImage(img, 0, 0, maxSize, maxSize);

            // Convertir a base64 comprimido
            const compressedData = canvas.toDataURL('image/jpeg', 0.6);

            // Guardar localmente
            this.userProfile.avatar = compressedData;
            this.userProfile.avatarType = 'custom';

            // Guardar en localStorage
            this.saveData();

            // Update UI
            this.updateConfigurationDisplay();
            this.updateProfileDisplay();

            this.showToast(
              'Avatar guardado localmente. Actualiza a PRO para sincronizar en la nube.',
              'info'
            );
          };
          img.src = imageData;
        }
        // Usuario anónimo
        else {
          console.log('Usuario no logueado');
          this.showToast('Inicia sesión para guardar el avatar', 'warning');
          this.userProfile.avatar = '';
          this.userProfile.avatarType = 'default';
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      this.showToast('Error al subir el avatar', 'error');
    }
  });

  input.click();
};

FinanceApp.prototype.formatNumberWithSeparators = function (value) {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

FinanceApp.prototype.showPartnerInviteModal = function () {
  const modal = document.getElementById('partnerInviteModal');
  if (!modal) return;

  // Reset modal to first step
  const step1 = document.getElementById('inviteStep1');
  const step2 = document.getElementById('inviteStep2');

  if (step1 && step2) {
    step1.classList.add('active');
    step1.classList.remove('hidden');
    step2.classList.remove('active');
    step2.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

FinanceApp.prototype.setupInviteModalHandlers = function () {
  const modal = document.getElementById('partnerInviteModal');
  const closeBtn = document.getElementById('closeInviteModalBtn');
  const cancelBtn = document.getElementById('cancelInviteBtn');
  const proceedBtn = document.getElementById('proceedInviteBtn');
  const copyLinkBtn = document.getElementById('copyInviteLinkBtn');
  const generateNewLinkBtn = document.getElementById('generateNewLinkBtn');
  const finishBtn = document.getElementById('finishInviteBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      this.closePartnerInviteModal();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      this.closePartnerInviteModal();
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      this.generateInviteLink();
    });
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      this.copyInviteLink();
    });
  }

  if (generateNewLinkBtn) {
    generateNewLinkBtn.addEventListener('click', () => {
      this.generateInviteLink();
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      this.closePartnerInviteModal();
    });
  }

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closePartnerInviteModal();
      }
    });
  }
};

FinanceApp.prototype.generateInviteLink = async function () {
  // Generate a unique secure invitation link
  const inviteCode = this.generateSecureInviteCode();
  const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${inviteCode}`;

  // Store invitation details
  const invitation = {
    code: inviteCode,
    link: inviteLink,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    used: false,
    createdBy: this.firebaseUser?.uid || 'anonymous',
  };

  localStorage.setItem(
    'financia_pending_invitation',
    JSON.stringify(invitation)
  );

  // Save to Firebase if logged in
  const FB = window.FB;
  if (FB?.auth && this.firebaseUser) {
    try {
      const invitesRef = FB.collection(FB.db, 'invitations');
      await FB.addDoc(invitesRef, invitation);
    } catch (error) {
      console.error('Error saving invitation to Firebase:', error);
    }
  }

  // Update UI
  const linkInput = document.getElementById('generatedInviteLink');
  if (linkInput) {
    linkInput.value = inviteLink;
  }

  // Switch to step 2
  const step1 = document.getElementById('inviteStep1');
  const step2 = document.getElementById('inviteStep2');

  if (step1 && step2) {
    step1.classList.remove('active');
    step1.classList.add('hidden');
    step2.classList.add('active');
    step2.classList.remove('hidden');
  }

  this.showToast('Enlace de invitación generado', 'success');
};

FinanceApp.prototype.generateSecureInviteCode = function () {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

FinanceApp.prototype.copyInviteLink = function () {
  const linkInput = document.getElementById('generatedInviteLink');
  const copyBtn = document.getElementById('copyInviteLinkBtn');

  if (linkInput && copyBtn) {
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);

    try {
      document.execCommand('copy');

      // Visual feedback
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';

      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 2000);

      this.showToast('Enlace copiado al portapapeles', 'success');
    } catch (err) {
      this.showToast('Error al copiar el enlace', 'error');
    }
  }
};

FinanceApp.prototype.closePartnerInviteModal = function () {
  const modal = document.getElementById('partnerInviteModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

FinanceApp.prototype.changeTheme = function (theme) {
  // Update active theme option
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach((option) => {
    option.classList.remove('active');
    if (option.dataset.theme === theme) {
      option.classList.add('active');
    }
  });

  // Apply theme logic (you can extend this based on your theme system)
  localStorage.setItem('financia_theme', theme);
  this.showToast(`Tema ${theme} aplicado`, 'success');
};

FinanceApp.prototype.toggleAnimations = function (enabled) {
  localStorage.setItem('financia_animations', enabled.toString());
  if (enabled) {
    document.body.classList.remove('no-animations');
  } else {
    document.body.classList.add('no-animations');
  }
  this.showToast(
    `Animaciones ${enabled ? 'activadas' : 'desactivadas'}`,
    'success'
  );
};

FinanceApp.prototype.toggleGoalNotifications = function (enabled) {
  localStorage.setItem('financia_goal_notifications', enabled.toString());
  this.showToast(
    `Notificaciones de metas ${enabled ? 'activadas' : 'desactivadas'}`,
    'success'
  );
};

FinanceApp.prototype.toggleDemoMode = function (enabled) {
  localStorage.setItem('financia_demo_mode', enabled.toString());
  this.showToast(
    `Modo demostración ${enabled ? 'activado' : 'desactivado'}`,
    'success'
  );
};

FinanceApp.prototype.updateConfigurationDisplay = function () {
  // Update profile information
  const profileUserName = document.getElementById('profileUserName');
  const profileNameInput = document.getElementById('profileNameInput');
  const monthlyIncomeInput = document.getElementById('monthlyIncomeInput');
  const configMemberName = document.getElementById('configMemberName');
  const configAccountBadge = document.getElementById('configAccountBadge');
  const configAccountTypeText = document.getElementById(
    'configAccountTypeText'
  );
  const configAccountDescription = document.getElementById(
    'configAccountDescription'
  );
  const configInviteSection = document.getElementById('configInviteSection');
  const currentProfileAvatar = document.getElementById('currentProfileAvatar');

  // Update avatar preview
  if (currentProfileAvatar) {
    const avatarPreview = currentProfileAvatar.querySelector('.avatar-preview');
    if (avatarPreview) {
      if (this.userProfile.avatar) {
        avatarPreview.innerHTML = `<img src="${this.userProfile.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Avatar">`;
      } else {
        avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
      }
    }
  }

  if (profileUserName) {
    profileUserName.textContent = this.userProfile.name || 'Usuario';
  }

  if (profileNameInput) {
    profileNameInput.value = this.userProfile.name || '';
  }

  if (monthlyIncomeInput) {
    const formattedIncome = this.monthlyIncome
      ? this.formatNumberWithSeparators(this.monthlyIncome.toString())
      : '';
    monthlyIncomeInput.value = formattedIncome;
  }

  // Actualizar display de ingresos extras
  this.updateExtraIncomeDisplay();

  if (configMemberName) {
    configMemberName.textContent = this.userProfile.name || 'Usuario';
  }

  // Update account type information
  const accountType = this.accountType || 'personal';
  if (configAccountBadge && configAccountTypeText) {
    if (accountType === 'shared') {
      configAccountBadge.innerHTML =
        '<i class="fas fa-users"></i><span>Cuenta Mancomunada</span>';
      configAccountTypeText.textContent = 'Cuenta Mancomunada';
      if (configAccountDescription) {
        configAccountDescription.textContent =
          'Cuenta compartida para gestión financiera en pareja o familia.';
      }
      if (configInviteSection) {
        configInviteSection.classList.remove('hidden');
      }
    } else {
      configAccountBadge.innerHTML =
        '<i class="fas fa-user"></i><span>Cuenta Personal</span>';
      configAccountTypeText.textContent = 'Cuenta Personal';
      if (configAccountDescription) {
        configAccountDescription.textContent =
          'Tu cuenta personal para el control de finanzas individuales.';
      }
      if (configInviteSection) {
        configInviteSection.classList.add('hidden');
      }
    }
  }

  // Update chart style display
  const chartStyleName = document.getElementById('configChartStyleName');
  if (chartStyleName && this.currentChartStyle) {
    chartStyleName.textContent =
      this.chartStyles[this.currentChartStyle]?.name || 'Clásico';
  }

  // Update preference toggles based on stored values
  const animationsToggle = document.getElementById('animationsToggle');
  const goalNotificationsToggle = document.getElementById(
    'goalNotificationsToggle'
  );
  const demoModeToggle = document.getElementById('demoModeToggle');

  if (animationsToggle) {
    animationsToggle.checked =
      localStorage.getItem('financia_animations') !== 'false';
  }

  if (goalNotificationsToggle) {
    goalNotificationsToggle.checked =
      localStorage.getItem('financia_goal_notifications') !== 'false';
  }

  if (demoModeToggle) {
    demoModeToggle.checked =
      localStorage.getItem('financia_demo_mode') === 'true';
  }

  // Update theme selection
  const selectedTheme = localStorage.getItem('financia_theme') || 'light';
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach((option) => {
    option.classList.remove('active');
    if (option.dataset.theme === selectedTheme) {
      option.classList.add('active');
    }
  });
};

// ============================================
// Shared Account Invite Modal Functions
// ============================================

FinanceApp.prototype.showSharedAccountInviteModal = async function () {
  console.log('DEBUG: showSharedAccountInviteModal llamada');
  console.log('DEBUG: Buscando modal con ID: sharedAccountInviteModal');

  const modal = document.getElementById('sharedAccountInviteModal');
  console.log('DEBUG: Modal encontrado:', modal);
  console.log(
    'DEBUG: Clases del modal:',
    modal ? modal.className : 'Modal es null'
  );

  if (!modal) {
    console.error(
      'ERROR: Modal sharedAccountInviteModal no encontrado en el DOM'
    );
    console.log(
      'DEBUG: Todos los elementos con class modal:',
      document.querySelectorAll('.modal')
    );
    return;
  }

  // Generate unique invite link
  const inviteLink = this.generateUniqueInviteLink();
  console.log('DEBUG: Enlace generado:', inviteLink);

  const inviteLinkInput = document.getElementById('sharedAccountInviteLink');
  console.log('DEBUG: Input encontrado:', inviteLinkInput);

  if (inviteLinkInput) {
    inviteLinkInput.value = inviteLink;
  }

  // Store invite link data
  this.currentInviteLink = {
    link: inviteLink,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    used: false,
  };

  console.log('DEBUG: currentInviteLink creado:', this.currentInviteLink);
  await this.saveData();
  console.log('DEBUG: Datos guardados con currentInviteLink');

  // Add notification with the invite link
  this.addInviteLinkNotification(inviteLink);
  console.log('DEBUG: Notificación agregada');

  // Start timer countdown
  this.startInviteLinkTimer();
  console.log('DEBUG: Timer iniciado');

  // Show modal
  console.log('DEBUG: Agregando clase "show" al modal...');
  modal.classList.add('show');
  console.log('DEBUG: Clases después de agregar show:', modal.className);
  console.log(
    'DEBUG: Display computed del modal:',
    window.getComputedStyle(modal).display
  );

  document.body.style.overflow = 'hidden';
  console.log('DEBUG: Modal mostrado y body overflow hidden');

  // Setup event listeners
  this.setupSharedAccountInviteModalListeners();
  console.log('DEBUG: Event listeners configurados');

  // Verificación final
  setTimeout(() => {
    console.log(
      'DEBUG: [500ms después] Display del modal:',
      window.getComputedStyle(modal).display
    );
    console.log(
      'DEBUG: [500ms después] Modal visible?',
      modal.offsetParent !== null
    );
  }, 500);
};

FinanceApp.prototype.generateUniqueInviteLink = function () {
  const baseUrl = window.location.origin;
  const inviteCode = this.generateRandomCode(16);
  const accountId = this.accountOwner || this.generateUserId().substring(0, 8);

  return `${baseUrl}/?invite=${inviteCode}&account=${accountId}`;
};

FinanceApp.prototype.startInviteLinkTimer = function () {
  const timerElement = document.getElementById('inviteLinkTimer');
  if (!timerElement || !this.currentInviteLink) return;

  // Clear any existing timer
  if (this.inviteLinkTimerInterval) {
    clearInterval(this.inviteLinkTimerInterval);
  }

  this.inviteLinkTimerInterval = setInterval(() => {
    const now = Date.now();
    const remaining = this.currentInviteLink.expiresAt - now;

    if (remaining <= 0) {
      timerElement.textContent = 'Expirado';
      timerElement.style.color = 'var(--color-error)';
      clearInterval(this.inviteLinkTimerInterval);
      this.markInviteLinkAsExpired();
      return;
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, 1000);
};

FinanceApp.prototype.markInviteLinkAsExpired = function () {
  if (this.currentInviteLink) {
    this.currentInviteLink.expired = true;
    this.saveData();

    // Update notification
    this.updateInviteLinkNotificationToExpired();
  }
};

FinanceApp.prototype.addInviteLinkNotification = function (inviteLink) {
  console.log('DEBUG: Agregando notificación de enlace:', inviteLink);
  // La notificación se agregará automáticamente en updateNotifications()
  // Solo necesitamos actualizar el sistema de notificaciones
  this.updateNotifications();
  console.log('DEBUG: Sistema de notificaciones actualizado');
};

FinanceApp.prototype.updateInviteLinkNotificationToExpired = function () {
  // La notificación se actualiza automáticamente en updateNotifications()
  // Solo marcamos el enlace como expirado y actualizamos
  if (this.currentInviteLink) {
    this.currentInviteLink.expired = true;
    this.saveData();
    this.updateNotifications();
    console.log('DEBUG: Notificación actualizada a expirado');
  }
};

FinanceApp.prototype.setupSharedAccountInviteModalListeners = function () {
  const modal = document.getElementById('sharedAccountInviteModal');
  if (!modal) return;

  // Copy button
  const copyBtn = document.getElementById('copySharedInviteLinkBtn');
  if (copyBtn) {
    copyBtn.onclick = () => this.copyInviteLinkToClipboard();
  }

  // Share button
  const shareBtn = document.getElementById('shareSharedInviteLinkBtn');
  if (shareBtn) {
    shareBtn.onclick = () => this.shareInviteLink();
  }

  // View notifications button
  const viewNotifBtn = document.getElementById('viewNotificationsBtn');
  if (viewNotifBtn) {
    viewNotifBtn.onclick = () => {
      this.closeSharedAccountInviteModal();
      // Abrir dropdown de notificaciones
      const dropdown = document.getElementById('notificationDropdown');
      if (dropdown) {
        dropdown.classList.remove('hidden');
      }
    };
  }

  // Close buttons
  const closeBtn = document.getElementById('closeSharedInviteModalBtn');
  const finishBtn = document.getElementById('closeSharedInviteModalFinishBtn');

  if (closeBtn) {
    closeBtn.onclick = () => this.closeSharedAccountInviteModal();
  }

  if (finishBtn) {
    finishBtn.onclick = () => this.closeSharedAccountInviteModal();
  }

  // Click outside to close
  modal.onclick = (e) => {
    if (e.target.id === 'sharedAccountInviteModal') {
      this.closeSharedAccountInviteModal();
    }
  };
};

FinanceApp.prototype.copyInviteLinkToClipboard = function () {
  const inviteLinkInput = document.getElementById('sharedAccountInviteLink');
  const copyBtn = document.getElementById('copySharedInviteLinkBtn');

  if (!inviteLinkInput) return;

  inviteLinkInput.select();
  document.execCommand('copy');

  // Visual feedback
  if (copyBtn) {
    const originalHTML = copyBtn.innerHTML;
    copyBtn.classList.add('copied');
    copyBtn.innerHTML = '<i class="fas fa-check"></i><span>¡Copiado!</span>';

    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = originalHTML;
    }, 2000);
  }

  this.showToast('Enlace copiado al portapapeles', 'success');
};

FinanceApp.prototype.shareInviteLink = function () {
  const inviteLink = this.currentInviteLink?.link;

  if (!inviteLink) {
    this.showToast('No hay enlace disponible', 'error');
    return;
  }

  // Check if Web Share API is available
  if (navigator.share) {
    navigator
      .share({
        title: 'Invitación a Cuenta Mancomunada - FinanciaPro Suite',
        text: 'Te invito a unirte a mi cuenta mancomunada en FinanciaPro Suite',
        url: inviteLink,
      })
      .then(() => {
        this.showToast('Enlace compartido exitosamente', 'success');
      })
      .catch((error) => {
        console.log('Error sharing:', error);
        // Fallback: copy to clipboard
        this.copyInviteLinkToClipboard();
      });
  } else {
    // Fallback for browsers without Web Share API
    this.copyInviteLinkToClipboard();
    this.showToast('Enlace copiado. Compártelo manualmente', 'info');
  }
};

FinanceApp.prototype.closeSharedAccountInviteModal = function () {
  const modal = document.getElementById('sharedAccountInviteModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  // Stop timer
  if (this.inviteLinkTimerInterval) {
    clearInterval(this.inviteLinkTimerInterval);
    this.inviteLinkTimerInterval = null;
  }
};

// ============================================
// Invitation Link Detection and Handling
// ============================================

// DESHABILITADO - Funcionalidad de invitación
FinanceApp.prototype.checkInvitationLink = function () {
  return; // Deshabilitado temporalmente
  const urlParams = new URLSearchParams(window.location.search);
  const inviteCode = urlParams.get('invite');
  const accountId = urlParams.get('account');

  console.log('DEBUG: Chequeando URL params:', { inviteCode, accountId });

  if (inviteCode && accountId) {
    console.log('DEBUG: ¡Enlace de invitación detectado!');

    // Guardar datos de invitación temporalmente
    this.pendingInvitation = {
      code: inviteCode,
      accountId: accountId,
      timestamp: Date.now(),
    };

    // Validar si el enlace está vigente
    this.validateAndShowInvitation(inviteCode, accountId);
  }
};

FinanceApp.prototype.validateAndShowInvitation = function (
  inviteCode,
  accountId
) {
  console.log('DEBUG: Validando enlace de invitación...');

  // TODO: Aquí deberías validar contra Firestore si el enlace es válido
  // Por ahora, asumimos que es válido si tiene menos de 24 horas

  // Verificar si ya está autenticado
  if (this.currentUser && this.currentUser !== 'anonymous') {
    this.showToast(
      'Ya tienes una sesión activa. Cierra sesión primero para unirte a otra cuenta.',
      'warning'
    );
    return;
  }

  // Mostrar modal especial de invitación
  setTimeout(() => {
    this.showInvitationWelcomeModal(inviteCode, accountId);
  }, 500);
};

FinanceApp.prototype.showInvitationWelcomeModal = function (
  inviteCode,
  accountId
) {
  console.log('DEBUG: Mostrando modal de bienvenida de invitación');

  // Cerrar modal de tipo de cuenta si está abierto
  const accountTypeModal = document.getElementById('accountTypeModal');
  if (accountTypeModal) {
    accountTypeModal.classList.remove('show');
  }

  // Abrir modal de autenticación en modo registro
  const authModal = document.getElementById('authModal');
  if (!authModal) {
    console.error('Modal de autenticación no encontrado');
    return;
  }

  // Configurar para registro
  document.getElementById('authModalTitle').textContent =
    '¡Te han invitado a una cuenta mancomunada!';
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');

  // Agregar mensaje de invitación
  const registerForm = document.getElementById('registerForm');
  let inviteMessage = document.getElementById('invitationMessage');

  if (!inviteMessage) {
    inviteMessage = document.createElement('div');
    inviteMessage.id = 'invitationMessage';
    inviteMessage.className = 'invitation-welcome-message';
    inviteMessage.innerHTML = `
      <div class="invite-icon">
        <i class="fas fa-users"></i>
      </div>
      <h3>¡Has sido invitado!</h3>
      <p>Alguien te ha invitado a unirte a su cuenta mancomunada.</p>
      <p><strong>Completa el registro para aceptar la invitación.</strong></p>
    `;
    registerForm.insertBefore(inviteMessage, registerForm.firstChild);
  }

  // Guardar que estamos en modo invitación
  window.isJoiningSharedAccount = true;
  window.invitationData = { code: inviteCode, accountId: accountId };

  authModal.classList.add('show');
  document.body.style.overflow = 'hidden';

  this.showToast(
    'Completa tu registro para unirte a la cuenta compartida',
    'info'
  );
};

// DESHABILITADO - Funcionalidad de invitación
FinanceApp.prototype.joinSharedAccountWithInvite = async function (
  name,
  email,
  password,
  inviteCode,
  accountId
) {
  return; // Deshabilitado temporalmente
  console.log('DEBUG: Uniendo a cuenta compartida con invitación');

  try {
    // 1. Registrar usuario en Firebase Auth
    const userCredential = await FB.createUserWithEmailAndPassword(
      FB.auth,
      email,
      password
    );

    const userId = userCredential.user.uid;
    console.log('DEBUG: Usuario creado:', userId);

    // 2. Cargar datos de la cuenta existente desde Firestore
    const accountDocRef = FB.doc(FB.db, 'userData', accountId);
    const accountDoc = await FB.getDoc(accountDocRef);

    if (!accountDoc.exists()) {
      throw new Error('La cuenta de invitación no existe o ha sido eliminada');
    }

    const accountData = accountDoc.data();
    console.log('DEBUG: Datos de cuenta cargados');

    // 3. Agregar nuevo usuario a la cuenta
    const newUser = {
      id: userId,
      name: name,
      email: email,
      role: 'member',
      joinedAt: Date.now(),
    };

    accountData.accountUsers.push(newUser);

    // 4. Marcar el enlace de invitación como usado
    if (accountData.currentInviteLink) {
      accountData.currentInviteLink.used = true;
      accountData.currentInviteLink.usedBy = userId;
      accountData.currentInviteLink.usedAt = Date.now();
    }

    // 5. Agregar log de actividad
    if (!accountData.activityLog) {
      accountData.activityLog = [];
    }
    accountData.activityLog.unshift({
      id: 'activity_' + Date.now(),
      type: 'user_joined',
      description: `${name} se unió a la cuenta`,
      userId: userId,
      timestamp: Date.now(),
    });

    // 6. Guardar datos actualizados en la cuenta original (el ÚNICO documento compartido)
    await FB.setDoc(accountDocRef, accountData);
    console.log('DEBUG: Cuenta compartida actualizada en Firestore');

    // 7. NO crear documento separado para el nuevo usuario
    // En su lugar, el nuevo usuario usará el accountId como su currentUser para acceder al documento compartido
    // Esto asegura que ambos usuarios lean y escriban en el MISMO documento

    // 8. Actualizar datos locales
    this.accountType = accountData.accountType;
    this.currentUser = userId; // ID del usuario autenticado en Firebase Auth
    this.sharedAccountId = accountId; // ID del documento compartido en Firestore
    this.accountOwner = accountData.accountOwner;
    this.accountUsers = accountData.accountUsers;
    this.expenses = accountData.expenses || [];
    this.goals = accountData.goals || [];
    this.shoppingItems = accountData.shoppingItems || [];
    this.monthlyIncome = accountData.monthlyIncome || 2500;
    this.inviteCodes = accountData.inviteCodes || {};
    this.currentInviteLink = accountData.currentInviteLink || null;
    this.activityLog = accountData.activityLog || [];

    // 9. Guardar en localStorage
    localStorage.setItem(
      'financiaProData',
      JSON.stringify({
        accountType: this.accountType,
        currentUser: this.currentUser,
        sharedAccountId: this.sharedAccountId,
        accountOwner: this.accountOwner,
        accountUsers: this.accountUsers,
        expenses: this.expenses,
        goals: this.goals,
        shoppingItems: this.shoppingItems,
        monthlyIncome: this.monthlyIncome,
        inviteCodes: this.inviteCodes,
        currentInviteLink: this.currentInviteLink,
        activityLog: this.activityLog,
        lastUpdate: Date.now(),
      })
    );

    // 10. Limpiar URL y datos de invitación
    window.history.replaceState({}, document.title, window.location.pathname);
    delete this.pendingInvitation;
    delete window.isJoiningSharedAccount;
    delete window.invitationData;

    // 11. Cerrar modal y mostrar éxito
    this.closeAuthModal();
    this.showToast(
      '¡Te has unido exitosamente a la cuenta compartida!',
      'success'
    );

    // 12. Actualizar UI
    this.updateAccountDisplay();
    this.updateUserSelectionDropdown();
    this.renderDashboard();
    this.renderExpenses();
    this.renderGoals();

    console.log('DEBUG: ¡Usuario unido exitosamente!');
  } catch (error) {
    console.error('Error al unirse a cuenta compartida:', error);

    if (error.code === 'auth/email-already-in-use') {
      this.showToast('Este email ya está registrado', 'error');
    } else if (error.message.includes('no existe')) {
      this.showToast('Este enlace de invitación ya no es válido', 'error');
    } else {
      this.showToast('Error al unirse a la cuenta: ' + error.message, 'error');
    }
  }
};

// ========================================
// AUDIT SYSTEM
// ========================================

FinanceApp.prototype.logAudit = function (
  type,
  action,
  description,
  reason = '',
  details = {}
) {
  const entry = {
    id: Date.now().toString(),
    type: type,
    action: action,
    description: description,
    reason: reason,
    details: details,
    timestamp: Date.now(),
    date: new Date().toISOString(),
    user: this.currentUser || 'anonymous',
  };

  this.auditLog.unshift(entry);
  this.saveData();

  // Actualizar notificaciones después de registrar el cambio
  this.updateNotifications();
};

FinanceApp.prototype.renderAuditLog = function () {
  const auditList = document.getElementById('auditList');
  if (!auditList) return;

  const typeFilter = document.getElementById('auditTypeFilter')?.value || 'all';
  const daysFilter = document.getElementById('auditDaysFilter')?.value || 'all';

  let filteredLog = this.auditLog;

  // Filtrar por tipo
  if (typeFilter !== 'all') {
    filteredLog = filteredLog.filter((entry) => entry.type === typeFilter);
  }

  // Filtrar por últimos días
  if (daysFilter !== 'all') {
    const daysAgo = parseInt(daysFilter);
    const cutoffDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    filteredLog = filteredLog.filter((entry) => entry.timestamp >= cutoffDate);
  }

  if (filteredLog.length === 0) {
    auditList.innerHTML = `
      <div class="audit-empty">
        <i class="fas fa-history"></i>
        <p>No hay cambios registrados</p>
      </div>
    `;
    return;
  }

  auditList.innerHTML = filteredLog
    .map((entry) => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      let icon = 'fas fa-edit';
      let actionClass = 'edited';

      if (entry.action === 'added') {
        icon = 'fas fa-plus';
        actionClass = 'added';
      } else if (entry.action === 'deleted') {
        icon = 'fas fa-trash';
        actionClass = 'deleted';
      } else if (entry.action === 'edited') {
        icon = 'fas fa-edit';
        actionClass = 'edited';
      }

      const reasonHtml = entry.reason
        ? `<div class="audit-reason"><strong>Motivo:</strong> ${entry.reason}</div>`
        : '';

      return `
      <div class="audit-item">
        <div class="audit-icon ${actionClass}">
          <i class="${icon}"></i>
        </div>
        <div class="audit-content">
          <div class="audit-header">
            <div class="audit-title">${entry.description}</div>
            <div class="audit-date">${dateStr}</div>
          </div>
          ${reasonHtml}
        </div>
      </div>
    `;
    })
    .join('');
};

FinanceApp.prototype.setupAuditListeners = function () {
  const typeFilter = document.getElementById('auditTypeFilter');
  const daysFilter = document.getElementById('auditDaysFilter');
  const clearFilters = document.getElementById('clearAuditFilters');

  if (typeFilter) {
    typeFilter.addEventListener('change', () => this.renderAuditLog());
  }

  if (daysFilter) {
    daysFilter.addEventListener('change', () => this.renderAuditLog());
  }

  if (clearFilters) {
    clearFilters.addEventListener('click', () => {
      if (typeFilter) typeFilter.value = 'all';
      if (daysFilter) daysFilter.value = '7';
      this.renderAuditLog();
    });
  }
};

// ========================================
// SAVINGS MANAGEMENT SYSTEM
// ========================================

FinanceApp.prototype.setupSavingsListeners = function () {
  const savingsForm = document.getElementById('savingsAccountForm');
  const savingsCard = document.getElementById('savingsCard');
  const closeSavingsDetail = document.getElementById('closeSavingsDetail');

  if (savingsForm) {
    savingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addSavingsAccount();
    });
  }

  if (savingsCard) {
    savingsCard.addEventListener('click', () => {
      this.showSavingsDetailModal();
    });
    savingsCard.style.cursor = 'pointer';
  }

  if (closeSavingsDetail) {
    closeSavingsDetail.addEventListener('click', () => {
      document.getElementById('savingsDetailModal').classList.remove('show');
    });
  }
};

FinanceApp.prototype.addSavingsAccount = function () {
  const sourceName = document.getElementById('savingsSourceName').value.trim();
  const amountInput = document.getElementById('savingsAmount');
  const amount = this.unformatNumber(amountInput.value);
  const type = document.getElementById('savingsType').value;
  const description = document
    .getElementById('savingsDescription')
    .value.trim();

  if (!sourceName || !amount || amount < 0 || !type) {
    this.showToast('Complete todos los campos requeridos', 'error');
    return;
  }

  const savingsAccount = {
    id: Date.now().toString(),
    sourceName: sourceName,
    amount: amount,
    type: type,
    description: description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  this.savingsAccounts.push(savingsAccount);

  this.logAudit(
    'savings_added',
    'added',
    `Nueva fuente de ahorro: ${sourceName} - $${amount}`,
    '',
    { sourceName, amount, type }
  );

  this.saveData();
  this.renderSavingsAccountsList();
  this.updateDashboardSavings();
  this.showToast('Fuente de ahorro agregada', 'success');

  // Cerrar modal y limpiar formulario
  const modal = document.getElementById('addSavingsModal');
  if (modal) {
    modal.classList.remove('show');
  }
  document.getElementById('savingsAccountForm').reset();
};

FinanceApp.prototype.deleteSavingsAccount = function (id) {
  const index = this.savingsAccounts.findIndex((acc) => acc.id === id);
  if (index === -1) return;

  const account = this.savingsAccounts[index];

  this.logAudit(
    'savings_deleted',
    'deleted',
    `Fuente de ahorro eliminada: ${account.sourceName} - $${account.amount}`,
    '',
    {
      sourceName: account.sourceName,
      amount: account.amount,
      type: account.type,
    }
  );

  this.savingsAccounts.splice(index, 1);
  this.saveData();
  this.renderSavingsAccountsList();
  this.updateDashboardSavings();
  this.showToast('Fuente de ahorro eliminada', 'success');
};

FinanceApp.prototype.updateSavingsAmount = function (id, newAmount) {
  const account = this.savingsAccounts.find((acc) => acc.id === id);
  if (!account) return;

  const oldAmount = account.amount;
  account.amount = parseFloat(newAmount);
  account.updatedAt = Date.now();

  this.logAudit(
    'savings_edited',
    'edited',
    `Monto actualizado: ${account.sourceName} de $${oldAmount} a $${account.amount}`,
    '',
    { sourceName: account.sourceName, oldAmount, newAmount: account.amount }
  );

  this.saveData();
  this.renderSavingsAccountsList();
  this.updateDashboardSavings();
};

FinanceApp.prototype.renderSavingsAccountsList = function () {
  const container = document.getElementById('savingsAccountsList');
  if (!container) return;

  const totalAmount = document.getElementById('totalSavingsAmount');
  const totalSources = document.getElementById('totalSavingsSources');

  if (this.savingsAccounts.length === 0) {
    container.innerHTML = `
      <div class="empty-state-small">
        <i class="fas fa-wallet"></i>
        <p>No hay fuentes de ahorro registradas</p>
      </div>
    `;
    if (totalAmount) totalAmount.textContent = '$0';
    if (totalSources) totalSources.textContent = '0';
    return;
  }

  const total = this.savingsAccounts.reduce((sum, acc) => sum + acc.amount, 0);

  if (totalAmount) totalAmount.textContent = `$${total.toLocaleString()}`;
  if (totalSources) totalSources.textContent = this.savingsAccounts.length;

  container.innerHTML = this.savingsAccounts
    .map((account) => {
      const icon = this.getSavingsTypeIcon(account.type);
      const typeName = this.getSavingsTypeName(account.type);

      return `
      <div class="savings-account-item">
        <div class="savings-account-icon ${account.type}">
          <i class="${icon}"></i>
        </div>
        <div class="savings-account-info">
          <div class="savings-account-name">${account.sourceName}</div>
          <div class="savings-account-meta">
            <span><i class="fas fa-tag"></i> ${typeName}</span>
            ${
              account.description
                ? `<span><i class="fas fa-info-circle"></i> ${account.description}</span>`
                : ''
            }
          </div>
        </div>
        <div class="savings-account-amount">$${account.amount.toLocaleString()}</div>
        <div class="savings-account-actions">
          <button class="btn-icon" onclick="app.editSavingsAmount('${
            account.id
          }')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon delete" onclick="app.deleteSavingsAccount('${
            account.id
          }')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    })
    .join('');
};

FinanceApp.prototype.editSavingsAmount = function (id) {
  const account = this.savingsAccounts.find((acc) => acc.id === id);
  if (!account) return;

  const newAmount = prompt(
    `Nuevo monto para ${account.sourceName}:`,
    account.amount
  );
  if (newAmount !== null && !isNaN(newAmount) && parseFloat(newAmount) >= 0) {
    this.updateSavingsAmount(id, newAmount);
  }
};

FinanceApp.prototype.showSavingsDetailModal = function () {
  console.log('showSavingsDetailModal called');
  const modal = document.getElementById('savingsDetailModal');
  if (!modal) {
    console.error('savingsDetailModal not found');
    return;
  }

  const modalTotal = document.getElementById('modalTotalSavings');
  const modalSources = document.getElementById('modalTotalSources');
  const breakdownList = document.getElementById('savingsBreakdownList');

  const total = this.savingsAccounts.reduce((sum, acc) => sum + acc.amount, 0);
  console.log(
    'Total savings:',
    total,
    'Accounts:',
    this.savingsAccounts.length
  );

  if (modalTotal) modalTotal.textContent = `$${total.toLocaleString()}`;
  if (modalSources) modalSources.textContent = this.savingsAccounts.length;

  if (this.savingsAccounts.length === 0) {
    breakdownList.innerHTML = `
      <div class="empty-state-small">
        <i class="fas fa-piggy-bank"></i>
        <p>No hay fuentes de ahorro para mostrar</p>
      </div>
    `;
  } else {
    breakdownList.innerHTML = this.savingsAccounts
      .map((account) => {
        const icon = this.getSavingsTypeIcon(account.type);
        const typeName = this.getSavingsTypeName(account.type);
        const percentage =
          total > 0 ? ((account.amount / total) * 100).toFixed(1) : 0;

        return `
        <div class="breakdown-item">
          <div class="breakdown-icon ${account.type}">
            <i class="${icon}"></i>
          </div>
          <div class="breakdown-info">
            <div class="breakdown-name">${account.sourceName}</div>
            <div class="breakdown-meta">
              <span class="breakdown-meta-item"><i class="fas fa-tag"></i> ${typeName}</span>
              ${
                account.description
                  ? `<span class="breakdown-meta-item"><i class="fas fa-info-circle"></i> ${account.description}</span>`
                  : ''
              }
            </div>
            <div class="breakdown-percentage">${percentage}% del total</div>
          </div>
          <div class="breakdown-amount">$${account.amount.toLocaleString()}</div>
        </div>
      `;
      })
      .join('');
  }

  modal.classList.add('show');
};

FinanceApp.prototype.updateDashboardSavings = function () {
  const totalSavingsEl = document.getElementById('totalSavings');
  if (!totalSavingsEl) return;

  const total = this.savingsAccounts.reduce((sum, acc) => sum + acc.amount, 0);
  totalSavingsEl.textContent = `$${total.toLocaleString()}`;
};

FinanceApp.prototype.getSavingsTypeIcon = function (type) {
  const icons = {
    retirement: 'fas fa-umbrella',
    emergency: 'fas fa-shield-alt',
    investment: 'fas fa-chart-line',
    savings_account: 'fas fa-university',
    cash: 'fas fa-money-bill-wave',
    goal: 'fas fa-bullseye',
    other: 'fas fa-wallet',
  };
  return icons[type] || 'fas fa-wallet';
};

FinanceApp.prototype.getSavingsTypeName = function (type) {
  const names = {
    retirement: 'Jubilación',
    emergency: 'Emergencia',
    investment: 'Inversión',
    savings_account: 'Cuenta de ahorros',
    cash: 'Efectivo',
    goal: 'Meta específica',
    other: 'Otro',
  };
  return names[type] || 'Otro';
};

/* ============================================
   RECURRING PAYMENTS SYSTEM
   ============================================ */

FinanceApp.prototype.setupPaymentsListeners = function () {
  const paymentForm = document.getElementById('recurringPaymentForm');
  const upcomingPaymentsCard = document.getElementById('upcomingPaymentsCard');
  const paymentsModal = document.getElementById('paymentsDetailModal');
  const closePaymentsDetail = document.getElementById('closePaymentsDetail');

  console.log(
    'Setup payments listeners - Card:',
    upcomingPaymentsCard,
    'Modal:',
    paymentsModal
  );

  if (paymentForm) {
    paymentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addRecurringPayment();
    });
  }

  if (upcomingPaymentsCard) {
    upcomingPaymentsCard.addEventListener('click', () => {
      console.log('Payments card clicked');
      this.showPaymentsDetailModal();
    });
  }

  if (closePaymentsDetail) {
    closePaymentsDetail.addEventListener('click', () => {
      paymentsModal?.classList.remove('show');
    });
  }

  if (paymentsModal) {
    paymentsModal.addEventListener('click', (e) => {
      if (e.target === paymentsModal) {
        paymentsModal.classList.remove('show');
      }
    });
  }
};

FinanceApp.prototype.addRecurringPayment = function () {
  const serviceName = document
    .getElementById('paymentServiceName')
    ?.value.trim();
  const serviceType = document.getElementById('paymentServiceType')?.value;
  const amountInput = document.getElementById('paymentAmount');
  const amount = amountInput ? this.unformatNumber(amountInput.value) : null;
  const dueDay = parseInt(document.getElementById('paymentDueDay')?.value);
  const notes = document.getElementById('paymentNotes')?.value.trim();

  if (!serviceName || !serviceType || !dueDay || dueDay < 1 || dueDay > 31) {
    this.showToast('Por favor completa todos los campos requeridos', 'error');
    return;
  }

  const payment = {
    id: Date.now().toString(),
    serviceName,
    serviceType,
    amount,
    dueDay,
    notes,
    isPaid: false,
    paidDate: null,
    paidAmount: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  this.recurringPayments.push(payment);
  this.saveData();

  const typeInfo = this.getPaymentTypeInfo(serviceType);
  this.logAudit(
    'payment_added',
    'added',
    `Pago recurrente agregado: ${serviceName} (${typeInfo.name})`,
    '',
    { serviceName, serviceType, amount, dueDay }
  );

  this.showToast(
    `Pago recurrente "${serviceName}" agregado exitosamente`,
    'success'
  );
  this.renderRecurringPaymentsList();
  this.updateDashboardPayments();

  // Cerrar modal y limpiar formulario
  const modal = document.getElementById('addPaymentModal');
  if (modal) {
    modal.classList.remove('show');
  }
  document.getElementById('recurringPaymentForm')?.reset();
};

FinanceApp.prototype.renderRecurringPaymentsList = function () {
  const container = document.getElementById('recurringPaymentsList');
  if (!container) return;

  if (this.recurringPayments.length === 0) {
    container.innerHTML = `
      <div class="empty-state-small">
        <i class="fas fa-money-bill-wave"></i>
        <p>No hay pagos recurrentes registrados</p>
      </div>
    `;
    this.updatePaymentsSummary();
    return;
  }

  container.innerHTML = this.recurringPayments
    .map((payment) => {
      const typeInfo = this.getPaymentTypeInfo(payment.serviceType);
      const amountDisplay = payment.amount
        ? `$${payment.amount.toLocaleString()}`
        : 'Variable';
      const statusClass = payment.isPaid ? 'paid' : 'pending';
      const statusText = payment.isPaid ? 'Pagado' : 'Pendiente';

      return `
        <div class="payment-item ${statusClass}">
          <div class="payment-item-icon ${payment.serviceType}">
            <i class="${typeInfo.icon}"></i>
          </div>
          <div class="payment-item-info">
            <div class="payment-item-name">${payment.serviceName}</div>
            <div class="payment-item-meta">
              <span><i class="fas fa-tag"></i> ${typeInfo.name}</span>
              <span><i class="fas fa-calendar-day"></i> Día ${
                payment.dueDay
              }</span>
              <span class="payment-item-status ${statusClass}">
                <i class="fas fa-${
                  payment.isPaid ? 'check-circle' : 'clock'
                }"></i>
                ${statusText}
              </span>
            </div>
          </div>
          <div class="payment-item-amount">${amountDisplay}</div>
          <div class="payment-item-actions">
            <button class="btn-icon" onclick="app.editRecurringPayment('${
              payment.id
            }')" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon delete" onclick="app.deleteRecurringPayment('${
              payment.id
            }')" title="Eliminar">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  this.updatePaymentsSummary();
};

FinanceApp.prototype.updatePaymentsSummary = function () {
  const totalEl = document.getElementById('totalMonthlyPayments');
  const countEl = document.getElementById('totalPaymentServices');

  const total = this.recurringPayments
    .filter((p) => p.amount)
    .reduce((sum, p) => sum + p.amount, 0);

  if (totalEl) {
    totalEl.textContent = `$${total.toLocaleString()}`;
  }

  if (countEl) {
    countEl.textContent = this.recurringPayments.length;
  }
};

FinanceApp.prototype.deleteRecurringPayment = function (id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este pago recurrente?')) {
    return;
  }

  const index = this.recurringPayments.findIndex((p) => p.id === id);
  if (index === -1) return;

  const payment = this.recurringPayments[index];
  this.recurringPayments.splice(index, 1);
  this.saveData();

  this.logAudit(
    'payment_deleted',
    'deleted',
    `Pago recurrente eliminado: ${payment.serviceName}`,
    '',
    { serviceName: payment.serviceName, serviceType: payment.serviceType }
  );

  this.showToast('Pago recurrente eliminado', 'success');
  this.renderRecurringPaymentsList();
  this.updateDashboardPayments();
};

FinanceApp.prototype.editRecurringPayment = function (id) {
  const payment = this.recurringPayments.find((p) => p.id === id);
  if (!payment) return;

  document.getElementById('paymentServiceName').value = payment.serviceName;
  document.getElementById('paymentServiceType').value = payment.serviceType;
  document.getElementById('paymentAmount').value = payment.amount || '';
  document.getElementById('paymentDueDay').value = payment.dueDay;
  document.getElementById('paymentNotes').value = payment.notes || '';

  this.deleteRecurringPayment(id);
  document.getElementById('paymentServiceName').focus();
  this.showToast('Editando pago. Modifica los campos y guarda', 'info');
};

FinanceApp.prototype.updateDashboardPayments = function () {
  this.checkMonthlyReset();

  const paymentsList = document.getElementById('paymentsList');
  const paymentCount = document.getElementById('paymentCount');

  if (!paymentsList) return;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthPayments = this.recurringPayments.map((payment) => {
    if (
      payment.currentMonth !== currentMonth ||
      payment.currentYear !== currentYear
    ) {
      payment.isPaid = false;
      payment.paidDate = null;
      payment.paidAmount = null;
      payment.currentMonth = currentMonth;
      payment.currentYear = currentYear;
    }
    return payment;
  });

  this.saveData();

  const pendingPayments = currentMonthPayments.filter((p) => !p.isPaid);
  const paidPayments = currentMonthPayments.filter((p) => p.isPaid);

  const allPayments = [...pendingPayments, ...paidPayments];

  if (allPayments.length === 0) {
    paymentsList.innerHTML = `
      <div class="empty-state-small">
        <i class="fas fa-money-bill-wave"></i>
        <p>No hay pagos registrados</p>
        <p class="empty-state-hint">Configura tus pagos recurrentes en Configuración</p>
      </div>
    `;
    if (paymentCount) {
      paymentCount.textContent = '0 pendientes';
    }
    return;
  }

  paymentsList.innerHTML = allPayments
    .map((payment) => {
      const typeInfo = this.getPaymentTypeInfo(payment.serviceType);
      const amountDisplay =
        payment.isPaid && payment.paidAmount
          ? `$${payment.paidAmount.toLocaleString()}`
          : payment.amount
          ? `$${payment.amount.toLocaleString()}`
          : 'Variable';

      const statusClass = payment.isPaid ? 'paid' : 'pending';
      const statusIcon = payment.isPaid ? 'check-circle' : 'exclamation-circle';
      const statusText = payment.isPaid
        ? 'Pagado'
        : `Vence el ${payment.dueDay}`;

      return `
        <div class="payment-item-compact ${statusClass}">
          <div class="payment-item-icon ${payment.serviceType}">
            <i class="${typeInfo.icon}"></i>
          </div>
          <div class="payment-item-info">
            <div class="payment-item-name">${payment.serviceName}</div>
            <div class="payment-item-meta">
              <span class="payment-date-badge">
                <i class="fas fa-calendar-day"></i> ${statusText}
              </span>
            </div>
          </div>
          <div class="payment-item-status ${statusClass}">
            <i class="fas fa-${statusIcon}"></i>
            ${amountDisplay}
          </div>
        </div>
      `;
    })
    .join('');

  if (paymentCount) {
    paymentCount.textContent = `${pendingPayments.length} pendiente${
      pendingPayments.length !== 1 ? 's' : ''
    }`;
  }
};

FinanceApp.prototype.showPaymentsDetailModal = function () {
  console.log('showPaymentsDetailModal called');
  const modal = document.getElementById('paymentsDetailModal');
  console.log('Modal element:', modal);
  if (!modal) return;

  this.checkMonthlyReset();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const pendingPayments = this.recurringPayments.filter((p) => !p.isPaid);
  const paidPayments = this.recurringPayments.filter((p) => p.isPaid);

  const totalMonthly = this.recurringPayments
    .filter((p) => p.amount)
    .reduce((sum, p) => sum + p.amount, 0);

  document.getElementById('modalPendingPayments').textContent =
    pendingPayments.length;
  document.getElementById('modalPaidPayments').textContent =
    paidPayments.length;
  document.getElementById(
    'modalTotalMonthlyAmount'
  ).textContent = `$${totalMonthly.toLocaleString()}`;

  const pendingList = document.getElementById('pendingPaymentsList');
  const paidList = document.getElementById('paidPaymentsList');

  if (pendingPayments.length === 0) {
    pendingList.innerHTML = `
      <div class="empty-state-small">
        <i class="fas fa-check-circle"></i>
        <p>¡Todos los pagos están al día!</p>
      </div>
    `;
  } else {
    pendingList.innerHTML = pendingPayments
      .map((payment) => this.renderPaymentDetailItem(payment, 'pending'))
      .join('');
  }

  if (paidPayments.length === 0) {
    paidList.innerHTML = `
      <div class="empty-state-small">
        <i class="fas fa-info-circle"></i>
        <p>Aún no hay pagos realizados este mes</p>
      </div>
    `;
  } else {
    paidList.innerHTML = paidPayments
      .map((payment) => this.renderPaymentDetailItem(payment, 'paid'))
      .join('');
  }

  modal.classList.add('show');
};

FinanceApp.prototype.renderPaymentDetailItem = function (payment, status) {
  const typeInfo = this.getPaymentTypeInfo(payment.serviceType);
  const amountDisplay =
    status === 'paid' && payment.paidAmount
      ? `$${payment.paidAmount.toLocaleString()}`
      : payment.amount
      ? `$${payment.amount.toLocaleString()}`
      : 'Sin monto fijo';

  const statusBadge =
    status === 'pending'
      ? `<span class="payment-status-badge pending"><i class="fas fa-clock"></i> Pendiente</span>`
      : `<span class="payment-status-badge paid"><i class="fas fa-check-circle"></i> Pagado</span>`;

  const actionButton =
    status === 'pending'
      ? `<button class="payment-action-button mark-paid" onclick="app.markPaymentAsPaid('${payment.id}')">
         <i class="fas fa-check"></i> Marcar como pagado
       </button>`
      : payment.paidDate
      ? `<div class="payment-paid-date">
         <i class="fas fa-calendar-check"></i>
         ${new Date(payment.paidDate).toLocaleDateString('es-ES')}
       </div>`
      : '';

  return `
    <div class="payment-detail-item ${status}">
      <div class="payment-detail-icon ${payment.serviceType}">
        <i class="${typeInfo.icon}"></i>
      </div>
      <div class="payment-detail-info">
        <div class="payment-detail-name">${payment.serviceName}</div>
        <div class="payment-detail-meta">
          <span class="payment-detail-meta-item">
            <i class="fas fa-tag"></i> ${typeInfo.name}
          </span>
          <span class="payment-detail-meta-item">
            <i class="fas fa-calendar-day"></i> Vence el día ${payment.dueDay}
          </span>
          ${
            payment.notes
              ? `<span class="payment-detail-meta-item"><i class="fas fa-sticky-note"></i> ${payment.notes}</span>`
              : ''
          }
        </div>
      </div>
      <div class="payment-detail-amount">${amountDisplay}</div>
      <div class="payment-detail-status">
        ${statusBadge}
        ${actionButton}
      </div>
    </div>
  `;
};

FinanceApp.prototype.markPaymentAsPaid = function (id) {
  const payment = this.recurringPayments.find((p) => p.id === id);
  if (!payment) return;

  let paidAmount = payment.amount;

  if (!payment.amount) {
    const input = prompt(`¿Cuánto pagaste por "${payment.serviceName}"?`);
    if (input === null) return;
    paidAmount = parseFloat(input);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      this.showToast('Monto inválido', 'error');
      return;
    }
  }

  payment.isPaid = true;
  payment.paidDate = Date.now();
  payment.paidAmount = paidAmount;
  payment.updatedAt = Date.now();

  this.saveData();

  const typeInfo = this.getPaymentTypeInfo(payment.serviceType);
  this.logAudit(
    'payment_paid',
    'edited',
    `Pago marcado como pagado: ${
      payment.serviceName
    } - $${paidAmount.toLocaleString()}`,
    '',
    {
      serviceName: payment.serviceName,
      amount: paidAmount,
      paidDate: new Date(payment.paidDate).toLocaleDateString('es-ES'),
    }
  );

  this.showToast(
    `Pago de "${payment.serviceName}" marcado como pagado`,
    'success'
  );
  this.updateDashboardPayments();
  this.showPaymentsDetailModal();
};

FinanceApp.prototype.checkMonthlyReset = function () {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let needsUpdate = false;

  this.recurringPayments.forEach((payment) => {
    if (
      payment.currentMonth !== currentMonth ||
      payment.currentYear !== currentYear
    ) {
      payment.isPaid = false;
      payment.paidDate = null;
      payment.paidAmount = null;
      payment.currentMonth = currentMonth;
      payment.currentYear = currentYear;
      needsUpdate = true;
    }
  });

  if (needsUpdate) {
    this.saveData();
  }
};

FinanceApp.prototype.getPaymentTypeInfo = function (typeId) {
  return (
    this.paymentServiceTypes.find((t) => t.id === typeId) ||
    this.paymentServiceTypes[this.paymentServiceTypes.length - 1]
  );
};

/* ============================================
   EXPENSES DETAIL MODAL SYSTEM
   ============================================ */

FinanceApp.prototype.setupExpensesModalListener = function () {
  const expensesCard = document.getElementById('totalExpensesCard');
  const expensesModal = document.getElementById('expensesDetailModal');
  const closeExpensesDetail = document.getElementById('closeExpensesDetail');

  console.log(
    'Setup expenses modal - Card:',
    expensesCard,
    'Modal:',
    expensesModal
  );

  if (expensesCard) {
    expensesCard.addEventListener('click', () => {
      console.log('Expenses card clicked');
      this.showExpensesDetailModal();
    });
  } else {
    console.warn('Total expenses card not found');
  }

  if (closeExpensesDetail) {
    closeExpensesDetail.addEventListener('click', () => {
      expensesModal?.classList.remove('show');
    });
  }

  if (expensesModal) {
    expensesModal.addEventListener('click', (e) => {
      if (e.target === expensesModal) {
        expensesModal.classList.remove('show');
      }
    });
  }
};

FinanceApp.prototype.showExpensesDetailModal = function () {
  console.log('showExpensesDetailModal called');
  const modal = document.getElementById('expensesDetailModal');
  if (!modal) {
    console.error('Modal expensesDetailModal not found');
    return;
  }

  // Obtener gastos del mes actual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);

  const monthlyExpenses = this.expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= firstDayOfMonth;
  });

  console.log('Monthly expenses:', monthlyExpenses.length);

  // Calcular total de gastos
  const totalAmount = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Actualizar período
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  document.getElementById('expensesPeriod').textContent = `1 de ${
    monthNames[currentMonth]
  } - ${now.getDate()} de ${monthNames[currentMonth]}`;

  // Actualizar total
  document.getElementById(
    'modalTotalExpenses'
  ).textContent = `$${totalAmount.toLocaleString()}`;

  // Estadísticas generales
  document.getElementById('modalTotalTransactions').textContent =
    monthlyExpenses.length;

  // Análisis por necesidad
  const necessityAnalysis = this.analyzeNecessity(monthlyExpenses, totalAmount);
  document.getElementById(
    'modalNecessaryPercentage'
  ).textContent = `${necessityAnalysis.necessaryPercent}%`;
  document.getElementById(
    'modalNecessaryAmount'
  ).textContent = `$${necessityAnalysis.necessaryAmount.toLocaleString()} en gastos esenciales`;
  document.getElementById(
    'modalUnnecessaryPercentage'
  ).textContent = `${necessityAnalysis.unnecessaryPercent}%`;
  document.getElementById(
    'modalUnnecessaryAmount'
  ).textContent = `$${necessityAnalysis.unnecessaryAmount.toLocaleString()} en gastos prescindibles`;

  // Servicios pagados
  const servicesPaid = this.getServicesPaid(monthlyExpenses);
  document.getElementById('modalServicesPaid').textContent = servicesPaid.count;
  document.getElementById(
    'modalServicesAmount'
  ).textContent = `$${servicesPaid.amount.toLocaleString()} en servicios`;

  // Renderizar secciones
  this.renderNecessityBars(monthlyExpenses, totalAmount);
  this.renderServicesPaidList(servicesPaid.services);
  this.renderCategoriesBreakdown(monthlyExpenses);
  this.renderMonthlyTransactions(monthlyExpenses);
  this.renderFinancialInsight(monthlyExpenses, totalAmount, necessityAnalysis);

  console.log('Opening modal...');
  modal.classList.add('show');
  console.log('Modal classes:', modal.classList);

  // Inicializar scroll horizontal para las tarjetas de estadísticas
  this.initializeStatsScroll();
};

// Inicializar scroll horizontal para las tarjetas de estadísticas
FinanceApp.prototype.initializeStatsScroll = function () {
  const scrollContainer = document.getElementById('expensesStatsGrid');
  const scrollLeftBtn = document.getElementById('scrollStatsLeft');
  const scrollRightBtn = document.getElementById('scrollStatsRight');

  if (!scrollContainer || !scrollLeftBtn || !scrollRightBtn) {
    return;
  }

  // Función para actualizar visibilidad de botones
  const updateButtonsVisibility = () => {
    const scrollLeft = scrollContainer.scrollLeft;
    const scrollWidth = scrollContainer.scrollWidth;
    const clientWidth = scrollContainer.clientWidth;

    // Ocultar botón izquierdo si está al inicio
    if (scrollLeft <= 0) {
      scrollLeftBtn.classList.add('hidden');
    } else {
      scrollLeftBtn.classList.remove('hidden');
    }

    // Ocultar botón derecho si está al final
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
      scrollRightBtn.classList.add('hidden');
    } else {
      scrollRightBtn.classList.remove('hidden');
    }
  };

  // Función para hacer scroll
  const scrollCards = (direction) => {
    const scrollAmount = 300; // Píxeles a desplazar
    const targetScroll =
      scrollContainer.scrollLeft +
      (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  // Event listeners para los botones
  scrollLeftBtn.addEventListener('click', () => scrollCards('left'));
  scrollRightBtn.addEventListener('click', () => scrollCards('right'));

  // Event listener para actualizar botones al hacer scroll
  scrollContainer.addEventListener('scroll', updateButtonsVisibility);

  // Inicializar visibilidad de botones
  updateButtonsVisibility();
};

FinanceApp.prototype.analyzeNecessity = function (expenses, total) {
  const necessary = ['Muy Necesario', 'Necesario'];
  const unnecessary = [
    'Poco Necesario',
    'No Necesario',
    'Compra por Impulso',
    'Malgasto',
  ];

  const necessaryExpenses = expenses.filter((e) =>
    necessary.includes(e.necessity)
  );
  const unnecessaryExpenses = expenses.filter((e) =>
    unnecessary.includes(e.necessity)
  );

  const necessaryAmount = necessaryExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const unnecessaryAmount = unnecessaryExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  return {
    necessaryAmount,
    unnecessaryAmount,
    necessaryPercent:
      total > 0 ? Math.round((necessaryAmount / total) * 100) : 0,
    unnecessaryPercent:
      total > 0 ? Math.round((unnecessaryAmount / total) * 100) : 0,
  };
};

FinanceApp.prototype.getServicesPaid = function (expenses) {
  const serviceCategories = ['Servicios'];
  const services = expenses.filter((e) =>
    serviceCategories.includes(e.category)
  );
  const amount = services.reduce((sum, e) => sum + e.amount, 0);

  return {
    count: services.length,
    amount,
    services,
  };
};

FinanceApp.prototype.renderNecessityBars = function (expenses, total) {
  const container = document.getElementById('necessityBarsContainer');
  if (!container) return;

  const necessityLevels = [
    { name: 'Muy Necesario', class: 'very-necessary' },
    { name: 'Necesario', class: 'necessary' },
    { name: 'Poco Necesario', class: 'little-necessary' },
    { name: 'No Necesario', class: 'not-necessary' },
    { name: 'Compra por Impulso', class: 'impulse' },
    { name: 'Malgasto', class: 'waste' },
  ];

  container.innerHTML = necessityLevels
    .map((level) => {
      const levelExpenses = expenses.filter((e) => e.necessity === level.name);
      const levelAmount = levelExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage =
        total > 0 ? Math.round((levelAmount / total) * 100) : 0;

      return `
      <div class="necessity-bar-item">
        <div class="necessity-bar-label">${level.name}</div>
        <div class="necessity-bar-wrapper">
          <div class="necessity-bar-fill ${
            level.class
          }" style="width: ${percentage}%">
            ${percentage}%
          </div>
        </div>
        <div class="necessity-bar-value">$${levelAmount.toLocaleString()}</div>
      </div>
    `;
    })
    .join('');
};

FinanceApp.prototype.renderServicesPaidList = function (services) {
  const container = document.getElementById('servicesPaidList');
  if (!container) return;

  if (services.length === 0) {
    container.innerHTML = `
      <div class="empty-state-small">
        <i class="fas fa-hand-holding-usd"></i>
        <p>No hay servicios pagados este mes</p>
      </div>
    `;
    return;
  }

  container.innerHTML = services
    .map((service) => {
      const typeInfo =
        this.paymentServiceTypes.find((t) =>
          service.description.toLowerCase().includes(t.name.toLowerCase())
        ) || this.paymentServiceTypes[this.paymentServiceTypes.length - 1];

      return `
      <div class="service-paid-item">
        <div class="service-paid-icon ${typeInfo.id}">
          <i class="${typeInfo.icon}"></i>
        </div>
        <div class="service-paid-info">
          <div class="service-paid-name">${service.description}</div>
          <div class="service-paid-amount">$${service.amount.toLocaleString()}</div>
        </div>
      </div>
    `;
    })
    .join('');
};

FinanceApp.prototype.renderCategoriesBreakdown = function (expenses) {
  const container = document.getElementById('categoriesBreakdown');
  if (!container) return;

  const categoryTotals = {};
  expenses.forEach((expense) => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = { amount: 0, count: 0 };
    }
    categoryTotals[expense.category].amount += expense.amount;
    categoryTotals[expense.category].count++;
  });

  const categoryIcons = {
    Alimentación: 'fas fa-utensils',
    Transporte: 'fas fa-car',
    Entretenimiento: 'fas fa-gamepad',
    Salud: 'fas fa-heartbeat',
    Servicios: 'fas fa-receipt',
    Compras: 'fas fa-shopping-bag',
    Otros: 'fas fa-ellipsis-h',
  };

  container.innerHTML = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .map(
      ([category, data]) => `
      <div class="category-item">
        <div class="category-header">
          <div class="category-icon">
            <i class="${categoryIcons[category] || 'fas fa-tag'}"></i>
          </div>
          <div class="category-name">${category}</div>
        </div>
        <div class="category-amount">$${data.amount.toLocaleString()}</div>
        <div class="category-count">${data.count} transaccion${
        data.count !== 1 ? 'es' : ''
      }</div>
      </div>
    `
    )
    .join('');
};

FinanceApp.prototype.renderMonthlyTransactions = function (expenses) {
  const container = document.getElementById('recentTransactionsList');
  if (!container) return;

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  if (recentExpenses.length === 0) {
    container.innerHTML = `
      <div class="empty-state-small">
        <i class="fas fa-receipt"></i>
        <p>No hay transacciones este mes</p>
      </div>
    `;
    return;
  }

  const categoryIcons = {
    Alimentación: 'fas fa-utensils',
    Transporte: 'fas fa-car',
    Entretenimiento: 'fas fa-gamepad',
    Salud: 'fas fa-heartbeat',
    Servicios: 'fas fa-receipt',
    Compras: 'fas fa-shopping-bag',
    Otros: 'fas fa-ellipsis-h',
  };

  container.innerHTML = recentExpenses
    .map((expense) => {
      const date = new Date(expense.date);
      const formattedDate = `${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`;

      return `
      <div class="transaction-item">
        <div class="transaction-icon">
          <i class="${categoryIcons[expense.category] || 'fas fa-receipt'}"></i>
        </div>
        <div class="transaction-info">
          <div class="transaction-description">${expense.description}</div>
          <div class="transaction-meta">
            <span><i class="fas fa-tag"></i> ${expense.category}</span>
            <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
            ${
              expense.user
                ? `<span><i class="fas fa-user"></i> ${expense.user}</span>`
                : ''
            }
          </div>
        </div>
        <div class="transaction-amount">$${expense.amount.toLocaleString()}</div>
      </div>
    `;
    })
    .join('');
};

FinanceApp.prototype.renderFinancialInsight = function (
  expenses,
  total,
  analysis
) {
  const insightEl = document.getElementById('financialInsight');
  if (!insightEl) return;

  let insight = `Este mes has realizado <strong>${
    expenses.length
  } transacciones</strong> por un total de <strong>$${total.toLocaleString()}</strong>. `;

  if (analysis.necessaryPercent >= 70) {
    insight += `¡Excelente! El <strong>${analysis.necessaryPercent}%</strong> de tus gastos son necesarios, lo que demuestra una gestión financiera muy responsable. `;
  } else if (analysis.necessaryPercent >= 50) {
    insight += `El <strong>${analysis.necessaryPercent}%</strong> de tus gastos son necesarios. Hay margen para optimizar, pero vas por buen camino. `;
  } else {
    insight += `Solo el <strong>${analysis.necessaryPercent}%</strong> de tus gastos son necesarios. Considera reducir gastos prescindibles para mejorar tu salud financiera. `;
  }

  if (analysis.unnecessaryAmount > 0) {
    insight += `Has gastado <strong>$${analysis.unnecessaryAmount.toLocaleString()}</strong> en compras no esenciales. `;
    if (analysis.unnecessaryPercent > 30) {
      insight += `<strong>Recomendación:</strong> Intenta reducir este tipo de gastos en un 20% el próximo mes para aumentar tu capacidad de ahorro.`;
    } else {
      insight += `Mantén este balance para alcanzar tus metas financieras más rápido.`;
    }
  }

  insightEl.innerHTML = insight;
};

// ========================================
// BUDGET SYSTEM (Envelope Budgeting)
// ========================================

FinanceApp.prototype.getCurrentMonthKey = function () {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

FinanceApp.prototype.getMonthName = function (monthKey) {
  const [year, month] = monthKey.split('-');
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

FinanceApp.prototype.setupBudget = function (monthKey, budgetConfig) {
  if (!this.budgets[monthKey]) {
    this.budgets[monthKey] = {
      categories: {},
      totalLimit: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
  }

  let totalLimit = 0;
  const categories = [
    'Alimentación',
    'Transporte',
    'Entretenimiento',
    'Salud',
    'Servicios',
    'Compras',
    'Otros',
  ];

  categories.forEach((category) => {
    const limit = parseFloat(budgetConfig[category]) || 0;
    this.budgets[monthKey].categories[category] = {
      limit: limit,
      spent: 0,
      alerts: true,
    };
    totalLimit += limit;
  });

  this.budgets[monthKey].totalLimit = totalLimit;
  this.updateBudgetSpending(monthKey);
  this.saveData();
};

FinanceApp.prototype.updateBudgetSpending = function (monthKey) {
  if (!this.budgets[monthKey]) return;

  const budget = this.budgets[monthKey];
  const [year, month] = monthKey.split('-');

  // Validar que existan las propiedades necesarias
  if (!budget.categories) {
    budget.categories = {};
  }
  if (!this.expenses) {
    this.expenses = [];
  }

  // Reset spent amounts
  Object.keys(budget.categories).forEach((category) => {
    if (!budget.categories[category]) {
      budget.categories[category] = { limit: 0, spent: 0 };
    }
    budget.categories[category].spent = 0;
  });

  if (typeof budget.totalSpent === 'undefined') {
    budget.totalSpent = 0;
  } else {
    budget.totalSpent = 0;
  }

  // Calculate spent amounts from expenses
  this.expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = String(expenseDate.getMonth() + 1).padStart(2, '0');
    const expenseMonthKey = `${expenseYear}-${expenseMonth}`;

    if (expenseMonthKey === monthKey && budget.categories[expense.category]) {
      budget.categories[expense.category].spent += parseFloat(expense.amount);
      budget.totalSpent += parseFloat(expense.amount);
    }
  });

  this.saveData();
};

// ========================================
// LEISURE BUDGET FUNCTIONS
// ========================================

FinanceApp.prototype.addLeisureItem = function (monthKey, description, amount) {
  console.log('🎉 addLeisureItem called with:', {
    monthKey,
    description,
    amount,
    amountType: typeof amount,
  });

  // Limpiar estructura antigua si existe
  if (!this.budgets[monthKey]) {
    this.budgets[monthKey] = {
      leisureItems: [],
      totalLimit: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
  } else if (this.budgets[monthKey].categories) {
    // Migrar de estructura antigua a nueva
    console.log(
      '⚠️ Migrando de estructura antigua (categories) a nueva (leisureItems)'
    );
    this.budgets[monthKey] = {
      leisureItems: [],
      totalLimit: 0,
      totalSpent: 0,
      createdAt: this.budgets[monthKey].createdAt || new Date().toISOString(),
    };
  }

  if (!this.budgets[monthKey].leisureItems) {
    this.budgets[monthKey].leisureItems = [];
  }

  const numericAmount = Number(amount);

  this.budgets[monthKey].leisureItems.push({
    description: description,
    amount: numericAmount,
    createdAt: new Date().toISOString(),
  });

  console.log('📋 Current leisureItems:', this.budgets[monthKey].leisureItems);

  // Recalcular total
  this.budgets[monthKey].totalLimit = this.budgets[
    monthKey
  ].leisureItems.reduce((sum, item) => {
    console.log('  Adding:', item.amount, 'to sum:', sum);
    return sum + item.amount;
  }, 0);

  console.log('💰 Total budget calculated:', this.budgets[monthKey].totalLimit);

  this.updateLeisureBudgetSpending(monthKey);
  this.saveData();
  this.renderBudgetSection();
  this.showToast(`Gasto de ocio agregado: ${description}`, 'success');
};

FinanceApp.prototype.removeLeisureItem = function (monthKey, index) {
  if (!this.budgets[monthKey] || !this.budgets[monthKey].leisureItems) return;

  const item = this.budgets[monthKey].leisureItems[index];
  this.budgets[monthKey].leisureItems.splice(index, 1);

  // Recalcular total
  this.budgets[monthKey].totalLimit = this.budgets[
    monthKey
  ].leisureItems.reduce((sum, item) => sum + item.amount, 0);

  this.updateLeisureBudgetSpending(monthKey);
  this.saveData();
  this.renderBudgetSection();
  this.showToast(`Gasto de ocio eliminado: ${item.description}`, 'info');

  console.log('🗑️ Leisure item removed:', { monthKey, index, item });
};

FinanceApp.prototype.markLeisureItemAsUsed = function (monthKey, index) {
  if (!this.budgets[monthKey] || !this.budgets[monthKey].leisureItems) return;

  const item = this.budgets[monthKey].leisureItems[index];

  if (item.used) {
    this.showToast('Este gasto de ocio ya fue marcado como usado', 'info');
    return;
  }

  console.log('✅ Marking leisure item as used:', { monthKey, index, item });

  // Marcar como usado
  item.used = true;
  item.usedDate = new Date().toISOString();

  // Crear gasto automáticamente
  const newExpense = {
    id: Date.now(),
    description: `Ocio: ${item.description}`,
    amount: item.amount,
    category: 'Entretenimiento',
    date: new Date().toISOString(),
    user: this.currentUser || 'Daniel',
    necessity: 'No Necesario', // Marcado como gasto de ocio
    isProtected: false,
  };

  this.expenses.push(newExpense);

  // Actualizar spending
  this.updateLeisureBudgetSpending(monthKey);

  // Guardar y actualizar UI completa
  this.saveData();
  this.renderDashboard();

  // Actualizar la lista de gastos si estamos en esa sección
  if (document.getElementById('expenses').style.display !== 'none') {
    this.renderExpenses();
  }

  // Actualizar análisis si está visible
  if (document.getElementById('analysis').style.display !== 'none') {
    this.renderAnalysis();
  }

  // Cerrar el modal actual y mostrar uno nuevo actualizado
  const modalOverlay = document.getElementById('budgetModalOverlay');
  if (modalOverlay) {
    modalOverlay.remove();
  }

  this.showBudgetModal();
  this.showToast(
    `💰 Gasto registrado: ${
      item.description
    } por $${item.amount.toLocaleString()}`,
    'success'
  );

  console.log('💰 Expense created from leisure item:', newExpense);
};

FinanceApp.prototype.updateLeisureBudgetSpending = function (monthKey) {
  if (!this.budgets[monthKey]) return;

  const budget = this.budgets[monthKey];
  const [year, month] = monthKey.split('-');

  budget.totalSpent = 0;

  // Calcular gastos extras (solo los no esenciales)
  this.expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = String(expenseDate.getMonth() + 1).padStart(2, '0');
    const expenseMonthKey = `${expenseYear}-${expenseMonth}`;

    if (expenseMonthKey === monthKey) {
      // Solo contar gastos de ocio
      if (
        expense.necessity === 'Poco Necesario' ||
        expense.necessity === 'No Necesario' ||
        expense.necessity === 'Compra por Impulso'
      ) {
        budget.totalSpent += parseFloat(expense.amount);
      }
    }
  });

  this.saveData();
};

FinanceApp.prototype.checkBudgetAlerts = function (monthKey) {
  if (!this.budgets[monthKey]) return [];

  const alerts = [];
  const budget = this.budgets[monthKey];

  Object.entries(budget.categories).forEach(([category, data]) => {
    if (data.limit === 0) return;

    const percentage = (data.spent / data.limit) * 100;

    if (percentage >= 100) {
      alerts.push({
        category,
        type: 'danger',
        message: `¡Has superado el presupuesto de ${category}! (${percentage.toFixed(
          0
        )}%)`,
      });
    } else if (percentage >= 80) {
      alerts.push({
        category,
        type: 'warning',
        message: `Te acercas al límite en ${category} (${percentage.toFixed(
          0
        )}%)`,
      });
    }
  });

  return alerts;
};

FinanceApp.prototype.renderBudgetSection = function () {
  const monthKey = this.currentBudgetMonth;
  const monthLabel = document.getElementById('currentBudgetMonth');
  if (monthLabel) {
    monthLabel.textContent = this.getMonthName(monthKey);
  }

  this.renderBudgetSummary(monthKey);
  this.renderLeisureItemsList(monthKey);
  this.renderBudgetProgress(monthKey);
};

FinanceApp.prototype.renderBudgetSummary = function (monthKey) {
  const budget = this.budgets[monthKey] || {
    totalLimit: 0,
    totalSpent: 0,
    categories: {},
  };

  const available = budget.totalLimit - budget.totalSpent;
  const percentage =
    budget.totalLimit > 0
      ? Math.min((budget.totalSpent / budget.totalLimit) * 100, 100)
      : 0;

  document.getElementById(
    'totalBudgetLimit'
  ).textContent = `$${this.formatNumber(budget.totalLimit)}`;
  document.getElementById(
    'totalBudgetSpent'
  ).textContent = `$${this.formatNumber(budget.totalSpent)}`;
  document.getElementById(
    'totalBudgetAvailable'
  ).textContent = `$${this.formatNumber(Math.max(available, 0))}`;
  document.getElementById(
    'overallBudgetPercentage'
  ).textContent = `${percentage.toFixed(0)}%`;

  const progressBar = document.getElementById('overallBudgetProgress');
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.className = 'progress-fill';
    if (percentage >= 100) {
      progressBar.classList.add('danger');
    } else if (percentage >= 80) {
      progressBar.classList.add('warning');
    }
  }
};

FinanceApp.prototype.renderLeisureItemsList = function (monthKey) {
  const container = document.getElementById('leisureItemsList');
  if (!container) return;

  const budget = this.budgets[monthKey];

  if (!budget || !budget.leisureItems || budget.leisureItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 20px; text-align: center; color: var(--color-text-muted);">
        <i class="fas fa-gift" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
        <p>No hay gastos de ocio configurados</p>
        <p style="font-size: 0.9rem;">Agrega un gasto usando el formulario de abajo</p>
      </div>
    `;
    return;
  }

  container.innerHTML = budget.leisureItems
    .map(
      (item, index) => `
    <div class="leisure-item" data-index="${index}">
      <div class="leisure-item-icon">
        <i class="fas fa-star"></i>
      </div>
      <div class="leisure-item-content">
        <div class="leisure-item-description">${item.description}</div>
        <div class="leisure-item-amount">$${item.amount.toLocaleString()}</div>
      </div>
      <button type="button" class="leisure-item-delete" data-index="${index}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `
    )
    .join('');

  // Agregar event listeners para eliminar items
  container.querySelectorAll('.leisure-item-delete').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.currentTarget.getAttribute('data-index'));
      this.removeLeisureItem(monthKey, index);
    });
  });
};

FinanceApp.prototype.renderBudgetProgress = function (monthKey) {
  const container = document.getElementById('budgetCategoriesProgress');
  if (!container) return;

  const budget = this.budgets[monthKey];
  if (!budget || !budget.leisureItems || budget.leisureItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-gift"></i>
        <p>No hay gastos de ocio configurados</p>
        <p class="text-muted">Agrega gastos de ocio para ver su progreso aquí</p>
      </div>
    `;
    return;
  }

  container.innerHTML = budget.leisureItems
    .map((item, index) => {
      // Por lógica: no podemos saber específicamente qué se gastó en cada item
      // Solo mostramos el límite configurado
      const itemLimit = item.amount;
      const itemSpent = 0; // Siempre 0 porque no hay tracking específico
      const itemRemaining = itemLimit;
      const itemExceeded = 0; // Solo si manualmente se marca

      return `
      <div class="budget-category-progress">
        <div class="budget-category-progress-header">
          <div class="budget-category-info">
            <i class="fas fa-star category-icon category-icon--entertainment"></i>
            <span class="category-name">${item.description}</span>
          </div>
          <div class="budget-category-amounts">
            <div class="budget-category-amounts-row">
              <span class="budget-amount-label">Límite:</span>
              <span class="budget-amount-value">$${itemLimit.toLocaleString()}</span>
            </div>
            <div class="budget-category-amounts-row">
              <span class="budget-amount-label">Gastado:</span>
              <span class="budget-amount-value spent">$${itemSpent.toLocaleString()}</span>
            </div>
            <div class="budget-category-amounts-row">
              <span class="budget-amount-label">Restante:</span>
              <span class="budget-amount-value available">$${itemRemaining.toLocaleString()}</span>
            </div>
            <div class="budget-category-amounts-row">
              <span class="budget-amount-label">Excedido:</span>
              <span class="budget-amount-value exceeded">$${itemExceeded.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
};

FinanceApp.prototype.setupBudgetListeners = function () {
  // Format amount input with thousands separator
  const amountInput = document.getElementById('leisureItemAmount');
  if (amountInput) {
    amountInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/[^0-9]/g, ''); // Solo números
      if (value) {
        // Formatear con separador de miles
        e.target.value = parseInt(value, 10).toLocaleString('es-ES');
      }
    });
  }

  // Add leisure item button
  const addLeisureBtn = document.getElementById('addLeisureItemBtn');
  if (addLeisureBtn) {
    addLeisureBtn.addEventListener('click', () => {
      const descInput = document.getElementById('leisureItemDescription');
      const amountInput = document.getElementById('leisureItemAmount');

      const description = descInput.value.trim();
      const amountRaw = amountInput.value.trim();

      // Limpiar el valor: eliminar todo lo que no sea dígito
      const amountCleaned = amountRaw.replace(/[^0-9]/g, '');
      const amount = parseInt(amountCleaned, 10) || 0;

      console.log('🎉 Adding leisure item:', {
        description,
        amountRaw,
        amountCleaned,
        amount,
        type: typeof amount,
      });

      if (!description) {
        this.showToast('Debes especificar para qué es el gasto', 'error');
        return;
      }

      if (amount <= 0) {
        this.showToast('El monto debe ser mayor a 0', 'error');
        return;
      }

      this.addLeisureItem(this.currentBudgetMonth, description, amount);

      // Limpiar inputs
      descInput.value = '';
      amountInput.value = '';
      descInput.focus();
    });
  }

  // Budget setup form (save all leisure items)
  const budgetForm = document.getElementById('budgetSetupForm');
  if (budgetForm) {
    budgetForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const monthKey = this.currentBudgetMonth;
      const budget = this.budgets[monthKey];

      if (!budget || !budget.leisureItems || budget.leisureItems.length === 0) {
        this.showToast(
          'Agrega al menos un gasto de ocio antes de guardar',
          'error'
        );
        return;
      }

      console.log('💾 Guardando presupuesto de ocio:', {
        month: monthKey,
        leisureItems: budget.leisureItems,
        totalBudget: budget.totalLimit,
      });

      this.saveData();
      this.renderDashboard(); // Actualizar tarjeta de presupuesto
      this.showToast('Presupuesto de ocio guardado exitosamente', 'success');
    });
  }

  // Reset budget button
  const resetBtn = document.getElementById('resetBudgetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (
        confirm(
          '¿Estás seguro de que deseas restablecer el presupuesto de este mes?'
        )
      ) {
        delete this.budgets[this.currentBudgetMonth];
        this.saveData();
        this.renderBudgetSection();
        this.showToast('Presupuesto restablecido', 'info');
      }
    });
  }

  // Month navigation
  const prevBtn = document.getElementById('prevMonthBtn');
  const nextBtn = document.getElementById('nextMonthBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const [year, month] = this.currentBudgetMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 2);
      this.currentBudgetMonth = this.getCurrentMonthKey.call({
        getFullYear: () => date.getFullYear(),
        getMonth: () => date.getMonth(),
      });
      this.renderBudgetSection();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const [year, month] = this.currentBudgetMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month));
      const newYear = date.getFullYear();
      const newMonth = String(date.getMonth() + 1).padStart(2, '0');
      this.currentBudgetMonth = `${newYear}-${newMonth}`;
      this.renderBudgetSection();
    });
  }
};

// ========================================
// QUICK EXPENSE ENTRY & TEMPLATES
// ========================================

FinanceApp.prototype.setupQuickExpenseListeners = function () {
  // FAB button - Toggles quick actions menu
  const fab = document.getElementById('fabQuickExpense');
  const menu = document.getElementById('quickExpenseModal');

  if (fab && menu) {
    fab.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menu && !menu.classList.contains('hidden')) {
      if (!e.target.closest('.fab-quick-menu') && !e.target.closest('.fab')) {
        menu.classList.add('hidden');
      }
    }
  });

  // === OPTION 1: REGISTRAR GASTO (Full Form) ===
  const fullExpenseBtn = document.getElementById('quickActionFullExpense');
  if (fullExpenseBtn) {
    fullExpenseBtn.addEventListener('click', () => {
      // Close menu
      menu.classList.add('hidden');

      // Open expenses section
      this.showSection('expenses');

      // Scroll to form and focus
      setTimeout(() => {
        const mainForm = document.getElementById('expenseForm');
        if (mainForm) {
          mainForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          document.getElementById('amount')?.focus();
        }
      }, 300);
    });
  }

  // === OPTION 2: MODO RÁPIDO ===
  const fastModeBtn = document.getElementById('quickActionFastMode');
  const fastModeModal = document.getElementById('fastModeModal');
  const closeFastMode = document.getElementById('closeFastModeModal');
  const cancelFastMode = document.getElementById('cancelFastMode');
  const fastModeForm = document.getElementById('fastModeForm');

  if (fastModeBtn) {
    fastModeBtn.addEventListener('click', () => {
      menu.classList.add('hidden');
      fastModeModal.classList.add('show');
      document.body.style.overflow = 'hidden';
      setTimeout(() => document.getElementById('fastAmount')?.focus(), 100);
    });
  }

  if (closeFastMode) {
    closeFastMode.addEventListener('click', () => {
      fastModeModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  if (cancelFastMode) {
    cancelFastMode.addEventListener('click', () => {
      fastModeModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  if (fastModeForm) {
    fastModeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFastModeSubmit();
    });
  }

  // === OPTION 3: REGISTRAR SUELDO ===
  const salaryBtn = document.getElementById('quickActionSalary');
  const salaryModal = document.getElementById('salaryModal');
  const closeSalary = document.getElementById('closeSalaryModal');
  const cancelSalary = document.getElementById('cancelSalary');
  const salaryForm = document.getElementById('salaryForm');

  if (salaryBtn) {
    salaryBtn.addEventListener('click', () => {
      menu.classList.add('hidden');
      salaryModal.classList.add('show');
      document.body.style.overflow = 'hidden';

      // Set current date
      const dateInput = document.getElementById('salaryDate');
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }

      // Pre-llenar con el sueldo actual si existe
      const salaryInput = document.getElementById('salaryAmount');
      if (salaryInput && this.monthlyIncome) {
        salaryInput.value = this.monthlyIncome;
      }

      setTimeout(() => document.getElementById('salaryAmount')?.focus(), 100);
    });
  }

  // Agregar formateo en tiempo real al input de sueldo
  const salaryInput = document.getElementById('salaryAmount');
  if (salaryInput && !salaryInput.dataset.listenerAdded) {
    salaryInput.dataset.listenerAdded = 'true';

    salaryInput.addEventListener('input', (e) => {
      // Remover cualquier caracter que no sea número
      let value = e.target.value.replace(/[^\d]/g, '');

      // Formatear con separadores de miles (puntos)
      if (value) {
        value = parseInt(value, 10).toLocaleString('es-CO');
      }

      e.target.value = value;
    });

    salaryInput.addEventListener('blur', (e) => {
      // Al salir del campo, asegurar formato correcto
      let value = e.target.value.replace(/[^\d]/g, '');
      if (value) {
        e.target.value = parseInt(value, 10).toLocaleString('es-CO');
      }
    });
  }

  if (closeSalary) {
    closeSalary.addEventListener('click', () => {
      salaryModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  if (cancelSalary) {
    cancelSalary.addEventListener('click', () => {
      salaryModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  if (salaryForm) {
    salaryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSalarySubmit();
    });
  }

  // === OPTION 4: ENTRADA EXTRA ===
  const extraBtn = document.getElementById('quickActionExtraIncome');
  const extraModal = document.getElementById('extraIncomeModal');
  const closeExtra = document.getElementById('closeExtraIncomeModal');
  const cancelExtra = document.getElementById('cancelExtra');
  const extraForm = document.getElementById('extraIncomeForm');

  if (extraBtn) {
    extraBtn.addEventListener('click', () => {
      menu.classList.add('hidden');
      extraModal.classList.add('show');
      document.body.style.overflow = 'hidden';

      // Set current date
      const dateInput = document.getElementById('extraDate');
      if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
      }

      setTimeout(() => document.getElementById('extraAmount')?.focus(), 100);
    });
  }

  // Agregar formateo en tiempo real al input de entrada extra
  const extraInput = document.getElementById('extraAmount');
  if (extraInput && !extraInput.dataset.listenerAdded) {
    extraInput.dataset.listenerAdded = 'true';

    extraInput.addEventListener('input', (e) => {
      // Remover cualquier caracter que no sea número
      let value = e.target.value.replace(/[^\d]/g, '');

      // Formatear con separadores de miles (puntos)
      if (value) {
        value = parseInt(value, 10).toLocaleString('es-CO');
      }

      e.target.value = value;
    });

    extraInput.addEventListener('blur', (e) => {
      // Al salir del campo, asegurar formato correcto
      let value = e.target.value.replace(/[^\d]/g, '');
      if (value) {
        e.target.value = parseInt(value, 10).toLocaleString('es-CO');
      }
    });
  }

  if (closeExtra) {
    closeExtra.addEventListener('click', () => {
      extraModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  if (cancelExtra) {
    cancelExtra.addEventListener('click', () => {
      extraModal.classList.remove('show');
      document.body.style.overflow = '';
    });
  }

  if (extraForm) {
    extraForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleExtraIncomeSubmit();
    });
  }

  // === DELETE CONFIRMATION MODAL LISTENERS ===
  const deleteModal = document.getElementById('deleteConfirmModal');
  const closeDeleteBtn = document.getElementById('closeDeleteConfirmModal');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  if (closeDeleteBtn) {
    closeDeleteBtn.addEventListener('click', () => {
      this.closeDeleteConfirmModal();
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      this.closeDeleteConfirmModal();
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      this.confirmDeleteExpense();
    });
  }

  // Close delete modal on backdrop click
  if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
      if (e.target === deleteModal) {
        this.closeDeleteConfirmModal();
      }
    });
  }

};

// ========================================
// INSTAGRAM-STYLE QUICK ACTIONS
// ========================================

FinanceApp.prototype.setupInstagramQuickActions = function () {
  const fabInstagram = document.getElementById('fabInstagram');

  // Ahora el botón fabInstagram toggle el menú de 4 opciones
  if (fabInstagram) {
    fabInstagram.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById('quickExpenseModal');
      if (menu) {
        menu.classList.toggle('hidden');
      }
    });
  }
};

// Banner cover and mobile avatar setup
FinanceApp.prototype.setupMobileBannerListeners = function () {
  const mobileBannerCover = document.getElementById('mobileBannerCover');
  if (mobileBannerCover) {
    mobileBannerCover.addEventListener('click', (e) => {
      // Evitar que se abra si se hace click en botones
      if (
        e.target.closest('.banner-hamburger-btn') ||
        e.target.closest('.banner-notification-btn') ||
        e.target.closest('#mobileAvatar')
      ) {
        return;
      }
      this.changeBannerCover();
    });
  }

  // Mobile avatar customization
  // Click en avatar móvil: si no está autenticado, abre modal de login
  const mobileAvatarContainer = document.getElementById(
    'mobileAvatarContainer'
  );
  if (mobileAvatarContainer) {
    mobileAvatarContainer.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent banner click event

      // Si el usuario no está autenticado, abrir modal de login
      if (this.currentUser === 'anonymous' || !this.currentUser) {
        console.log('[Avatar] Usuario no autenticado, abriendo modal de login');
        this.openAuthModal();
      }
      // Si está autenticado, el avatar-sidebar.js maneja el click para abrir el menú
    });
  }
};

FinanceApp.prototype.changeBannerCover = async function () {
  // Create hidden file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.showToast('Por favor selecciona una imagen válida', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('La imagen debe ser menor a 5MB', 'error');
      return;
    }

    // Show loading
    this.showToast('Subiendo portada...', 'info');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target.result;

        // Initialize userProfile if needed
        if (!this.userProfile) {
          this.userProfile = {};
        }

        // Update banner UI immediately (sin guardar base64 en localStorage)
        const mobileBannerCover = document.getElementById('mobileBannerCover');
        if (mobileBannerCover) {
          mobileBannerCover.style.backgroundImage = `url(${imageData})`;
          mobileBannerCover.style.backgroundSize = 'cover';
          mobileBannerCover.style.backgroundPosition = 'center';
        }

        // Verificar plan del usuario
        const isPro = this.userPlan === 'pro';
        const FB = window.FB;
        const currentFirebaseUser = this.firebaseUser || FB.auth?.currentUser;
        const isLoggedIn =
          currentFirebaseUser &&
          this.currentUser &&
          this.currentUser !== 'anonymous';

        // Plan PRO: Subir a Firebase Storage (nube)
        if (isPro && FB?.auth && isLoggedIn) {
          try {
            // Subir a Firebase Storage
            const storageRef = FB.ref(
              FB.storage,
              `banners/${currentFirebaseUser.uid}`
            );
            await FB.uploadString(storageRef, imageData, 'data_url');
            const downloadURL = await FB.getDownloadURL(storageRef);

            // Guardar URL en perfil
            this.userProfile.bannerCover = downloadURL;

            // Guardar en localStorage (solo URL)
            this.saveData();

            // Update Firestore
            const userDocRef = FB.doc(
              FB.db,
              'usuarios',
              currentFirebaseUser.uid
            );
            await FB.updateDoc(userDocRef, {
              'userProfile.bannerCover': downloadURL,
              updatedAt: Date.now(),
            });

            this.showToast('Portada guardada en la nube ✓', 'success');
          } catch (error) {
            console.error('Error uploading banner to Firebase:', error);
            this.showToast('Error al subir portada: ' + error.message, 'error');
          }
        }
        // Plan FREE: Guardar localmente (temporal)
        else if (isLoggedIn) {
          // Comprimir imagen para localStorage
          const maxWidth = 800; // 800px ancho para plan free
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calcular dimensiones proporcionales
            const ratio = img.height / img.width;
            canvas.width = maxWidth;
            canvas.height = maxWidth * ratio;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Convertir a base64 comprimido
            const compressedData = canvas.toDataURL('image/jpeg', 0.5);

            // Guardar localmente
            this.userProfile.bannerCover = compressedData;

            // Guardar en localStorage
            this.saveData();

            // Update UI
            if (mobileBannerCover) {
              mobileBannerCover.style.backgroundImage = `url(${compressedData})`;
            }

            this.showToast(
              'Portada guardada localmente. Actualiza a PRO para sincronizar en la nube.',
              'info'
            );
          };
          img.src = imageData;
        }
        // Usuario anónimo
        else {
          console.log('Usuario no logueado');
          this.showToast('Inicia sesión para guardar la portada', 'warning');
          this.userProfile.bannerCover = '';
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading banner:', error);
      this.showToast('Error al subir la portada', 'error');
    }
  });

  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

FinanceApp.prototype.openQuickExpenseModal = function () {
  const modal = document.getElementById('quickExpenseModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    this.renderExpenseTemplates();

    // Initialize date field with today's date
    const dateInput = document.getElementById('quickDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Populate user dropdown with custom users
    this.updateQuickUserDropdown();

    // Setup quick user selection handler
    this.setupQuickUserHandler();

    // Focus on amount input
    setTimeout(() => {
      document.getElementById('quickAmount')?.focus();
    }, 100);
  }
};

FinanceApp.prototype.handleQuickExpenseSubmit = function () {
  const amountInput = document.getElementById('quickAmount');
  const amount = this.unformatNumber(amountInput.value);
  const category = document.getElementById('quickCategory').value;
  const description =
    document.getElementById('quickDescription').value || 'Gasto rápido';

  // Get values from normal mode fields if they exist
  const necessity =
    document.getElementById('quickNecessity')?.value || 'Necesario';
  const date =
    document.getElementById('quickDate')?.value ||
    new Date().toISOString().split('T')[0];
  const userValue = document.getElementById('quickUser')?.value;

  // Use defined user or current user
  const user =
    userValue && userValue !== '__add_new__'
      ? userValue
      : this.currentUser || this.defaultUser || 'Sin usuario';

  if (!amount || !category) {
    this.showToast('Por favor completa los campos requeridos', 'error');
    return;
  }

  console.log('💰 Registrando gasto...', { amount, category, description });

  // Create expense
  const expense = {
    id: Date.now(),
    amount: amount,
    category: category,
    description: description,
    date: date,
    user: user,
    necessity: necessity,
    createdAt: new Date().toISOString(),
  };

  this.expenses.push(expense);

  // Save expense pattern for autocomplete
  this.saveExpensePattern(description, category, necessity, user);

  this.saveData();

  // Update budget
  const currentMonth = this.getCurrentMonthKey();
  if (this.budgets[currentMonth]) {
    this.updateBudgetSpending(currentMonth);

    // Check for alerts
    const alerts = this.checkBudgetAlerts(currentMonth);
    alerts.forEach((alert) => {
      this.showToast(alert.message, alert.type);
    });
  }

  console.log('🔒 Cerrando modal...');

  // Close modal and reset form
  const modal = document.getElementById('quickExpenseModal');
  if (modal) {
    modal.classList.remove('show');
    console.log('✅ Clase "show" removida del modal');
  } else {
    console.error('❌ No se encontró el modal quickExpenseModal');
  }

  document.body.style.overflow = '';

  const form = document.getElementById('quickExpenseForm');
  if (form) {
    form.reset();
    console.log('✅ Formulario reseteado');
  }

  // Update dashboard if visible
  if (document.getElementById('dashboard').classList.contains('active')) {
    this.renderDashboard();
  }

  this.renderExpenses();
  this.updateExpenseStats(); // Update expense form stats
  this.showToast('Gasto registrado exitosamente', 'success');
  console.log('✅ Gasto registrado completamente');
};

// === NUEVA FUNCIÓN: MODO RÁPIDO (solo monto y descripción) ===
FinanceApp.prototype.handleFastModeSubmit = function () {
  const amount = parseFloat(document.getElementById('fastAmount').value);
  const description = document.getElementById('fastDescription').value.trim();

  if (!amount || !description) {
    this.showToast('Por favor completa todos los campos', 'error');
    return;
  }

  // Crear gasto con valores mínimos (para editar después)
  const expense = {
    id: Date.now(),
    amount: amount,
    description: description,
    category: 'Otros', // Categoría por defecto
    necessity: 'Necesario', // Necesidad por defecto
    date: new Date().toISOString().split('T')[0],
    user: this.currentUser || this.defaultUser || 'Sin usuario',
    timestamp: Date.now(),
    quickMode: true // Marcador para saber que fue creado en modo rápido
  };

  this.expenses.push(expense);
  this.saveData();

  // Cerrar modal
  const modal = document.getElementById('fastModeModal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
  document.getElementById('fastModeForm').reset();

  // Actualizar vistas
  this.renderExpenses();
  this.updateExpenseStats();
  if (document.getElementById('dashboard').classList.contains('active')) {
    this.renderDashboard();
  }

  this.showToast(`Gasto rápido de $${amount.toLocaleString()} registrado. Recuerda editarlo después.`, 'success');
};

// === NUEVA FUNCIÓN: REGISTRAR SUELDO ===
FinanceApp.prototype.handleSalarySubmit = function () {
  const amountInput = document.getElementById('salaryAmount').value;
  // Limpiar separadores de miles (puntos, comas, espacios) antes de parsear
  const cleanValue = amountInput.replace(/[^\d]/g, '');
  const amount = parseInt(cleanValue, 10);
  const date = document.getElementById('salaryDate').value;

  console.log('🔍 Procesando sueldo:', {
    inputValue: amountInput,
    cleanValue: cleanValue,
    parsedAmount: amount,
    date: date
  });

  if (!amountInput || !date) {
    this.showToast('Por favor completa todos los campos', 'error');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    this.showToast('⚠️ Por favor ingresa un monto válido mayor a 0', 'error');
    return;
  }

  if (amount < 100) {
    this.showToast('⚠️ El sueldo parece muy bajo. ¿Estás seguro? Mínimo recomendado: $100', 'error');
    return;
  }

  // Verificar si ya existe un sueldo registrado
  if (this.monthlyIncome && this.monthlyIncome > 0) {
    // Calcular días desde el último cambio (si tenemos la fecha guardada)
    const lastSalaryDate = this.lastSalaryDate || 'fecha desconocida';
    let daysAgo = '';

    if (this.lastSalaryDate) {
      const lastDate = new Date(this.lastSalaryDate);
      const today = new Date();
      const diffTime = Math.abs(today - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysAgo = diffDays === 1 ? 'hace 1 día' : `hace ${diffDays} días`;
    }

    // Mostrar confirmación
    const confirmed = confirm(
      `⚠️ CAMBIO DE SUELDO\n\n` +
      `Ya tienes un sueldo establecido:\n` +
      `💰 Sueldo actual: $${this.monthlyIncome.toLocaleString()}\n` +
      `📅 Registrado: ${daysAgo}\n\n` +
      `Nuevo sueldo: $${amount.toLocaleString()}\n\n` +
      `¿Estás seguro de cambiar el sueldo?\n` +
      `Esto actualizará tu balance total.`
    );

    if (!confirmed) {
      return; // Usuario canceló el cambio
    }
  }

  // Actualizar ingreso mensual (balance total)
  this.monthlyIncome = amount;
  this.lastSalaryDate = date; // Guardar la fecha del último sueldo

  console.log('✅ Sueldo actualizado:', {
    monthlyIncome: this.monthlyIncome,
    lastSalaryDate: this.lastSalaryDate,
    getTotalIncome: this.getTotalIncome()
  });

  this.saveData();

  // Cerrar modal
  const modal = document.getElementById('salaryModal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
  document.getElementById('salaryForm').reset();

  // Actualizar vistas - SIEMPRE actualizar el dashboard
  this.renderDashboard();

  // Si estamos en otra sección, también actualizar
  const activeSection = document.querySelector('.content-section.active');
  if (activeSection && activeSection.id === 'config') {
    this.renderConfigSection();
  }

  this.showToast(`💰 Sueldo de $${amount.toLocaleString()} registrado correctamente`, 'success');
};

// === NUEVA FUNCIÓN: ENTRADA EXTRA ===
FinanceApp.prototype.handleExtraIncomeSubmit = function () {
  const amountInput = document.getElementById('extraAmount').value;
  // Limpiar separadores de miles (puntos, comas, espacios) antes de parsear
  const cleanValue = amountInput.replace(/[^\d]/g, '');
  const amount = parseInt(cleanValue, 10);
  const description = document.getElementById('extraDescription').value.trim();
  const date = document.getElementById('extraDate').value;

  console.log('🔍 Procesando entrada extra:', {
    inputValue: amountInput,
    cleanValue: cleanValue,
    parsedAmount: amount,
    description: description,
    date: date
  });

  if (!amountInput || !description || !date) {
    this.showToast('Por favor completa todos los campos', 'error');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    this.showToast('⚠️ Por favor ingresa un monto válido mayor a 0', 'error');
    return;
  }

  // Guardar el balance anterior para mostrar el cambio
  const previousBalance = this.monthlyIncome || 0;

  // Sumar al ingreso mensual (balance total)
  this.monthlyIncome = previousBalance + amount;

  // Guardar en historial de entradas extras (para futuras referencias)
  if (!this.extraIncomeHistory) {
    this.extraIncomeHistory = [];
  }

  this.extraIncomeHistory.push({
    id: Date.now(),
    amount: amount,
    description: description,
    date: date,
    timestamp: Date.now()
  });

  // Limitar historial a últimas 50 entradas
  if (this.extraIncomeHistory.length > 50) {
    this.extraIncomeHistory = this.extraIncomeHistory.slice(-50);
  }

  console.log('✅ Entrada extra agregada:', {
    amount: amount,
    description: description,
    previousBalance: previousBalance,
    newBalance: this.monthlyIncome,
    getTotalIncome: this.getTotalIncome()
  });

  this.saveData();

  // Cerrar modal
  const modal = document.getElementById('extraIncomeModal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
  document.getElementById('extraIncomeForm').reset();

  // Actualizar vistas - SIEMPRE actualizar el dashboard
  this.renderDashboard();

  // Si estamos en otra sección, también actualizar
  const activeSection = document.querySelector('.content-section.active');
  if (activeSection && activeSection.id === 'config') {
    this.renderConfigSection();
  }

  // Mostrar toast con información detallada
  this.showToast(
    `✨ Entrada extra agregada: $${amount.toLocaleString()} (${description})\n` +
    `Balance: $${previousBalance.toLocaleString()} → $${this.monthlyIncome.toLocaleString()}`,
    'success'
  );
};

FinanceApp.prototype.saveExpenseTemplate = function () {
  const amountInput = document.getElementById('quickAmount');
  const amount = this.unformatNumber(amountInput.value);
  const category = document.getElementById('quickCategory').value;
  const description = document.getElementById('quickDescription').value;

  if (!amount || !category || !description) {
    this.showToast(
      'Completa todos los campos para guardar una plantilla',
      'warning'
    );
    return;
  }

  // Check if template already exists
  const exists = this.expenseTemplates.some(
    (t) => t.description === description && t.category === category
  );

  if (exists) {
    this.showToast('Esta plantilla ya existe', 'info');
    return;
  }

  const template = {
    id: Date.now(),
    amount: amount,
    category: category,
    description: description,
    createdAt: new Date().toISOString(),
  };

  this.expenseTemplates.push(template);
  this.saveData();
  this.renderExpenseTemplates();
  this.showToast('Plantilla guardada exitosamente', 'success');
};

FinanceApp.prototype.renderExpenseTemplates = function () {
  const container = document.getElementById('quickTemplates');
  if (!container) return;

  if (this.expenseTemplates.length === 0) {
    container.innerHTML = `
      <div class="quick-templates-empty">
        <i class="fas fa-bookmark"></i>
        <p>No hay plantillas guardadas</p>
      </div>
    `;
    return;
  }

  container.innerHTML = this.expenseTemplates
    .map(
      (template) => `
    <div class="quick-template" data-template-id="${template.id}">
      <span>${template.description}</span>
      <span>$${this.formatNumber(template.amount)}</span>
      <i class="fas fa-times" data-action="delete"></i>
    </div>
  `
    )
    .join('');

  // Add click listeners
  container.querySelectorAll('.quick-template').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'delete') {
        this.deleteExpenseTemplate(parseInt(el.dataset.templateId));
      } else {
        this.applyExpenseTemplate(parseInt(el.dataset.templateId));
      }
    });
  });
};

FinanceApp.prototype.applyExpenseTemplate = function (templateId) {
  const template = this.expenseTemplates.find((t) => t.id === templateId);
  if (!template) return;

  document.getElementById('quickAmount').value = template.amount;
  document.getElementById('quickCategory').value = template.category;
  document.getElementById('quickDescription').value = template.description;
};

FinanceApp.prototype.deleteExpenseTemplate = function (templateId) {
  this.expenseTemplates = this.expenseTemplates.filter(
    (t) => t.id !== templateId
  );
  this.saveData();
  this.renderExpenseTemplates();
  this.showToast('Plantilla eliminada', 'info');
};

// ========================================
// SMART AUTOCOMPLETE & EXPENSE PATTERNS
// ========================================

FinanceApp.prototype.initializeExpensePatterns = function () {
  // Initialize expense patterns database if not exists
  if (!this.expensePatterns) {
    this.expensePatterns = {};
  }
};

FinanceApp.prototype.saveExpensePattern = function (
  description,
  category,
  necessity,
  user
) {
  if (!description) return;

  const key = description.toLowerCase().trim();

  if (!this.expensePatterns) {
    this.expensePatterns = {};
  }

  // If pattern exists, update count and last used
  if (this.expensePatterns[key]) {
    this.expensePatterns[key].count++;
    this.expensePatterns[key].lastUsed = new Date().toISOString();
  } else {
    // Create new pattern
    this.expensePatterns[key] = {
      description: description,
      category: category,
      necessity: necessity,
      user: user,
      count: 1,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };
  }

  this.saveData();
};

FinanceApp.prototype.handleQuickAutocomplete = function (searchText) {
  const autocompleteDiv = document.getElementById('quickAutocomplete');
  if (!autocompleteDiv) return;

  if (!searchText || searchText.length < 2) {
    autocompleteDiv.classList.add('hidden');
    return;
  }

  const matches = this.searchExpensePatterns(searchText);

  if (matches.length === 0) {
    autocompleteDiv.classList.add('hidden');
    return;
  }

  // Render suggestions
  autocompleteDiv.innerHTML = matches
    .slice(0, 5) // Show max 5 suggestions
    .map(
      (pattern) => `
    <div class="autocomplete-suggestion" data-pattern='${JSON.stringify(
      pattern
    )}'>
      <span class="autocomplete-suggestion-text">${pattern.description}</span>
      <div class="autocomplete-suggestion-meta">
        <span class="autocomplete-suggestion-badge">${pattern.category}</span>
        <span class="autocomplete-suggestion-badge">${pattern.necessity}</span>
        ${
          pattern.user
            ? `<span class="autocomplete-suggestion-badge">${pattern.user}</span>`
            : ''
        }
        <span class="autocomplete-suggestion-badge">Usado ${
          pattern.count
        }x</span>
      </div>
    </div>
  `
    )
    .join('');

  autocompleteDiv.classList.remove('hidden');

  // Add click listeners to suggestions
  autocompleteDiv.querySelectorAll('.autocomplete-suggestion').forEach((el) => {
    el.addEventListener('click', () => {
      const pattern = JSON.parse(el.dataset.pattern);
      this.applyExpensePattern(pattern);
      autocompleteDiv.classList.add('hidden');
    });
  });
};

FinanceApp.prototype.searchExpensePatterns = function (searchText) {
  if (!this.expensePatterns) return [];

  const search = searchText.toLowerCase().trim();
  const results = [];

  for (const key in this.expensePatterns) {
    if (key.includes(search)) {
      results.push(this.expensePatterns[key]);
    }
  }

  // Sort by usage count (most used first)
  results.sort((a, b) => b.count - a.count);

  return results;
};

FinanceApp.prototype.applyExpensePattern = function (pattern) {
  // Fill form fields with pattern data
  document.getElementById('quickDescription').value = pattern.description;
  document.getElementById('quickCategory').value = pattern.category;

  // Only fill normal mode fields if they're visible
  const normalModeFields = document.querySelector('.normal-mode-fields');
  if (normalModeFields && !normalModeFields.classList.contains('hidden')) {
    document.getElementById('quickNecessity').value = pattern.necessity || '';
    if (pattern.user) {
      const userSelect = document.getElementById('quickUser');
      // Check if user exists in dropdown
      const userOption = Array.from(userSelect.options).find(
        (opt) => opt.value === pattern.user
      );
      if (userOption) {
        userSelect.value = pattern.user;
      }
    }
  }

  this.showToast('Patrón aplicado', 'info');
};

FinanceApp.prototype.updateQuickUserDropdown = function () {
  const userSelect = document.getElementById('quickUser');
  if (!userSelect) return;

  // Clear existing options except the first two (Sin asignar and + Añadir usuario)
  while (userSelect.options.length > 2) {
    userSelect.remove(2);
  }

  // Add custom users
  this.customUsers.forEach((userName) => {
    const option = document.createElement('option');
    option.value = userName;
    option.textContent = userName;
    userSelect.appendChild(option);
  });

  // Set default user if exists
  if (this.defaultUser && this.customUsers.includes(this.defaultUser)) {
    userSelect.value = this.defaultUser;
  }
};

FinanceApp.prototype.setupQuickUserHandler = function () {
  // Get fresh references
  const quickUserSelect = document.getElementById('quickUser');
  const quickNewUserGroup = document.getElementById('quickNewUserGroup');
  const quickNewUserNameInput = document.getElementById('quickNewUserName');
  const quickSaveNewUserBtn = document.getElementById('quickSaveNewUserBtn');

  if (!quickUserSelect) return;

  // Function to save new user
  const saveQuickNewUser = () => {
    const userInput = document.getElementById('quickNewUserName');
    const userGroup = document.getElementById('quickNewUserGroup');
    const newUserName = userInput?.value.trim();

    if (newUserName && !this.customUsers.includes(newUserName)) {
      this.customUsers.push(newUserName);
      this.saveData();
      this.updateQuickUserDropdown();
      this.updateUserSelectionDropdown(); // Update normal form dropdown too
      this.updateDefaultUserDropdown(); // Update settings dropdown too

      // Select the newly created user
      const userSelect = document.getElementById('quickUser');
      if (userSelect) {
        userSelect.value = newUserName;
      }
      userGroup?.classList.add('hidden');
      if (userInput) {
        userInput.value = '';
      }

      this.showToast(`Usuario "${newUserName}" añadido`, 'success');
    } else if (this.customUsers.includes(newUserName)) {
      this.showToast('Este usuario ya existe', 'error');
    } else {
      this.showToast('Ingresa un nombre de usuario', 'error');
    }
  };

  // Remove previous listener by cloning
  const newSelect = quickUserSelect.cloneNode(true);
  quickUserSelect.parentNode.replaceChild(newSelect, quickUserSelect);

  // Add change listener to new element
  newSelect.addEventListener('change', (e) => {
    const group = document.getElementById('quickNewUserGroup');
    const input = document.getElementById('quickNewUserName');

    if (e.target.value === '__add_new__') {
      group?.classList.remove('hidden');
      input?.focus();
    } else {
      group?.classList.add('hidden');
    }
  });

  // Setup input handler
  if (quickNewUserNameInput) {
    const newInput = quickNewUserNameInput.cloneNode(true);
    quickNewUserNameInput.parentNode.replaceChild(
      newInput,
      quickNewUserNameInput
    );

    newInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveQuickNewUser();
      }
    });
  }

  // Setup button handler
  if (quickSaveNewUserBtn) {
    const newBtn = quickSaveNewUserBtn.cloneNode(true);
    quickSaveNewUserBtn.parentNode.replaceChild(newBtn, quickSaveNewUserBtn);

    newBtn.addEventListener('click', () => {
      saveQuickNewUser();
    });
  }
};

// ========================================
// PREMIUM SETTINGS SYSTEM
// ========================================

FinanceApp.prototype.setupPremiumSettings = function () {
  // Settings tab navigation (desktop sidebar + mobile bottom nav)
  const settingsNavItems = document.querySelectorAll('.settings-nav-item');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  const settingsTabs = document.querySelectorAll('.settings-tab');

  // Function to switch tabs (shared between desktop and mobile)
  const switchTab = (targetTab) => {
    // Update active state for desktop nav
    settingsNavItems.forEach((item) => item.classList.remove('active'));
    const desktopNav = document.querySelector(
      `.settings-nav-item[data-settings-tab="${targetTab}"]`
    );
    if (desktopNav) desktopNav.classList.add('active');

    // Update active state for mobile nav
    bottomNavItems.forEach((item) => item.classList.remove('active'));
    const mobileNav = document.querySelector(
      `.bottom-nav-item[data-settings-tab="${targetTab}"]`
    );
    if (mobileNav) mobileNav.classList.add('active');

    // Update active tab content
    settingsTabs.forEach((tab) => tab.classList.remove('active'));
    const targetTabElement = document.getElementById(`settings-${targetTab}`);
    if (targetTabElement) {
      targetTabElement.classList.add('active');
    }

    // Scroll to top of page when switching tabs
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Update statistics if on profile tab
    if (targetTab === 'profile') {
      this.updateUsageStatistics();
    }
  };

  // Desktop sidebar navigation
  settingsNavItems.forEach((navItem) => {
    navItem.addEventListener('click', () => {
      const targetTab = navItem.dataset.settingsTab;
      switchTab(targetTab);
    });
  });

  // Mobile bottom navigation
  bottomNavItems.forEach((navItem) => {
    navItem.addEventListener('click', () => {
      const targetTab = navItem.dataset.settingsTab;
      switchTab(targetTab);
    });
  });

  // Update stats on initial load
  this.updateUsageStatistics();

  // Default User Configuration
  this.setupDefaultUserConfig();

  // Export/Import buttons
  const exportJSONBtn = document.getElementById('exportJSONBtn');
  if (exportJSONBtn) {
    exportJSONBtn.addEventListener('click', () => this.exportDataAsJSON());
  }

  const exportCSVBtn = document.getElementById('exportCSVBtn');
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener('click', () => this.exportDataAsCSV());
  }

  const importJSONBtn = document.getElementById('importJSONBtn');
  const importFileInput = document.getElementById('importFileInput');
  if (importJSONBtn && importFileInput) {
    importJSONBtn.addEventListener('click', () => {
      importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.importDataFromJSON(file);
      }
    });
  }

  // Delete all data button
  const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');
  if (deleteAllDataBtn) {
    deleteAllDataBtn.addEventListener('click', () => {
      const confirmed = confirm(
        '⚠️ ADVERTENCIA: Esta acción borrará TODOS tus datos permanentemente.\n\n¿Estás completamente seguro de que deseas continuar?'
      );
      if (confirmed) {
        const doubleConfirm = confirm(
          'Esta es tu última oportunidad. ¿Realmente deseas borrar todos los datos?\n\nEsta acción NO se puede deshacer.'
        );
        if (doubleConfirm) {
          localStorage.clear();
          this.showToast('Todos los datos han sido eliminados', 'info');
          setTimeout(() => {
            location.reload();
          }, 1500);
        }
      }
    });
  }

  // System info
  this.updateSystemInfo();
};

FinanceApp.prototype.setupDefaultUserConfig = function () {
  const defaultUserSelect = document.getElementById('defaultUserSelect');
  if (!defaultUserSelect) return;

  // Populate dropdown with custom users
  this.updateDefaultUserDropdown();

  // Set current default user
  if (this.defaultUser) {
    defaultUserSelect.value = this.defaultUser;
  }

  // Listen for changes
  defaultUserSelect.addEventListener('change', (e) => {
    this.defaultUser = e.target.value;
    this.saveData();
    this.showToast(
      this.defaultUser
        ? `Usuario predefinido: ${this.defaultUser}`
        : 'Usuario predefinido eliminado',
      'success'
    );
  });
};

FinanceApp.prototype.updateDefaultUserDropdown = function () {
  const defaultUserSelect = document.getElementById('defaultUserSelect');
  if (!defaultUserSelect) return;

  // Clear existing options except the first one
  while (defaultUserSelect.options.length > 1) {
    defaultUserSelect.remove(1);
  }

  // Add custom users
  this.customUsers.forEach((userName) => {
    const option = document.createElement('option');
    option.value = userName;
    option.textContent = userName;
    defaultUserSelect.appendChild(option);
  });
};

FinanceApp.prototype.updateUsageStatistics = function () {
  // Total expenses count
  const totalExpensesEl = document.getElementById('totalExpensesCount');
  if (totalExpensesEl) {
    totalExpensesEl.textContent = this.expenses.length;
  }

  // Total goals count
  const totalGoalsEl = document.getElementById('totalGoalsCount');
  if (totalGoalsEl) {
    totalGoalsEl.textContent = this.goals.length;
  }

  // Account age (days since first expense or goal)
  const accountAgeEl = document.getElementById('accountAge');
  if (accountAgeEl) {
    const allDates = [
      ...this.expenses.map((e) => new Date(e.date)),
      ...this.goals.map((g) => new Date(g.createdAt || Date.now())),
    ];

    if (allDates.length > 0) {
      const oldestDate = new Date(Math.min(...allDates));
      const daysDiff = Math.floor(
        (new Date() - oldestDate) / (1000 * 60 * 60 * 24)
      );
      accountAgeEl.textContent = daysDiff;
    } else {
      accountAgeEl.textContent = '0';
    }
  }
};

// Export data as JSON
FinanceApp.prototype.exportDataAsJSON = function () {
  const dataToExport = {
    expenses: this.expenses,
    goals: this.goals,
    shoppingItems: this.shoppingItems,
    monthlyIncome: this.monthlyIncome,
    budgets: this.budgets,
    expenseTemplates: this.expenseTemplates,
    savingsAccounts: this.savingsAccounts,
    recurringPayments: this.recurringPayments,
    exportDate: new Date().toISOString(),
    version: '1.0',
  };

  const dataStr = JSON.stringify(dataToExport, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `financiapro-backup-${
    new Date().toISOString().split('T')[0]
  }.json`;
  link.click();

  URL.revokeObjectURL(url);
  this.showToast('Datos exportados exitosamente', 'success');
};

// Export data as CSV
FinanceApp.prototype.exportDataAsCSV = function () {
  // Export expenses as CSV
  let csvContent = 'Fecha,Descripción,Monto,Categoría,Necesidad,Usuario\n';

  this.expenses.forEach((expense) => {
    const row = [
      expense.date,
      `"${expense.description}"`,
      expense.amount,
      expense.category,
      expense.necessity,
      expense.user,
    ].join(',');
    csvContent += row + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `financiapro-expenses-${
    new Date().toISOString().split('T')[0]
  }.csv`;
  link.click();

  URL.revokeObjectURL(url);
  this.showToast('Gastos exportados como CSV', 'success');
};

// Import data from JSON
FinanceApp.prototype.importDataFromJSON = function (file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      // Validate data structure
      if (!importedData.expenses && !importedData.goals) {
        this.showToast('Archivo JSON inválido', 'error');
        return;
      }

      // Confirm import
      if (
        !confirm(
          '¿Estás seguro de que deseas importar estos datos? Esto sobrescribirá tus datos actuales.'
        )
      ) {
        return;
      }

      // Import data
      if (importedData.expenses) this.expenses = importedData.expenses;
      if (importedData.goals) this.goals = importedData.goals;
      if (importedData.shoppingItems)
        this.shoppingItems = importedData.shoppingItems;
      if (importedData.monthlyIncome)
        this.monthlyIncome = importedData.monthlyIncome;
      if (importedData.budgets) this.budgets = importedData.budgets;
      if (importedData.expenseTemplates)
        this.expenseTemplates = importedData.expenseTemplates;
      if (importedData.savingsAccounts)
        this.savingsAccounts = importedData.savingsAccounts;
      if (importedData.recurringPayments)
        this.recurringPayments = importedData.recurringPayments;

      this.saveData();
      this.renderDashboard();
      this.showToast('Datos importados exitosamente', 'success');

      // Reload page to reflect changes
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error importing data:', error);
      this.showToast('Error al importar datos', 'error');
    }
  };

  reader.readAsText(file);
};

// Update system information in Advanced tab
FinanceApp.prototype.updateSystemInfo = function () {
  // Last update date
  const lastUpdateEl = document.getElementById('lastUpdateDate');
  if (lastUpdateEl) {
    const savedData = localStorage.getItem('financeAppData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.lastUpdate) {
          const date = new Date(data.lastUpdate);
          lastUpdateEl.textContent = date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
      } catch (e) {
        lastUpdateEl.textContent = 'No disponible';
      }
    } else {
      lastUpdateEl.textContent = 'Sin datos';
    }
  }

  // Data size
  const dataSizeEl = document.getElementById('dataSize');
  if (dataSizeEl) {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    const sizeInKB = (totalSize / 1024).toFixed(2);
    dataSizeEl.textContent = `${sizeInKB} KB`;
  }
};

// Update expense form statistics
FinanceApp.prototype.updateExpenseStats = function () {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Count today's expenses
  const todayExpenses = this.expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return expDate.toISOString().split('T')[0] === todayStr;
  });

  // Calculate today's total
  const todayTotal = todayExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  );

  // Calculate month's total
  const monthExpenses = this.expenses.filter((exp) => {
    const expDate = new Date(exp.date);
    return (
      expDate.getMonth() === currentMonth &&
      expDate.getFullYear() === currentYear
    );
  });
  const monthTotal = monthExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0
  );

  // Update DOM elements
  const todayCountEl = document.getElementById('todayExpensesCount');
  const todayTotalEl = document.getElementById('todayExpensesTotal');
  const monthTotalEl = document.getElementById('monthExpensesTotal');

  if (todayCountEl) todayCountEl.textContent = todayExpenses.length;
  if (todayTotalEl)
    todayTotalEl.textContent = `$${this.formatNumber(todayTotal)}`;
  if (monthTotalEl)
    monthTotalEl.textContent = `$${this.formatNumber(monthTotal)}`;
};

// ============================================================================
// UTILIDADES DE FORMATEO NUMÉRICO
// ============================================================================

// Formatea número con separadores de miles (formato chileno: 1.000.000)
FinanceApp.prototype.formatNumber = function (number) {
  if (number === null || number === undefined || isNaN(number)) return '0';

  // Convertir a número si es string
  const num = typeof number === 'string' ? parseFloat(number) : number;

  // Separar parte entera y decimal
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Formatear parte entera con puntos como separadores de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Retornar sin decimales si son .00, sino con decimales
  return decimalPart === '00'
    ? formattedInteger
    : `${formattedInteger},${decimalPart}`;
};

// Limpia el formato de número para obtener valor numérico puro
FinanceApp.prototype.unformatNumber = function (formattedNumber) {
  if (typeof formattedNumber !== 'string' || !formattedNumber) {
    return 0;
  }

  // CORRECCIÓN: Elimina TODOS los caracteres que no sean dígitos o una coma decimal.
  // Luego, reemplaza la coma por un punto para el parseFloat.
  const cleaned = formattedNumber.replace(/[^0-9,]/g, '').replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
};

// Configura formateo automático en un input numérico
FinanceApp.prototype.setupNumberFormatting = function (inputElement) {
  if (!inputElement) return;

  // Cambiar tipo de input de 'number' a 'text' para permitir formato personalizado
  inputElement.type = 'text';
  inputElement.inputMode = 'decimal';

  // Almacenar el valor sin formato
  let rawValue = '';

  // Evento al escribir
  inputElement.addEventListener('input', (e) => {
    let value = e.target.value;

    // Permitir solo números, puntos y comas
    value = value.replace(/[^\d.,]/g, '');

    // Limpiar formato anterior
    const numericValue = this.unformatNumber(value);

    // Guardar posición del cursor
    const cursorPosition = e.target.selectionStart;
    const oldLength = e.target.value.length;

    // Aplicar nuevo formato
    if (!isNaN(numericValue) && value !== '') {
      e.target.value = this.formatNumber(numericValue);
      rawValue = numericValue;

      // Ajustar posición del cursor
      const newLength = e.target.value.length;
      const lengthDiff = newLength - oldLength;
      e.target.setSelectionRange(
        cursorPosition + lengthDiff,
        cursorPosition + lengthDiff
      );
    } else if (value === '') {
      e.target.value = '';
      rawValue = '';
    }
  });

  // Evento al perder foco - asegurar formato correcto
  inputElement.addEventListener('blur', (e) => {
    const value = e.target.value;
    if (value === '') return;

    const numericValue = this.unformatNumber(value);
    if (!isNaN(numericValue)) {
      e.target.value = this.formatNumber(numericValue);
      rawValue = numericValue;
    }
  });

  // Método para obtener valor numérico
  inputElement.getNumericValue = () => {
    return this.unformatNumber(inputElement.value);
  };
};

// Configura formateo en todos los inputs numéricos de la aplicación
FinanceApp.prototype.setupAllNumberInputs = function () {
  // Lista de IDs de inputs numéricos en la aplicación
  const numericInputIds = [
    'amount', // Formulario de gastos
    'monthlyIncome', // Configuración de ingreso mensual
    'goalAmount', // Meta de ahorro
    'budget-food', // Presupuestos por categoría
    'budget-transport',
    'budget-entertainment',
    'budget-health',
    'budget-services',
    'budget-shopping',
    'budget-other',
    'savingsAmount', // Ahorro (modal)
    'recurringPaymentAmount', // Pago recurrente (modal)
    'recurringPaymentDay', // Día del mes
  ];

  // Aplicar formateo a cada input
  numericInputIds.forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      this.setupNumberFormatting(input);
    }
  });

  // También buscar todos los inputs con type="number" en la página
  const numberInputs = document.querySelectorAll('input[type="number"]');
  numberInputs.forEach((input) => {
    this.setupNumberFormatting(input);
  });
};

// === FUNCIONES PARA INGRESOS EXTRAS ===
FinanceApp.prototype.promptAddExtraIncome = function () {
  const amount = prompt(
    '💰 Ingresa el monto del ingreso extra:\n\n(Este monto se sumará a tu ingreso base)'
  );

  if (amount === null) return; // Canceló

  const cleanValue = amount.replace(/[^\d.]/g, '');
  const extraAmount = parseFloat(cleanValue);

  if (!extraAmount || extraAmount <= 0) {
    this.showToast('⚠️ Ingresa un monto válido mayor a cero', 'error');
    return;
  }

  // Sumar al total de extras
  this.extraIncome += extraAmount;

  // Guardar
  this.saveData();

  // Actualizar displays
  this.updateExtraIncomeDisplay();
  this.updateConfigurationDisplay();
  this.renderDashboard();

  this.showToast(
    `✅ Ingreso extra de $${extraAmount.toLocaleString()} agregado`,
    'success'
  );
};

FinanceApp.prototype.resetExtraIncome = function () {
  const confirmed = confirm(
    '⚠️ ¿Resetear ingresos extras?\n\n' +
      `Extras actuales: $${this.extraIncome.toLocaleString()}\n\n` +
      'Esto NO afectará tu ingreso base, solo eliminará los extras acumulados.'
  );

  if (!confirmed) return;

  this.extraIncome = 0;
  this.saveData();
  this.updateExtraIncomeDisplay();
  this.updateConfigurationDisplay();
  this.renderDashboard();

  this.showToast('Ingresos extras reseteados', 'success');
};

FinanceApp.prototype.updateExtraIncomeDisplay = function () {
  const extraDisplay = document.getElementById('extraIncomeDisplay');
  const extraAmount = document.getElementById('extraIncomeAmount');
  const totalDisplay = document.getElementById('totalIncomeDisplay');

  if (extraDisplay && extraAmount) {
    if (this.extraIncome > 0) {
      extraDisplay.style.display = 'flex';
      extraAmount.textContent = `$${this.extraIncome.toLocaleString()}`;
    } else {
      extraDisplay.style.display = 'none';
    }
  }

  if (totalDisplay) {
    const totalIncome = this.monthlyIncome + this.extraIncome;
    totalDisplay.textContent = `$${totalIncome.toLocaleString()}`;
  }
};

FinanceApp.prototype.getTotalIncome = function () {
  return this.monthlyIncome + this.extraIncome;
};

// ========================================
// LOADING SPINNER METHODS
// ========================================
FinanceApp.prototype.hideAppLoading = function () {
  const loader = document.getElementById('loader-wrapper');
  if (loader) {
    loader.classList.add('hidden');
  }
};

if (typeof window !== 'undefined') {
  window.FinanceApp = FinanceApp;
  // window.selectAccountType = selectAccountType; // DESHABILITADO
  // switchToLogin y switchToRegister ya se exportaron anteriormente
  // window.showAccountTypeSelection = showAccountTypeSelection; // DESHABILITADO
}
