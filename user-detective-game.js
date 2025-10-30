/* ============================================
   🎮 SISTEMA DE GAMIFICACIÓN - DETECTOR DE USUARIOS
   Sistema interactivo para asignar usuario a gastos
   Con avatares dinámicos, puntos y logros
   ============================================ */

(function() {
  'use strict';

  console.log('🎮 User Detective Game cargando...');

  // ============================================
  // CONFIGURACIÓN GLOBAL
  // ============================================
  const config = {
    pointsPerAssignment: 10,
    pointsPerBothAssignment: 15,
    enableConfetti: true,
    avatarColors: [
      ['#00c2ff', '#00a9e0'],  // Azul
      ['#1fdb8b', '#14b773'],  // Verde
      ['#f4a261', '#d0843f'],  // Naranja
      ['#ff5c5c', '#e03e3e'],  // Rojo
      ['#a78bfa', '#8b5cf6'],  // Púrpura
      ['#ffc857', '#f4a261'],  // Amarillo
    ],
    reactions: ['😊', '😎', '🤓', '😄', '🤗', '😁', '🤩', '😋']
  };

  // ============================================
  // CLASE PRINCIPAL
  // ============================================
  class UserDetectiveGame {
    constructor(app) {
      this.app = app;
      this.modal = null;
      this.overlay = null;
      this.currentExpenseData = null;
      this.userStats = this.loadUserStats();
      this.init();
    }

    init() {
      console.log('✅ Inicializando User Detective Game');
      this.createModal();
    }

    // ============================================
    // CREAR MODAL DINÁMICAMENTE
    // ============================================
    createModal() {
      // Crear overlay
      this.overlay = document.createElement('div');
      this.overlay.className = 'detective-modal-overlay';
      this.overlay.id = 'detectiveModalOverlay';

      // Crear modal
      const modal = document.createElement('div');
      modal.className = 'detective-modal';
      modal.id = 'detectiveModal';

      this.overlay.appendChild(modal);
      document.body.appendChild(this.overlay);

      // Click fuera del modal para cerrar
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });

      this.modal = modal;
      console.log('✅ Modal creado');
    }

    // ============================================
    // OBTENER USUARIOS DISPONIBLES
    // ============================================
    getAvailableUsers() {
      const users = [];

      // Usuarios del sistema (Daniel, Givonik por defecto)
      const defaultUsers = ['Daniel', 'Givonik'];

      // Usuarios personalizados si existen
      const customUsers = this.app.customUsers || [];

      // Combinar todos
      const allUsers = [...new Set([...defaultUsers, ...customUsers])];

      // Filtrar "Sin asignar" y valores vacíos
      return allUsers.filter(user => user && user !== '' && user !== 'Sin asignar');
    }

    // ============================================
    // GENERAR INICIALES DEL NOMBRE
    // ============================================
    getInitials(name) {
      if (!name) return '?';
      const parts = name.trim().split(' ');
      if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
      }
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    // ============================================
    // OBTENER COLOR PARA AVATAR
    // ============================================
    getAvatarColor(index) {
      const colorIndex = index % config.avatarColors.length;
      return config.avatarColors[colorIndex];
    }

    // ============================================
    // OBTENER REACCIÓN ALEATORIA
    // ============================================
    getRandomReaction() {
      return config.reactions[Math.floor(Math.random() * config.reactions.length)];
    }

    // ============================================
    // MOSTRAR MODAL
    // ============================================
    show(expenseData) {
      this.currentExpenseData = expenseData;
      const users = this.getAvailableUsers();

      console.log('👥 Usuarios disponibles:', users);

      // Construir HTML del modal
      const modalHTML = this.buildModalHTML(users, expenseData);
      this.modal.innerHTML = modalHTML;

      // Mostrar overlay
      this.overlay.classList.add('active');

      // Configurar event listeners
      this.setupEventListeners(users);

      // Reproducir sonido (opcional)
      this.playSound('open');
    }

    // ============================================
    // CONSTRUIR HTML DEL MODAL
    // ============================================
    buildModalHTML(users, expenseData) {
      const amount = expenseData.amount || 0;
      const description = expenseData.description || 'este gasto';
      const store = expenseData.store_name || '';

      let html = `
        <div class="detective-header">
          <button class="btn-close-detective" id="btnCloseDetective">
            <i class="fas fa-times"></i>
          </button>

          <div class="detective-icon">🕵️</div>
          <h2 class="detective-title">¿Quién hizo esta compra?</h2>
          <p class="detective-subtitle">Ayuda a identificar al responsable</p>

          <div class="detective-expense-info">
            <p class="detective-expense-amount">$${amount.toLocaleString()}</p>
            <p class="detective-expense-details">
              ${description}${store ? ` en ${store}` : ''}
            </p>
          </div>
        </div>

        <div class="detective-body">
          <div class="avatars-container ${users.length === 2 ? 'two-users' : users.length > 2 ? 'many-users' : ''}">
      `;

      // Generar tarjetas de usuarios
      users.forEach((user, index) => {
        const initials = this.getInitials(user);
        const colors = this.getAvatarColor(index);
        const reaction = this.getRandomReaction();
        const level = this.getUserLevel(user);

        html += `
          <div class="avatar-card" data-user="${user}" data-index="${index}">
            <div class="avatar-circle" style="background: linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%);">
              <span class="avatar-initials">${initials}</span>
              <div class="avatar-reaction">${reaction}</div>
            </div>
            <span class="avatar-name">${user}</span>
            <div class="avatar-stats">
              <span class="avatar-level">
                <i class="fas fa-star"></i>
                Nivel ${level}
              </span>
            </div>
          </div>
        `;
      });

      // Si hay exactamente 2 usuarios, agregar opción "Ambos"
      if (users.length === 2) {
        html += `
          <div class="avatar-card both-option" data-user="both">
            <div class="avatar-circle">
              <i class="fas fa-users"></i>
              <div class="avatar-reaction">🤝</div>
            </div>
            <span class="avatar-name">Ambos</span>
            <div class="both-users-preview">
              <i class="fas fa-arrow-left"></i>
              <span>${users[0]}</span>
              <i class="fas fa-plus"></i>
              <span>${users[1]}</span>
              <i class="fas fa-arrow-right"></i>
            </div>
            <div class="avatar-stats">
              <small>Divide el gasto 50/50</small>
            </div>
          </div>
        `;
      }

      // Opción "No lo sé" (auto-asignar)
      html += `
          <div class="avatar-card mystery" data-user="auto">
            <div class="avatar-circle">
              <i class="fas fa-question"></i>
              <div class="avatar-reaction">🤷</div>
            </div>
            <span class="avatar-name">No lo sé</span>
            <div class="avatar-stats">
              <small>Asignar automáticamente</small>
            </div>
          </div>
        </div>

        <div class="detective-rewards">
          <p class="reward-text">
            <i class="fas fa-trophy"></i>
            <span>¡Gana <strong class="reward-points">+${config.pointsPerAssignment}</strong> puntos!</span>
          </p>
        </div>
      </div>
      `;

      return html;
    }

    // ============================================
    // CONFIGURAR EVENT LISTENERS
    // ============================================
    setupEventListeners(users) {
      // Botón cerrar
      const btnClose = document.getElementById('btnCloseDetective');
      if (btnClose) {
        btnClose.addEventListener('click', () => this.close());
      }

      // Tarjetas de usuario
      const avatarCards = this.modal.querySelectorAll('.avatar-card');
      avatarCards.forEach((card, index) => {
        card.addEventListener('click', () => {
          const selectedUser = card.dataset.user;
          this.selectUser(selectedUser, users);
        });
      });
    }

    // ============================================
    // SELECCIONAR USUARIO
    // ============================================
    selectUser(selectedUser, users) {
      console.log('✅ Usuario seleccionado:', selectedUser);

      // Marcar como seleccionado visualmente
      const card = this.modal.querySelector(`[data-user="${selectedUser}"]`);
      if (card) {
        card.classList.add('selected');
      }

      // Determinar usuario final
      let finalUser;
      let isBoth = false;
      let points = config.pointsPerAssignment;

      if (selectedUser === 'both') {
        // Opción "Ambos" - dividir el gasto
        isBoth = true;
        finalUser = `${users[0]} + ${users[1]}`;
        points = config.pointsPerBothAssignment;
      } else if (selectedUser === 'auto') {
        // Auto-asignar al usuario autenticado
        finalUser = this.app.userProfile?.name || this.app.currentUser || users[0];
      } else {
        // Usuario específico
        finalUser = selectedUser;
      }

      // Agregar puntos
      this.addPoints(selectedUser === 'auto' ? null : selectedUser, points);

      // Mostrar feedback
      this.showSelectionFeedback(finalUser, points, isBoth);

      // Aplicar al formulario después de un delay
      setTimeout(() => {
        if (isBoth) {
          this.applyBothUsers(users, this.currentExpenseData);
        } else {
          this.applyUser(finalUser);
        }

        // Cerrar modal
        this.close();
      }, 1500);
    }

    // ============================================
    // APLICAR USUARIO AL FORMULARIO
    // ============================================
    applyUser(user) {
      const userSelect = document.getElementById('user');
      const userDisplay = document.getElementById('selectedUserField');

      if (userSelect) {
        // Verificar si el usuario existe en el select
        const option = Array.from(userSelect.options).find(opt => opt.value === user);

        if (option) {
          userSelect.value = user;
        } else {
          // Si no existe, agregarlo dinámicamente
          const newOption = document.createElement('option');
          newOption.value = user;
          newOption.textContent = `👤 ${user}`;
          userSelect.appendChild(newOption);
          userSelect.value = user;
        }

        // Disparar evento change
        userSelect.dispatchEvent(new Event('change'));
      }

      if (userDisplay) {
        userDisplay.textContent = user;
        userDisplay.style.color = 'var(--color-primary, #0e2a47)';
        userDisplay.style.fontWeight = '600';
      }

      console.log('✅ Usuario aplicado al formulario:', user);
    }

    // ============================================
    // APLICAR "AMBOS" - DIVIDIR GASTO
    // ============================================
    applyBothUsers(users, expenseData) {
      // Asignar al primer usuario por ahora
      // En el submit se creará un gasto dividido
      this.applyUser(`${users[0]} + ${users[1]}`);

      // Guardar flag para dividir en el submit
      this.app._splitExpense = {
        users: users,
        originalAmount: expenseData.amount,
        splitAmount: Math.round(expenseData.amount / 2)
      };

      console.log('✅ Gasto marcado para dividir entre:', users);
    }

    // ============================================
    // MOSTRAR FEEDBACK DE SELECCIÓN
    // ============================================
    showSelectionFeedback(user, points, isBoth) {
      // Crear elemento de feedback
      const feedback = document.createElement('div');
      feedback.className = 'selection-feedback';
      feedback.innerHTML = `
        <div class="feedback-icon">${isBoth ? '🤝' : '🎉'}</div>
        <p class="feedback-message">
          ${isBoth ? '¡Gasto dividido!' : '¡Perfecto!'}
        </p>
        <p class="feedback-submessage">
          Asignado a <strong>${user}</strong>
          <br>
          <span style="color: #ffc857; font-weight: 700;">+${points} puntos</span>
        </p>
      `;

      document.body.appendChild(feedback);

      // Mostrar con animación
      setTimeout(() => feedback.classList.add('active'), 10);

      // Confetti
      if (config.enableConfetti) {
        this.launchConfetti();
      }

      // Remover después
      setTimeout(() => {
        feedback.classList.remove('active');
        setTimeout(() => feedback.remove(), 300);
      }, 1500);

      // Reproducir sonido
      this.playSound('success');
    }

    // ============================================
    // SISTEMA DE PUNTOS
    // ============================================
    addPoints(user, points) {
      if (!user) return;

      if (!this.userStats[user]) {
        this.userStats[user] = {
          points: 0,
          assignments: 0,
          level: 1
        };
      }

      this.userStats[user].points += points;
      this.userStats[user].assignments += 1;
      this.userStats[user].level = this.calculateLevel(this.userStats[user].points);

      this.saveUserStats();
      this.checkAchievements(user);

      console.log(`📊 ${user}: ${this.userStats[user].points} puntos (Nivel ${this.userStats[user].level})`);
    }

    calculateLevel(points) {
      // Nivel basado en puntos: 1 nivel cada 100 puntos
      return Math.floor(points / 100) + 1;
    }

    getUserLevel(user) {
      return this.userStats[user]?.level || 1;
    }

    loadUserStats() {
      const saved = localStorage.getItem('detectiveUserStats');
      return saved ? JSON.parse(saved) : {};
    }

    saveUserStats() {
      localStorage.setItem('detectiveUserStats', JSON.stringify(this.userStats));
    }

    // ============================================
    // SISTEMA DE LOGROS
    // ============================================
    checkAchievements(user) {
      const stats = this.userStats[user];
      if (!stats) return;

      const achievements = [
        {
          id: 'first_assignment',
          name: 'Primera Asignación',
          description: 'Asignaste tu primer gasto',
          condition: stats.assignments === 1,
          icon: '🎯'
        },
        {
          id: 'detective_rookie',
          name: 'Detective Novato',
          description: 'Asignaste 10 gastos',
          condition: stats.assignments === 10,
          icon: '🕵️'
        },
        {
          id: 'detective_expert',
          name: 'Detective Experto',
          description: 'Asignaste 50 gastos',
          condition: stats.assignments === 50,
          icon: '🏆'
        },
        {
          id: 'level_5',
          name: 'Nivel 5 Alcanzado',
          description: '¡Llegaste al nivel 5!',
          condition: stats.level === 5,
          icon: '⭐'
        },
        {
          id: 'level_10',
          name: 'Maestro Detective',
          description: '¡Nivel 10! Eres un experto',
          condition: stats.level === 10,
          icon: '👑'
        }
      ];

      achievements.forEach(achievement => {
        if (achievement.condition) {
          this.unlockAchievement(user, achievement);
        }
      });
    }

    unlockAchievement(user, achievement) {
      const key = `achievement_${achievement.id}_${user}`;
      if (localStorage.getItem(key)) return; // Ya desbloqueado

      localStorage.setItem(key, 'true');

      // Mostrar notificación
      if (this.app.showToast) {
        this.app.showToast(
          `${achievement.icon} ¡Logro desbloqueado! ${achievement.name}`,
          'success'
        );
      }

      console.log(`🏆 ${user} desbloqueó: ${achievement.name}`);
    }

    // ============================================
    // CONFETTI
    // ============================================
    launchConfetti() {
      const colors = ['#00c2ff', '#1fdb8b', '#ffc857', '#f4a261', '#ff5c5c'];
      const confettiCount = 50;

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
      }
    }

    // ============================================
    // SONIDOS (OPCIONAL)
    // ============================================
    playSound(type) {
      // Implementar sonidos si se desea
      // Por ahora solo log
      console.log(`🔊 Sonido: ${type}`);
    }

    // ============================================
    // CERRAR MODAL
    // ============================================
    close() {
      this.overlay.classList.remove('active');
      this.currentExpenseData = null;
    }
  }

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  function init() {
    if (typeof window.app === 'undefined') {
      console.warn('⚠️ Esperando a que window.app esté disponible...');
      setTimeout(init, 100);
      return;
    }

    const game = new UserDetectiveGame(window.app);
    window.userDetectiveGame = game;

    // Integrar con el escáner de recibos
    integrateWithReceiptScanner(game);

    console.log('✅ User Detective Game iniciado');
  }

  // ============================================
  // INTEGRACIÓN CON ESCÁNER DE RECIBOS
  // ============================================
  function integrateWithReceiptScanner(game) {
    // Interceptar la función applyDataToForm
    if (window.receiptScanner) {
      const originalApply = window.receiptScanner.applyDataToForm.bind(window.receiptScanner);

      window.receiptScanner.applyDataToForm = function() {
        // Aplicar datos normalmente
        originalApply();

        // Mostrar modal de detective DESPUÉS
        setTimeout(() => {
          game.show({
            amount: this.extractedData?.amount || 0,
            description: this.extractedData?.description || '',
            store_name: this.extractedData?.store_name || '',
            category: this.extractedData?.category || ''
          });
        }, 500);
      };

      console.log('✅ Integración con Receipt Scanner completada');
    }
  }

  // Iniciar cuando DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
