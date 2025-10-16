// ========================================
// CONVERSATIONAL EXPENSE UI
// Interfaz conversacional para registro de gastos
// ========================================

class ConversationalExpenseUI {
  constructor(financeApp) {
    this.app = financeApp;
    this.conversational = null;
    this.modal = null;
    this.chatContainer = null;
    this.inputField = null;
  }

  // ========================================
  // ABRIR MODAL
  // ========================================
  async open() {
    // Verificar Premium
    if (window.premiumManager && !window.premiumManager.isPremiumActive()) {
      showPremiumUpgradeModal({
        feature: 'Registro Conversacional de Gastos',
        benefits: [
          '🤖 Registra gastos hablando con Fin',
          '⚡ Sin formularios, todo conversacional',
          '📊 Análisis en tiempo real',
          '💡 Feedback inmediato según tus gastos',
          '✨ Ahorra tiempo y mejora tu control'
        ]
      });
      return;
    }

    // Crear instancia conversacional
    this.conversational = new ConversationalExpense(this.app);

    // Crear modal si no existe
    if (!this.modal) {
      this.createModal();
    }

    // Iniciar conversación
    const initialMessage = await this.conversational.start();

    // Mostrar modal
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Limpiar chat y agregar mensaje inicial
    this.chatContainer.innerHTML = '';
    this.addFinMessage(initialMessage.message, initialMessage.suggestions);

    // Focus en input
    setTimeout(() => this.inputField.focus(), 300);
  }

  // ========================================
  // CREAR MODAL
  // ========================================
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay conversational-expense-modal';
    this.modal.id = 'conversationalExpenseModal';

    this.modal.innerHTML = `
      <div class="modal-content conversational-content">
        <div class="modal-header conversational-header">
          <div class="header-left">
            <img src="img/FIN.png" alt="Fin" class="fin-avatar-modal">
            <div>
              <h3>💬 Registrar Gasto con Fin</h3>
              <span class="header-subtitle">Cuéntame sobre tu gasto</span>
            </div>
          </div>
          <button class="modal-close" onclick="closeConversationalExpense()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" id="expenseProgress"></div>
          </div>
          <span class="progress-text" id="progressText">0/3 completado</span>
        </div>

        <div class="chat-container" id="expenseChatContainer">
          <!-- Mensajes aquí -->
        </div>

        <div class="suggestions-container" id="expenseSuggestions">
          <!-- Sugerencias aquí -->
        </div>

        <div class="chat-input-container">
          <input
            type="text"
            id="expenseChatInput"
            placeholder="Escribe aquí o selecciona una sugerencia..."
            autocomplete="off"
          />
          <button class="send-btn" onclick="sendExpenseMessage()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.chatContainer = document.getElementById('expenseChatContainer');
    this.inputField = document.getElementById('expenseChatInput');

    // Event listeners
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });

    // Cerrar al hacer clic fuera
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  // ========================================
  // AGREGAR MENSAJES AL CHAT
  // ========================================
  addFinMessage(text, suggestions = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message fin-message';

    messageDiv.innerHTML = `
      <img src="img/FIN.png" alt="Fin" class="message-avatar">
      <div class="message-bubble fin-bubble">
        <p>${text}</p>
      </div>
    `;

    this.chatContainer.appendChild(messageDiv);
    this.scrollToBottom();

    // Agregar sugerencias si existen
    if (suggestions && suggestions.length > 0) {
      setTimeout(() => {
        this.renderSuggestions(suggestions);
      }, 300);
    }
  }

  addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';

    messageDiv.innerHTML = `
      <div class="message-bubble user-bubble">
        <p>${text}</p>
      </div>
    `;

    this.chatContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-message fin-message typing-indicator';
    indicator.id = 'typingIndicator';

    indicator.innerHTML = `
      <img src="img/FIN.png" alt="Fin" class="message-avatar">
      <div class="message-bubble fin-bubble typing">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.chatContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  addConfirmationCard(data) {
    const card = document.createElement('div');
    card.className = 'confirmation-card';

    const { expenseData, analysis, emoji, actions } = data;

    card.innerHTML = `
      <div class="confirmation-header">
        <span class="confirmation-emoji">${emoji}</span>
        <h4>Confirmar Gasto</h4>
      </div>

      <div class="confirmation-details">
        <div class="detail-row">
          <span class="detail-label">Monto:</span>
          <span class="detail-value">$${expenseData.amount.toLocaleString('es-CO')}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Categoría:</span>
          <span class="detail-value">${expenseData.category}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Necesidad:</span>
          <span class="detail-value">${expenseData.necessity}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">${new Date(expenseData.date).toLocaleDateString('es-CO')}</span>
        </div>
      </div>

      <div class="confirmation-analysis ${analysis.type}">
        <i class="fas ${this.getAnalysisIcon(analysis.type)}"></i>
        <p>${analysis.message}</p>
      </div>

      <div class="confirmation-actions">
        ${actions.map(action => `
          <button class="confirmation-btn ${action.action}" onclick="handleExpenseAction('${action.action}')">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;

    this.chatContainer.appendChild(card);
    this.scrollToBottom();
  }

