// ========================================
// SISTEMA DE LOGROS (ACHIEVEMENTS)
// Gamificación para mantener a los usuarios comprometidos
// ========================================

class AchievementsSystem {
  constructor(financeApp) {
    this.app = financeApp;
    this.storageKey = 'userAchievements';
    this.achievements = this.initializeAchievements();
    this.userProgress = this.loadProgress();
  }

  // ========================================
  // DEFINIR 16 LOGROS
  // ========================================
  initializeAchievements() {
    return [
      // LOGROS DISPONIBLES (10)
      {
        id: 'first_expense',
        name: 'Primer Paso',
        description: 'Registra tu primer gasto',
        icon: '🎯',
        points: 10,
        type: 'basic',
        unlocked: false,
        available: true,
        requirement: 'Registrar 1 gasto',
        reward: null
      },
      {
        id: 'five_expenses',
        name: 'Consistente',
        description: 'Registra 5 gastos',
        icon: '📝',
        points: 25,
        type: 'basic',
        unlocked: false,
        available: true,
        requirement: 'Registrar 5 gastos',
        reward: null
      },
      {
        id: 'first_goal',
        name: 'Soñador',
        description: 'Crea tu primera meta financiera',
        icon: '⭐',
        points: 15,
        type: 'basic',
        unlocked: false,
        available: true,
        requirement: 'Crear 1 meta',
        reward: null
      },
      {
        id: 'budget_master',
        name: 'Maestro del Presupuesto',
        description: 'Mantén tus gastos bajo el 80% del ingreso mensual',
        icon: '💰',
        points: 50,
        type: 'advanced',
        unlocked: false,
        available: true,
        requirement: 'Gastos < 80% ingreso por 1 mes',
        reward: null
      },
      {
        id: 'ai_advisor',
        name: 'Asesorado por IA',
        description: 'Solicita 3 recomendaciones de Fin',
        icon: '🤖',
        points: 20,
        type: 'basic',
        unlocked: false,
        available: true,
        requirement: 'Ver 3 recomendaciones de IA',
        reward: null
      },
      {
        id: 'savings_hero',
        name: 'Héroe del Ahorro',
        description: 'Ahorra al menos $500,000 en un mes',
        icon: '🦸',
        points: 100,
        type: 'advanced',
        unlocked: false,
        available: true,
        requirement: 'Ahorrar $500K en 1 mes',
        reward: null
      },
      {
        id: 'shopping_planner',
        name: 'Planificador Inteligente',
        description: 'Crea tu primera lista de compras',
        icon: '📋',
        points: 15,
        type: 'basic',
        unlocked: false,
        available: true,
        requirement: 'Crear 1 lista de compras',
        reward: null
      },
      {
        id: 'goal_achiever',
        name: 'Alcanzador de Metas',
        description: 'Completa tu primera meta financiera',
        icon: '🎖️',
        points: 75,
        type: 'advanced',
        unlocked: false,
        available: true,
        requirement: 'Alcanzar 100% de 1 meta',
        reward: null
      },
      {
        id: 'week_streak',
        name: 'Semana Perfecta',
        description: 'Registra gastos durante 7 días consecutivos',
        icon: '🔥',
        points: 40,
        type: 'basic',
        unlocked: false,
        available: true,
        requirement: 'Usar la app 7 días seguidos',
        reward: null
      },
      {
        id: 'frugal_master',
        name: 'Maestro de la Frugalidad',
        description: 'Registra 10 gastos marcados como "No Necesario"',
        icon: '🎓',
        points: 35,
        type: 'advanced',
        unlocked: false,
        available: true,
        requirement: 'Identificar 10 gastos innecesarios',
        reward: null
      },

      // LOGROS PRÓXIMAMENTE - PREMIUM (6)
      {
        id: 'fin_purple_skin',
        name: 'Fin Morado',
        description: 'Desbloquea la apariencia morada de Fin',
        icon: '💜',
        points: 150,
        type: 'premium',
        unlocked: false,
        available: false,
        comingSoon: true,
        requirement: 'Completar 20 gastos + Premium',
        reward: 'Nueva apariencia de Fin (Morado)'
      },
      {
        id: 'fin_golden_skin',
        name: 'Fin Dorado',
        description: 'Desbloquea la apariencia dorada de Fin',
        icon: '✨',
        points: 250,
        type: 'premium',
        unlocked: false,
        available: false,
        comingSoon: true,
        requirement: 'Ahorrar $2M + Premium',
        reward: 'Nueva apariencia de Fin (Dorado)'
      },
      {
        id: 'custom_charts',
        name: 'Gráficos Personalizados',
        description: 'Desbloquea 5 tipos de gráficos adicionales',
        icon: '📊',
        points: 200,
        type: 'premium',
        unlocked: false,
        available: false,
        comingSoon: true,
        requirement: '50 gastos registrados + Premium',
        reward: 'Gráficos: Líneas, Área, Radar, Polar, Burbujas'
      },
      {
        id: 'fin_robot_skin',
        name: 'Fin Cyberpunk',
        description: 'Apariencia futurista de Fin',
        icon: '🤖',
        points: 300,
        type: 'premium',
        unlocked: false,
        available: false,
        comingSoon: true,
        requirement: 'Usar app 30 días consecutivos + Premium',
        reward: 'Apariencia Cyberpunk de Fin'
      },
      {
        id: 'animated_dashboard',
        name: 'Dashboard Animado',
        description: 'Desbloquea animaciones premium en el dashboard',
        icon: '✨',
        points: 180,
        type: 'premium',
        unlocked: false,
        available: false,
        comingSoon: true,
        requirement: 'Alcanzar 3 metas + Premium',
        reward: 'Animaciones y efectos visuales premium'
      },
      {
        id: 'fin_santa_skin',
        name: 'Fin Navideño',
        description: 'Apariencia especial de temporada',
        icon: '🎅',
        points: 150,
        type: 'premium',
        unlocked: false,
        available: false,
        comingSoon: true,
        requirement: 'Evento especial de Navidad + Premium',
        reward: 'Apariencia Navideña de Fin'
      }
    ];
  }

