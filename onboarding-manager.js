// ========================================
// ONBOARDING MANAGER - Sistema Guiado por IA
// ========================================

class OnboardingManager {
  constructor() {
    this.currentStep = 0;
    this.userData = {
      name: '',
      monthlyIncome: 0,
      mainGoal: '',
      preferredMode: '', // 'auto' o 'manual'
      concerns: [],
      estimatedExpenses: 0,
      savingsGoal: 0
    };

    this.steps = [
      'welcome',
      'mode-selection',
      'basic-info',
      'financial-situation',
      'goals-setup',
      'plan-generation',
      'completion'
    ];

    this.geminiApiKey = null;
    this.isProcessing = false;

    this.init();
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================
  init() {
    // Escuchar configuración de Firebase desde el padre
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'FIREBASE_CONFIG') {
        this.geminiApiKey = event.data.payload.geminiApiKey;
        console.log('✅ Onboarding recibió API Key');
        this.start();
      }
    });

    // Solicitar configuración si estamos en un iframe
    if (window.parent !== window) {
      console.log('🟡 Onboarding esperando configuración...');
    } else {
      // Si no estamos en iframe, intentar obtener de window.FB
      if (window.FB && window.FB.geminiApiKey) {
        this.geminiApiKey = window.FB.geminiApiKey;
        this.start();
      }
    }

    this.setupEventListeners();
  }

  // ========================================
  // INICIO DEL ONBOARDING
  // ========================================
  start() {
    console.log('🚀 Iniciando onboarding...');
    this.showStep('welcome');
  }

  // ========================================
  // NAVEGACIÓN ENTRE PASOS
  // ========================================
  showStep(stepName) {
    const stepIndex = this.steps.indexOf(stepName);
    if (stepIndex === -1) return;

    this.currentStep = stepIndex;
    this.updateProgressBar();

    // Ocultar todos los pasos
    document.querySelectorAll('.onboarding-step').forEach(step => {
      step.classList.remove('active');
    });

    // Mostrar el paso actual
    const currentStepEl = document.getElementById(`step-${stepName}`);
    if (currentStepEl) {
      setTimeout(() => {
        currentStepEl.classList.add('active');
        this.animateStepEntry(currentStepEl);
      }, 300);
    }

    // Ejecutar lógica específica del paso
    this.executeStepLogic(stepName);
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      const nextStepName = this.steps[this.currentStep + 1];
      this.showStep(nextStepName);
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      const prevStepName = this.steps[this.currentStep - 1];
      this.showStep(prevStepName);
    }
  }

  // ========================================
  // LÓGICA DE CADA PASO
  // ========================================
  executeStepLogic(stepName) {
    switch(stepName) {
      case 'welcome':
        this.handleWelcomeStep();
        break;
      case 'mode-selection':
        this.handleModeSelectionStep();
        break;
      case 'basic-info':
        this.handleBasicInfoStep();
        break;
      case 'financial-situation':
        this.handleFinancialSituationStep();
        break;
      case 'goals-setup':
        this.handleGoalsSetupStep();
        break;
      case 'plan-generation':
        this.handlePlanGenerationStep();
        break;
      case 'completion':
        this.handleCompletionStep();
        break;
    }
  }

  // ========================================
  // PASO 1: BIENVENIDA EMOCIONAL
  // ========================================
  handleWelcomeStep() {
    setTimeout(() => {
      const continueBtn = document.getElementById('welcomeContinueBtn');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          this.showStep('mode-selection');
        });
      }
    }, 100);
  }

  // ========================================
  // PASO 2: SELECCIÓN DE MODO
  // ========================================
  handleModeSelectionStep() {
    const autoBtn = document.getElementById('modeAutoBtn');
    const manualBtn = document.getElementById('modeManualBtn');

    if (autoBtn) {
      autoBtn.addEventListener('click', () => {
        this.userData.preferredMode = 'auto';
        this.selectModeButton(autoBtn, manualBtn);
        setTimeout(() => this.showStep('basic-info'), 800);
      });
    }

    if (manualBtn) {
      manualBtn.addEventListener('click', () => {
        this.userData.preferredMode = 'manual';
        this.selectModeButton(manualBtn, autoBtn);
        setTimeout(() => this.showStep('basic-info'), 800);
      });
    }
  }

  selectModeButton(selected, other) {
    selected.classList.add('selected');
    other.classList.remove('selected');

    // Animación de confirmación
    this.showConfetti(selected);
  }

  // ========================================
  // PASO 3: INFORMACIÓN BÁSICA
  // ========================================
  handleBasicInfoStep() {
    const continueBtn = document.getElementById('basicInfoContinueBtn');
    const nameInput = document.getElementById('onboardingName');
    const incomeInput = document.getElementById('onboardingIncome');

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        const name = nameInput?.value.trim();
        const income = parseFloat(incomeInput?.value || 0);

        if (!name || income <= 0) {
          this.showToast('Por favor completa todos los campos', 'warning');
          return;
        }

        this.userData.name = name;
        this.userData.monthlyIncome = income;

        // Personalizar mensajes siguientes con el nombre
        this.personalizeFutureSteps();

        this.showStep('financial-situation');
      });
    }
  }

  // ========================================
  // PASO 4: SITUACIÓN FINANCIERA
  // ========================================
  handleFinancialSituationStep() {
    const concernBtns = document.querySelectorAll('.concern-btn');
    const continueBtn = document.getElementById('financialContinueBtn');

    concernBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('selected');
        const concern = btn.dataset.concern;

        if (btn.classList.contains('selected')) {
          if (!this.userData.concerns.includes(concern)) {
            this.userData.concerns.push(concern);
          }
        } else {
          this.userData.concerns = this.userData.concerns.filter(c => c !== concern);
        }
      });
    });

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (this.userData.concerns.length === 0) {
          this.showToast('Selecciona al menos una preocupación', 'warning');
          return;
        }
        this.showStep('goals-setup');
      });
    }
  }

  // ========================================
  // PASO 5: CONFIGURACIÓN DE METAS
  // ========================================
  handleGoalsSetupStep() {
    const goalBtns = document.querySelectorAll('.goal-btn');
    const customGoalInput = document.getElementById('customGoal');
    const continueBtn = document.getElementById('goalsContinueBtn');

    goalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Deseleccionar otros
        goalBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        this.userData.mainGoal = btn.dataset.goal;
      });
    });

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (!this.userData.mainGoal && !customGoalInput?.value.trim()) {
          this.showToast('Selecciona o escribe tu meta principal', 'warning');
          return;
        }

        if (customGoalInput?.value.trim()) {
          this.userData.mainGoal = customGoalInput.value.trim();
        }

        this.showStep('plan-generation');
      });
    }
  }

  // ========================================
  // PASO 6: GENERACIÓN DEL PLAN CON IA
  // ========================================
  async handlePlanGenerationStep() {
    this.showLoadingPlan();

    try {
      // Si el modo es automático, generar plan completo con IA
      if (this.userData.preferredMode === 'auto') {
        await this.generateAIPlan();
      } else {
        // Modo manual: generar sugerencias básicas
        await this.generateBasicPlan();
      }

      // Mostrar el plan generado
      setTimeout(() => {
        this.displayGeneratedPlan();
      }, 2000);

    } catch (error) {
      console.error('Error generando plan:', error);
      this.showToast('Hubo un error al generar tu plan. Intenta de nuevo.', 'error');
    }
  }

  async generateAIPlan() {
    const prompt = `Eres Fin, un coach financiero experto y empático.

Usuario: ${this.userData.name}
Ingreso mensual: $${this.userData.monthlyIncome.toLocaleString('es-CO')}
Preocupaciones: ${this.userData.concerns.join(', ')}
Meta principal: ${this.userData.mainGoal}

Genera un plan financiero personalizado que incluya:

1. Presupuesto recomendado (porcentajes para gastos esenciales, ocio, ahorro)
2. Meta de ahorro mensual específica (en pesos colombianos)
3. 3 consejos prácticos y accionables
4. Mensaje motivacional personalizado (máximo 2 líneas)

Formato de respuesta:
{
  "presupuesto": {
    "esenciales": 60,
    "ocio": 20,
    "ahorro": 20
  },
  "ahorroMensual": 160000,
  "consejos": ["consejo 1", "consejo 2", "consejo 3"],
  "mensaje": "mensaje motivacional"
}`;

    const planData = await this.callGeminiAPI(prompt);
    this.userData.generatedPlan = planData;
  }

  async generateBasicPlan() {
    // Plan básico basado en regla 50/30/20
    const suggestedSavings = Math.round(this.userData.monthlyIncome * 0.20);

    this.userData.generatedPlan = {
      presupuesto: {
        esenciales: 50,
        ocio: 30,
        ahorro: 20
      },
      ahorroMensual: suggestedSavings,
      consejos: [
        'Registra todos tus gastos diarios para tener visibilidad total',
        'Establece alertas cuando te acerques al límite de tu presupuesto',
        'Revisa tu progreso cada semana para mantener el rumbo'
      ],
      mensaje: `${this.userData.name}, con disciplina y este plan, alcanzarás tus metas. ¡Yo estaré aquí para ayudarte!`
    };
  }

  displayGeneratedPlan() {
    const planContainer = document.getElementById('generatedPlanContent');
    if (!planContainer) return;

    const plan = this.userData.generatedPlan;

    planContainer.innerHTML = `
      <div class="plan-header">
        <h3>Tu Plan Financiero Personalizado</h3>
        <p class="plan-subtitle">Diseñado especialmente para ti, ${this.userData.name} 🎯</p>
      </div>

      <div class="plan-budget">
        <h4><i class="fas fa-chart-pie"></i> Distribución Recomendada</h4>
        <div class="budget-bars">
          <div class="budget-item">
            <div class="budget-label">
              <span>Gastos Esenciales</span>
              <strong>${plan.presupuesto.esenciales}%</strong>
            </div>
            <div class="budget-bar">
              <div class="budget-fill essentials" style="width: ${plan.presupuesto.esenciales}%"></div>
            </div>
            <div class="budget-amount">$${Math.round(this.userData.monthlyIncome * plan.presupuesto.esenciales / 100).toLocaleString('es-CO')}</div>
          </div>

          <div class="budget-item">
            <div class="budget-label">
              <span>Ocio y Diversión</span>
              <strong>${plan.presupuesto.ocio}%</strong>
            </div>
            <div class="budget-bar">
              <div class="budget-fill leisure" style="width: ${plan.presupuesto.ocio}%"></div>
            </div>
            <div class="budget-amount">$${Math.round(this.userData.monthlyIncome * plan.presupuesto.ocio / 100).toLocaleString('es-CO')}</div>
          </div>

          <div class="budget-item">
            <div class="budget-label">
              <span>Ahorro</span>
              <strong>${plan.presupuesto.ahorro}%</strong>
            </div>
            <div class="budget-bar">
              <div class="budget-fill savings" style="width: ${plan.presupuesto.ahorro}%"></div>
            </div>
            <div class="budget-amount">$${plan.ahorroMensual.toLocaleString('es-CO')}</div>
          </div>
        </div>
      </div>

      <div class="plan-goal">
        <div class="goal-icon">🎯</div>
        <div class="goal-content">
          <h4>Tu Meta de Ahorro Mensual</h4>
          <div class="goal-amount">$${plan.ahorroMensual.toLocaleString('es-CO')}</div>
          <p>Con tu ingreso de $${this.userData.monthlyIncome.toLocaleString('es-CO')}, podrías ahorrar esto cada mes</p>
        </div>
      </div>

      <div class="plan-tips">
        <h4><i class="fas fa-lightbulb"></i> Consejos para Empezar</h4>
        <ul class="tips-list">
          ${plan.consejos.map(consejo => `<li><i class="fas fa-check-circle"></i> ${consejo}</li>`).join('')}
        </ul>
      </div>

      <div class="plan-message">
        <i class="fas fa-quote-left"></i>
        <p>${plan.mensaje}</p>
        <div class="message-author">— Fin, tu coach financiero</div>
      </div>

      <div class="plan-actions">
        <button class="btn btn-primary btn-large" id="acceptPlanBtn">
          <i class="fas fa-check"></i>
          ¡Activar mi plan!
        </button>
        <button class="btn btn-secondary" id="customizePlanBtn">
          <i class="fas fa-edit"></i>
          Personalizar
        </button>
      </div>
    `;

    // Event listeners para los botones
    const acceptBtn = document.getElementById('acceptPlanBtn');
    const customizeBtn = document.getElementById('customizePlanBtn');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        this.acceptPlan();
      });
    }

    if (customizeBtn) {
      customizeBtn.addEventListener('click', () => {
        this.showToast('Podrás personalizar todo desde el dashboard', 'info');
        setTimeout(() => this.acceptPlan(), 1500);
      });
    }

    // Ocultar el loading
    const loadingEl = document.getElementById('planLoading');
    const planContentEl = document.getElementById('generatedPlan');

    if (loadingEl) loadingEl.style.display = 'none';
    if (planContentEl) planContentEl.style.display = 'block';

    // Animar entrada
    this.animatePlanEntry();
  }

  acceptPlan() {
    // Guardar el plan
    this.savePlanToLocalStorage();

    // Mostrar confetti
    this.showFullScreenConfetti();

    // Ir a la página de completado
    setTimeout(() => {
      this.showStep('completion');
    }, 1500);
  }

  // ========================================
  // PASO 7: COMPLETADO Y CELEBRACIÓN
  // ========================================
  handleCompletionStep() {
    setTimeout(() => {
      this.showFullScreenConfetti();
    }, 500);

    const goToDashboardBtn = document.getElementById('goToDashboardBtn');
    if (goToDashboardBtn) {
      goToDashboardBtn.addEventListener('click', () => {
        this.completeOnboarding();
      });
    }
  }

  completeOnboarding() {
    // Marcar onboarding como completado
    localStorage.setItem('onboardingCompleted', 'true');

    // Redirigir al dashboard
    if (window.parent !== window) {
      // Si estamos en iframe, notificar al padre
      window.parent.postMessage({
        type: 'ONBOARDING_COMPLETED',
        payload: this.userData
      }, '*');
    } else {
      // Si estamos en standalone, redirigir
      window.location.href = 'index.html';
    }
  }

  // ========================================
  // UTILIDADES
  // ========================================
  updateProgressBar() {
    const progress = ((this.currentStep + 1) / this.steps.length) * 100;
    const progressBar = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (progressText) {
      progressText.textContent = `Paso ${this.currentStep + 1} de ${this.steps.length}`;
    }
  }

  animateStepEntry(stepEl) {
    stepEl.style.opacity = '0';
    stepEl.style.transform = 'translateY(30px)';

    setTimeout(() => {
      stepEl.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      stepEl.style.opacity = '1';
      stepEl.style.transform = 'translateY(0)';
    }, 50);
  }

  animatePlanEntry() {
    const items = document.querySelectorAll('.budget-item, .plan-goal, .plan-tips, .plan-message, .plan-actions');
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';

      setTimeout(() => {
        item.style.transition = 'all 0.5s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  showLoadingPlan() {
    const loadingEl = document.getElementById('planLoading');
    if (loadingEl) {
      loadingEl.style.display = 'flex';
    }
  }

  personalizeFutureSteps() {
    // Actualizar textos con el nombre del usuario
    const personalizedElements = document.querySelectorAll('[data-personalize]');
    personalizedElements.forEach(el => {
      el.textContent = el.textContent.replace('{name}', this.userData.name);
    });
  }

  savePlanToLocalStorage() {
    // Guardar datos del usuario
    localStorage.setItem('userName', this.userData.name);
    localStorage.setItem('monthlyIncome', this.userData.monthlyIncome.toString());

    // Guardar el plan generado
    localStorage.setItem('financialPlan', JSON.stringify(this.userData.generatedPlan));

    // Guardar fecha de creación
    localStorage.setItem('onboardingDate', new Date().toISOString());

    console.log('✅ Plan guardado en localStorage');
  }

  // ========================================
  // LLAMADA A GEMINI API
  // ========================================
  async callGeminiAPI(prompt) {
    if (!this.geminiApiKey) {
      console.error('❌ No hay API Key disponible');
      return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.geminiApiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Intentar parsear como JSON
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn('La respuesta no es JSON válido, usando texto plano');
        return { rawText: text };
      }

    } catch (error) {
      console.error('Error llamando a Gemini API:', error);
      throw error;
    }
  }

  // ========================================
  // EFECTOS VISUALES
  // ========================================
  showConfetti(element) {
    // Crear partículas de confetti
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-particle';
      confetti.style.left = `${element.offsetLeft + element.offsetWidth / 2}px`;
      confetti.style.top = `${element.offsetTop + element.offsetHeight / 2}px`;
      confetti.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
      confetti.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
      confetti.style.setProperty('--ty', `${(Math.random() - 0.5) * 200}px`);

      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 1000);
    }
  }

  showFullScreenConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-full';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = `${Math.random() * 0.5}s`;

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
      }, i * 20);
    }
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('onboardingToast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ========================================
  // EVENT LISTENERS GENERALES
  // ========================================
  setupEventListeners() {
    // Listener para botón de volver (si existe)
    const backBtns = document.querySelectorAll('.back-step-btn');
    backBtns.forEach(btn => {
      btn.addEventListener('click', () => this.previousStep());
    });

    // Listener para Enter en inputs
    document.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const currentStepEl = document.querySelector('.onboarding-step.active');
        const continueBtn = currentStepEl?.querySelector('.btn-primary');
        if (continueBtn) continueBtn.click();
      }
    });
  }
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================
let onboardingManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    onboardingManager = new OnboardingManager();
    window.onboardingManager = onboardingManager;
  });
} else {
  onboardingManager = new OnboardingManager();
  window.onboardingManager = onboardingManager;
}
