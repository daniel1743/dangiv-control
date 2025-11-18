/**
 * PROFESSIONAL ONBOARDING SYSTEM
 * Modern onboarding with micro-interactions
 */

(function() {
  'use strict';

  const onboarding = {
    currentStep: 0,
    totalSteps: 5,
    
    steps: [
      {
        icon: 'fas fa-rocket',
        title: 'Bienvenido a Financia Suite',
        description: 'Tu asistente financiero inteligente está listo para ayudarte a tomar control de tus finanzas y alcanzar tus metas.',
        showcaseIcon: 'fas fa-chart-line'
      },
      {
        icon: 'fas fa-wallet',
        title: 'Registra tus Gastos',
        description: 'Añade tus gastos fácilmente desde el FAB (+) o usando el asistente inteligente Fin. Categoriza y controla cada peso que gastas.',
        showcaseIcon: 'fas fa-receipt'
      },
      {
        icon: 'fas fa-bullseye',
        title: 'Establece Metas Financieras',
        description: 'Define tus objetivos de ahorro y visualiza tu progreso en tiempo real. Desde tu próximo viaje hasta el fondo de emergencia.',
        showcaseIcon: 'fas fa-trophy'
      },
      {
        icon: 'fas fa-chart-pie',
        title: 'Analiza tus Finanzas',
        description: 'Obtén gráficos detallados de tus gastos por categoría, compara con meses anteriores y recibe insights personalizados.',
        showcaseIcon: 'fas fa-chart-bar'
      },
      {
        icon: 'fas fa-check-circle',
        title: '¡Listo para Comenzar!',
        description: 'Ya conoces lo básico. Explora la app, registra tus primeros gastos y comienza tu camino hacia la libertad financiera.',
        showcaseIcon: 'fas fa-star'
      }
    ],

    init() {
      this.overlay = document.getElementById('onboardingOverlay');
      this.startBtn = document.getElementById('startTourBtn');
      
      if (!this.overlay || !this.startBtn) return;

      this.setupEventListeners();
      this.checkFirstTime();
    },

    setupEventListeners() {
      document.getElementById('nextStep')?.addEventListener('click', () => this.next());
      document.getElementById('prevStep')?.addEventListener('click', () => this.prev());
      document.getElementById('skipOnboarding')?.addEventListener('click', () => this.skip());
      document.getElementById('finishOnboarding')?.addEventListener('click', () => this.finish());
      this.startBtn?.addEventListener('click', () => this.start());
      
      // Progress dots click
      document.querySelectorAll('.progress-dots .dot').forEach((dot, index) => {
        dot.addEventListener('click', () => this.goToStep(index));
      });
    },

    checkFirstTime() {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding && !document.body.classList.contains('landing-mode')) {
        setTimeout(() => this.start(), 1500);
      }
    },

    start() {
      this.currentStep = 0;
      this.overlay.classList.remove('hidden');
      this.renderStep();
      console.log('🎯 Onboarding started');
    },

    next() {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
        this.renderStep();
      }
    },

    prev() {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.renderStep();
      }
    },

    goToStep(step) {
      if (step >= 0 && step < this.totalSteps) {
        this.currentStep = step;
        this.renderStep();
      }
    },

    skip() {
      this.finish();
    },

    finish() {
      this.overlay.classList.add('hidden');
      localStorage.setItem('hasSeenOnboarding', 'true');
      console.log('✅ Onboarding completed');
    },

    renderStep() {
      const step = this.steps[this.currentStep];
      
      // Update content
      document.getElementById('onboardingIcon').innerHTML = `<i class="${step.icon}"></i>`;
      document.getElementById('onboardingTitle').textContent = step.title;
      document.getElementById('onboardingDescription').textContent = step.description;
      document.getElementById('onboardingImage').innerHTML = `
        <div class="feature-showcase">
          <i class="${step.showcaseIcon} showcase-icon"></i>
        </div>
      `;
      document.getElementById('currentStep').textContent = this.currentStep + 1;

      // Update progress dots
      document.querySelectorAll('.progress-dots .dot').forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index < this.currentStep) {
          dot.classList.add('completed');
        } else if (index === this.currentStep) {
          dot.classList.add('active');
        }
      });

      // Update buttons
      const prevBtn = document.getElementById('prevStep');
      const nextBtn = document.getElementById('nextStep');
      const finishBtn = document.getElementById('finishOnboarding');

      if (prevBtn) prevBtn.classList.toggle('hidden', this.currentStep === 0);
      if (nextBtn) nextBtn.classList.toggle('hidden', this.currentStep === this.totalSteps - 1);
      if (finishBtn) finishBtn.classList.toggle('hidden', this.currentStep < this.totalSteps - 1);
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => onboarding.init());
  } else {
    onboarding.init();
  }

  // Export globally
  window.professionalOnboarding = onboarding;

})();
