// ========================================
// MEJORAS MOBILE PARA DROPDOWNS
// Posicionamiento inteligente y mejor UX
// ========================================

/**
 * Sistema de posicionamiento inteligente para dropdowns en móviles
 * Evita que los select se corten en la parte inferior de la pantalla
 */

class MobileDropdownEnhancer {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  init() {
    // Detectar cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });

    // Mejorar custom dropdowns si existen
    this.enhanceCustomDropdowns();

    // Agregar manejo especial para select nativos en móvil
    this.enhanceNativeSelects();

    console.log('✅ Mobile Dropdown Enhancer initialized');
  }

  /**
   * Mejora los custom dropdowns con posicionamiento inteligente
   */
  enhanceCustomDropdowns() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.custom-dropdown-trigger');
      if (!trigger || !this.isMobile) return;

      const wrapper = trigger.closest('.custom-dropdown-wrapper');
      if (!wrapper) return;

      // Esperar a que se abra el dropdown
      setTimeout(() => {
        this.positionDropdown(wrapper);
      }, 50);
    });
  }

  /**
   * Posiciona el dropdown de manera inteligente
   */
  positionDropdown(wrapper) {
    const menu = wrapper.querySelector('.custom-dropdown-menu');
    if (!menu || !menu.classList.contains('open')) return;

    const rect = wrapper.getBoundingClientRect();
    const menuHeight = menu.offsetHeight;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Si no hay suficiente espacio abajo y hay más espacio arriba, voltearlo
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      wrapper.classList.add('flip-up');
    } else {
      wrapper.classList.remove('flip-up');
    }

    // Si el dropdown es muy alto, limitar su altura
    const maxHeight = Math.min(
      viewportHeight * 0.6,
      Math.max(spaceBelow, spaceAbove) - 20
    );
    menu.style.maxHeight = `${maxHeight}px`;
  }

  /**
   * Mejora select nativos en móviles
   */
  enhanceNativeSelects() {
    // Cuando se abre un select en móvil, hacer scroll al formulario
    document.addEventListener('focus', (e) => {
      if (!this.isMobile) return;

      const select = e.target;
      if (select.tagName !== 'SELECT') return;
      if (!select.classList.contains('form-select-premium')) return;

      // Hacer scroll para asegurar que el select sea visible
      setTimeout(() => {
        this.scrollToElement(select);
      }, 300);
    }, true);

    // Agregar evento para detectar cuando se abre el dropdown nativo
    document.addEventListener('mousedown', (e) => {
      if (!this.isMobile) return;

      const select = e.target;
      if (select.tagName !== 'SELECT') return;
      if (!select.classList.contains('form-select-premium')) return;

      this.ensureSelectVisible(select);
    });
  }

  /**
   * Asegura que el select sea visible en pantalla
   */
  ensureSelectVisible(select) {
    const formGroup = select.closest('.form-group-premium');
    if (!formGroup) return;

    const rect = formGroup.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Si el select está en el bottom 30% de la pantalla
    if (rect.bottom > viewportHeight * 0.7) {
      // Hacer scroll hacia arriba
      this.scrollToElement(formGroup, -100);
    }
  }

  /**
   * Hace scroll suave hacia un elemento
   */
  scrollToElement(element, offset = -20) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const elementTop = rect.top + scrollTop;

    window.scrollTo({
      top: elementTop + offset,
      behavior: 'smooth'
    });
  }

  /**
   * Agrega espacio extra al final del formulario si hay selects
   */
  addBottomPadding() {
    const forms = document.querySelectorAll('.expense-form-content');

    forms.forEach(form => {
      const selects = form.querySelectorAll('select.form-select-premium');
      if (selects.length === 0) return;

      // Agregar padding al final si estamos en móvil
      if (this.isMobile) {
        form.style.paddingBottom = '300px';
      } else {
        form.style.paddingBottom = '';
      }
    });
  }
}

// ========================================
// MEJORAS ADICIONALES PARA TOUCH
// ========================================

/**
 * Previene el zoom al hacer tap en inputs/selects en iOS
 */
function preventIOSZoom() {
  // Agregar meta viewport dinámicamente si no existe
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    const content = viewport.getAttribute('content');
    if (!content.includes('maximum-scale')) {
      viewport.setAttribute(
        'content',
        content + ', maximum-scale=1.0, user-scalable=no'
      );
    }
  }

  // Asegurar que todos los inputs y selects tengan font-size >= 16px
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const computedSize = window.getComputedStyle(input).fontSize;
    const size = parseFloat(computedSize);
    if (size < 16) {
      input.style.fontSize = '16px';
    }
  });
}

/**
 * Mejora el feedback táctil en opciones de select
 */
function enhanceTouchFeedback() {
  // Agregar clase active al tocar opciones
  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'OPTION' || e.target.closest('.custom-dropdown-option')) {
      e.target.classList.add('touch-active');
    }
  });

  document.addEventListener('touchend', (e) => {
    if (e.target.tagName === 'OPTION' || e.target.closest('.custom-dropdown-option')) {
      setTimeout(() => {
        e.target.classList.remove('touch-active');
      }, 200);
    }
  });
}

/**
 * Cierra dropdowns al hacer scroll (mejor UX en móvil)
 */
function closeDropdownsOnScroll() {
  let scrollTimeout;
  let isScrolling = false;

  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      isScrolling = true;

      // Cerrar custom dropdowns abiertos
      const openDropdowns = document.querySelectorAll('.custom-dropdown-menu.open');
      openDropdowns.forEach(dropdown => {
        const wrapper = dropdown.closest('.custom-dropdown-wrapper');
        if (wrapper) {
          const trigger = wrapper.querySelector('.custom-dropdown-trigger');
          if (trigger) {
            trigger.click(); // Cerrar dropdown
          }
        }
      });
    }

    // Reset después del scroll
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 150);
  }, { passive: true });
}

// ========================================
// INICIALIZACIÓN
// ========================================

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileEnhancements);
} else {
  initMobileEnhancements();
}

function initMobileEnhancements() {
  // Solo aplicar mejoras en móviles
  if (window.innerWidth <= 768) {
    // Inicializar enhancer
    window.mobileDropdownEnhancer = new MobileDropdownEnhancer();

    // Aplicar mejoras adicionales
    preventIOSZoom();
    enhanceTouchFeedback();
    closeDropdownsOnScroll();

    console.log('✅ Mobile enhancements activated');
  }

  // Re-aplicar si cambia el tamaño de ventana
  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !window.mobileDropdownEnhancer) {
      window.mobileDropdownEnhancer = new MobileDropdownEnhancer();
      preventIOSZoom();
      enhanceTouchFeedback();
      closeDropdownsOnScroll();
    }
  });
}

// Exportar para uso global
window.MobileDropdownEnhancer = MobileDropdownEnhancer;

console.log('✅ mobile-dropdown-fix.js loaded');
