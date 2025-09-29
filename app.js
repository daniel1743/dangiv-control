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
    this.accountType = savedData.accountType || localStorage.getItem('financia_account_type') || 'personal';
    this.currentUser = savedData.currentUser || 'anonymous';
    this.accountOwner = savedData.accountOwner || null;
    this.accountUsers = savedData.accountUsers || [];
    this.inviteCodes = savedData.inviteCodes || {};
    this.activityLog = savedData.activityLog || [];

    this.expenses = savedData.expenses || [];
    this.goals = savedData.goals || [];
    this.shoppingItems = savedData.shoppingItems || [];
    this.monthlyIncome = savedData.monthlyIncome || 2500;
    this.userCoins = savedData.userCoins || 100;
    this.ownedStyles = savedData.ownedStyles || ['classic'];
    this.currentStyle = savedData.currentStyle || 'classic';

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
          textColor: '#374151'
        }
      },
      {
        id: 'neon',
        name: 'Neón',
        price: 50,
        colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'],
        options: {
          backgroundColor: '#1a1a2e',
          borderColor: '#16213e',
          textColor: '#ffffff'
        }
      },
      {
        id: 'pastel',
        name: 'Pastel',
        price: 30,
        colors: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff'],
        options: {
          backgroundColor: '#faf9f6',
          borderColor: '#f0f0f0',
          textColor: '#5a5a5a'
        }
      },
      {
        id: 'ocean',
        name: 'Océano',
        price: 40,
        colors: ['#006994', '#13293d', '#004e89', '#247ba0', '#70a9a1'],
        options: {
          backgroundColor: '#f0f8ff',
          borderColor: '#b8dce8',
          textColor: '#13293d'
        }
      },
      {
        id: 'sunset',
        name: 'Atardecer',
        price: 45,
        colors: ['#ff4d6d', '#c9184a', '#a4161a', '#800f2f', '#590d22'],
        options: {
          backgroundColor: '#fff3e0',
          borderColor: '#ffccbc',
          textColor: '#5d4037'
        }
      },
      {
        id: 'forest',
        name: 'Bosque',
        price: 35,
        colors: ['#355e3b', '#2d5016', '#4f7942', '#8fbc8f', '#228b22'],
        options: {
          backgroundColor: '#f1f8e9',
          borderColor: '#c8e6c9',
          textColor: '#2e7d32'
        }
      },
      {
        id: 'royal',
        name: 'Real',
        price: 60,
        colors: ['#4b0082', '#6a0dad', '#9370db', '#ba55d3', '#dda0dd'],
        options: {
          backgroundColor: '#f3e5f5',
          borderColor: '#e1bee7',
          textColor: '#4a148c'
        }
      },
      {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        price: 70,
        colors: ['#ff073a', '#39ff14', '#00ffff', '#ff00ff', '#ffff00'],
        options: {
          backgroundColor: '#0a0a0a',
          borderColor: '#333333',
          textColor: '#00ff00'
        }
      },
      {
        id: 'vintage',
        name: 'Vintage',
        price: 25,
        colors: ['#8b4513', '#a0522d', '#cd853f', '#daa520', '#b8860b'],
        options: {
          backgroundColor: '#fdf5e6',
          borderColor: '#f5deb3',
          textColor: '#8b4513'
        }
      },
      {
        id: 'monochrome',
        name: 'Monocromático',
        price: 20,
        colors: ['#000000', '#2c2c2c', '#545454', '#7c7c7c', '#a4a4a4'],
        options: {
          backgroundColor: '#ffffff',
          borderColor: '#e0e0e0',
          textColor: '#212121'
        }
      }
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
    ];
    this.users = ['Daniel', 'Givonik', 'Otro'];
    this.charts = {};
    this.currentSection = 'dashboard';
    this.currentUser = 'anonymous'; // Â¡CORRECCIÃƒâ€œN APLICADA!
    this.userPlan = 'free'; // free or pro
    this.userProfile = {
      name: 'Usuario',
      email: '',
      avatar:
        'https://ui-avatars.com/api/?name=Usuario&background=3da1ac&color=fff&size=128',
      avatarType: 'default', // 'default' or 'custom'
      selectedAvatar: 0, // Index for default avatars
    };
    this.defaultAvatars = [
      'https://ui-avatars.com/api/?name=U1&background=3da1ac&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U2&background=f97316&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U3&background=ef4444&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U4&background=22c55e&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U5&background=8b5cf6&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U6&background=f59e0b&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U7&background=6366f1&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U8&background=ec4899&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U9&background=14b8a6&color=fff&size=128&font-size=0.6',
      'https://ui-avatars.com/api/?name=U10&background=64748b&color=fff&size=128&font-size=0.6',
    ];
    this.pendingDeleteId = null;
    this.aiRecommendations = [];

    this.conversationHistory = []; // Para guardar el historial del chat
    this.conversationState = 'START'; // Para saber en quÃ© punto del chat estamos
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
  async saveData() {
    const dataToSave = {
      accountType: this.accountType,
      currentUser: this.currentUser,
      accountOwner: this.accountOwner,
      accountUsers: this.accountUsers,
      inviteCodes: this.inviteCodes,
      activityLog: this.activityLog,
      expenses: this.expenses,
      goals: this.goals,
      shoppingItems: this.shoppingItems,
      monthlyIncome: this.monthlyIncome,
      userCoins: this.userCoins,
      ownedStyles: this.ownedStyles,
      currentStyle: this.currentStyle,
      lastUpdate: Date.now(),
    };

    const { cleaned: normalizedData } = this.normalizePersistedData(dataToSave);

    let localSaveOk = false;

    try {
      localStorage.setItem('financiaProData', JSON.stringify(normalizedData));
      localSaveOk = true;
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }

    if (!this.currentUser || this.currentUser === 'anonymous') {
      this.showToast(
        localSaveOk
          ? 'Datos guardados en este dispositivo. Inicia sesión para sincronizarlos en la nube.'
          : 'No se pudieron guardar los datos en este dispositivo.',
        localSaveOk ? 'info' : 'error'
      );
      return;
    }

    try {
      const userDocRef = FB.doc(FB.db, 'userData', this.currentUser);
      await FB.setDoc(userDocRef, normalizedData);

      if (localSaveOk) {
        this.showToast(
          'Datos guardados en la nube y en este dispositivo.',
          'success'
        );
      } else {
        this.showToast(
          'Datos sincronizados en la nube. No se pudieron guardar de forma local.',
          'info'
        );
      }
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
      const message = localSaveOk
        ? 'Los datos se guardaron en este dispositivo, pero falló la sincronización en la nube.'
        : 'No se pudieron guardar los datos.';
      this.showToast(message, 'error');
    }
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

    const loginBtns = document.querySelectorAll(
      '#navbarLoginBtn, #sidebarLoginBtn'
    );
    const profileMenuContainer = document.getElementById(
      'profileMenuContainer'
    );

    FB.onAuthStateChanged(FB.auth, (user) => {
      if (user) {
        this.currentUser = user.uid;
        this.userProfile.email = user.email || '';
        this.userProfile.name =
          user.displayName || user.email?.split('@')[0] || 'Usuario';

        // Show profile menu, hide login buttons
        loginBtns.forEach((btn) => (btn.style.display = 'none'));
        if (profileMenuContainer) profileMenuContainer.style.display = 'block';

        this.updateProfileDisplay();
        this.syncFromFirebase();
        this.updateDashboardWelcome();
      } else {
        this.currentUser = 'anonymous';
        this.userPlan = 'free';
        this.userProfile.name = 'Usuario';
        this.userProfile.email = '';

        // Show login buttons, hide profile menu
        loginBtns.forEach((btn) => (btn.style.display = 'inline-flex'));
        if (profileMenuContainer) profileMenuContainer.style.display = 'none';
        this.updateDashboardWelcome();

        this.renderDashboard();
      }
    });

    // Setup profile menu functionality
    this.setupProfileMenu();

    // El botÃ³n de login ahora abre el modal.
    loginBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.openAuthModal();
      });
    });
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
        this.showToast('Página de perfil próximamente', 'info');
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
      profileLogoutBtn.addEventListener('click', async () => {
        try {
          const FB = window.FB;
          await FB.signOut(FB.auth);
          this.showToast('Sesión cerrada correctamente 👋', 'success');
          profileDropdown.classList.add('hidden');
        } catch (e) {
          this.showToast('Error al cerrar sesión', 'error');
        }
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
  }

  updateProfileDisplay() {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileHeaderImg = document.getElementById('profileHeaderImg');
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
    const avatarSrc =
      this.userProfile.avatarType === 'custom'
        ? this.userProfile.avatar
        : this.defaultAvatars[this.userProfile.selectedAvatar];

    if (profileAvatar) profileAvatar.src = avatarSrc;
    if (profileHeaderImg) profileHeaderImg.src = avatarSrc;

    // Update profile info
    if (profileName) profileName.textContent = this.userProfile.name;
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
    // Simulate upgrading to Pro (for demo purposes)
    this.userPlan = 'pro';
    this.updateProfileDisplay();
    this.showToast('¡Bienvenido a Pro! 🌟', 'success');

    document.getElementById('upgradeModal').remove();
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
    if (this.userPlan !== 'pro') {
      this.showToast('Función disponible solo para usuarios Pro', 'info');
      return;
    }

    // Simulate uploading custom avatar
    const reader = new FileReader();
    reader.onload = (e) => {
      this.userProfile.avatar = e.target.result;
      this.userProfile.avatarType = 'custom';
      this.updateProfileDisplay();
      this.saveData();
      this.showToast('Foto de perfil actualizada', 'success');
    };
    reader.readAsDataURL(file);
  }

  async syncFromFirebase() {
    if (!this.currentUser || this.currentUser === 'anonymous') {
      // Si no hay usuario, no hay nada que sincronizar.
      return;
    }

    try {
      const userDocRef = FB.doc(FB.db, 'userData', this.currentUser);
      const docSnap = await FB.getDoc(userDocRef);

      if (docSnap.exists()) {
        const cloudRaw = docSnap.data() || {};
        const { cleaned: cloudData, changed: cloudNormalized } =
          this.normalizePersistedData(cloudRaw);

        this.expenses = cloudData.expenses || [];
        this.goals = cloudData.goals || [];
        this.shoppingItems = cloudData.shoppingItems || [];
        this.monthlyIncome = cloudData.monthlyIncome || 2500;
        this.securityPasswords = cloudData.securityPasswords || {};

        try {
          localStorage.setItem('danGivControlData', JSON.stringify(cloudData));
        } catch (error) {
          console.warn(
            'No se pudo actualizar el almacenamiento local con los datos de la nube.',
            error
          );
        }

        if (cloudNormalized) {
          console.info(
            'Se normalizaron textos con codificación incorrecta provenientes de la nube.'
          );
        }

        this.showToast('Datos sincronizados desde la nube.', 'success');
      } else {
        this.showToast('¡Bienvenido! Creando tu espacio en la nube.', 'info');
        await this.saveData();
      }

      this.renderDashboard();
      this.renderExpenses();
      this.renderGoals();
      this.renderShoppingList();
      this.renderConfig();
    } catch (error) {
      console.error('Error al sincronizar desde Firestore:', error);
      this.showToast('No se pudieron cargar tus datos desde la nube.', 'error');
    }
  }
  // QuedarÃ¡ asÃ­ (Pega estos dos mÃ©todos nuevos en tu clase)
  // QuedarÃ¡ asÃ­
  // QUEDARÃ ASÃ (FunciÃ³n de registro con depuraciÃ³n mejorada)
  async registerWithEmail(email, password) {
    try {
      console.log('Intentando registrar:', email); // Debug
      const userCredential = await FB.createUserWithEmailAndPassword(
        FB.auth,
        email,
        password
      );
      this.showToast(
        `¡Cuenta creada para ${userCredential.user.email}!`,
        'success'
      );
      this.closeAuthModal();
      return true;
    } catch (error) {
      console.error('Error completo de registro:', error); // Debug mejorado

      // Mensajes de error mÃ¡s especÃ­ficos
      if (error.code === 'auth/weak-password') {
        this.showToast(
          'La contraseña debe tener al menos 6 caracteres.',
          'error'
        );
      } else if (error.code === 'auth/email-already-in-use') {
        this.showToast('El correo electrónico ya está en uso.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        this.showToast('El correo electrónico no es válido.', 'error');
      } else if (error.code === 'auth/operation-not-allowed') {
        this.showToast(
          'El registro con email/password no está habilitado.',
          'error'
        );
      } else {
        this.showToast(`Error: ${error.message}`, 'error');
      }
      return false;
    }
  }
  async loginWithEmail(email, password) {
    try {
      const userCredential = await FB.signInWithEmailAndPassword(
        FB.auth,
        email,
        password
      );
      this.showToast(
        `¡Bienvenido de nuevo, ${userCredential.user.email}!`,
        'success'
      );
      // Opcional: Cerrar el modal de autenticaciÃ³n aquÃ­.
      // document.getElementById('authModal').classList.remove('show');
      return true;
    } catch (error) {
      console.error('Error de inicio de sesiÃ³n:', error.code);
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential'
      ) {
        this.showToast('Correo o contraseña incorrectos.', 'error');
      } else {
        this.showToast('Error al iniciar sesión.', 'error');
      }
      return false;
    }
  }

  // === INICIO DE SECCIÃƒâ€œN: INICIALIZACIÃƒâ€œN DE LA APP ===
  init() {
    // Esta función ahora solo llama directamente a los métodos de configuración.
    this.setupAuth();
    this.setupEventListeners(); // ¡CORRECCIÓN! Llamamos a la función correcta.
    this.setupNotificationBell();
    this.setupScrollOptimization();
    this.initQuickAccess(); // Optimización sutil del scroll

    // Forzar normalización de datos existentes al inicio
    this.forceDataNormalization();

    this.renderDashboard();
    this.initTrendChart();
    this.initSidebarScrollBehavior();
    this.initLazyLoading();
    this.initScrollAnimations();
    this.updateDashboardWelcome();
    this.initAchievements();
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

    // Expense filtering and search functionality
    this.setupExpenseFilters();

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

    // === LÃƒâ€œGICA PARA EL MENÃƒÅ¡ HAMBURGUESA (MÃƒâ€œVIL) ===
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    if (hamburgerBtn && sidebar) {
      let overlay = document.querySelector('.overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
      }

      hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });

      document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
          }
        });
      });
    }

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

    this.chartStyles.forEach(style => {
      const isOwned = this.ownedStyles.includes(style.id);
      const canAfford = this.userCoins >= style.price;

      const productCard = document.createElement('div');
      productCard.className = `product-card ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'unaffordable' : ''}`;

      productCard.innerHTML = `
        <div class="product-preview">
          <div class="mini-chart-preview" style="background: ${style.options.backgroundColor}">
            ${style.colors.map((color, index) =>
              `<div class="color-bar" style="background: ${color}; height: ${20 + index * 10}px;"></div>`
            ).join('')}
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">${style.name}</h3>
          <div class="product-price">
            ${style.price === 0 ? 'Gratis' : `${style.price} monedas`}
          </div>
          <button class="product-btn ${isOwned ? 'owned-btn' : (canAfford ? 'buy-btn' : 'disabled-btn')}"
                  onclick="app.${isOwned ? `applyStyle('${style.id}')` : `purchaseStyle('${style.id}')`}"
                  ${!canAfford && !isOwned ? 'disabled' : ''}>
            ${isOwned ? 'Aplicar' : (canAfford ? 'Comprar' : 'Insuficientes monedas')}
          </button>
        </div>
      `;

      storeGrid.appendChild(productCard);
    });
  }

  purchaseStyle(styleId) {
    const style = this.chartStyles.find(s => s.id === styleId);
    if (!style || this.ownedStyles.includes(styleId) || this.userCoins < style.price) {
      return;
    }

    this.userCoins -= style.price;
    this.ownedStyles.push(styleId);
    this.saveData();

    this.renderStore();
    this.updateCoinsDisplay();
    this.setupStyleManager();

    this.showToast(`¡Has adquirido el estilo "${style.name}"!`, 'success');
  }

  applyStyle(styleId) {
    if (!this.ownedStyles.includes(styleId)) return;

    this.currentStyle = styleId;
    this.saveData();

    this.refreshAllCharts();
    this.setupStyleManager();

    const style = this.chartStyles.find(s => s.id === styleId);
    this.showToast(`Estilo "${style.name}" aplicado`, 'success');
  }

  setupStyleManager() {
    const ownedStylesGrid = document.getElementById('ownedStylesGrid');
    const currentStyleName = document.getElementById('currentStyleName');

    if (!ownedStylesGrid) return;

    // Update current style display
    const currentStyleObj = this.chartStyles.find(s => s.id === this.currentStyle);
    if (currentStyleName && currentStyleObj) {
      currentStyleName.textContent = currentStyleObj.name;
    }

    // Render owned styles
    ownedStylesGrid.innerHTML = '';

    this.ownedStyles.forEach(styleId => {
      const style = this.chartStyles.find(s => s.id === styleId);
      if (!style) return;

      const styleCard = document.createElement('div');
      styleCard.className = `owned-style-card ${this.currentStyle === styleId ? 'active' : ''}`;

      styleCard.innerHTML = `
        <div class="owned-style-preview" style="background: ${style.options.backgroundColor}">
          ${style.colors.slice(0, 3).map((color, index) =>
            `<div class="mini-color-dot" style="background: ${color};"></div>`
          ).join('')}
        </div>
        <div class="owned-style-info">
          <span class="owned-style-name">${style.name}</span>
          ${this.currentStyle === styleId ? '<span class="active-badge">Activo</span>' : ''}
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
    const currentStyleObj = this.chartStyles.find(s => s.id === this.currentStyle);
    return currentStyleObj ? currentStyleObj.colors : this.chartStyles[0].colors;
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

    necessityButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();

        // Remove active class from all buttons
        necessityButtons.forEach(b => b.classList.remove('active'));

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
      await new Promise(resolve => setTimeout(resolve, 1500));

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
      { id: 'date', name: 'Fecha' }
    ];

    // Add user field validation for shared accounts
    if (this.accountType === 'shared') {
      requiredFields.push({ id: 'user', name: 'Usuario' });
    }

    let isValid = true;

    requiredFields.forEach(field => {
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
      form.querySelectorAll('.form-control-premium').forEach(field => {
        field.classList.remove('error', 'success', 'auto-filled');
      });

      // Remove error messages
      form.querySelectorAll('.error-message').forEach(msg => msg.remove());

      // Reset necessity selector
      document.querySelectorAll('.necessity-btn').forEach(btn => {
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

    this.currentSection = sectionId;

    // Render section-specific content
    setTimeout(() => {
      if (sectionId === 'analysis') {
        this.renderAnalysis();
        this.renderRadarChart();
      } else if (sectionId === 'dashboard') {
        this.renderDashboard();
      } else if (sectionId === 'achievements') {
        this.renderAchievements();
      }
    }, 100);
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
    const totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const monthlyIncome = this.monthlyIncome || 0;
    const balance = monthlyIncome - totalExpenses;
    const savings = balance > 0 ? balance : 0;
    const activeGoals = this.goals.filter(goal => goal.current < goal.target).length;
    const goalsProgress = this.goals.length > 0
      ? Math.round((this.goals.reduce((sum, goal) => sum + (goal.current / goal.target * 100), 0) / this.goals.length))
      : 0;

    // Update DOM elements
    document.getElementById('newTotalBalance').textContent = `$${this.formatCurrency(balance)}`;
    document.getElementById('newTotalExpenses').textContent = `$${this.formatCurrency(totalExpenses)}`;
    document.getElementById('newSavings').textContent = `$${this.formatCurrency(savings)}`;
    document.getElementById('newActiveGoals').textContent = activeGoals;
    document.getElementById('newGoalsProgress').textContent = `${goalsProgress}% completado`;

    // Update trends
    const expensesChange = this.calculateExpensesChange();
    const expensesChangeEl = document.getElementById('newExpensesChange');
    if (expensesChangeEl) {
      expensesChangeEl.textContent = `${expensesChange >= 0 ? '+' : ''}${expensesChange}% vs anterior`;
      expensesChangeEl.className = `stat-trend ${expensesChange >= 0 ? 'negative' : 'positive'}`;
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
    const totalExpenses = categoryData.reduce((sum, item) => sum + item.amount, 0);

    totalAmountEl.textContent = `$${this.formatCurrency(totalExpenses)}`;

    if (categoryData.length === 0) {
      // Show demo data
      const demoData = [
        { category: 'Alimentación', amount: 450, color: '#FF6384' },
        { category: 'Transporte', amount: 200, color: '#36A2EB' },
        { category: 'Entretenimiento', amount: 150, color: '#FFCE56' }
      ];

      this.newPremiumChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: demoData.map(item => item.category),
          datasets: [{
            data: demoData.map(item => item.amount),
            backgroundColor: demoData.map(item => item.color),
            borderWidth: 0,
            hoverBorderWidth: 3,
            hoverBorderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => `${context.label}: $${this.formatCurrency(context.raw)}`
              }
            }
          },
          cutout: '60%'
        }
      });

      // Update legend
      legendContainer.innerHTML = demoData.map(item => `
        <div class="legend-item demo-item">
          <span class="legend-color" style="background-color: ${item.color}"></span>
          <span class="legend-label">${item.category}</span>
          <span class="legend-amount">$${this.formatCurrency(item.amount)}</span>
        </div>
      `).join('');

      totalAmountEl.textContent = `$${this.formatCurrency(800)}`;
      return;
    }

    // Real data chart
    this.newPremiumChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryData.map(item => item.category),
        datasets: [{
          data: categoryData.map(item => item.amount),
          backgroundColor: categoryData.map(item => item.color),
          borderWidth: 0,
          hoverBorderWidth: 3,
          hoverBorderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: $${this.formatCurrency(context.raw)}`
            }
          }
        },
        cutout: '60%'
      }
    });

    // Update legend
    legendContainer.innerHTML = categoryData.map(item => `
      <div class="legend-item">
        <span class="legend-color" style="background-color: ${item.color}"></span>
        <span class="legend-label">${item.category}</span>
        <span class="legend-amount">$${this.formatCurrency(item.amount)}</span>
      </div>
    `).join('');
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
        datasets: [{
          label: 'Gastos Diarios',
          data: trendData.data,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#007bff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: {
              callback: (value) => `$${this.formatCurrency(value)}`
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  renderNewAIRecommendations() {
    const container = document.getElementById('newAiRecommendations');
    if (!container) return;

    container.innerHTML = '';

    let recommendations = [];

    if (this.expenses.length > 0) {
      const totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const avgDailySpend = totalExpenses / Math.max(1, this.expenses.length);

      recommendations = [
        `💡 Tu gasto promedio diario es $${avgDailySpend.toFixed(2)}. Considera establecer un presupuesto diario.`,
        `📊 Has registrado ${this.expenses.length} transacciones. ¡Mantén el control de tus finanzas!`,
        `🎯 Revisa tus gastos semanalmente para identificar oportunidades de ahorro.`
      ];
    } else {
      recommendations = [
        `💡 Comienza registrando todos tus gastos, incluso los pequeños. Todo suma.`,
        `🎯 Establece metas financieras específicas y alcanzables para mantenerte motivado.`,
        `📊 Revisa tus gastos semanalmente para identificar patrones y oportunidades.`
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
        { description: "Almuerzo en restaurante", amount: 25.50, category: "Alimentación", date: new Date() },
        { description: "Combustible", amount: 45.00, category: "Transporte", date: new Date(Date.now() - 86400000) },
        { description: "Supermercado", amount: 67.30, category: "Alimentación", date: new Date(Date.now() - 172800000) }
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
          <div class="transaction-amount">-$${expense.amount.toFixed(2)}</div>
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
            <span class="transaction-date">${new Date(expense.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="transaction-amount">-$${this.formatCurrency(expense.amount)}</div>
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
      addExpenseBtn.addEventListener('click', () => this.showSection('expenses'));
    }
    if (addGoalBtn) {
      addGoalBtn.addEventListener('click', () => this.showSection('goals'));
    }
    if (viewAnalysisBtn) {
      viewAnalysisBtn.addEventListener('click', () => this.showSection('analysis'));
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
      <span class="transaction-amount">-$${this.formatCurrency(lastExpense.amount)}</span>
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
  }

  updateNotifications() {
    // Initialize notification tracking if not exists
    if (!this.notificationStates) {
      this.notificationStates = new Map();
    }

    let notifications = [];
    const today = new Date();

    // Generate goal notifications
    this.goals.forEach((goal, index) => {
      const deadline = new Date(goal.deadline);
      const diff = (deadline - today) / (1000 * 60 * 60 * 24);
      const progress = (goal.current / goal.target) * 100;

      if (diff <= 7 && goal.current < goal.target) {
        const priority = diff <= 2 ? 'high' : diff <= 5 ? 'medium' : 'low';
        const urgencyText = diff <= 1 ? 'mañana' : `${Math.ceil(diff)} días`;

        notifications.push({
          id: `goal-${index}-deadline`,
          type: 'goal',
          category: 'goal',
          title: goal.name,
          subtitle: `Meta vence en ${urgencyText}`,
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

    // Generate expense notifications for recent large expenses
    const recentExpenses = this.expenses
      .filter((exp) => {
        const expDate = new Date(exp.date);
        const daysDiff = (today - expDate) / (1000 * 60 * 60 * 24);
        return daysDiff <= 3; // Last 3 days
      })
      .sort((a, b) => b.amount - a.amount);

    recentExpenses.slice(0, 3).forEach((exp, index) => {
      const isLarge = exp.amount > this.monthlyIncome * 0.1; // 10% of monthly income
      const priority = exp.protected ? 'high' : isLarge ? 'medium' : 'low';

      notifications.push({
        id: `expense-${exp.date}-${index}`,
        type: 'expense',
        category: this.getCategoryIcon(exp.category),
        title: exp.description,
        subtitle: exp.protected
          ? 'Gasto protegido'
          : `Gasto en ${exp.category}`,
        amount: `$${this.formatCurrency(exp.amount)}`,
        time: this.getRelativeTime(new Date(exp.date)),
        priority: priority,
        data: { expenseId: index, section: 'expenses' },
        isRead:
          this.notificationStates.get(`expense-${exp.date}-${index}`) || false,
      });
    });

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
    if (badge) {
      if (count > 0) {
        badge.style.display = 'flex';
        badge.textContent = count > 99 ? '99+' : count.toString();
      } else {
        badge.style.display = 'none';
      }
    }
  }

  renderNotificationList(notifications) {
    const list = document.getElementById('notificationList');
    const emptyState = document.getElementById('notificationEmpty');

    if (!list || !emptyState) return;

    // Show/hide empty state
    if (notifications.length === 0) {
      list.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    list.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Sort notifications by priority and read status
    const sortedNotifications = notifications.sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
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

    const emoji = this.getCategoryEmoji(notification.category);

    item.innerHTML = `
      <div class="notification-icon category-${notification.category}">
        ${emoji}
      </div>

      <div class="notification-content">
        <h6 class="notification-title">${notification.title}</h6>
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
        <button class="notification-action-btn" data-action="view" title="Ver detalles">
          <i class="fas fa-external-link-alt"></i>
        </button>
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
        this.updateNotifications(); // Refresh the list
      }, 200);
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

    // Navigate to relevant section (placeholder for future implementation)
    this.showToast('Navegación a sección específica próximamente', 'info');

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
      stats = {
        availableBalance: this.monthlyIncome - totalExpenses,
        totalExpenses: totalExpenses,
        totalSavings: totalSavings,
        transactionCount: this.expenses.length,
      };
    }

    document.getElementById(
      'totalBalance'
    ).textContent = `$${stats.availableBalance.toLocaleString()}`;
    document.getElementById(
      'totalExpenses'
    ).textContent = `$${stats.totalExpenses.toLocaleString()}`;
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

    // Crear nuevo gráfico tipo "hamburguesa"
    this.charts.premiumChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: false,
        maintainAspectRatio: false,
        cutout: '65%', // Anillo óptimo para visualización
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
                return ` ${label}: $${value.toFixed(2)} (${percentage}%)`;
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
          canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
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
      necessaryAmount = 1200;
      unnecessaryAmount = 800;
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

    // Actualizar valores
    const cashFlowTotal = document.getElementById('cashFlowTotal');
    const necessaryValue = document.getElementById('necessaryValue');
    const unnecessaryValue = document.getElementById('unnecessaryValue');

    if (cashFlowTotal) cashFlowTotal.textContent = `$${total.toLocaleString()}`;
    if (necessaryValue)
      necessaryValue.textContent = `$${necessaryAmount.toLocaleString()}`;
    if (unnecessaryValue)
      unnecessaryValue.textContent = `$${unnecessaryAmount.toLocaleString()}`;

    // Animar barras de progreso
    const necessaryProgress = document.getElementById('necessaryProgress');
    const unnecessaryProgress = document.getElementById('unnecessaryProgress');

    if (necessaryProgress && total > 0) {
      setTimeout(() => {
        necessaryProgress.style.width = `${(necessaryAmount / total) * 100}%`;
      }, 300);
    }

    if (unnecessaryProgress && total > 0) {
      setTimeout(() => {
        unnecessaryProgress.style.width = `${
          (unnecessaryAmount / total) * 100
        }%`;
      }, 600);
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
      current = 4200;
      target = 6000;
      percentage = Math.round((current / target) * 100);
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

    // Actualizar textos
    if (goalsProgressText) {
      goalsProgressText.textContent = `$${current.toLocaleString()} / $${target.toLocaleString()}`;
    }

    if (goalsProgressPercentage) {
      goalsProgressPercentage.textContent = `${percentage}%`;
    }

    // Animar anillo de progreso
    if (goalsProgressRing) {
      const circumference = 2 * Math.PI * 35; // r=35
      const offset = circumference - (percentage / 100) * circumference;

      setTimeout(() => {
        goalsProgressRing.style.strokeDashoffset = offset;
      }, 800);
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
      this.charts.expenseChart.update('none');
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
          cutout: '60%',
          layout: {
            padding: {
              top: 60,
              bottom: 60,
              left: 60,
              right: 60,
            },
          },
          animation: {
            duration: 1200,
            easing: 'easeInOutQuart',
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
                padding: 15,
                font: {
                  size: 11,
                  family: 'Inter, sans-serif',
                },
                color: 'var(--color-text-secondary)',
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
                        text: `${label} (${percentage}%)`,
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
            },
            datalabels: {
              display: true,
              color: '#ffffff',
              backgroundColor: function (context) {
                return context.dataset.backgroundColor[context.dataIndex];
              },
              borderColor: '#ffffff',
              borderRadius: 6,
              borderWidth: 1,
              font: {
                weight: 'bold',
                size: 10,
                family: 'Inter, sans-serif',
              },
              padding: 4,
              formatter: function (value, context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = (value / total) * 100;
                if (percentage < 5) return '';
                return context.chart.data.labels[context.dataIndex];
              },
              anchor: 'end',
              align: 'end',
              offset: 20,
              clip: false,
            },
            tooltip: {
              enabled: true,
              backgroundColor: 'var(--color-surface-raised)',
              titleColor: 'var(--color-text)',
              bodyColor: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border)',
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              displayColors: true,
              boxPadding: 4,
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.chart.getDatasetMeta(0).total;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return ` ${label}: $${value.toFixed(2)} (${percentage}%)`;
                },
              },
            },
          },
        },
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
      const totalExpenses = this.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const avgDailySpend = totalExpenses / Math.max(1, this.expenses.length);

      recommendations = [
        `Tu gasto promedio diario es $${avgDailySpend.toFixed(2)}. Considera establecer un presupuesto diario.`,
        `Has registrado ${this.expenses.length} transacciones. ¡Mantén el control de tus finanzas!`,
        "Revisa tus gastos semanalmente para identificar oportunidades de ahorro."
      ];
    } else {
      // Consejos útiles para usuarios nuevos
      recommendations = [
        "💡 Comienza registrando todos tus gastos, incluso los pequeños. Todo suma.",
        "🎯 Establece metas financieras específicas y alcanzables para mantenerte motivado.",
        "📊 Revisa tus gastos semanalmente para identificar patrones y oportunidades.",
        "💰 Ahorra al menos el 20% de tus ingresos mensuales para emergencias.",
        "📱 Usa esta app diariamente para desarrollar buenos hábitos financieros."
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
        { description: "Almuerzo en restaurante", amount: 25.50, category: "Alimentación", date: new Date() },
        { description: "Combustible", amount: 45.00, category: "Transporte", date: new Date(Date.now() - 86400000) },
        { description: "Supermercado", amount: 67.30, category: "Alimentación", date: new Date(Date.now() - 172800000) },
        { description: "Cine", amount: 15.00, category: "Entretenimiento", date: new Date(Date.now() - 259200000) },
        { description: "Farmacia", amount: 12.80, category: "Salud", date: new Date(Date.now() - 345600000) }
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
          <div class="transaction-amount">-$${expense.amount.toFixed(2)}</div>
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
      const hasContent = recentExpenses.length > 0 || container.children.length > 0;
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
    const amount = parseFloat(document.getElementById('amount').value);
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
      !date ||
      !user
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
      user: user,
      protected: user === 'Daniel' || user === 'Givonik',
    };

    this.expenses.push(expense);
    this.saveData();
    this.renderDashboard();
    this.renderExpenses();
    this.updateTrendChart();
    this.updateLastTransaction();
    this.checkAchievements();
    this.showToast('Gasto registrado exitosamente', 'success');

    document.getElementById('expenseForm').reset();
    this.setupCurrentDate();
  }

  renderExpenses() {
    // If filters are initialized, use filtered rendering
    if (this.expenseFilters) {
      this.renderExpensesWithFilters();
      return;
    }

    // Fallback to original method for initialization
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
        expense.protected ? 'PROTEGIDO' : '',
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

  // Setup expense filtering and search functionality
  setupExpenseFilters() {
    const searchInput = document.getElementById('expenseSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const necessityFilter = document.getElementById('necessityFilter');
    const userFilter = document.getElementById('userFilter');
    const dateFromFilter = document.getElementById('dateFromFilter');
    const dateToFilter = document.getElementById('dateToFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const exportCSVBtn = document.getElementById('exportCSV');

    // Initialize filters
    this.expenseFilters = {
      search: '',
      category: '',
      necessity: '',
      user: '',
      dateFrom: '',
      dateTo: ''
    };

    // Add event listeners for all filters
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.expenseFilters.search = e.target.value.toLowerCase();
        this.renderExpensesWithFilters();
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.expenseFilters.category = e.target.value;
        this.renderExpensesWithFilters();
      });
    }

    if (necessityFilter) {
      necessityFilter.addEventListener('change', (e) => {
        this.expenseFilters.necessity = e.target.value;
        this.renderExpensesWithFilters();
      });
    }

    if (userFilter) {
      userFilter.addEventListener('change', (e) => {
        this.expenseFilters.user = e.target.value;
        this.renderExpensesWithFilters();
      });
    }

    if (dateFromFilter) {
      dateFromFilter.addEventListener('change', (e) => {
        this.expenseFilters.dateFrom = e.target.value;
        this.renderExpensesWithFilters();
      });
    }

    if (dateToFilter) {
      dateToFilter.addEventListener('change', (e) => {
        this.expenseFilters.dateTo = e.target.value;
        this.renderExpensesWithFilters();
      });
    }

    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearExpenseFilters();
      });
    }

    // Export CSV button
    if (exportCSVBtn) {
      exportCSVBtn.addEventListener('click', () => {
        this.exportExpensesToCSV();
      });
    }
  }

  // Filter expenses based on current filter settings
  filterExpenses(expenses) {
    return expenses.filter(expense => {
      // Search filter
      if (this.expenseFilters.search) {
        const searchText = this.expenseFilters.search;
        const description = this.fixLegacyEncoding(expense.description).toLowerCase();
        if (!description.includes(searchText)) {
          return false;
        }
      }

      // Category filter
      if (this.expenseFilters.category && expense.category !== this.expenseFilters.category) {
        return false;
      }

      // Necessity filter
      if (this.expenseFilters.necessity && expense.necessity !== this.expenseFilters.necessity) {
        return false;
      }

      // User filter
      if (this.expenseFilters.user && expense.user !== this.expenseFilters.user) {
        return false;
      }

      // Date range filter
      if (this.expenseFilters.dateFrom || this.expenseFilters.dateTo) {
        const expenseDate = new Date(expense.date);

        if (this.expenseFilters.dateFrom) {
          const fromDate = new Date(this.expenseFilters.dateFrom);
          if (expenseDate < fromDate) {
            return false;
          }
        }

        if (this.expenseFilters.dateTo) {
          const toDate = new Date(this.expenseFilters.dateTo);
          // Set time to end of day for dateTo comparison
          toDate.setHours(23, 59, 59, 999);
          if (expenseDate > toDate) {
            return false;
          }
        }
      }

      return true;
    });
  }

  // Clear all expense filters
  clearExpenseFilters() {
    this.expenseFilters = {
      search: '',
      category: '',
      necessity: '',
      user: '',
      dateFrom: '',
      dateTo: ''
    };

    // Clear form inputs
    const searchInput = document.getElementById('expenseSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const necessityFilter = document.getElementById('necessityFilter');
    const userFilter = document.getElementById('userFilter');
    const dateFromFilter = document.getElementById('dateFromFilter');
    const dateToFilter = document.getElementById('dateToFilter');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.selectedIndex = 0;
    if (necessityFilter) necessityFilter.selectedIndex = 0;
    if (userFilter) userFilter.selectedIndex = 0;
    if (dateFromFilter) dateFromFilter.value = '';
    if (dateToFilter) dateToFilter.value = '';

    this.renderExpensesWithFilters();
  }

  // Update expense summary stats
  updateExpenseSummary(filteredExpenses) {
    const countElement = document.getElementById('expenseCount');
    const totalElement = document.getElementById('expenseTotal');

    if (countElement) {
      const count = filteredExpenses.length;
      countElement.textContent = `${count} gasto${count !== 1 ? 's' : ''}`;
    }

    if (totalElement) {
      const total = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      totalElement.textContent = `$${total.toFixed(2)}`;
    }
  }

  // Render expenses with current filters applied
  renderExpensesWithFilters() {
    const container = document.getElementById('expenseList');
    if (!container) return;

    container.innerHTML = '';

    // Apply filters
    const filteredExpenses = this.filterExpenses(this.expenses);

    // Update summary
    this.updateExpenseSummary(filteredExpenses);

    if (filteredExpenses.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-search"></i><h3>No se encontraron gastos con los filtros aplicados</h3><p>Prueba ajustando los criterios de búsqueda</p></div>';
      return;
    }

    const sortedExpenses = [...filteredExpenses].sort(
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
        expense.protected ? 'PROTEGIDO' : '',
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

  // Export expenses to CSV
  exportExpensesToCSV() {
    const filteredExpenses = this.filterExpenses(this.expenses);

    if (filteredExpenses.length === 0) {
      this.showToast('No hay gastos para exportar', 'warning');
      return;
    }

    // CSV headers
    const headers = ['Fecha', 'Descripción', 'Categoría', 'Monto', 'Usuario', 'Necesidad'];

    // Convert expenses to CSV format
    const csvData = [
      headers.join(','),
      ...filteredExpenses.map(expense => [
        expense.date,
        `"${this.fixLegacyEncoding(expense.description).replace(/"/g, '""')}"`,
        expense.category,
        expense.amount,
        expense.user,
        expense.necessity
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      const today = new Date().toISOString().split('T')[0];
      const filename = `gastos_${today}.csv`;
      link.setAttribute('download', filename);

      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showToast(`Archivo ${filename} descargado exitosamente`, 'success');
    } else {
      this.showToast('Error al exportar archivo', 'error');
    }
  }

  deleteExpense(id) {
    const idx = this.expenses.findIndex((expense) => expense.id === id);
    if (idx === -1) {
      this.showToast('Gasto no encontrado', 'error');
      return;
    }

    const item = this.expenses[idx];

    if (!item.protected) {
      this.expenses.splice(idx, 1);
      this.saveData();
      this.renderDashboard();
      this.renderExpenses();
      this.showToast('Gasto eliminado', 'success');
      return;
    }

    const modal = document.getElementById('securityModal');
    if (!modal) {
      this.showToast('Modal de seguridad no disponible', 'error');
      return;
    }

    this.openDeleteModal(id);
  }

  openDeleteModal(expenseId) {
    const modal = document.getElementById('securityModal');
    const titleEl = modal.querySelector('.modal-title');
    const saveBtn = document.getElementById('modalSavePasswordsBtn');
    const newPassSection = document.getElementById('newPassSection');

    if (titleEl)
      titleEl.innerHTML = `<i class="fas fa-key"></i> Confirmar eliminaciÃ³n`;
    if (saveBtn) saveBtn.textContent = 'Eliminar';
    if (newPassSection) newPassSection.style.display = 'none';

    // Limpiar campos
    const curDanielEl = document.getElementById('curDaniel');
    const curGivonikEl = document.getElementById('curGivonik');
    if (curDanielEl) curDanielEl.value = '';
    if (curGivonikEl) curGivonikEl.value = '';

    // Configurar evento de eliminaciÃ³n
    this.pendingDeleteId = expenseId;
    modal.classList.add('show');
  }

  confirmDeleteFromModal() {
    const curDanielEl = document.getElementById('curDaniel');
    const curGivonikEl = document.getElementById('curGivonik');

    if (!curDanielEl || !curGivonikEl) return;

    const curDaniel = curDanielEl.value || '';
    const curGivonik = curGivonikEl.value || '';

    if (!this.verifyPassword('Daniel', curDaniel)) {
      this.showToast('Contraseña actual de Daniel incorrecta', 'error');
      return;
    }
    if (!this.verifyPassword('Givonik', curGivonik)) {
      this.showToast('Contraseña actual de Givonik incorrecta', 'error');
      return;
    }

    // Eliminar gasto
    const idx = this.expenses.findIndex((e) => e.id === this.pendingDeleteId);
    if (idx !== -1) {
      this.expenses.splice(idx, 1);
      this.saveData();
      this.renderDashboard();
      this.renderExpenses();
      this.showToast('Gasto eliminado', 'success');
    }

    document.getElementById('securityModal').classList.remove('show');
    this.pendingDeleteId = null;
  }

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

  // === SECCIÃƒâ€œN: MANEJO DEL MODAL DE AUTENTICACIÃƒâ€œN (LOGIN/REGISTRO) ===

  openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  setupAuthModalListeners() {
    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authSwitchLink = document.getElementById('authSwitchLink');
    const closeButtons = modal.querySelectorAll('[data-close-modal]');

    // Listener para cambiar entre login y registro
    authSwitchLink?.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.toggle('hidden');
      registerForm.classList.toggle('hidden');
      const isLoginVisible = !loginForm.classList.contains('hidden');
      authSwitchLink.innerHTML = isLoginVisible
        ? '¿No tienes una cuenta? <a href="#">Regístrate aquí</a>'
        : '¿Ya tienes una cuenta? <a href="#">Inicia sesión</a>';
    });

    // Listener para el formulario de login
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const success = await this.loginWithEmail(email, password);
      if (success) {
        this.closeAuthModal();
        this.showPremiumFeatures();
      }
    });

    // Listener para el formulario de registro
    registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const success = await this.registerWithEmail(email, password);
      if (success) {
        this.closeAuthModal();
        this.showPremiumFeatures();
      }
    });

    // Listeners para cerrar el modal
    closeButtons.forEach((btn) =>
      btn.addEventListener('click', () => this.closeAuthModal())
    );
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'authModal') {
        this.closeAuthModal();
      }
    });
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
      this.showToast('La nueva contraseña debe tener al menos 6 caracteres', 'error');
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
        const userDocRef = FB.doc(FB.db, 'userData', this.firebaseUser.uid);
        await FB.updateDoc(userDocRef, {
          passwordUpdatedAt: Date.now()
        });

        document.getElementById('securityModal').classList.remove('show');
        document.body.style.overflow = '';
        this.showToast('Contraseña actualizada correctamente', 'success');
      } catch (error) {
        console.error('Error changing password:', error);
        if (error.code === 'auth/wrong-password') {
          this.showToast('Contraseña actual incorrecta', 'error');
        } else {
          this.showToast('Error al cambiar contraseña: ' + error.message, 'error');
        }
      }
    } else {
      this.showToast('Debes iniciar sesión para cambiar tu contraseña', 'error');
    }
  }

  // Goals Methods
  addGoal(e) {
    e.preventDefault();

    const name = document.getElementById('goalName').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
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
            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
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
          exp.necessity === 'Compra por Impulso'
      )
      .reduce((sum, exp) => sum + exp.amount, 0);

    this.charts.necessityChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Necesario', 'No Necesario'],
        datasets: [
          {
            data: [necessaryExpenses, unnecessaryExpenses],
            backgroundColor: [this.getCurrentStyleColors()[0], this.getCurrentStyleColors()[1]],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
        exp.necessity === 'Compra por Impulso'
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

    const income = parseFloat(document.getElementById('monthlyIncome').value);

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

  renderConfig() {
    const incomeField = document.getElementById('monthlyIncome');
    if (incomeField) {
      incomeField.value = this.monthlyIncome;
    }

    const container = document.getElementById('monthSummary');
    if (!container) return;

    const totalExpenses = this.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const available = this.monthlyIncome - totalExpenses;
    const savingsGoal = this.goals.reduce(
      (sum, goal) => sum + (goal.target - goal.current),
      0
    );

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <h3>Ingresos del Mes</h3>
            <p class="stat-value">$${this.monthlyIncome.toLocaleString()}</p>
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
    const currentTheme =
      document.documentElement.getAttribute('data-color-scheme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-color-scheme', newTheme);

    const icon = document.querySelector('#themeToggle i');
    if (icon) {
      icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
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
} // <-- FIN DE LA CLASE FINANCEAPP

// === INICIO DE SECCIÃƒâ€œN: INICIALIZACIÃƒâ€œN GLOBAL DE LA APP ===

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa la aplicaciÃ³n principal una sola vez.
  if (!window.app) {
    window.app = new FinanceApp();
    window.app.init();
  }

  // 2. Configura las animaciones de scroll.
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
// QuedarÃ¡ asÃ­
// 1. Funcionalidad para mostrar/ocultar contraseÃ±as (toggle pass)
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('toggle-pass')) {
    // CORRECCIÃƒâ€œN: Usamos el data-target para encontrar el input correcto.
    const inputId = e.target.dataset.target;
    const input = document.getElementById(inputId);

    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        e.target.classList.remove('fa-eye');
        e.target.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        e.target.classList.remove('fa-eye-slash');
        e.target.classList.add('fa-eye');
      }
    }
  }
});
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

    if (this.currentUser && this.currentUser !== 'anonymous') {
      greeting += `, ${this.currentUser}!`;
    } else {
      greeting += ', Usuario!';
    }

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
              return `${context.label}: ${value}% ($${amount.toFixed(2)})`;
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

    // Professional welcome messages for authenticated users
    const welcomeMessages = [
      `¡Hola ${userName}! Este es tu dashboard financiero`,
      `Bienvenido de vuelta, ${userName}`,
      `Tu centro de control financiero, ${userName}`,
      `Dashboard financiero de ${userName}`,
    ];

    const professionalSubtitles = [
      'Gestiona tus inversiones, controla gastos y alcanza tus objetivos financieros',
      'Analiza tu rendimiento financiero y toma decisiones estratégicas',
      'Monitorea tu patrimonio y optimiza tu flujo de caja',
      'Supervisa tus finanzas como un experto en inversiones',
      'Controla cada aspecto de tu economía personal',
      'Tu herramienta profesional para la excelencia financiera',
    ];

    // Select random messages to keep it fresh
    const randomWelcome =
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    const randomSubtitle =
      professionalSubtitles[
        Math.floor(Math.random() * professionalSubtitles.length)
      ];

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