  // ========================================
  // RENDERIZAR SUGERENCIAS
  // ========================================
  renderSuggestions(suggestions) {
    const container = document.getElementById('expenseSuggestions');
    container.innerHTML = '';

    if (!suggestions || suggestions.length === 0) return;

    suggestions.forEach((suggestion) => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-chip';

      if (typeof suggestion === 'string') {
        btn.textContent = suggestion;
        btn.onclick = () => this.selectSuggestion(suggestion);
      } else {
        btn.textContent = suggestion.text;
        btn.onclick = () => this.selectSuggestion(suggestion.text, suggestion.value);
      }

      container.appendChild(btn);
    });
  }

  selectSuggestion(text, value = null) {
    this.inputField.value = text;
    this.sendMessage(value);
  }

  // ========================================
  // ENVIAR MENSAJE
  // ========================================
  async sendMessage(directValue = null) {
    const text = this.inputField.value.trim();
    if (!text && !directValue) return;

    // Agregar mensaje del usuario
    this.addUserMessage(text);
    this.inputField.value = '';

    // Limpiar sugerencias
    document.getElementById('expenseSuggestions').innerHTML = '';

    // Mostrar indicador de escritura
    this.addTypingIndicator();

    // Procesar mensaje
    try {
      const response = await this.conversational.processMessage(text);

      this.removeTypingIndicator();

      if (response.isComplete) {
        // Mostrar tarjeta de confirmación
        this.addConfirmationCard(response);
      } else {
        // Agregar respuesta de Fin
        this.addFinMessage(response.message, response.suggestions);

        // Actualizar barra de progreso
        this.updateProgress(response.progress);
      }

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      this.removeTypingIndicator();
      this.addFinMessage('Disculpa, hubo un error. ¿Puedes intentar de nuevo?');
    }
  }

  // ========================================
  // ACCIONES DE CONFIRMACIÓN
  // ========================================
  async handleAction(action) {
    if (action === 'save') {
      await this.saveExpense();
    } else if (action === 'edit') {
      this.editExpense();
    } else if (action === 'cancel') {
      this.close();
    }
  }

  async saveExpense() {
    try {
      const result = await this.conversational.saveExpense();

      if (result.success) {
        this.addFinMessage(result.message);

        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          this.close();
          this.showSuccessToast();
        }, 2000);
      }

    } catch (error) {
      console.error('Error guardando gasto:', error);
      this.addFinMessage('❌ Error guardando el gasto. Intenta de nuevo.');
    }
  }

  editExpense() {
    this.addFinMessage('¿Qué campo quieres cambiar?', [
      '💰 Cambiar monto',
      '📂 Cambiar categoría',
      '⭐ Cambiar necesidad',
      '❌ Cancelar'
    ]);
  }

  // ========================================
  // UTILIDADES
  // ========================================
  updateProgress(progress) {
    const progressBar = document.getElementById('expenseProgress');
    const progressText = document.getElementById('progressText');

    if (progressBar) {
      progressBar.style.width = `${progress.percent}%`;
    }

    if (progressText) {
      progressText.textContent = `${progress.current}/${progress.total} completado`;
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }, 100);
  }

  getAnalysisIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle',
      alert: 'fa-exclamation-circle'
    };
    return icons[type] || 'fa-info-circle';
  }

  showSuccessToast() {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>✅ Gasto guardado exitosamente</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========================================
  // CERRAR MODAL
  // ========================================
  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    if (this.conversational) {
      this.conversational.reset();
    }
  }
}

// ========================================
// FUNCIONES GLOBALES
// ========================================
let conversationalExpenseUI = null;

function openConversationalExpense() {
  if (!conversationalExpenseUI) {
    conversationalExpenseUI = new ConversationalExpenseUI(window.financeApp);
  }
  conversationalExpenseUI.open();
}

function closeConversationalExpense() {
  if (conversationalExpenseUI) {
    conversationalExpenseUI.close();
  }
}

function sendExpenseMessage() {
  if (conversationalExpenseUI) {
    conversationalExpenseUI.sendMessage();
  }
}

function handleExpenseAction(action) {
  if (conversationalExpenseUI) {
    conversationalExpenseUI.handleAction(action);
  }
}

// Exponer globalmente
window.ConversationalExpenseUI = ConversationalExpenseUI;
window.openConversationalExpense = openConversationalExpense;
window.closeConversationalExpense = closeConversationalExpense;
window.sendExpenseMessage = sendExpenseMessage;
window.handleExpenseAction = handleExpenseAction;

console.log('✅ ConversationalExpenseUI loaded');
