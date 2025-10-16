// ========================================
// FIN WIDGET - Sistema de Coach Financiero Integrado
// ========================================

class FinWidget {
  constructor() {
    this.isVisible = this.getVisibilitySetting();
    this.hasSeenWelcome = localStorage.getItem('finWelcomeSeen') === 'true';
    this.floatingBtn = null;
    this.chatModal = null;
    this.welcomeModal = null;
    this.chatIframe = null;

    this.init();
  }

  // ========================================
  // INICIALIZACI�N
  // ========================================
  init() {
    // Esperar a que el DOM est� listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.createFloatingButton();
    this.createChatModal();
    this.createWelcomeModal();
    this.attachEventListeners();

    // Mostrar bienvenida si es primera vez y el usuario est� autenticado
    setTimeout(() => {
      this.checkFirstVisit();
    }, 2000); // Esperar 2 segundos despu�s de cargar

    console.log(' Fin Widget inicializado');
  }

  // ========================================
  // CREAR BOT�N FLOTANTE
  // ========================================
  createFloatingButton() {
    const btn = document.createElement('div');
    btn.className = 'fin-floating-btn';
    btn.id = 'finFloatingBtn';
    btn.title = 'Hablar con Fin - Tu Coach Financiero';

    if (!this.isVisible) {
      btn.classList.add('hidden');
    }

    btn.innerHTML = `
      <img src="img/FIN.png" alt="Fin">
    `;

    document.body.appendChild(btn);
    this.floatingBtn = btn;
  }

  // ========================================
  // CREAR MODAL DEL CHAT
  // ========================================
  createChatModal() {
    const modal = document.createElement('div');
    modal.className = 'fin-modal';
    modal.id = 'finChatModal';

    modal.innerHTML = `
      <div class="fin-modal-backdrop" id="finModalBackdrop"></div>
      <div class="fin-modal-content">
        <button class="fin-modal-close" id="finModalClose">
          <i class="fas fa-times"></i>
        </button>
        <iframe
          src="chat-fin.html"
          class="fin-chat-iframe"
          id="finChatIframe"
          allow="microphone"
        ></iframe>
      </div>
    `;

    document.body.appendChild(modal);
    this.chatModal = modal;
    this.chatIframe = modal.querySelector('#finChatIframe');
  }

  // ========================================
  // CREAR MODAL DE BIENVENIDA
  // ========================================
  createWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'fin-welcome-modal';
    modal.id = 'finWelcomeModal';

