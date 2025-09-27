// Dan&Giv Control - Personal Finance Application
// Main JavaScript file with all functionality

class FinanceApp {
  // QuedarÃ¡ asÃ­ (el nuevo constructor)
  // QuedarÃ¡ asÃ­
  // QuedarÃ¡ asÃ­

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

    const rawData =
      JSON.parse(localStorage.getItem('danGivControlData')) || {};

    const { cleaned: savedData, changed: hadEncodingIssues } =
      this.normalizePersistedData(rawData);

    if (hadEncodingIssues) {
      try {
        localStorage.setItem('danGivControlData', JSON.stringify(savedData));
      } catch (error) {
        console.warn('No se pudo normalizar el almacenamiento local:', error);
      }
    }

    this.expenses = savedData.expenses || [];
    this.goals = savedData.goals || [];
    this.shoppingItems = savedData.shoppingItems || [];
    this.monthlyIncome = savedData.monthlyIncome || 2500;

    this.securityPasswords = savedData.securityPasswords || {
      Daniel: CryptoJS.SHA256('1234').toString(),
      Givonik: CryptoJS.SHA256('5678').toString(),
    };

    // Propiedades del Modo Demo
    this.demoIntervalId = null;
    this.currentDemoIndex = 0;
    // QuedarÃ¡ asÃ­ (reemplaza el array demoDataSets completo)
    this.demoDataSets = [
      // Escenario 1: "Mes Bueno"
      {
        title: 'Mes de Ahorro Exitoso',
        labels: ['Ahorro', 'Necesarios', 'Ocio'],
        data: [40, 50, 10], // % de gastos
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
        labels: ['Servicios', 'Comida', 'Transporte'],
        data: [25, 45, 30], // % de gastos
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
        labels: ['Salud', 'Reparaciones', 'Otros'],
        data: [50, 30, 20], // % de gastos
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
    this.pendingDeleteId = null;
    this.aiRecommendations = [];

    this.conversationHistory = []; // Para guardar el historial del chat
    this.conversationState = 'START'; // Para saber en quÃ© punto del chat estamos
  }

  // QuedarÃ¡ asÃ­ (pega estas dos nuevas funciones en la clase)
  startDemoMode() {
    // Si la animaciÃ³n ya estÃ¡ corriendo, no hacemos nada.
    if (this.demoIntervalId) return;

    const updateDemo = () => {
      const dataSet = this.demoDataSets[this.currentDemoIndex];

      // Actualizamos los KPIs y el grÃ¡fico con los datos de demo
      this.updateStats(dataSet.stats);
      this.renderExpenseChart(dataSet);

      // Pasamos al siguiente set de datos para la prÃ³xima vez
      this.currentDemoIndex =
        (this.currentDemoIndex + 1) % this.demoDataSets.length;
    };

    updateDemo(); // Ejecutamos una vez inmediatamente
    this.demoIntervalId = setInterval(updateDemo, 4000); // Y luego cada 4 segundos
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

  // Función para forzar la normalización de datos existentes
  forceDataNormalization() {
    try {
      const currentData = {
        expenses: this.expenses,
        goals: this.goals,
        shoppingItems: this.shoppingItems,
        monthlyIncome: this.monthlyIncome,
        securityPasswords: this.securityPasswords
      };

      const { cleaned: normalizedData, changed } = this.normalizePersistedData(currentData);

      if (changed) {
        console.log('Aplicando normalización de caracteres a datos existentes...');
        this.expenses = normalizedData.expenses || [];
        this.goals = normalizedData.goals || [];
        this.shoppingItems = normalizedData.shoppingItems || [];
        this.monthlyIncome = normalizedData.monthlyIncome || 2500;
        this.securityPasswords = normalizedData.securityPasswords || this.securityPasswords;

        // Guardar los datos normalizados
        this.saveData();
        this.showToast('Datos actualizados para mejorar la visualización', 'success');
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
          console.warn('No se pudo decodificar texto en windows-1252:', value, error);
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
      expenses: this.expenses,
      goals: this.goals,
      shoppingItems: this.shoppingItems,
      monthlyIncome: this.monthlyIncome,
      securityPasswords: this.securityPasswords,
      lastUpdate: Date.now(),
    };

    const { cleaned: normalizedData } = this.normalizePersistedData(dataToSave);

    let localSaveOk = false;

    try {
      localStorage.setItem('danGivControlData', JSON.stringify(normalizedData));
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
        this.showToast('Datos guardados en la nube y en este dispositivo.', 'success');
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
    const logoutBtns = document.querySelectorAll(
      '#navbarLogoutBtn, #sidebarLogoutBtn'
    );

    FB.onAuthStateChanged(FB.auth, (user) => {
      if (user) {
        this.currentUser = user.uid;
        loginBtns.forEach((btn) => (btn.style.display = 'none'));
        logoutBtns.forEach((btn) => (btn.style.display = 'inline-flex'));
        this.syncFromFirebase();
      } else {
        this.currentUser = 'anonymous';
        loginBtns.forEach((btn) => (btn.style.display = 'inline-flex'));
        logoutBtns.forEach((btn) => (btn.style.display = 'none'));
        this.renderDashboard();
      }
    });

    // El botÃ³n de login ahora abre el modal.
    loginBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.openAuthModal();
      });
    });

    logoutBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await FB.signOut(FB.auth);
          this.showToast('Sesión cerrada 👋', 'info');
        } catch (e) {
          this.showToast('No se pudo cerrar sesión', 'error');
        }
      });
    });
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
          localStorage.setItem("danGivControlData", JSON.stringify(cloudData));
        } catch (error) {
          console.warn(
            "No se pudo actualizar el almacenamiento local con los datos de la nube.",
            error
          );
        }

        if (cloudNormalized) {
          console.info(
            "Se normalizaron textos con codificación incorrecta provenientes de la nube."
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
  // QUEDARÃ ASÃ (La nueva funciÃ³n init)

  // === INICIO DE SECCIÃƒâ€œN: INICIALIZACIÃƒâ€œN DE LA APP ===
  init() {
    // Esta función ahora solo llama directamente a los métodos de configuración.
    this.setupAuth();
    this.setupEventListeners(); // ¡CORRECCIÓN! Llamamos a la función correcta.
    this.setupNotificationBell();

    // Forzar normalización de datos existentes al inicio
    this.forceDataNormalization();

    this.renderDashboard();
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
        overlay.style.display = sidebar.classList.contains('open')
          ? 'block'
          : 'none';
      });

      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.style.display = 'none';
      });

      document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
        item.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
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
      } else if (sectionId === 'dashboard') {
        this.renderDashboard();
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
    this.renderExpenseChart();
    this.renderGoalsProgress();
    this.renderAIRecommendations();
    this.renderRecentTransactions();
    this.updateNotifications();
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
    let notifications = [];
    const today = new Date();

    // Metas por vencer
    this.goals.forEach((goal) => {
      const deadline = new Date(goal.deadline);
      const diff = (deadline - today) / (1000 * 60 * 60 * 24);
      if (diff <= 7 && goal.current < goal.target) {
        notifications.push({
          type: 'goal',
          text: `Meta "${goal.name}" vence en ${Math.ceil(diff)} dÃ­as`,
        });
      }
    });

    // Gastos protegidos
    this.expenses.forEach((exp) => {
      if (exp.protected) {
        notifications.push({
          type: 'expense',
          text: `Gasto protegido: ${exp.description} ($${exp.amount})`,
        });
      }
    });

    const badge = document.getElementById('notificationCount');
    if (badge) {
      if (notifications.length > 0) {
        badge.style.display = 'flex';
        badge.textContent = '';
      } else {
        badge.style.display = 'none';
      }
    }

    const list = document.getElementById('notificationList');
    if (list) {
      list.innerHTML = '';
      if (notifications.length === 0) {
        list.innerHTML = '<li>Sin notificaciones</li>';
      } else {
        notifications.forEach((n) => {
          const li = document.createElement('li');
          if (n.type === 'goal') {
            li.innerHTML = `<i class="fas fa-flag"></i> ${n.text}`;
          } else if (n.type === 'expense') {
            li.innerHTML = `<i class="fas fa-lock"></i> ${n.text}`;
          } else {
            li.textContent = n.text;
          }
          list.appendChild(li);
        });
      }
    }
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
    const expensesChangeEl = document.getElementById('expensesChange');
    const savingsChangeEl = document.getElementById('savingsChange');

    if (demoStats && expensesChangeEl && savingsChangeEl) {
      expensesChangeEl.textContent = demoStats.expensesChange.text;
      expensesChangeEl.className = `stat-change ${demoStats.expensesChange.class}`;

      savingsChangeEl.textContent = demoStats.savingsChange.text;
      savingsChangeEl.className = `stat-change ${demoStats.savingsChange.class}`;
    }
  }

  // QuedarÃ¡ asÃ­ (renderExpenseChart)
  // QuedarÃ¡ asÃ­ (reemplaza la funciÃ³n completa)
  renderExpenseChart(demoData = null) {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let chartData;
    let chartTitle = 'Gastos por CategorÃ­a';

    // --- INICIO: Paleta de colores moderna ---
    const modernColors = [
      '#008F8C', // Verde azulado principal
      '#00C49A', // Verde menta
      '#FFB347', // Naranja suave
      '#FF8066', // Coral
      '#D9D9D9', // Gris claro
      '#6B7280', // Gris medio
    ];
    // --- FIN: Paleta de colores moderna ---

    if (demoData) {
      chartData = {
        labels: demoData.labels,
        datasets: [
          {
            data: demoData.data,
            backgroundColor: modernColors,
            borderWidth: 0, // Sin borde
            borderColor: 'transparent',
            // --- INICIO: Efecto hover ---
            hoverOffset: 15,
            hoverBorderWidth: 0, // Sin borde al hacer hover
            // --- FIN: Efecto hover ---
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
      this.charts.expenseChart.update('normal');
    } else {
      this.charts.expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%', // Anillo mÃ¡s delgado para un look moderno
          animation: {
            duration: 1200, // AnimaciÃ³n mÃ¡s suave
            easing: 'easeInOutQuart',
          },
          plugins: {
            title: {
              display: true,
              text: chartTitle,
              padding: { top: 15, bottom: 15 },
              font: { size: 16, family: 'Inter, sans-serif', weight: '600' },
              color: 'var(--color-text)',
            },
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 25,
                font: { size: 12, family: 'Inter, sans-serif' },
                color: 'var(--color-text-secondary)',
              },
            },
            // --- INICIO: Tooltips modernos ---
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
                  return ` ${label}: ${value.toFixed(2)}Ã¢â€šÂ¬ (${percentage}%)`;
                },
              },
            },
            // --- FIN: Tooltips modernos ---
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

  renderEmptyGoalsState(container) {
    const motivationalMessages = [
      {
        icon: 'fas fa-rocket',
        title: '¡Comienza tu viaje financiero!',
        subtitle: 'Establece tu primera meta y ve cómo tu dinero crece',
        color: '#3b82f6'
      },
      {
        icon: 'fas fa-star',
        title: 'Las metas te acercan al éxito',
        subtitle: 'Cada gran logro comienza con una decisión de intentarlo',
        color: '#f59e0b'
      },
      {
        icon: 'fas fa-chart-line',
        title: 'Visualiza tu progreso',
        subtitle: 'Transforma tus sueños en objetivos medibles',
        color: '#10b981'
      },
      {
        icon: 'fas fa-gem',
        title: 'Construye tu futuro',
        subtitle: 'Cada peso ahorrado es un paso hacia tu libertad financiera',
        color: '#8b5cf6'
      },
      {
        icon: 'fas fa-trophy',
        title: 'Alcanza tus sueños',
        subtitle: 'Las metas claras son el camino hacia el éxito',
        color: '#ef4444'
      }
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
            ${motivationalMessages.map((_, index) =>
              `<span class="dot ${index === currentMessageIndex ? 'active' : ''}" style="background-color: ${index === currentMessageIndex ? message.color : '#cbd5e1'}"></span>`
            ).join('')}
          </div>
          <button class="create-goal-btn" style="background: linear-gradient(135deg, ${message.color}, ${message.color}99)">
            <i class="fas fa-plus"></i> Crear primera meta
          </button>
        </div>
      `;
    };

    container.innerHTML = createMessageElement(motivationalMessages[currentMessageIndex]);

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
      currentMessageIndex = (currentMessageIndex + 1) % motivationalMessages.length;

      const state = container.querySelector('.empty-goals-state');
      if (state) {
        state.style.animation = 'fadeOutUp 0.5s ease-in-out forwards';

        setTimeout(() => {
          container.innerHTML = createMessageElement(motivationalMessages[currentMessageIndex]);

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

    // Si no hay recomendaciones reales, usamos unas de ejemplo.
    const recommendations =
      this.aiRecommendations && this.aiRecommendations.length > 0
        ? this.aiRecommendations
        : [
            "Has gastado un 20% más en 'Comida' este mes. Considera planificar tus comidas.",
            "¡Buen trabajo! Tu ahorro para 'Vacaciones' está al 75% de la meta.",
          ];

    container.innerHTML = ''; // Limpiamos el contenedor

    recommendations.forEach((recommendation) => {
      const recEl = document.createElement('div');
      recEl.className = 'insight-card'; // Usamos la nueva clase del rediseÃ±o
      recEl.innerHTML = `
            <div class="insight-card__icon">
                <i class="fas fa-wand-magic-sparkles"></i>
            </div>
            <div class="insight-card__content">
                <h5 class="insight-card__title">Recomendación de IA</h5>
                <p class="insight-card__text">${recommendation}</p>
            </div>
        `;
      container.appendChild(recEl);
    });
  }

  renderRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    container.innerHTML = '';

    const recentExpenses = this.expenses.slice(-5).reverse();

    if (recentExpenses.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-receipt"></i><h3>No hay transacciones</h3></div>';
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
    this.showToast('Gasto registrado exitosamente', 'success');

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
        expense.protected ? 'PROTEGIDO' : '',
      ]);
      expenseEl.innerHTML = `
        <div class="transaction-info">
          <h4>${this.fixLegacyEncoding(expense.description)}</h4>
          <div class="transaction-meta">${metaLine}</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="transaction-amount expense">$${expense.amount}</div>
          <button type="button" class="btn btn-danger btn-delete" data-id="${expense.id}">
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

  savePasswordsFromModal() {
    // Si estamos en modo eliminar
    if (this.pendingDeleteId) {
      this.confirmDeleteFromModal();
      return;
    }

    const curDanielEl = document.getElementById('curDaniel');
    const curGivonikEl = document.getElementById('curGivonik');
    const newDanielEl = document.getElementById('newDaniel');
    const confirmDanielEl = document.getElementById('confirmDaniel');
    const newGivonikEl = document.getElementById('newGivonik');
    const confirmGivonikEl = document.getElementById('confirmGivonik');

    if (
      !curDanielEl ||
      !curGivonikEl ||
      !newDanielEl ||
      !confirmDanielEl ||
      !newGivonikEl ||
      !confirmGivonikEl
    ) {
      this.showToast('Campos del modal incompletos', 'error');
      return;
    }

    const curDaniel = curDanielEl.value || '';
    const curGivonik = curGivonikEl.value || '';
    const newDaniel = newDanielEl.value || '';
    const confirmDaniel = confirmDanielEl.value || '';
    const newGivonik = newGivonikEl.value || '';
    const confirmGivonik = confirmGivonikEl.value || '';

    if (!this.verifyPassword('Daniel', curDaniel)) {
      this.showToast('Contraseña actual de Daniel incorrecta', 'error');
      return;
    }
    if (!this.verifyPassword('Givonik', curGivonik)) {
      this.showToast('Contraseña actual de Givonik incorrecta', 'error');
      return;
    }

    if (newDaniel.trim().length < 4 || newGivonik.trim().length < 4) {
      this.showToast(
        'Las nuevas contraseñas deben tener al menos 4 caracteres',
        'error'
      );
      return;
    }
    if (newDaniel !== confirmDaniel) {
      this.showToast('Confirmación de Daniel no coincide', 'error');
      return;
    }
    if (newGivonik !== confirmGivonik) {
      this.showToast('Confirmación de Givonik no coincide', 'error');
      return;
    }

    this.updatePassword('Daniel', newDaniel);
    this.updatePassword('Givonik', newGivonik);

    document.getElementById('securityModal').classList.remove('show');
    this.showToast(
      'Contraseñas actualizadas con doble autorización',
      'success'
    );
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
      const motivationMessage = progress >= 75 && progress < 100
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
              <span class="goal-progress-percentage">${progress.toFixed(0)}%</span>
            </div>
            ${motivationMessage}
          </div>
        </div>

        <div class="goal-footer">
          <div class="goal-meta-info">
            <span class="goal-target">Meta: $${this.formatCurrency(goal.target)}</span>
            <span class="goal-saved">Ahorrado: $${this.formatCurrency(goal.current)}</span>
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
            backgroundColor: ['#1FB8CD', '#B4413C'],
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
          <div class="shopping-product">${this.fixLegacyEncoding(item.product)}</div>
          <div class="shopping-details">
            <span>Cantidad: ${item.quantity}</span>
            <span class="shopping-separator">•</span>
            <span class="necessity-badge ${item.necessary ? 'necessary' : 'not-necessary'}">
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
    typingIndicator.innerHTML = `<div class="chat-bubble"><i class="fas fa-spinner fa-spin"></i></div>`;
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
        this.conversationHistory.push({ role: 'assistant', content: aiMessage });
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

// === FIN DE SECCIÃƒâ€œN: HELPERS GLOBALES (EVENTOS Y CONSOLA) ===