// Global function for account type selection
function selectAccountType(type) {
  window.selectedAccountType = type;

  document.getElementById('accountTypeModal').classList.remove('show');
  document.body.style.overflow = '';

  // Show registration form with account type pre-selected
  document.getElementById('authModal').classList.add('show');
  document.getElementById('authModalTitle').textContent =
    type === 'personal' ? 'Crear Cuenta Personal' : 'Crear Cuenta Compartida';

  // Show register form
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.remove('hidden');
  document.getElementById('authSwitchLink').innerHTML =
    '¿Ya tienes una cuenta? <a href="#" onclick="switchToLogin()">Inicia sesión aquí</a>';

  // Show invite code field for shared accounts
  if (type === 'shared') {
    document.getElementById('inviteCodeGroup').classList.remove('hidden');
  } else {
    document.getElementById('inviteCodeGroup').classList.add('hidden');
  }
}

function switchToLogin() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  document.getElementById('authModalTitle').textContent = '¡Bienvenido de vuelta!';
  document.getElementById('authSwitchLink').innerHTML =
    '¿No tienes una cuenta? <a href="#" onclick="showAccountTypeSelection()">Regístrate aquí</a>';
}

function showAccountTypeSelection() {
  document.getElementById('authModal').classList.remove('show');
  document.getElementById('accountTypeModal').classList.add('show');
}

