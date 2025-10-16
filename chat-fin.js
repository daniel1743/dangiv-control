// ========================================
// FIN CHAT - Coach Financiero con IA
// ========================================

class FinChat {
  constructor() {
    // Elementos del DOM
    this.chatMessages = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.quickSuggestions = document.getElementById('quickSuggestions');
    this.settingsModal = document.getElementById('settingsModal');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.closeModal = document.getElementById('closeModal');
    this.modalBackdrop = document.getElementById('modalBackdrop');
    this.saveProfileBtn = document.getElementById('saveProfileBtn');
    this.cancelBtn = document.getElementById('cancelBtn');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.backBtn = document.getElementById('backBtn');
    this.attachBtn = document.getElementById('attachBtn');
    this.toast = document.getElementById('toast');

    // Datos del usuario
    this.userProfile = this.loadUserProfile();
    this.conversationHistory = [];
    this.expenses = [];
    this.goals = [];

    // Configuración de Gemini API
    this.geminiApiKey = '';
    this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    this.FB = null;

    // Intentar obtener API key del parent (si está en iframe) o window
    try {
      const FB = window.parent?.FB || window.FB;
      if (FB) {
        this.geminiApiKey = FB.geminiApiKey || '';
        this.FB = FB;
      }
    } catch (e) {
      console.warn(
        'No se pudo acceder a Firebase desde parent, usando configuración local'
      );
    }

    // Prompt del sistema (La "Personalidad" de Fin)
    this.systemPrompt = `Eres 'Fin', un coach financiero experto, empático y motivador que vive dentro de la aplicación 'FinanciaSuite'.

Tu misión es ayudar a los usuarios a entender su dinero y alcanzar sus metas financieras con confianza.

CARACTERÍSTICAS DE TU PERSONALIDAD:
- Tono siempre amigable, cercano y fácil de entender, como un amigo experto
- Empático y motivador, nunca juzgas las decisiones pasadas
- Proactivo y optimista sobre el futuro financiero del usuario
- Usas emojis de manera natural para hacer la conversación más amigable

REGLAS IMPORTANTES:
- Nunca das consejos de inversión específicos sobre acciones o criptomonedas
- Te enfocas en principios de ahorro, presupuesto, pago de deudas y planificación
- Siempre utilizas los datos proporcionados del usuario para hacer tus consejos 100% personalizados
- Tus respuestas son concisas pero completas (máximo 3-4 párrafos)
- Siempre buscas oportunidades para que el usuario mejore su situación financiera
- Haces preguntas relevantes para entender mejor la situación del usuario

FORMATO DE RESPUESTAS:
- Usa párrafos cortos y fáciles de leer
- Cuando des consejos, usa listas numeradas o con viñetas
- Incluye emojis relevantes (💰, 📊, 📈, 💡, 🎯, 👍, etc.)
- Termina siempre con una pregunta o llamado a la acción

Tu objetivo final es que el usuario se sienta en control y optimista sobre su futuro financiero.`;

    this.init();
  }

  // ========================================
  // INICIALIZACIï¿½N
  // ========================================
  init() {
    this.loadFinancialData();
    this.attachEventListeners();
    this.adjustTextareaHeight();

    // Auto-focus en el input
    if (this.messageInput) {
      this.messageInput.focus();
    }

    console.log(' Fin Chat inicializado correctamente');

    // Validar API Key
    if (!this.geminiApiKey) {
      console.error('L API Key de Gemini no encontrada');
      this.showToast('Error: API Key de Gemini no configurada', 'error');
    }
  }