    modal.innerHTML = `
      <div class="fin-welcome-backdrop"></div>
      <div class="fin-welcome-content">
        <div class="fin-welcome-avatar">
          <img src="img/FIN.png" alt="Fin">
        </div>
        <h1 class="fin-welcome-title">¡Hola! Soy Fin 😊</h1>
        <p class="fin-welcome-subtitle">Tu Coach Financiero Personal</p>
        <div class="fin-welcome-message" id="finWelcomeMessage">
          <!-- El mensaje se genera dinámicamente -->
        </div>
        <div class="fin-welcome-actions">
          <button class="fin-welcome-btn primary" id="finStartChat">
            <i class="fas fa-comments"></i>
            <span id="finStartChatText">Comenzar</span>
          </button>
          <button class="fin-welcome-btn secondary" id="finCloseLater">
            <i class="fas fa-clock"></i>
            Más tarde
          </button>
        </div>
        <div class="fin-welcome-footer">
          <label class="fin-welcome-checkbox">
            <input type="checkbox" id="finDontShowAgain">
            <span>No mostrar esta bienvenida nuevamente</span>
          </label>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.welcomeModal = modal;
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================
  attachEventListeners() {
    // Abrir chat desde bot�n flotante
    this.floatingBtn?.addEventListener('click', () => this.openChat());

    // Cerrar modal del chat
    const closeBtn = document.getElementById('finModalClose');
    const backdrop = document.getElementById('finModalBackdrop');

    closeBtn?.addEventListener('click', () => this.closeChat());
    backdrop?.addEventListener('click', () => this.closeChat());

    // Botones del modal de bienvenida
    document.getElementById('finStartChat')?.addEventListener('click', () => {
      this.handleWelcomeAction(true);
    });

    document.getElementById('finCloseLater')?.addEventListener('click', () => {
      this.handleWelcomeAction(false);
    });

    // Escape para cerrar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeChat();
        this.closeWelcome();
      }
    });

    // Toggle de configuración
    setTimeout(() => {
      const toggleSwitch = document.getElementById('finWidgetToggle');
      if (toggleSwitch) {
        toggleSwitch.checked = this.isVisible;
        toggleSwitch.addEventListener('change', (e) => {
          if (e.target.checked) {
            this.show();
          } else {
            this.hide();
          }
        });
      }
    }, 1000); // Esperar a que el DOM de configuración esté listo
  }

  // ========================================
  // VERIFICAR PRIMERA VISITA
  // ========================================
  async checkFirstVisit() {
    // No mostrar si ya vio la bienvenida
    if (this.hasSeenWelcome) {
      return;
    }

    // Verificar si el usuario est� autenticado y tiene datos
    const hasUserData = await this.checkUserData();

    // Generar mensaje personalizado
    const message = this.generateWelcomeMessage(hasUserData);

    // Mostrar modal de bienvenida
    this.showWelcome(message, hasUserData);
  }

  // ========================================
  // VERIFICAR DATOS DEL USUARIO
  // ========================================
  async checkUserData() {
    try {
      // Verificar si hay datos en localStorage
      const expenses = localStorage.getItem('expenses');
      const goals = localStorage.getItem('goals');
      const monthlyIncome = localStorage.getItem('monthlyIncome');

      // Si hay datos, el usuario ya tiene informaci�n registrada
      if (expenses || goals || monthlyIncome) {
        const expenseData = expenses ? JSON.parse(expenses) : [];
        const goalData = goals ? JSON.parse(goals) : [];
        const income = monthlyIncome ? parseFloat(monthlyIncome) : 0;

        return {
          hasData: true,
          expenseCount: expenseData.length,
          goalCount: goalData.length,
          hasIncome: income > 0
        };
      }

      // Verificar en Firebase si est� disponible
      if (window.FB && window.FB.auth.currentUser) {
        const userId = window.FB.auth.currentUser.uid;
        const userDocRef = window.FB.doc(window.FB.db, 'users', userId);
        const userDoc = await window.FB.getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          return {
            hasData: !!(data.expenses || data.goals || data.monthlyIncome),
            expenseCount: data.expenses?.length || 0,
            goalCount: data.goals?.length || 0,
            hasIncome: (data.monthlyIncome || 0) > 0
          };
        }
      }

      return { hasData: false };
    } catch (error) {
      console.error('Error al verificar datos del usuario:', error);
      return { hasData: false };
    }
  }

  // ========================================
  // GENERAR MENSAJE DE BIENVENIDA
  // ========================================
  generateWelcomeMessage(userData) {
    if (!userData || !userData.hasData) {
      // Usuario nuevo sin datos
      return `
        <p>¡Bienvenido a <strong>FinanciaSuite</strong>! 💎</p>
        <p>Estoy aquí para ayudarte a tomar el control de tus finanzas. Veo que estás comenzando tu camino financiero, ¡eso es genial!</p>
        <p><strong>Te recomiendo empezar por:</strong></p>
        <ul>
          <li>💰 Registrar tus ingresos mensuales</li>
          <li>📝 Anotar tus gastos diarios</li>
          <li>🎯 Definir tus metas financieras</li>
        </ul>
        <p>Cuando tengas algunos datos, podré darte consejos personalizados. ¿Empezamos?</p>
      `;
    } else {
      // Usuario con datos existentes
      const { expenseCount, goalCount, hasIncome } = userData;

      let message = `
        <p>¡Me alegra verte de nuevo! 👋</p>
        <p>He revisado tu información financiera:</p>
        <ul>
      `;

      if (expenseCount > 0) {
        message += `<li>📊 Tienes <strong>${expenseCount}</strong> gastos registrados</li>`;
      }

      if (goalCount > 0) {
        message += `<li>🎯 Estás trabajando en <strong>${goalCount}</strong> meta${goalCount > 1 ? 's' : ''} financiera${goalCount > 1 ? 's' : ''}</li>`;
      }

      if (hasIncome) {
        message += `<li>💰 Tu ingreso mensual está configurado</li>`;
      }

      message += `
        </ul>
        <p>¿Quieres que hagamos un análisis juntos?</p>
      `;

      return message;
    }
  }

  // ========================================
  // MOSTRAR MODAL DE BIENVENIDA
  // ========================================
  showWelcome(message, hasData) {
    const messageEl = document.getElementById('finWelcomeMessage');
    const startBtnText = document.getElementById('finStartChatText');

    if (messageEl) {
      messageEl.innerHTML = message;
    }

    if (startBtnText) {
      startBtnText.textContent = hasData?.hasData ? '¡Analizar mis finanzas!' : '¡Comenzar!';
    }

    this.welcomeModal?.classList.add('active');
  }

  closeWelcome() {
    this.welcomeModal?.classList.remove('active');
  }

  // ========================================
  // MANEJAR ACCI�N DE BIENVENIDA
  // ========================================
  handleWelcomeAction(openChat) {
    const dontShowAgain = document.getElementById('finDontShowAgain')?.checked;

    if (dontShowAgain) {
      localStorage.setItem('finWelcomeSeen', 'true');
      this.hasSeenWelcome = true;
    }

    this.closeWelcome();

    if (openChat) {
      setTimeout(() => {
        this.openChat();
      }, 300);
    }
  }

  // ========================================
  // ABRIR/CERRAR CHAT
  // ========================================
  openChat() {
    if (this.chatModal) {
      this.chatModal.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Enviar configuración de Firebase al iframe cuando esté listo
      if (this.chatIframe) {
        const sendConfig = () => {
          if (window.FB && window.FB.geminiApiKey) {
            this.chatIframe.contentWindow.postMessage({
              type: 'FIREBASE_CONFIG',
              payload: {
                geminiApiKey: window.FB.geminiApiKey
              }
            }, '*');
            console.log('✅ Configuración enviada al iframe del chat');
          }
        };

        // Si el iframe ya está cargado, enviar inmediatamente
        if (this.chatIframe.contentDocument && this.chatIframe.contentDocument.readyState === 'complete') {
          sendConfig();
        } else {
          // Si no, esperar a que cargue
          this.chatIframe.onload = sendConfig;
        }
      }
    }
  }

  closeChat() {
    if (this.chatModal) {
      this.chatModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ========================================
  // MOSTRAR/OCULTAR WIDGET
  // ========================================
  show() {
    if (this.floatingBtn) {
      this.floatingBtn.classList.remove('hidden');
      this.isVisible = true;
      this.saveVisibilitySetting(true);
    }
  }

  hide() {
    if (this.floatingBtn) {
      this.floatingBtn.classList.add('hidden');
      this.isVisible = false;
      this.saveVisibilitySetting(false);
    }
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  // ========================================
  // PERSISTENCIA DE CONFIGURACI�N
  // ========================================
  getVisibilitySetting() {
    const saved = localStorage.getItem('finWidgetVisible');
    return saved !== 'false'; // Por defecto es visible
  }

  saveVisibilitySetting(visible) {
    localStorage.setItem('finWidgetVisible', visible.toString());
  }

  // ========================================
  // MOSTRAR BADGE DE NOTIFICACI�N
  // ========================================
  showBadge(count) {
    if (!this.floatingBtn) return;

    let badge = this.floatingBtn.querySelector('.fin-badge');

    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'fin-badge';
      this.floatingBtn.appendChild(badge);
    }

    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = 'flex';
  }

  hideBadge() {
    const badge = this.floatingBtn?.querySelector('.fin-badge');
    if (badge) {
      badge.style.display = 'none';
    }
  }

  // ========================================
  // REINICIAR BIENVENIDA (Para testing)
  // ========================================
  resetWelcome() {
    localStorage.removeItem('finWelcomeSeen');
    this.hasSeenWelcome = false;
    this.checkFirstVisit();
  }
}

// ========================================
// INICIALIZAR WIDGET AUTOM�TICAMENTE
// ========================================
let finWidget;

// Esperar a que el DOM y Firebase est�n listos
const initFinWidget = () => {
  finWidget = new FinWidget();
  window.finWidget = finWidget; // Exponer globalmente
  console.log('> Fin Widget est� listo');
};

// Inicializar cuando el DOM est� listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFinWidget);
} else {
  initFinWidget();
}

// Exponer funciones �tiles globalmente
window.openFinChat = () => finWidget?.openChat();
window.closeFinChat = () => finWidget?.closeChat();
window.toggleFinWidget = () => finWidget?.toggle();
window.resetFinWelcome = () => finWidget?.resetWelcome();