FinanceApp.prototype.setupUserSystemListeners = function() {
  // Auth form switch
  const authSwitchLink = document.getElementById('authSwitchLink');
  if (authSwitchLink) {
    authSwitchLink.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        if (e.target.onclick) {
          e.target.onclick();
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

  // Show account type selection on first register click
  const navbarLoginBtn = document.getElementById('navbarLoginBtn');
  if (navbarLoginBtn) {
    navbarLoginBtn.addEventListener('click', () => {
      showAccountTypeSelection();
    });
  }

  const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
  if (sidebarLoginBtn) {
    sidebarLoginBtn.addEventListener('click', () => {
      showAccountTypeSelection();
    });
  }

  // Update user selection dropdown
  this.updateUserSelectionDropdown();
};

FinanceApp.prototype.handleRegistration = function() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const inviteCode = document.getElementById('inviteCode').value.trim();

  if (!name || !email || !password) {
    this.showToast('Todos los campos son obligatorios', 'error');
    return;
  }

  const accountType = window.selectedAccountType || 'personal';

  if (accountType === 'shared' && inviteCode) {
    // Joining existing shared account
    if (this.validateInviteCode(inviteCode)) {
      this.joinSharedAccount(name, email, password, inviteCode);
    } else {
      this.showToast('Código de invitación inválido', 'error');
      return;
    }
  } else {
    // Creating new account
    this.createNewAccount(name, email, password, accountType);
  }
};

FinanceApp.prototype.createNewAccount = function(name, email, password, accountType) {
  const userId = this.generateUserId();

  this.accountType = accountType;
  this.currentUser = userId;
  this.accountOwner = userId;
  this.accountUsers = [{
    id: userId,
    name: name,
    email: email,
    role: 'owner',
    joinedAt: Date.now()
  }];

  this.logActivity('account_created', `Cuenta ${accountType} creada`, userId);

  this.saveData();
  this.updateAccountDisplay();
  this.updateUserSelectionDropdown();

  this.closeAuthModal();
  this.showToast(`Cuenta ${accountType} creada exitosamente`, 'success');
};

FinanceApp.prototype.joinSharedAccount = function(name, email, password, inviteCode) {
  const inviteData = this.inviteCodes[inviteCode];
  const userId = this.generateUserId();

  this.currentUser = userId;
  this.accountUsers.push({
    id: userId,
    name: name,
    email: email,
    role: 'member',
    joinedAt: Date.now()
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

FinanceApp.prototype.handleLogin = function() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    this.showToast('Email y contraseña son obligatorios', 'error');
    return;
  }

  // Simple authentication simulation
  const user = this.accountUsers.find(u => u.email === email);
  if (user) {
    this.currentUser = user.id;
    this.logActivity('user_login', `${user.name} inició sesión`, user.id);
    this.saveData();
    this.updateAccountDisplay();
    this.closeAuthModal();
    this.showToast(`Bienvenido de vuelta, ${user.name}`, 'success');
  } else {
    this.showToast('Credenciales incorrectas', 'error');
  }
};

FinanceApp.prototype.showInvitationModal = function() {
  if (this.accountType !== 'shared' || this.accountUsers.length >= 2) {
    this.showToast('Solo las cuentas compartidas pueden tener invitaciones', 'info');
    return;
  }

  document.getElementById('invitationModal').classList.add('show');
  document.body.style.overflow = 'hidden';

  // Reset modal to step 1
  document.querySelectorAll('.step-item').forEach(step => {
    step.classList.remove('active');
  });
  document.querySelector('.step-item[data-step="1"]').classList.add('active');
};

FinanceApp.prototype.generateInviteCode = function() {
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
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };

  this.saveData();
  this.logActivity('invite_created', `Invitación creada para ${inviteeName}`, this.currentUser);

  // Show step 2
  document.querySelectorAll('.step-item').forEach(step => {
    step.classList.remove('active');
  });
  document.querySelector('.step-item[data-step="2"]').classList.add('active');

  // Display code
  document.getElementById('generatedInviteCode').textContent = code;
  document.getElementById('generatedInviteCode').classList.add('invite-code-generated');

  this.showToast('Código de invitación generado', 'success');
};

FinanceApp.prototype.copyInviteCodeToClipboard = function() {
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

FinanceApp.prototype.updateAccountDisplay = function() {
  const accountTypeBadge = document.getElementById('accountTypeBadge');
  const accountTypeText = document.getElementById('accountTypeText');
  const currentUserName = document.getElementById('currentUserName');
  const invitedUserInfo = document.getElementById('invitedUserInfo');
  const invitedUserName = document.getElementById('invitedUserName');
  const inviteUserBtn = document.getElementById('inviteUserBtn');
  const activityLogSection = document.getElementById('activityLogSection');

  if (this.accountType === 'shared') {
    accountTypeBadge.classList.add('shared');
    accountTypeText.innerHTML = '<i class="fas fa-users"></i> Cuenta Mancomunada';

    if (this.accountUsers.length === 1) {
      inviteUserBtn.classList.remove('hidden');
    } else {
      inviteUserBtn.classList.add('hidden');
      invitedUserInfo.classList.remove('hidden');
      const otherUser = this.accountUsers.find(u => u.id !== this.currentUser);
      if (otherUser) {
        invitedUserName.textContent = otherUser.name;
      }
    }

    activityLogSection.classList.remove('hidden');
    this.updateActivityLog();
  } else {
    accountTypeBadge.classList.remove('shared');
    accountTypeText.innerHTML = '<i class="fas fa-user"></i> Cuenta Personal';
    inviteUserBtn.classList.add('hidden');
    invitedUserInfo.classList.add('hidden');
    activityLogSection.classList.add('hidden');
  }

  const currentUser = this.accountUsers.find(u => u.id === this.currentUser);
  if (currentUser) {
    currentUserName.textContent = currentUser.name;
  }
};

FinanceApp.prototype.updateUserSelectionDropdown = function() {
  const userSelect = document.getElementById('user');
  if (!userSelect) return;

  userSelect.innerHTML = '<option value="">Selecciona usuario</option>';

  if (this.accountType === 'shared') {
    this.accountUsers.forEach(user => {
      const option = document.createElement('option');
      option.value = user.name;
      option.textContent = user.name;
      userSelect.appendChild(option);
    });
  } else if (this.accountType === 'personal') {
    const currentUser = this.accountUsers.find(u => u.id === this.currentUser);
    if (currentUser) {
      const option = document.createElement('option');
      option.value = currentUser.name;
      option.textContent = currentUser.name;
      option.selected = true;
      userSelect.appendChild(option);
    }
  }
};

FinanceApp.prototype.updateActivityLog = function() {
  const activityList = document.getElementById('activityList');
  const activityCount = document.getElementById('activityCount');

  if (!activityList) return;

  const recentActivities = this.activityLog.slice(-20).reverse();
  activityCount.textContent = `${recentActivities.length} actividades`;

  activityList.innerHTML = '';

  recentActivities.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';

    const user = this.accountUsers.find(u => u.id === activity.userId);
    const userName = user ? user.name : 'Usuario desconocido';

    activityItem.innerHTML = `
      <div class="activity-icon ${activity.type}">
        <i class="fas ${this.getActivityIcon(activity.type)}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-title">${activity.description}</div>
        <div class="activity-description">${this.formatActivityTime(activity.timestamp)}</div>
      </div>
      <div class="activity-meta">
        <span class="activity-user">${userName}</span>
        <span class="activity-time">${this.formatRelativeTime(activity.timestamp)}</span>
      </div>
    `;

    activityList.appendChild(activityItem);
  });
};