  // ========================================
  // EVENT LISTENERS
  // ========================================
  attachEventListeners() {
    // Enviar mensaje
    this.sendBtn?.addEventListener('click', () => this.sendMessage());
    this.messageInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize del textarea
    this.messageInput?.addEventListener('input', () => {
      this.adjustTextareaHeight();
      this.toggleSendButton();
    });

    // Sugerencias rï¿½pidas
    document.querySelectorAll('.suggestion-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const question = btn.getAttribute('data-question');
        this.messageInput.value = question;
        this.toggleSendButton();
        this.sendMessage();
      });
    });

    // Modal de configuraciï¿½n
    this.settingsBtn?.addEventListener('click', () => this.openSettingsModal());
    this.closeModal?.addEventListener('click', () => this.closeSettingsModal());
    this.modalBackdrop?.addEventListener('click', () =>
      this.closeSettingsModal()
    );
    this.cancelBtn?.addEventListener('click', () => this.closeSettingsModal());
    this.saveProfileBtn?.addEventListener('click', () => this.saveProfile());

    // Botones de acciï¿½n
    this.refreshBtn?.addEventListener('click', () =>
      this.refreshConversation()
    );
    this.backBtn?.addEventListener('click', () => this.goBack());
    this.attachBtn?.addEventListener('click', () => this.attachFinancialData());
  }

  // ========================================
  // ENVIAR MENSAJE
  // ========================================
  async sendMessage() {
    const message = this.messageInput.value.trim();

    if (!message) return;

    // Agregar mensaje del usuario al chat
    this.addUserMessage(message);

    // Limpiar input
    this.messageInput.value = '';
    this.adjustTextareaHeight();
    this.toggleSendButton();

    // Ocultar sugerencias despuï¿½s del primer mensaje
    if (this.quickSuggestions) {
      this.quickSuggestions.style.display = 'none';
    }

    // Agregar a historial de conversaciï¿½n
    this.conversationHistory.push({
      role: 'user',
      content: message,
    });

    // Mostrar indicador de escritura
    this.showTypingIndicator();

    // Obtener respuesta de la IA
    try {
      const response = await this.getAIResponse(message);
      this.hideTypingIndicator();
      this.addBotMessage(response);

      // Agregar respuesta al historial
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
      });
    } catch (error) {
      this.hideTypingIndicator();
      this.addBotMessage(
        'Lo siento, tuve un problema al procesar tu mensaje. Â¿PodrÃ­as intentarlo de nuevo? ðŸ˜Š'
      );
      console.error('Error al obtener respuesta de IA:', error);
      this.showToast('Error al conectar con la IA', 'error');
    }
  }

  // ========================================
  // INTEGRACIï¿½N CON GEMINI API
  // ========================================
  async getAIResponse(userMessage) {
    try {
      // Construir el contexto completo para la IA
      const contextualPrompt = this.buildContextualPrompt(userMessage);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: contextualPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      };

      const response = await fetch(
        `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error de Gemini API:', errorData);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        return aiResponse;
      } else {
        throw new Error('No se recibiï¿½ respuesta de la IA');
      }
    } catch (error) {
      console.error('Error en getAIResponse:', error);
      throw error;
    }
  }

  // ========================================
  // CONSTRUIR PROMPT CONTEXTUAL
  // ========================================
  buildContextualPrompt(userMessage) {
    // Construir el contexto financiero del usuario
    let financialContext = '\n\n--- DATOS FINANCIEROS DEL USUARIO ---\n';

    if (this.userProfile.name) {
      financialContext += `Nombre: ${this.userProfile.name}\n`;
    }

    if (this.userProfile.monthlyIncome > 0) {
      financialContext += `Ingreso Mensual: $${this.userProfile.monthlyIncome.toLocaleString(
        'es-CO'
      )}\n`;
    }

    if (this.userProfile.monthlyExpenses > 0) {
      financialContext += `Gastos Mensuales: $${this.userProfile.monthlyExpenses.toLocaleString(
        'es-CO'
      )}\n`;
      const savings =
        this.userProfile.monthlyIncome - this.userProfile.monthlyExpenses;
      financialContext += `Ahorro Mensual Estimado: $${savings.toLocaleString(
        'es-CO'
      )}\n`;
    }

    if (this.userProfile.financialGoals) {
      financialContext += `Metas Financieras: ${this.userProfile.financialGoals}\n`;
    }

    if (this.userProfile.financialConcerns) {
      financialContext += `Preocupaciones: ${this.userProfile.financialConcerns}\n`;
    }

    // Agregar datos de gastos si estï¿½n disponibles
    if (this.expenses.length > 0) {
      const totalExpenses = this.expenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
      financialContext += `\nGastos registrados: ${this.expenses.length} transacciones\n`;
      financialContext += `Total gastado: $${totalExpenses.toLocaleString(
        'es-CO'
      )}\n`;

      // Top 3 categorï¿½as
      const categories = {};
      this.expenses.forEach((exp) => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
      });
      const topCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (topCategories.length > 0) {
        financialContext += `Categorï¿½as principales: ${topCategories
          .map(([cat, amt]) => `${cat} ($${amt.toLocaleString('es-CO')})`)
          .join(', ')}\n`;
      }
    }

    // Agregar metas si estï¿½n disponibles
    if (this.goals.length > 0) {
      financialContext += `\nMetas activas: ${this.goals.length}\n`;
      this.goals.forEach((goal) => {
        const progress = ((goal.current / goal.target) * 100).toFixed(1);
        financialContext += `- ${goal.name}: $${goal.current.toLocaleString(
          'es-CO'
        )} / $${goal.target.toLocaleString('es-CO')} (${progress}%)\n`;
      });
    }

    financialContext += '--- FIN DE DATOS FINANCIEROS ---\n\n';

    // Construir el historial de conversaciï¿½n
    let conversationContext = '';
    if (this.conversationHistory.length > 0) {
      conversationContext = '\n\n--- HISTORIAL DE CONVERSACIï¿½N ---\n';
      // Solo incluir los ï¿½ltimos 5 mensajes para no exceder lï¿½mites
      const recentHistory = this.conversationHistory.slice(-5);
      recentHistory.forEach((msg) => {
        conversationContext += `${msg.role === 'user' ? 'Usuario' : 'Fin'}: ${
          msg.content
        }\n`;
      });
      conversationContext += '--- FIN DE HISTORIAL ---\n\n';
    }

    // Prompt completo
    const fullPrompt = `${this.systemPrompt}${financialContext}${conversationContext}Usuario: ${userMessage}\n\nFin:`;

    return fullPrompt;
  }

  // ========================================
  // AGREGAR MENSAJES AL CHAT
  // ========================================
  addUserMessage(message) {
    const messageEl = this.createMessageElement(message, 'user');
    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  }

  addBotMessage(message) {
    const messageEl = this.createMessageElement(message, 'bot');
    this.chatMessages.appendChild(messageEl);
    this.scrollToBottom();
  }

  createMessageElement(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';

    if (type === 'bot') {
      const img = document.createElement('img');
      img.src = 'img/FIN.png';
      img.alt = 'Fin';
      avatarDiv.appendChild(img);
    } else {
      avatarDiv.textContent = this.userProfile.name
        ? this.userProfile.name.charAt(0).toUpperCase()
        : 'U';
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';

    // Formatear el texto (convertir saltos de lï¿½nea y formateo bï¿½sico)
    bubbleDiv.innerHTML = this.formatMessage(text);

    const footerDiv = document.createElement('div');
    footerDiv.className = 'message-footer';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = this.getCurrentTime();

    footerDiv.appendChild(timeSpan);
    contentDiv.appendChild(bubbleDiv);
    contentDiv.appendChild(footerDiv);

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
  }

  formatMessage(text) {
    // Convertir ** a <strong> para negrita
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convertir saltos de lï¿½nea a <br>
    formatted = formatted.replace(/\n/g, '<br>');

    // Detectar listas con viï¿½etas
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Detectar listas numeradas
    formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    return formatted;
  }

  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // ========================================
  // INDICADORES Y UI
  // ========================================
  showTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'block';
      this.scrollToBottom();
    }
  }

  hideTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'none';
    }
  }

  adjustTextareaHeight() {
    if (this.messageInput) {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    }
  }

  toggleSendButton() {
    if (this.sendBtn && this.messageInput) {
      this.sendBtn.disabled = this.messageInput.value.trim() === '';
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }

  // ========================================
  // MODAL DE CONFIGURACIï¿½N
  // ========================================
  openSettingsModal() {
    if (this.settingsModal) {
      this.settingsModal.classList.add('active');

      // Cargar datos actuales
      document.getElementById('userName').value = this.userProfile.name || '';
      document.getElementById('monthlyIncome').value =
        this.userProfile.monthlyIncome || '';
      document.getElementById('monthlyExpenses').value =
        this.userProfile.monthlyExpenses || '';
      document.getElementById('financialGoals').value =
        this.userProfile.financialGoals || '';
      document.getElementById('financialConcerns').value =
        this.userProfile.financialConcerns || '';
    }
  }

  closeSettingsModal() {
    if (this.settingsModal) {
      this.settingsModal.classList.remove('active');
    }
  }

  saveProfile() {
    const profile = {
      name: document.getElementById('userName').value.trim(),
      monthlyIncome:
        parseFloat(document.getElementById('monthlyIncome').value) || 0,
      monthlyExpenses:
        parseFloat(document.getElementById('monthlyExpenses').value) || 0,
      financialGoals: document.getElementById('financialGoals').value.trim(),
      financialConcerns: document
        .getElementById('financialConcerns')
        .value.trim(),
    };

    this.userProfile = profile;
    localStorage.setItem('finChatProfile', JSON.stringify(profile));

    this.closeSettingsModal();
    this.showToast('Perfil actualizado correctamente ', 'success');

    console.log(' Perfil guardado:', profile);
  }

  loadUserProfile() {
    const saved = localStorage.getItem('finChatProfile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error al cargar perfil:', e);
      }
    }

    return {
      name: '',
      monthlyIncome: 0,
      monthlyExpenses: 0,
      financialGoals: '',
      financialConcerns: '',
    };
  }

  // ========================================
  // CARGAR DATOS FINANCIEROS
  // ========================================
  loadFinancialData() {
    // Intentar cargar desde localStorage o Firebase
    try {
      // Desde localStorage
      const expenses = localStorage.getItem('expenses');
      if (expenses) {
        this.expenses = JSON.parse(expenses);
      }

      const goals = localStorage.getItem('goals');
      if (goals) {
        this.goals = JSON.parse(goals);
      }

      // Si hay usuario autenticado, cargar desde Firebase
      if (window.FB && window.FB.auth.currentUser) {
        this.loadFromFirebase();
      }
    } catch (error) {
      console.error('Error al cargar datos financieros:', error);
    }
  }

  async loadFromFirebase() {
    try {
      const user = window.FB.auth.currentUser;
      if (!user) return;

      const userId = user.uid;
      const userDocRef = window.FB.doc(window.FB.db, 'users', userId);
      const userDoc = await window.FB.getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.expenses) this.expenses = data.expenses;
        if (data.goals) this.goals = data.goals;
        console.log(' Datos cargados desde Firebase');
      }
    } catch (error) {
      console.error('Error al cargar desde Firebase:', error);
    }
  }

  // ========================================
  // ACCIONES
  // ========================================
  refreshConversation() {
    if (
      confirm(
        'ï¿½Quieres iniciar una nueva conversaciï¿½n? Se borrarï¿½ el historial actual.'
      )
    ) {
      this.conversationHistory = [];

      // Limpiar mensajes excepto el mensaje de bienvenida
      while (this.chatMessages.children.length > 2) {
        this.chatMessages.removeChild(this.chatMessages.lastChild);
      }

      // Mostrar sugerencias de nuevo
      if (this.quickSuggestions) {
        this.quickSuggestions.style.display = 'block';
      }

      this.showToast('Nueva conversaciï¿½n iniciada =', 'success');
    }
  }

  goBack() {
    // Volver al dashboard o index.html
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  }

  attachFinancialData() {
    this.showToast('Adjuntando datos financieros... =ï¿½', 'success');
    // Recargar datos financieros
    this.loadFinancialData();
  }

  // ========================================
  // TOAST DE NOTIFICACIONES
  // ========================================
  showToast(message, type = 'success') {
    if (this.toast) {
      this.toast.textContent = message;
      this.toast.className = `toast ${type} show`;

      setTimeout(() => {
        this.toast.classList.remove('show');
      }, 3000);
    }
  }
}

// ========================================
// INICIALIZAR CUANDO EL DOM ESTÃ‰ LISTO
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  // FunciÃ³n para inicializar el chat con la configuraciÃ³n recibida
  function initializeChat(config) {
    // Crear objeto FB global con la configuraciÃ³n recibida
    window.FB = {
      geminiApiKey: config.geminiApiKey,
    };

    // Inicializar el chat
    const finChat = new FinChat();
    window.finChat = finChat; // Exponer globalmente para debugging
    console.log('âœ… Fin Chat estÃ¡ listo para ayudarte');
  }

  // Escuchar mensajes del padre (parent window)
  window.addEventListener('message', (event) => {
    // Validar que el mensaje sea del tipo esperado
    if (event.data && event.data.type === 'FIREBASE_CONFIG') {
      console.log(
        'âœ… ConfiguraciÃ³n de Firebase recibida desde la app principal.'
      );
      initializeChat(event.data.payload);
    }
  });

  console.log('ðŸŸ¡ Chat esperando configuraciÃ³n de Firebase...');
});
