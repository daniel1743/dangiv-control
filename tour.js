/**
 * SISTEMA DE TOUR GUIADO - ONBOARDING
 * Tour interactivo para nuevos usuarios
 */

/*class GuidedTour {
  constructor() {
    this.currentStep = 0;
    this.isActive = false;
    this.steps = [];
    this.overlay = null;
    this.spotlight = null;
    this.tooltip = null;
    this.arrow = null;

    this.init();
  }

  init() {
    // Definir los pasos del tour
    this.steps = [
      {
        title: '📊 Dashboard - Tu Centro de Control',
        subtitle: 'Visión completa de tus finanzas',
        content:
          'Aquí ves el resumen de tu situación financiera actual: balance disponible, gastos totales, ahorros y más.',
        target: '.stat-card--primary',
        position: 'bottom',
        features: [
          'Balance en tiempo real',
          'Gráficos interactivos',
          'Estadísticas detalladas',
        ],
      },
      {
        title: '💳 Registro de Gastos',
        subtitle: 'Control total de tus gastos',
        content:
          'Registra cada gasto de forma rápida y sencilla. Categoriza, asigna usuarios y marca el nivel de necesidad.',
        target: '[data-section="expenses"]',
        position: 'right',
        features: [
          'Categorías personalizables',
          'Multi-usuario (Daniel/Givonik)',
          'Nivel de necesidad',
        ],
      },
      {
        title: '🎯 Metas Financieras',
        subtitle: 'Alcanza tus objetivos',
        content:
          'Define metas de ahorro con plazos y montos. Visualiza tu progreso y recibe notificaciones motivacionales.',
        target: '[data-section="goals"]',
        position: 'right',
        features: [
          'Metas con plazos',
          'Seguimiento visual',
          'Notificaciones de progreso',
        ],
      },
      {
        title: '💰 Presupuesto Mensual',
        subtitle: 'Planifica y controla',
        content:
          'Establece presupuestos por categoría y mes. Recibe alertas cuando te acerques al límite.',
        target: '[data-section="budget"]',
        position: 'right',
        features: [
          'Presupuesto por categoría',
          'Alertas inteligentes',
          'Comparativas mensuales',
        ],
      },
      {
        title: '📜 Historial Completo',
        subtitle: 'Toda tu actividad financiera',
        content:
          'Accede al registro completo de todas tus transacciones con filtros avanzados y búsqueda.',
        target: '[data-section="history"]',
        position: 'right',
        features: ['Filtros avanzados', 'Búsqueda rápida', 'Exportar datos'],
      },
      {
        title: '⚙️ Configuración',
        subtitle: 'Personaliza tu experiencia',
        content:
          'Ajusta el tema, cambia tu foto de perfil, configura usuarios y personaliza la aplicación a tu gusto.',
        target: '[data-section="config"]',
        position: 'right',
        features: ['Tema claro/oscuro', 'Foto de perfil', 'Multi-usuario'],
      },
      {
        title: '🚀 ¡Listo para Comenzar!',
        subtitle: 'Crea tu cuenta o inicia sesión',
        content:
          'Registra una cuenta para guardar tus datos en la nube y acceder desde cualquier dispositivo.',
        target: '.login-icon-btn',
        position: 'bottom',
        features: [
          'Sincronización en la nube',
          'Acceso multi-dispositivo',
          'Datos seguros con Firebase',
        ],
        isLast: true,
      },
    ];

    this.createElements();
    this.bindEvents();
  }

  createElements() {
    // Crear overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'tour-overlay';
    document.body.appendChild(this.overlay);

    // Crear spotlight
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'tour-spotlight';
    document.body.appendChild(this.spotlight);

    // Crear tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tour-tooltip';
    document.body.appendChild(this.tooltip);

    // Crear arrow
    this.arrow = document.createElement('div');
    this.arrow.className = 'tour-arrow';
    document.body.appendChild(this.arrow);
  }

  bindEvents() {
    // Click en overlay para cerrar
    this.overlay.addEventListener('click', () => {
      this.end();
    });
  }

  showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'tour-welcome-modal';
    modal.innerHTML = `
      <div class="tour-welcome-hero">
        <div class="tour-welcome-icon">💰</div>
        <h1 class="tour-welcome-title">¡Bienvenido a Financia Suite!</h1>
        <p class="tour-welcome-subtitle">Tu asistente financiero inteligente</p>
      </div>
      <div class="tour-welcome-content">
        <p class="tour-welcome-description">
          Toma el control de tus finanzas de forma simple y eficiente.
          Te ayudamos a registrar gastos, establecer metas y alcanzar la libertad financiera.
        </p>

        <div class="tour-welcome-benefits">
          <div class="tour-benefit-card">
            <div class="tour-benefit-icon">📊</div>
            <h3 class="tour-benefit-title">Análisis en Tiempo Real</h3>
          </div>
          <div class="tour-benefit-card">
            <div class="tour-benefit-icon">🎯</div>
            <h3 class="tour-benefit-title">Metas Personalizadas</h3>
          </div>
          <div class="tour-benefit-card">
            <div class="tour-benefit-icon">✨</div>
            <h3 class="tour-benefit-title">IA Integrada</h3>
          </div>
          <div class="tour-benefit-card">
            <div class="tour-benefit-icon">☁️</div>
            <h3 class="tour-benefit-title">Sincronización Cloud</h3>
          </div>
        </div>

        <div class="tour-welcome-actions">
          <button class="tour-btn tour-btn-skip" id="skipTourBtn">
            Saltar tour
          </button>
          <button class="tour-btn tour-btn-start" id="startTourBtn">
            <i class="fas fa-play"></i> Comenzar tour
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.overlay.classList.add('active');

    // Animar entrada
    setTimeout(() => {
      modal.classList.add('active');
      modal.classList.add('entering');
    }, 10);

    // Eventos de botones
    const skipBtn = modal.querySelector('#skipTourBtn');
    const startBtn = modal.querySelector('#startTourBtn');

    skipBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      this.overlay.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
      this.markTourAsCompleted();
    });

    startBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        this.start();
      }, 300);
    });
  }

  start() {
    this.isActive = true;
    this.currentStep = 0;
    this.overlay.classList.add('active');
    this.showStep(0);
  }

  showStep(index) {
    if (index < 0 || index >= this.steps.length) return;

    this.currentStep = index;
    const step = this.steps[index];
    const target = document.querySelector(step.target);

    if (!target) {
      console.warn(`Target not found: ${step.target}`);
      this.next();
      return;
    }

    // Scroll al elemento si es necesario
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      // Posicionar spotlight
      this.positionSpotlight(target);

      // Posicionar y mostrar tooltip
      this.positionTooltip(target, step);

      // Actualizar contenido del tooltip
      this.updateTooltipContent(step, index);

      // Mostrar animado
      setTimeout(() => {
        this.spotlight.style.opacity = '1';
        this.tooltip.classList.add('active');
      }, 100);
    }, 500);
  }

  positionSpotlight(element) {
    const rect = element.getBoundingClientRect();
    const padding = 8;

    this.spotlight.style.top = `${rect.top - padding + window.scrollY}px`;
    this.spotlight.style.left = `${rect.left - padding}px`;
    this.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.spotlight.style.height = `${rect.height + padding * 2}px`;
    this.spotlight.style.opacity = '0';
  }

  positionTooltip(target, step) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let position = step.position || 'bottom';
    const gap = 20;
    const margin = 20; // Margen de seguridad desde los bordes

    let top, left;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calcular posición inicial según preferencia
    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - gap;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + gap;
        break;
    }

    // Verificar si se desborda y ajustar posición automáticamente
    // Si se desborda abajo, intentar arriba
    if (
      position === 'bottom' &&
      top + tooltipRect.height > viewportHeight - margin
    ) {
      position = 'top';
      top = targetRect.top - tooltipRect.height - gap;
    }

    // Si se desborda arriba, intentar abajo
    if (position === 'top' && top < margin) {
      position = 'bottom';
      top = targetRect.bottom + gap;
    }

    // Si se desborda a la derecha, intentar izquierda
    if (
      position === 'right' &&
      left + tooltipRect.width > viewportWidth - margin
    ) {
      position = 'left';
      left = targetRect.left - tooltipRect.width - gap;
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
    }

    // Si se desborda a la izquierda, intentar derecha
    if (position === 'left' && left < margin) {
      position = 'right';
      left = targetRect.right + gap;
      top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
    }

    // Ajuste final: asegurar que esté completamente dentro de la viewport
    if (left < margin) {
      left = margin;
    }
    if (left + tooltipRect.width > viewportWidth - margin) {
      left = viewportWidth - tooltipRect.width - margin;
    }
    if (top < margin) {
      top = margin;
    }
    if (top + tooltipRect.height > viewportHeight - margin) {
      top = viewportHeight - tooltipRect.height - margin;
    }

    // Aplicar posición
    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;

    // Actualizar atributo de posición para arrow
    this.arrow.setAttribute('data-position', position);

    // Posicionar arrow
    this.positionArrow(targetRect, position);
  }

  positionArrow(targetRect, position) {
    const tooltipRect = this.tooltip.getBoundingClientRect();

    switch (position) {
      case 'top':
        this.arrow.style.top = `${tooltipRect.bottom}px`;
        this.arrow.style.left = `${tooltipRect.left + tooltipRect.width / 2}px`;
        break;
      case 'bottom':
        this.arrow.style.top = `${tooltipRect.top}px`;
        this.arrow.style.left = `${tooltipRect.left + tooltipRect.width / 2}px`;
        break;
      case 'left':
        this.arrow.style.top = `${tooltipRect.top + tooltipRect.height / 2}px`;
        this.arrow.style.left = `${tooltipRect.right}px`;
        break;
      case 'right':
        this.arrow.style.top = `${tooltipRect.top + tooltipRect.height / 2}px`;
        this.arrow.style.left = `${tooltipRect.left}px`;
        break;
    }
  }

  updateTooltipContent(step, index) {
    const isFirst = index === 0;
    const isLast = step.isLast || index === this.steps.length - 1;

    let featuresHTML = '';
    if (step.features && step.features.length > 0) {
      featuresHTML = `
        <ul class="tour-features">
          ${step.features.map((feature) => `<li>${feature}</li>`).join('')}
        </ul>
      `;
    }

    this.tooltip.innerHTML = `
      <div class="tour-tooltip-header">
        <div class="tour-tooltip-icon">${step.title.split(' ')[0]}</div>
        <h3 class="tour-tooltip-title">${step.title.substring(
          step.title.indexOf(' ') + 1
        )}</h3>
        <p class="tour-tooltip-subtitle">${step.subtitle}</p>
      </div>
      <div class="tour-tooltip-body">
        <div class="tour-tooltip-content">
          ${step.content}
        </div>
        ${featuresHTML}
      </div>
      <div class="tour-tooltip-footer">
        <div class="tour-progress">
          <span>${index + 1}/${this.steps.length}</span>
          <div class="tour-progress-dots">
            ${this.steps
              .map(
                (_, i) => `
              <div class="tour-progress-dot ${
                i === index ? 'active' : ''
              }"></div>
            `
              )
              .join('')}
          </div>
        </div>
        <div class="tour-buttons">
          <button class="tour-btn tour-btn-skip" id="tourSkipBtn">
            Saltar
          </button>
          ${
            !isFirst
              ? `
            <button class="tour-btn tour-btn-prev" id="tourPrevBtn">
              <i class="fas fa-arrow-left"></i> Anterior
            </button>
          `
              : ''
          }
          ${
            !isLast
              ? `
            <button class="tour-btn tour-btn-next" id="tourNextBtn">
              Siguiente <i class="fas fa-arrow-right"></i>
            </button>
          `
              : `
            <button class="tour-btn tour-btn-finish" id="tourFinishBtn">
              <i class="fas fa-check"></i> Finalizar
            </button>
          `
          }
        </div>
      </div>
    `;

    // Bind eventos de botones
    const skipBtn = this.tooltip.querySelector('#tourSkipBtn');
    const prevBtn = this.tooltip.querySelector('#tourPrevBtn');
    const nextBtn = this.tooltip.querySelector('#tourNextBtn');
    const finishBtn = this.tooltip.querySelector('#tourFinishBtn');

    if (skipBtn) skipBtn.addEventListener('click', () => this.end());
    if (prevBtn) prevBtn.addEventListener('click', () => this.prev());
    if (nextBtn) nextBtn.addEventListener('click', () => this.next());
    if (finishBtn) finishBtn.addEventListener('click', () => this.finish());
  }

  next() {
    this.tooltip.classList.remove('active');
    setTimeout(() => {
      if (this.currentStep < this.steps.length - 1) {
        this.showStep(this.currentStep + 1);
      } else {
        this.finish();
      }
    }, 300);
  }

  prev() {
    this.tooltip.classList.remove('active');
    setTimeout(() => {
      if (this.currentStep > 0) {
        this.showStep(this.currentStep - 1);
      }
    }, 300);
  }

  finish() {
    this.end();
    this.markTourAsCompleted();

    // Mostrar mensaje de éxito
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(
        '¡Tour completado! 🎉 Ahora puedes empezar a usar Financia Suite.',
        'success'
      );
    }
  }

  end() {
    this.isActive = false;
    this.tooltip.classList.remove('active');
    this.overlay.classList.remove('active');
    this.spotlight.style.opacity = '0';

    setTimeout(() => {
      this.spotlight.style.width = '0';
      this.spotlight.style.height = '0';
    }, 300);
  }

  markTourAsCompleted() {
    localStorage.setItem('tourCompleted', 'true');
  }

  shouldShowTour() {
    const tourCompleted = localStorage.getItem('tourCompleted');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Mostrar tour si no se ha completado y el usuario no está logueado
    return !tourCompleted && !isLoggedIn;
  }
}

// Inicializar tour cuando el DOM esté listo
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que la app se inicialice
    setTimeout(() => {
      const tour = new GuidedTour();
      window.guidedTour = tour;

      // Mostrar tour automáticamente para nuevos usuarios
      if (tour.shouldShowTour()) {
        setTimeout(() => {
          tour.showWelcomeModal();
        }, 1000);
      }

      // Botón para reiniciar tour desde configuración
      setTimeout(() => {
        const restartBtn = document.getElementById('restartTourBtn');
        if (restartBtn) {
          restartBtn.addEventListener('click', () => {
            tour.showWelcomeModal();
          });
        }
      }, 1000);
    }, 500);
  });
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GuidedTour;
}*/