FinanceApp.prototype.logActivity = function(type, description, userId = null) {
  this.activityLog.push({
    id: Date.now(),
    type: type,
    description: description,
    userId: userId || this.currentUser,
    timestamp: Date.now()
  });

  // Keep only last 100 activities
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }
};

FinanceApp.prototype.getActivityIcon = function(type) {
  const icons = {
    'expense': 'fa-minus-circle',
    'goal': 'fa-bullseye',
    'edit': 'fa-edit',
    'delete': 'fa-trash',
    'account_created': 'fa-user-plus',
    'user_joined': 'fa-user-friends',
    'user_login': 'fa-sign-in-alt',
    'invite_created': 'fa-envelope'
  };
  return icons[type] || 'fa-info-circle';
};

FinanceApp.prototype.formatActivityTime = function(timestamp) {
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

FinanceApp.prototype.formatRelativeTime = function(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'Hace un momento';
};

FinanceApp.prototype.generateUserId = function() {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

FinanceApp.prototype.generateRandomCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

FinanceApp.prototype.validateInviteCode = function(code) {
  const invite = this.inviteCodes[code];
  return invite && invite.expiresAt > Date.now();
};

FinanceApp.prototype.closeAuthModal = function() {
  document.getElementById('authModal').classList.remove('show');
  document.getElementById('accountTypeModal').classList.remove('show');
  document.body.style.overflow = '';
};

FinanceApp.prototype.showChangePasswordModal = function() {
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

FinanceApp.prototype.showAccountTypeSwitch = function() {
  const modal = document.getElementById('accountTypeModal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
};

FinanceApp.prototype.changeAccountType = function(type) {
  this.accountType = type;
  localStorage.setItem('financia_account_type', type);
  this.saveData();

  this.updateConfigurationDisplay();

  const modal = document.getElementById('accountTypeModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  const message = type === 'shared'
    ? 'Cuenta cambiada a Mancomunada. Ahora puedes invitar a tu socio.'
    : 'Cuenta cambiada a Personal.';

  this.showToast(message, 'success');
};

// Override expense addition to include activity logging
FinanceApp.prototype.addExpenseOriginal = FinanceApp.prototype.addExpense;
FinanceApp.prototype.addExpense = function() {
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const user = document.getElementById('user').value;

  // Call original method
  this.addExpenseOriginal();

  // Add activity logging
  this.logActivity('expense', `Gasto agregado: ${description} - $${amount}`, this.currentUser);

  if (this.accountType === 'shared' && this.accountUsers.length > 1) {
    // Notify other user
    const otherUser = this.accountUsers.find(u => u.id !== this.currentUser);
    if (otherUser) {
      this.addNotification({
        id: Date.now(),
        type: 'expense_added',
        title: 'Nuevo Gasto Registrado',
        message: `${user} registró un gasto: ${description} - $${amount}`,
        timestamp: Date.now(),
        read: false,
        priority: 'normal'
      });
    }
  }
};

// Setup onboarding tour system
FinanceApp.prototype.setupOnboardingTour = function() {
  this.tourSteps = [
    {
      element: '.navbar__logo',
      title: '¡Bienvenido a FinanciaPro Suite!',
      description: 'Esta es tu nueva herramienta para el control financiero personal. Te guiaremos por las principales funciones.',
      position: 'bottom'
    },
    {
      element: '[data-section="dashboard"]',
      title: 'Panel Principal',
      description: 'Aquí verás un resumen de tus finanzas: gastos totales, metas y gráficos de análisis.',
      position: 'bottom'
    },
    {
      element: '[data-section="expenses"]',
      title: 'Registro de Gastos',
      description: 'Registra todos tus gastos de forma rápida y organizada por categorías y nivel de necesidad.',
      position: 'bottom'
    },
    {
      element: '[data-section="goals"]',
      title: 'Metas Financieras',
      description: 'Define y hace seguimiento a tus objetivos de ahorro. Mantente motivado con el progreso visual.',
      position: 'bottom'
    },
    {
      element: '[data-section="analysis"]',
      title: 'Análisis Detallado',
      description: 'Visualiza patrones en tus gastos con gráficos interactivos y estadísticas útiles.',
      position: 'bottom'
    },
    {
      element: '[data-section="store"]',
      title: 'Tienda de Estilos',
      description: 'Personaliza la apariencia de tus gráficos con diferentes temas y estilos visuales.',
      position: 'bottom'
    },
    {
      element: '[data-section="config"]',
      title: 'Configuración',
      description: 'Administra tu perfil, configuración de cuenta y preferencias de la aplicación.',
      position: 'bottom'
    },
    {
      element: '#expenseForm',
      title: 'Registrar tu Primer Gasto',
      description: 'Comienza registrando un gasto. Completa la descripción, monto, categoría y nivel de necesidad.',
      position: 'top'
    }
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

  // Show tour start button after a delay if user hasn't seen tour
  setTimeout(() => {
    if (!localStorage.getItem('financia_tour_completed') && this.tourStartBtn) {
      this.tourStartBtn.classList.add('show');
    }
  }, 3000);
};

FinanceApp.prototype.setupTourEventListeners = function() {
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
  const skipBtn = this.tourOverlay.querySelector('.tour-skip');
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

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      this.endTour();
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      this.endTour();
      this.showSection('expenses'); // Navigate to expenses section to start
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

FinanceApp.prototype.startTour = function() {
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

FinanceApp.prototype.showTourStep = function(stepIndex) {
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
  if (counterEl) counterEl.textContent = `${stepIndex + 1} de ${this.tourSteps.length}`;
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

FinanceApp.prototype.positionTourElements = function(targetElement, position) {
  if (!this.tourSpotlight || !this.tourTooltip) return;

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

  this.tourTooltip.style.left = `${left}px`;
  this.tourTooltip.style.top = `${top}px`;
  this.tourTooltip.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');
  this.tourTooltip.classList.add(`position-${position}`);
};

FinanceApp.prototype.highlightElement = function(element) {
  // Remove previous highlights
  const prevHighlighted = document.querySelector('.tour-highlighted');
  if (prevHighlighted) {
    prevHighlighted.classList.remove('tour-highlighted');
  }

  // Add highlight to current element
  element.classList.add('tour-highlighted');
};

FinanceApp.prototype.nextTourStep = function() {
  if (this.currentTourStep < this.tourSteps.length - 1) {
    this.tourTooltip?.classList.remove('show');
    setTimeout(() => {
      this.currentTourStep++;
      this.showTourStep(this.currentTourStep);
    }, 150);
  }
};

FinanceApp.prototype.prevTourStep = function() {
  if (this.currentTourStep > 0) {
    this.tourTooltip?.classList.remove('show');
    setTimeout(() => {
      this.currentTourStep--;
      this.showTourStep(this.currentTourStep);
    }, 150);
  }
};

FinanceApp.prototype.endTour = function() {
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

  // Show completion message
  this.showToast('¡Tour completado! Ya puedes comenzar a usar FinanciaPro Suite.', 'success');
};

// Setup new configuration functionality
FinanceApp.prototype.setupConfigurationHandlers = function() {
  // Profile section handlers
  this.setupProfileHandlers();

  // Account section handlers
  this.setupAccountHandlers();

  // Appearance section handlers
  this.setupAppearanceHandlers();

  // Update config display with current data
  this.updateConfigurationDisplay();
};

FinanceApp.prototype.setupProfileHandlers = function() {
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
};

FinanceApp.prototype.setupAccountHandlers = function() {
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

FinanceApp.prototype.setupAppearanceHandlers = function() {
  const themeOptions = document.querySelectorAll('.theme-option');
  const changeChartStyleBtn = document.getElementById('configChangeChartStyleBtn');
  const animationsToggle = document.getElementById('animationsToggle');
  const goalNotificationsToggle = document.getElementById('goalNotificationsToggle');
  const demoModeToggle = document.getElementById('demoModeToggle');

  themeOptions.forEach(option => {
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

FinanceApp.prototype.saveProfileSettings = async function() {
  const profileNameInput = document.getElementById('profileNameInput');
  const monthlyIncomeInput = document.getElementById('monthlyIncomeInput');

  let updated = false;

  if (profileNameInput && profileNameInput.value.trim()) {
    const newName = profileNameInput.value.trim();
    if (newName !== this.userProfile.name) {
      this.userProfile.name = newName;
      updated = true;
    }
  }

  if (monthlyIncomeInput && monthlyIncomeInput.value) {
    const cleanValue = monthlyIncomeInput.value.replace(/[^\d]/g, '');
    const newIncome = parseFloat(cleanValue);
    if (newIncome !== this.monthlyIncome) {
      this.monthlyIncome = newIncome;
      localStorage.setItem('financia_monthly_income', this.monthlyIncome.toString());
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
        const userDocRef = FB.doc(FB.db, 'userData', this.firebaseUser.uid);
        await FB.updateDoc(userDocRef, {
          userName: this.userProfile.name,
          monthlyIncome: this.monthlyIncome,
          updatedAt: Date.now()
        });
      } catch (error) {
        console.error('Error updating Firebase:', error);
      }
    }

    // Update UI across the app
    this.updateConfigurationDisplay();
    this.updateProfileDisplay();
    this.renderDashboard();

    this.showToast('Perfil actualizado correctamente', 'success');
  }
};

FinanceApp.prototype.showAvatarSelector = function() {
  // Navigate to store section for avatar selection
  this.showSection('store');
  this.showToast('Selecciona un nuevo avatar en la tienda', 'info');
};

FinanceApp.prototype.openAvatarUploader = function() {
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

        // Update profile
        this.userProfile.avatar = imageData;
        this.userProfile.avatarType = 'custom';

        // Save to local storage
        this.saveData();

        // Upload to Firebase Storage if logged in
        const FB = window.FB;
        if (FB?.auth && this.firebaseUser) {
          try {
            const storageRef = FB.ref(FB.storage, `avatars/${this.firebaseUser.uid}`);
            await FB.uploadString(storageRef, imageData, 'data_url');
            const downloadURL = await FB.getDownloadURL(storageRef);

            // Update Firestore with image URL
            const userDocRef = FB.doc(FB.db, 'userData', this.firebaseUser.uid);
            await FB.updateDoc(userDocRef, {
              avatar: downloadURL,
              avatarType: 'custom',
              updatedAt: Date.now()
            });

            this.userProfile.avatar = downloadURL;
          } catch (error) {
            console.error('Error uploading to Firebase:', error);
          }
        }

        // Update UI
        this.updateConfigurationDisplay();
        this.updateProfileDisplay();

        this.showToast('Avatar actualizado correctamente', 'success');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      this.showToast('Error al subir el avatar', 'error');
    }
  });

  input.click();
};

FinanceApp.prototype.formatNumberWithSeparators = function(value) {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

FinanceApp.prototype.showPartnerInviteModal = function() {
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

FinanceApp.prototype.setupInviteModalHandlers = function() {
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

FinanceApp.prototype.generateInviteLink = async function() {
  // Generate a unique secure invitation link
  const inviteCode = this.generateSecureInviteCode();
  const inviteLink = `${window.location.origin}${window.location.pathname}?invite=${inviteCode}`;

  // Store invitation details
  const invitation = {
    code: inviteCode,
    link: inviteLink,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    used: false,
    createdBy: this.firebaseUser?.uid || 'anonymous'
  };

  localStorage.setItem('financia_pending_invitation', JSON.stringify(invitation));

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

FinanceApp.prototype.generateSecureInviteCode = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

FinanceApp.prototype.copyInviteLink = function() {
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

FinanceApp.prototype.closePartnerInviteModal = function() {
  const modal = document.getElementById('partnerInviteModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

FinanceApp.prototype.changeTheme = function(theme) {
  // Update active theme option
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.classList.remove('active');
    if (option.dataset.theme === theme) {
      option.classList.add('active');
    }
  });

  // Apply theme logic (you can extend this based on your theme system)
  localStorage.setItem('financia_theme', theme);
  this.showToast(`Tema ${theme} aplicado`, 'success');
};

FinanceApp.prototype.toggleAnimations = function(enabled) {
  localStorage.setItem('financia_animations', enabled.toString());
  if (enabled) {
    document.body.classList.remove('no-animations');
  } else {
    document.body.classList.add('no-animations');
  }
  this.showToast(`Animaciones ${enabled ? 'activadas' : 'desactivadas'}`, 'success');
};

FinanceApp.prototype.toggleGoalNotifications = function(enabled) {
  localStorage.setItem('financia_goal_notifications', enabled.toString());
  this.showToast(`Notificaciones de metas ${enabled ? 'activadas' : 'desactivadas'}`, 'success');
};

FinanceApp.prototype.toggleDemoMode = function(enabled) {
  localStorage.setItem('financia_demo_mode', enabled.toString());
  this.showToast(`Modo demostración ${enabled ? 'activado' : 'desactivado'}`, 'success');
};

FinanceApp.prototype.updateConfigurationDisplay = function() {
  // Update profile information
  const profileUserName = document.getElementById('profileUserName');
  const profileNameInput = document.getElementById('profileNameInput');
  const monthlyIncomeInput = document.getElementById('monthlyIncomeInput');
  const configMemberName = document.getElementById('configMemberName');
  const configAccountBadge = document.getElementById('configAccountBadge');
  const configAccountTypeText = document.getElementById('configAccountTypeText');
  const configAccountDescription = document.getElementById('configAccountDescription');
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
    const formattedIncome = this.monthlyIncome ? this.formatNumberWithSeparators(this.monthlyIncome.toString()) : '';
    monthlyIncomeInput.value = formattedIncome;
  }

  if (configMemberName) {
    configMemberName.textContent = this.userProfile.name || 'Usuario';
  }

  // Update account type information
  const accountType = this.accountType || 'personal';
  if (configAccountBadge && configAccountTypeText) {
    if (accountType === 'shared') {
      configAccountBadge.innerHTML = '<i class="fas fa-users"></i><span>Cuenta Mancomunada</span>';
      configAccountTypeText.textContent = 'Cuenta Mancomunada';
      if (configAccountDescription) {
        configAccountDescription.textContent = 'Cuenta compartida para gestión financiera en pareja o familia.';
      }
      if (configInviteSection) {
        configInviteSection.classList.remove('hidden');
      }
    } else {
      configAccountBadge.innerHTML = '<i class="fas fa-user"></i><span>Cuenta Personal</span>';
      configAccountTypeText.textContent = 'Cuenta Personal';
      if (configAccountDescription) {
        configAccountDescription.textContent = 'Tu cuenta personal para el control de finanzas individuales.';
      }
      if (configInviteSection) {
        configInviteSection.classList.add('hidden');
      }
    }
  }

  // Update chart style display
  const chartStyleName = document.getElementById('configChartStyleName');
  if (chartStyleName && this.currentChartStyle) {
    chartStyleName.textContent = this.chartStyles[this.currentChartStyle]?.name || 'Clásico';
  }

  // Update preference toggles based on stored values
  const animationsToggle = document.getElementById('animationsToggle');
  const goalNotificationsToggle = document.getElementById('goalNotificationsToggle');
  const demoModeToggle = document.getElementById('demoModeToggle');

  if (animationsToggle) {
    animationsToggle.checked = localStorage.getItem('financia_animations') !== 'false';
  }

  if (goalNotificationsToggle) {
    goalNotificationsToggle.checked = localStorage.getItem('financia_goal_notifications') !== 'false';
  }

  if (demoModeToggle) {
    demoModeToggle.checked = localStorage.getItem('financia_demo_mode') === 'true';
  }

  // Update theme selection
  const selectedTheme = localStorage.getItem('financia_theme') || 'light';
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.classList.remove('active');
    if (option.dataset.theme === selectedTheme) {
      option.classList.add('active');
    }
  });
};

if (typeof window !== 'undefined') {
  window.FinanceApp = FinanceApp;
  window.selectAccountType = selectAccountType;
  window.switchToLogin = switchToLogin;
  window.showAccountTypeSelection = showAccountTypeSelection;
}
