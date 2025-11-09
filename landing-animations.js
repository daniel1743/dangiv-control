// ========================================
// LANDING PAGE ANIMATIONS
// Adaptación de animaciones de CONTENTLAB a vanilla JavaScript
// Sin dependencias de frameworks (Framer Motion replicado)
// ========================================

/**
 * Sistema de animaciones Intersection Observer
 * Detecta cuando elementos entran al viewport y los anima
 */
class LandingAnimations {
  constructor() {
    this.observers = [];
    this.init();
  }

  init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupAnimations());
    } else {
      this.setupAnimations();
    }
  }

  setupAnimations() {
    this.setupScrollAnimations();
    this.setupTypingEffect();
    this.setupCounterAnimations();
    this.setupParallaxBackground();
    this.setupRippleButtons();
    this.setupHoverAnimations();
  }

  /**
   * Animaciones de scroll (fade in, slide in)
   */
  setupScrollAnimations() {
    const fadeInElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
      }
    );

    fadeInElements.forEach((el) => observer.observe(el));
    this.observers.push(observer);
  }

  /**
   * Efecto de typing (texto que se escribe)
   */
  setupTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (!typingElement) return;

    const texts = typingElement.dataset.texts
      ? typingElement.dataset.texts.split('|')
      : ['Controla tus gastos', 'Alcanza tus metas', 'Ahorra inteligentemente'];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    let typingTimeoutId = null;
    let isTypingActive = false;
    let isTypingRunning = false;

    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;

    const scheduleNext = (delay) => {
      if (!isTypingActive) {
        typingTimeoutId = null;
        isTypingRunning = false;
        return;
      }

      typingTimeoutId = setTimeout(() => {
        typingTimeoutId = null;
        type();
      }, delay);
    };

    const type = () => {
      if (!isTypingActive) {
        isTypingRunning = false;
        return;
      }

      isTypingRunning = true;
      const currentText = texts[textIndex];

      if (isPaused) {
        isPaused = false;
        scheduleNext(pauseTime);
        return;
      }

      if (!isDeleting && charIndex <= currentText.length) {
        typingElement.textContent = currentText.slice(0, charIndex);
        charIndex++;
        scheduleNext(typingSpeed);
      } else if (!isDeleting && charIndex > currentText.length) {
        isPaused = true;
        isDeleting = true;
        scheduleNext(pauseTime);
      } else if (isDeleting && charIndex >= 0) {
        typingElement.textContent = currentText.slice(0, charIndex);
        charIndex--;
        scheduleNext(deletingSpeed);
      } else {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        charIndex = 0;
        scheduleNext(500);
      }
    };

    const pauseTyping = () => {
      if (!isTypingActive) return;
      isTypingActive = false;
      if (typingTimeoutId) {
        clearTimeout(typingTimeoutId);
        typingTimeoutId = null;
      }
      isTypingRunning = false;
    };

    const resumeTyping = () => {
      if (isTypingActive) {
        if (!isTypingRunning) {
          type();
        }
        return;
      }

      isTypingActive = true;
      type();
    };

    const heroSection =
      document.querySelector('.hero-section') ||
      typingElement.closest('.hero-container') ||
      typingElement;

    if (heroSection) {
      const visibilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              resumeTyping();
            } else {
              pauseTyping();
            }
          });
        },
        {
          threshold: 0.35,
        }
      );

      visibilityObserver.observe(heroSection);
      this.observers.push(visibilityObserver);

      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        pauseTyping();
      } else {
        resumeTyping();
      }
    } else {
      resumeTyping();
    }
  }

  /**
   * Contadores animados (números que suben progresivamente)
   */
  setupCounterAnimations() {
    const counters = document.querySelectorAll('.animated-counter');

    const animateCounter = (element) => {
      const target = parseFloat(element.dataset.value || 0);
      const suffix = element.dataset.suffix || '';
      const duration = 2000;
      const frameDuration = 1000 / 60; // 60 FPS
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentValue = Math.round(target * progress);

        element.textContent = currentValue + suffix;

        if (frame === totalFrames) {
          clearInterval(counter);
          element.textContent = target + suffix;
        }
      }, frameDuration);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            animateCounter(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
    this.observers.push(observer);
  }

  /**
   * Fondo parallax (se mueve con el scroll)
   */
  setupParallaxBackground() {
    const parallaxElements = document.querySelectorAll('.parallax-bg');

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.dataset.speed || 0.5);
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  /**
   * Efecto ripple en botones (onda al hacer clic)
   */
  setupRippleButtons() {
    const rippleButtons = document.querySelectorAll('.btn-ripple');

    rippleButtons.forEach((button) => {
      button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');

        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  /**
   * Animaciones de hover en cards
   */
  setupHoverAnimations() {
    const hoverCards = document.querySelectorAll('.hover-card');

    hoverCards.forEach((card) => {
      const icon = card.querySelector('.card-icon');

      card.addEventListener('mouseenter', () => {
        if (icon) {
          icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
      });

      card.addEventListener('mouseleave', () => {
        if (icon) {
          icon.style.transform = 'scale(1) rotate(0deg)';
        }
      });
    });
  }

  /**
   * Destruir todos los observers al cambiar de sección
   */
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// ========================================
// AUTO-INICIALIZACIÓN
// ========================================

// Crear instancia global
window.landingAnimations = new LandingAnimations();

console.log('✨ Landing Animations cargadas');