  // ========================================
  // CARGAR PROGRESO DEL USUARIO
  // ========================================
  loadProgress() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      return JSON.parse(saved);
    }

    // Inicializar progreso
    return {
      unlockedIds: [],
      totalPoints: 0,
      lastChecked: Date.now()
    };
  }

  saveProgress() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.userProgress));
  }

  // ========================================
  // VERIFICAR LOGROS AUTOMÁTICAMENTE
  // ========================================
  checkAchievements() {
    let newUnlocks = [];

    // 1. Primer gasto
    if (!this.isUnlocked('first_expense') && this.app.expenses.length >= 1) {
      newUnlocks.push(this.unlockAchievement('first_expense'));
    }

    // 2. Cinco gastos
    if (!this.isUnlocked('five_expenses') && this.app.expenses.length >= 5) {
      newUnlocks.push(this.unlockAchievement('five_expenses'));
    }

    // 3. Primera meta
    if (!this.isUnlocked('first_goal') && this.app.goals.length >= 1) {
      newUnlocks.push(this.unlockAchievement('first_goal'));
    }

    // 4. Maestro del presupuesto
    if (!this.isUnlocked('budget_master')) {
      const totalExpenses = this.app.expenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = (totalExpenses / this.app.monthlyIncome) * 100;
      if (percentage < 80 && this.app.monthlyIncome > 0) {
        newUnlocks.push(this.unlockAchievement('budget_master'));
      }
    }

    // 5. Asesorado por IA (verificar si ha visto recomendaciones)
    const aiViewsCount = localStorage.getItem('aiRecommendationsViewed') || 0;
    if (!this.isUnlocked('ai_advisor') && parseInt(aiViewsCount) >= 3) {
      newUnlocks.push(this.unlockAchievement('ai_advisor'));
    }

    // 6. Héroe del ahorro
    if (!this.isUnlocked('savings_hero')) {
      const totalExpenses = this.app.expenses.reduce((sum, e) => sum + e.amount, 0);
      const savings = this.app.monthlyIncome - totalExpenses;
      if (savings >= 500000 && this.app.monthlyIncome > 0) {
        newUnlocks.push(this.unlockAchievement('savings_hero'));
      }
    }

    // 7. Planificador Inteligente (primera lista de compras)
    if (!this.isUnlocked('shopping_planner') && this.app.shoppingItems && this.app.shoppingItems.length >= 1) {
      newUnlocks.push(this.unlockAchievement('shopping_planner'));
    }

    // 8. Alcanzador de Metas (completar primera meta al 100%)
    if (!this.isUnlocked('goal_achiever') && this.app.goals && this.app.goals.length > 0) {
      const completedGoal = this.app.goals.find(goal => {
        const progress = (goal.saved / goal.amount) * 100;
        return progress >= 100;
      });
      if (completedGoal) {
        newUnlocks.push(this.unlockAchievement('goal_achiever'));
      }
    }

    // 9. Semana Perfecta (7 días consecutivos)
    if (!this.isUnlocked('week_streak')) {
      const streakDays = this.calculateConsecutiveDays();
      if (streakDays >= 7) {
        newUnlocks.push(this.unlockAchievement('week_streak'));
      }
    }

    // 10. Maestro de la Frugalidad (10 gastos "No Necesario")
    if (!this.isUnlocked('frugal_master')) {
      const unnecessaryExpenses = this.app.expenses.filter(e =>
        e.necessity === 'No Necesario' || e.necessity === 'no-necesario'
      );
      if (unnecessaryExpenses.length >= 10) {
        newUnlocks.push(this.unlockAchievement('frugal_master'));
      }
    }

    // Mostrar notificaciones de nuevos logros
    newUnlocks.filter(a => a).forEach(achievement => {
      this.showAchievementUnlockedNotification(achievement);
    });

    return newUnlocks;
  }

  // ========================================
  // DESBLOQUEAR LOGRO
  // ========================================
  unlockAchievement(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);

    if (!achievement || achievement.unlocked) {
      return null;
    }

    achievement.unlocked = true;
    this.userProgress.unlockedIds.push(achievementId);
    this.userProgress.totalPoints += achievement.points;
    this.userProgress.lastChecked = Date.now();

    this.saveProgress();

    return achievement;
  }

  isUnlocked(achievementId) {
    return this.userProgress.unlockedIds.includes(achievementId);
  }

  // ========================================
  // CALCULAR DÍAS CONSECUTIVOS
  // ========================================
  calculateConsecutiveDays() {
    if (!this.app.expenses || this.app.expenses.length === 0) {
      return 0;
    }

    // Obtener fechas únicas de gastos (ordenadas)
    const uniqueDates = [...new Set(this.app.expenses.map(e => {
      const date = new Date(e.date);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }))].sort().reverse(); // Más reciente primero

    if (uniqueDates.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Verificar si hay registro hoy o ayer
    const latestDate = uniqueDates[0];
    const latestDateObj = new Date(latestDate);
    const daysDiff = Math.floor((today - latestDateObj) / (1000 * 60 * 60 * 24));

    // Si el último registro fue hace más de 1 día, no hay racha activa
    if (daysDiff > 1) {
      return 0;
    }

    // Contar días consecutivos hacia atrás
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1]);
      const prevDate = new Date(uniqueDates[i]);
      const diff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // ========================================
  // NOTIFICACIÓN DE LOGRO DESBLOQUEADO
  // ========================================
  showAchievementUnlockedNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';

    notification.innerHTML = `
      <div class="achievement-notification-content">
        <div class="achievement-icon-large">${achievement.icon}</div>
        <div class="achievement-text">
          <h4>🎉 ¡Logro Desbloqueado!</h4>
          <h3>${achievement.name}</h3>
          <p>${achievement.description}</p>
          <span class="achievement-points">+${achievement.points} puntos</span>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animación de entrada
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Reproducir sonido (opcional)
    this.playAchievementSound();
  }

  playAchievementSound() {
    // Opcional: agregar sonido de logro
    // const audio = new Audio('sounds/achievement.mp3');
    // audio.play().catch(() => {});
  }

  // ========================================
  // RENDERIZAR MODAL DE LOGROS
  // ========================================
  showAchievementsModal() {
    // Actualizar estado de logros
    this.achievements.forEach(achievement => {
      if (this.userProgress.unlockedIds.includes(achievement.id)) {
        achievement.unlocked = true;
      }
    });

    const userName = this.app.userProfile?.name || 'Usuario';
    const totalPossiblePoints = this.achievements.reduce((sum, a) => sum + a.points, 0);
    const percentage = Math.round((this.userProgress.totalPoints / totalPossiblePoints) * 100);

    let modal = document.getElementById('achievementsModal');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'achievementsModal';
      modal.className = 'modal-overlay achievements-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content achievements-content">
        <div class="modal-header achievements-header">
          <div>
            <h2>🏆 Logros de ${userName}</h2>
            <p class="achievements-subtitle">
              ${this.userProgress.unlockedIds.length} de ${this.achievements.length} desbloqueados
            </p>
          </div>
          <button class="modal-close" onclick="closeAchievementsModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="achievements-progress-section">
          <div class="achievements-stats">
            <div class="stat-card">
              <span class="stat-icon">🎯</span>
              <div>
                <span class="stat-value">${this.userProgress.unlockedIds.length}</span>
                <span class="stat-label">Logros</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">⭐</span>
              <div>
                <span class="stat-value">${this.userProgress.totalPoints}</span>
                <span class="stat-label">Puntos</span>
              </div>
            </div>
            <div class="stat-card">
              <span class="stat-icon">📊</span>
              <div>
                <span class="stat-value">${percentage}%</span>
                <span class="stat-label">Completado</span>
              </div>
            </div>
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
        </div>

        <div class="achievements-grid">
          ${this.achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  // ========================================
  // RENDERIZAR TARJETA DE LOGRO
  // ========================================
  renderAchievementCard(achievement) {
    const isLocked = !achievement.unlocked;
    const isComingSoon = achievement.comingSoon;

    let statusClass = '';
    let statusBadge = '';

    if (achievement.unlocked) {
      statusClass = 'unlocked';
      statusBadge = '<span class="achievement-badge unlocked">✓ Desbloqueado</span>';
    } else if (isComingSoon) {
      statusClass = 'coming-soon';
      statusBadge = '<span class="achievement-badge coming-soon">🔜 Próximamente</span>';
    } else {
      statusClass = 'locked';
      statusBadge = '<span class="achievement-badge locked">🔒 Bloqueado</span>';
    }

    return `
      <div class="achievement-card ${statusClass}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h4>${achievement.name}</h4>
          <p>${achievement.description}</p>
          <div class="achievement-requirement">
            <i class="fas fa-info-circle"></i>
            <span>${achievement.requirement}</span>
          </div>
          ${achievement.reward ? `
            <div class="achievement-reward">
              <i class="fas fa-gift"></i>
              <span>${achievement.reward}</span>
            </div>
          ` : ''}
        </div>
        <div class="achievement-footer">
          ${statusBadge}
          <span class="achievement-points-badge">${achievement.points} pts</span>
        </div>
      </div>
    `;
  }

  // ========================================
  // CERRAR MODAL
  // ========================================
  closeModal() {
    const modal = document.getElementById('achievementsModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  // ========================================
  // OBTENER RESUMEN
  // ========================================
  getSummary() {
    return {
      total: this.achievements.length,
      unlocked: this.userProgress.unlockedIds.length,
      points: this.userProgress.totalPoints,
      percentage: Math.round((this.userProgress.unlockedIds.length / this.achievements.length) * 100)
    };
  }
}

// ========================================
// FUNCIONES GLOBALES
// ========================================
function openAchievementsModal() {
  if (window.financeApp && window.financeApp.achievementsSystem) {
    window.financeApp.achievementsSystem.showAchievementsModal();
  }
}

function closeAchievementsModal() {
  if (window.financeApp && window.financeApp.achievementsSystem) {
    window.financeApp.achievementsSystem.closeModal();
  }
}

// Exponer globalmente
window.AchievementsSystem = AchievementsSystem;
window.openAchievementsModal = openAchievementsModal;
window.closeAchievementsModal = closeAchievementsModal;

console.log('✅ Achievements System loaded');
