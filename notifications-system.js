// ========================================
// SISTEMA DE NOTIFICACIONES
// Notificaciones diarias de Fin con IA Gemini
// ========================================

class NotificationsSystem {
  constructor(financeApp) {
    this.app = financeApp;
    this.storageKey = 'finNotifications';
    this.lastNotificationKey = 'lastFinNotification';
    this.notifications = [];
    this.unreadCount = 0;
    this.geminiApiKey = window.FB?.geminiApiKey || null;
    this.dropdownEl = null;
    this.dropdownListEl = null;
    this.dropdownEmptyEl = null;
    this.dropdownBadgeEl = null;
    this.bannerBadgeEl = null;
    this.markAllButtonEl = null;
    this.bellButtonEl = null;
    this.bannerButtonEl = null;
    this.mainBellIcon = null;
    this.bannerBellIcon = null;
    this.dropdownListBound = false;

    this.loadNotifications();
    this.checkDailyNotification();
  }

  configureDropdownUI(options = {}) {
    const defaults = {
      dropdownId: 'notificationDropdown',
      listId: 'notificationList',
      emptyStateId: 'notificationEmpty',
      badgeId: 'notificationCount',
      markAllId: 'markAllReadBtn',
      mobileBadgeId: 'bannerNotificationCount',
      bellButtonId: 'notificationArea',
      bannerButtonId: 'bannerNotificationArea',
      mainBellIconId: 'notificationBell',
      mobileBellIconId: 'bannerNotificationBell',
    };

    const config = { ...defaults, ...options };

    this.dropdownEl = document.getElementById(config.dropdownId);
    this.dropdownListEl = document.getElementById(config.listId);
    this.dropdownEmptyEl = document.getElementById(config.emptyStateId);
    this.dropdownBadgeEl = document.getElementById(config.badgeId);
    this.bannerBadgeEl = document.getElementById(config.mobileBadgeId);
    this.markAllButtonEl = document.getElementById(config.markAllId);
    this.bellButtonEl = document.getElementById(config.bellButtonId);
    if (this.bellButtonEl && this.bellButtonEl.tagName !== 'BUTTON') {
      const candidate = this.bellButtonEl.querySelector('button');
      if (candidate) this.bellButtonEl = candidate;
    }
    this.bannerButtonEl = document.getElementById(config.bannerButtonId);
    if (this.bannerButtonEl && this.bannerButtonEl.tagName !== 'BUTTON') {
      const candidate = this.bannerButtonEl.querySelector('button');
      if (candidate) this.bannerButtonEl = candidate;
    }
    this.mainBellIcon =
      document.getElementById(config.mainBellIconId) ||
      this.bellButtonEl?.querySelector('i');
    this.bannerBellIcon =
      document.getElementById(config.mobileBellIconId) ||
      this.bannerButtonEl?.querySelector('i');

    if (this.dropdownListEl && !this.dropdownListBound) {
      this.dropdownListEl.addEventListener('click', (event) => {
        const item = event.target.closest('[data-notification-id]');
        if (!item) return;
        event.preventDefault();
        const notificationId = item.dataset.notificationId;
        this.markAsRead(notificationId);
      });
      this.dropdownListBound = true;
    }

    if (this.markAllButtonEl && !this.markAllButtonEl.__notificationsBound) {
      this.markAllButtonEl.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.markAllAsRead();
      });
      this.markAllButtonEl.__notificationsBound = true;
    }

    this.updateBellIcon();
    this.renderDropdown();
  }

  // ========================================
  // MENSAJES DE SISTEMA PREDEFINIDOS
  // ========================================
  getSystemMessages() {
    const userName = this.app.userProfile?.name || 'Usuario';

    return [
      {
        type: 'motivation',
        messages: [
          `¡Hola ${userName}! 💪 Cada pequeño ahorro cuenta. ¿Ya revisaste tus gastos de hoy?`,
          `${userName}, recuerda: el éxito financiero se construye día a día. ¡Tú puedes! 🌟`,
          `¡Buenos días ${userName}! 😊 Hoy es un gran día para mejorar tus finanzas.`,
          `${userName}, tu dedicación es inspiradora. ¡Sigue así! 🎯`,
          `¡Hola ${userName}! ✨ Pequeños cambios, grandes resultados. ¿Listo para hoy?`
        ]
      },
      {
        type: 'tips',
        messages: [
          `💡 Tip del día ${userName}: Antes de comprar algo, espera 24 horas. Muchas compras impulsivas desaparecen con el tiempo.`,
          `📊 ${userName}, ¿sabías que registrar tus gastos reduce el gasto impulsivo en un 30%? ¡Sigue así!`,
          `💰 Consejo: Destina el 20% de tus ingresos al ahorro, ${userName}. Tu yo futuro te lo agradecerá.`,
          `🎯 ${userName}, establece metas financieras específicas. Las metas claras son más fáciles de alcanzar.`,
          `✨ Tip: Automatiza tus ahorros, ${userName}. Lo que no ves, no lo gastas.`
        ]
      },
      {
        type: 'questions',
        messages: [
          `¿Cómo va tu semana financiera, ${userName}? 🤔 Revisa tu progreso en el dashboard.`,
          `${userName}, ¿ya estableciste tu meta de ahorro para este mes? 🎯`,
          `¿Cuánto has ahorrado esta semana, ${userName}? ¡Cada peso cuenta! 💵`,
          `${userName}, ¿revisaste tus gastos recurrentes? Puede haber oportunidades de ahorro. 🔍`,
          `¿Qué tal si revisamos tus gastos juntos, ${userName}? Estoy aquí para ayudarte. 😊`
        ]
      },
      {
        type: 'reminders',
        messages: [
          `⏰ ${userName}, no olvides registrar tus gastos de hoy. ¡Mantén tu racha!`,
          `📝 Recuerda ${userName}: registrar gastos es el primer paso para controlarlos.`,
          `🔔 ${userName}, ¿ya revisaste tus metas esta semana? ¡No pierdas el enfoque!`,
          `⭐ ${userName}, actualiza tu presupuesto mensual. Los datos precisos = mejores decisiones.`,
          `💼 ${userName}, es un buen momento para revisar tus categorías de gasto.`
        ]
      },
      {
        type: 'celebrations',
        messages: [
          `🎉 ¡Felicidades ${userName}! Has registrado varios gastos. ¡Excelente trabajo!`,
          `🌟 ${userName}, tu constancia es admirable. ¡Sigue construyendo buenos hábitos!`,
          `🏆 ¡Bravo ${userName}! Cada día estás más cerca de tus metas financieras.`,
          `💪 ${userName}, tu dedicación a las finanzas es inspiradora. ¡No pares!`,
          `✨ ${userName}, estás haciendo un trabajo fantástico. ¡Confío en ti!`
        ]
      }
    ];
  }

  // ========================================
  // VERIFICAR SI TOCA NOTIFICACIÓN DIARIA
  // ========================================
  async checkDailyNotification() {
    const lastNotification = localStorage.getItem(this.lastNotificationKey);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Si no hay notificación previa o pasaron 24 horas
    if (!lastNotification || (now - parseInt(lastNotification)) > oneDay) {
      await this.sendDailyNotification();
    }
  }

  // ========================================
  // ENVIAR NOTIFICACIÓN DIARIA
  // ========================================
  async sendDailyNotification() {
    const userName = this.app.userProfile?.name || 'Usuario';
    let message = '';

    // Si hay API key, usar Gemini
    if (this.geminiApiKey) {
      message = await this.generateAIMessage();
    }

    // Si no hay API o falla, usar mensajes predefinidos
    if (!message) {
      message = this.getRandomSystemMessage();
    }

    // Crear notificación
    this.addNotification({
      id: 'daily_' + Date.now(),
      title: '🤖 Mensaje de Fin',
      message: message,
      type: 'daily',
      timestamp: Date.now(),
      read: false
    });

    // Actualizar última notificación
    localStorage.setItem(this.lastNotificationKey, Date.now().toString());
  }

  // ========================================
  // GENERAR MENSAJE CON IA GEMINI
  // ========================================
  async generateAIMessage() {
    const userName = this.app.userProfile?.name || 'Usuario';

    // Calcular estadísticas actuales
    const totalExpenses = this.app.expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = this.app.monthlyIncome;
    const savingsPercentage = totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0;
    const expenseCount = this.app.expenses.length;
    const goalsCount = this.app.goals.length;

    const prompt = `Eres Fin, el asistente financiero personal de ${userName}.

CONTEXTO DEL USUARIO:
- Nombre: ${userName}
- Gastos totales: $${totalExpenses.toLocaleString('es-CO')}
- Ingreso mensual: $${totalIncome.toLocaleString('es-CO')}
- Porcentaje de ahorro: ${savingsPercentage}%
- Gastos registrados: ${expenseCount}
- Metas financieras: ${goalsCount}

TAREA:
Genera UN mensaje diario motivacional, personalizado y breve (máximo 2 líneas) para ${userName}.

REGLAS:
1. Usa el nombre ${userName} en el mensaje
2. Sé motivacional y positivo
3. Si ${savingsPercentage} > 20%, felicita por el ahorro
4. Si ${savingsPercentage} < 10%, motiva a ahorrar sin juzgar
5. Si ${expenseCount} < 5, motiva a registrar más gastos
6. Incluye 1-2 emojis relevantes
7. Máximo 40 palabras (2 líneas)
8. Tono: amigable, cercano, motivador

RESPONDE SOLO CON EL MENSAJE (sin comillas ni formato extra):`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 150
          }
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      let message = data.candidates[0].content.parts[0].text.trim();

      // Limpiar mensaje
      message = message.replace(/^["']|["']$/g, '');
      message = message.replace(/\n/g, ' ');

      return message;

    } catch (error) {
      console.error('Error generando mensaje con IA:', error);
      return null;
    }
  }

  // ========================================
  // OBTENER MENSAJE ALEATORIO DEL SISTEMA
  // ========================================
  getRandomSystemMessage() {
    const categories = this.getSystemMessages();
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomMessage = randomCategory.messages[Math.floor(Math.random() * randomCategory.messages.length)];
    return randomMessage;
  }

  // ========================================
  // AGREGAR NOTIFICACIÓN
  // ========================================
  addNotification(notification) {
    this.notifications.unshift(notification);

    // Limitar a 20 notificaciones
    if (this.notifications.length > 20) {
      this.notifications = this.notifications.slice(0, 20);
    }

    this.updateUnreadCount();
    this.saveNotifications();
    this.updateBellIcon();
    this.renderDropdown();

    // Mostrar toast
    this.showNotificationToast(notification);
  }

  // ========================================
  // CARGAR NOTIFICACIONES
  // ========================================
  loadNotifications() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.notifications = JSON.parse(saved);
    }
    this.updateUnreadCount();
    this.updateBellIcon();
    this.renderDropdown();
  }

  saveNotifications() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
  }

  // ========================================
  // ACTUALIZAR CONTADOR NO LEÍDAS
  // ========================================
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  // ========================================
  // ACTUALIZAR ICONO DE CAMPANITA
  // ========================================
  updateBellIcon() {
    const hasUnread = this.unreadCount > 0;
    const countText = this.unreadCount > 9 ? '9+' : String(this.unreadCount);

    const badge =
      this.dropdownBadgeEl ||
      document.querySelector('.notification-badge');
    if (badge) {
      if (hasUnread) {
        badge.textContent = countText;
        badge.style.display = 'flex';
      } else {
        badge.textContent = '';
        badge.style.display = 'none';
      }
    }

    const bellButton =
      this.bellButtonEl || document.querySelector('.notification-bell');
    if (bellButton) {
      bellButton.classList.toggle('has-notifications', hasUnread);
    }

    const mainIcon =
      this.mainBellIcon ||
      document.querySelector('#notificationBell') ||
      bellButton?.querySelector('i');
    if (mainIcon) {
      mainIcon.classList.toggle('has-notifications', hasUnread);
    }

    if (this.bannerBadgeEl) {
      if (hasUnread) {
        this.bannerBadgeEl.textContent = countText;
        this.bannerBadgeEl.style.display = 'flex';
      } else {
        this.bannerBadgeEl.textContent = '';
        this.bannerBadgeEl.style.display = 'none';
      }
    }

    if (this.bannerButtonEl) {
      this.bannerButtonEl.classList.toggle('has-notifications', hasUnread);
    }

    if (this.bannerBellIcon) {
      this.bannerBellIcon.classList.toggle('has-notifications', hasUnread);
    }
  }

  // ========================================
  // MOSTRAR TOAST DE NOTIFICACIÓN
  // ========================================
  showNotificationToast(notification) {
    const toast = document.createElement('div');
    toast.className = 'toast notification-toast';

    toast.innerHTML = `
      <img src="img/FIN.png" alt="Fin" style="width: 32px; height: 32px; border-radius: 50%;">
      <div>
        <strong>${notification.title}</strong>
        <p style="margin: 4px 0 0 0; font-size: 0.9em;">${notification.message}</p>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 6000);
  }

  // ========================================
  // ABRIR PANEL DE NOTIFICACIONES
  // ========================================
  openNotificationsPanel() {
    const panel = document.getElementById('notificationsPanel');

    if (!panel) {
      this.createNotificationsPanel();
      return;
    }

    // Toggle panel
    if (panel.classList.contains('show')) {
      panel.classList.remove('show');
    } else {
      this.renderNotifications();
      panel.classList.add('show');
    }
  }

  // ========================================
  // CREAR PANEL DE NOTIFICACIONES
  // ========================================
  createNotificationsPanel() {
    const panel = document.createElement('div');
    panel.id = 'notificationsPanel';
    panel.className = 'notifications-panel';

    panel.innerHTML = `
      <div class="notifications-header">
        <h3>🔔 Notificaciones</h3>
        <button class="mark-all-read-btn" onclick="window.notificationsSystem.markAllAsRead()">
          Marcar todas como leídas
        </button>
      </div>
      <div class="notifications-list" id="notificationsList">
        <!-- Notificaciones aquí -->
      </div>
    `;

    document.body.appendChild(panel);

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      const bellIcon = document.querySelector('.notification-bell');
      if (!panel.contains(e.target) && !bellIcon.contains(e.target)) {
        panel.classList.remove('show');
      }
    });

    this.renderNotifications();
    panel.classList.add('show');
  }

  // ========================================
  // RENDERIZAR NOTIFICACIONES
  // ========================================
  renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = `
        <div class="no-notifications">
          <i class="fas fa-bell-slash"></i>
          <p>No tienes notificaciones</p>
        </div>
      `;
      return;
    }

    list.innerHTML = this.notifications.map(notification => `
      <div class="notification-item ${notification.read ? 'read' : 'unread'}" onclick="window.notificationsSystem.markAsRead('${notification.id}')">
        <div class="notification-icon">
          <img src="img/FIN.png" alt="Fin">
        </div>
        <div class="notification-content">
          <h4>${notification.title}</h4>
          <p>${notification.message}</p>
          <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
        </div>
        ${!notification.read ? '<span class="unread-dot"></span>' : ''}
      </div>
    `).join('');

    this.renderDropdown();
  }

  renderDropdown() {
    if (!this.dropdownListEl) return;

    if (!this.notifications.length) {
      this.dropdownListEl.innerHTML = '';
      if (this.dropdownEmptyEl) this.dropdownEmptyEl.classList.remove('hidden');
      if (this.markAllButtonEl) this.markAllButtonEl.disabled = true;
      return;
    }

    if (this.dropdownEmptyEl) this.dropdownEmptyEl.classList.add('hidden');
    if (this.markAllButtonEl) this.markAllButtonEl.disabled = false;

    this.dropdownListEl.innerHTML = this.notifications
      .map((notification) => this.buildDropdownItem(notification))
      .join('');
  }

  handleDropdownOpen() {
    if (this.dropdownBadgeEl) {
      this.dropdownBadgeEl.style.display = 'none';
    }
    if (this.bannerBadgeEl) {
      this.bannerBadgeEl.style.display = 'none';
    }
  }

  buildDropdownItem(notification) {
    const meta = this.getNotificationMeta(notification.type);
    const classes = ['notification-item', notification.read ? 'read' : 'unread']
      .join(' ')
      .trim();

    return `
      <div class="${classes}" data-notification-id="${notification.id}">
        <div class="notification-icon" style="background: ${meta.background}">
          <i class="fas ${meta.icon}"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title-row">
            <h4>${this.escapeHTML(notification.title || meta.title)}</h4>
            <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
          </div>
          <p>${this.escapeHTML(notification.message)}</p>
          <span class="notification-type-label">${meta.label}</span>
        </div>
        ${!notification.read ? '<span class="unread-dot"></span>' : ''}
      </div>
    `;
  }

  getNotificationMeta(type = 'default') {
    const map = {
      daily: {
        icon: 'fa-star',
        label: 'Mensaje diario',
        background: 'rgba(255, 215, 0, 0.18)',
        title: 'Mensaje diario',
      },
      motivation: {
        icon: 'fa-heart',
        label: 'Motivación',
        background: 'rgba(59, 130, 246, 0.18)',
        title: 'Motivación',
      },
      tips: {
        icon: 'fa-lightbulb',
        label: 'Consejo',
        background: 'rgba(251, 191, 36, 0.18)',
        title: 'Consejo financiero',
      },
      reminders: {
        icon: 'fa-clock',
        label: 'Recordatorio',
        background: 'rgba(14, 116, 144, 0.18)',
        title: 'Recordatorio',
      },
      celebrations: {
        icon: 'fa-trophy',
        label: 'Logro',
        background: 'rgba(16, 185, 129, 0.18)',
        title: '¡Logro!',
      },
      alerts: {
        icon: 'fa-triangle-exclamation',
        label: 'Alerta',
        background: 'rgba(239, 68, 68, 0.18)',
        title: 'Alerta',
      },
      default: {
        icon: 'fa-bell',
        label: 'Notificación',
        background: 'rgba(37, 99, 235, 0.18)',
        title: 'Notificación',
      },
    };

    return map[type] || map.default;
  }

  escapeHTML(string = '') {
    return string
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ========================================
  // MARCAR COMO LEÍDA
  // ========================================
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.updateUnreadCount();
      this.updateBellIcon();
      this.renderNotifications();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
    this.updateUnreadCount();
    this.updateBellIcon();
    this.renderNotifications();
  }

  // ========================================
  // FORMATEAR TIEMPO
  // ========================================
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;

    const date = new Date(timestamp);
    return date.toLocaleDateString('es-CO');
  }

  // ========================================
  // FORZAR NUEVA NOTIFICACIÓN (TESTING)
  // ========================================
  async forceNewNotification() {
    localStorage.removeItem(this.lastNotificationKey);
    await this.sendDailyNotification();
  }
}

// Exponer globalmente
window.NotificationsSystem = NotificationsSystem;

console.log('✅ Notifications System loaded');
