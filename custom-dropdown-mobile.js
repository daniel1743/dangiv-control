// ========================================
// CUSTOM DROPDOWN PARA MÓVILES
// Reemplaza select nativos con dropdowns inteligentes
// ========================================

/**
 * Sistema de custom dropdown que se posiciona inteligentemente
 * y nunca se corta por los bordes de la pantalla
 */

class CustomDropdownMobile {
  constructor(selectElement) {
    this.selectElement = selectElement;
    this.wrapper = null;
    this.trigger = null;
    this.menu = null;
    this.isOpen = false;
    this.selectedIndex = selectElement.selectedIndex;

    this.init();
  }

  init() {
    // Crear estructura del custom dropdown
    this.createStructure();

    // Copiar opciones
    this.populateOptions();

    // Agregar event listeners
    this.attachEvents();

    // Sincronizar valor inicial
    this.syncValue();
  }

  createStructure() {
    // Crear wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'custom-dropdown-mobile';

    // Crear trigger (botón que se ve)
    this.trigger = document.createElement('button');
    this.trigger.type = 'button';
    this.trigger.className = 'custom-dropdown-trigger-mobile';
    this.trigger.innerHTML = `
      <span class="trigger-text">Selecciona una opción</span>
      <i class="fas fa-chevron-down trigger-icon"></i>
    `;

    // Crear menú
    this.menu = document.createElement('div');
    this.menu.className = 'custom-dropdown-menu-mobile';
    this.menu.style.display = 'none';

    // Envolver el select original
    this.selectElement.parentNode.insertBefore(this.wrapper, this.selectElement);
    this.wrapper.appendChild(this.trigger);
    this.wrapper.appendChild(this.menu);
    this.wrapper.appendChild(this.selectElement);

    // Ocultar select original
    this.selectElement.style.display = 'none';
    this.selectElement.setAttribute('tabindex', '-1');
  }

  populateOptions() {
    const options = Array.from(this.selectElement.options);

    options.forEach((option, index) => {
      if (option.value === '') return; // Skip placeholder

      const optionEl = document.createElement('div');
      optionEl.className = 'custom-dropdown-option-mobile';
      optionEl.dataset.value = option.value;
      optionEl.dataset.index = index;

      // Obtener icono si existe
      const icon = option.getAttribute('data-icon') || '';

      optionEl.innerHTML = `
        ${icon ? `<span class="option-icon">${icon}</span>` : ''}
        <span class="option-text">${option.textContent.trim()}</span>
        ${option.selected ? '<i class="fas fa-check option-check"></i>' : ''}
      `;

      this.menu.appendChild(optionEl);
    });
  }

  attachEvents() {
    // Toggle al hacer click en trigger
    this.trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    // Seleccionar opción
    this.menu.addEventListener('click', (e) => {
      const option = e.target.closest('.custom-dropdown-option-mobile');
      if (!option) return;

      const index = parseInt(option.dataset.index);
      this.selectOption(index);
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target) && this.isOpen) {
        this.close();
      }
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Cerrar al hacer scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!this.isOpen) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.close();
      }, 100);
    }, { passive: true });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    // Cerrar otros dropdowns abiertos
    CustomDropdownMobile.closeAll();

    this.isOpen = true;
    this.menu.style.display = 'block';
    this.wrapper.classList.add('is-open');
    this.trigger.classList.add('active');

    // Calcular y aplicar posicionamiento
    this.position();

    // Scroll a la opción seleccionada
    this.scrollToSelected();

    // Agregar backdrop en móvil
    this.showBackdrop();
  }

  close() {
    this.isOpen = false;
    this.menu.style.display = 'none';
    this.wrapper.classList.remove('is-open');
    this.trigger.classList.remove('active');
    this.hideBackdrop();
  }

  position() {
    const triggerRect = this.trigger.getBoundingClientRect();
    const menuHeight = this.menu.scrollHeight;
    const viewportHeight = window.innerHeight;

    // Espacio disponible arriba y abajo
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Determinar si abrir hacia arriba o abajo
    const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    if (openUpward) {
      // Abrir hacia arriba
      this.wrapper.classList.add('open-upward');
      this.wrapper.classList.remove('open-downward');

      // Calcular altura máxima basada en espacio disponible
      const maxHeight = Math.min(spaceAbove - 20, 400);
      this.menu.style.maxHeight = `${maxHeight}px`;
      this.menu.style.bottom = '100%';
      this.menu.style.top = 'auto';
      this.menu.style.marginBottom = '8px';
      this.menu.style.marginTop = '0';
    } else {
      // Abrir hacia abajo
      this.wrapper.classList.add('open-downward');
      this.wrapper.classList.remove('open-upward');

      // Calcular altura máxima basada en espacio disponible
      const maxHeight = Math.min(spaceBelow - 20, 400);
      this.menu.style.maxHeight = `${maxHeight}px`;
      this.menu.style.top = '100%';
      this.menu.style.bottom = 'auto';
      this.menu.style.marginTop = '8px';
      this.menu.style.marginBottom = '0';
    }

    // Ancho completo del trigger
    this.menu.style.width = `${triggerRect.width}px`;

    // Si aún así se sale, forzar scroll interno
    if (menuHeight > (openUpward ? spaceAbove : spaceBelow)) {
      this.menu.style.overflowY = 'auto';
    }
  }

  scrollToSelected() {
    const selected = this.menu.querySelector('.custom-dropdown-option-mobile.selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  selectOption(index) {
    // Actualizar select nativo
    this.selectElement.selectedIndex = index;
    this.selectedIndex = index;

    // Disparar evento change
    const event = new Event('change', { bubbles: true });
    this.selectElement.dispatchEvent(event);

    // Actualizar UI
    this.syncValue();

    // Cerrar
    this.close();
  }

  syncValue() {
    const selected = this.selectElement.options[this.selectedIndex];
    if (!selected) return;

    // Actualizar texto del trigger
    const icon = selected.getAttribute('data-icon') || '';
    const text = selected.textContent.trim();

    this.trigger.querySelector('.trigger-text').innerHTML =
      `${icon ? `<span class="trigger-icon-emoji">${icon}</span>` : ''} ${text}`;

    // Actualizar opciones
    this.menu.querySelectorAll('.custom-dropdown-option-mobile').forEach((option, idx) => {
      if (idx + 1 === this.selectedIndex) { // +1 porque skip placeholder
        option.classList.add('selected');
        option.innerHTML = option.innerHTML.replace(
          '<i class="fas fa-check option-check"></i>',
          ''
        ) + '<i class="fas fa-check option-check"></i>';
      } else {
        option.classList.remove('selected');
        option.innerHTML = option.innerHTML.replace(
          '<i class="fas fa-check option-check"></i>',
          ''
        );
      }
    });
  }

  showBackdrop() {
    let backdrop = document.getElementById('dropdown-backdrop-mobile');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'dropdown-backdrop-mobile';
      backdrop.className = 'dropdown-backdrop-mobile';
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', () => {
        CustomDropdownMobile.closeAll();
      });
    }

    backdrop.classList.add('show');
  }

  hideBackdrop() {
    const backdrop = document.getElementById('dropdown-backdrop-mobile');
    if (backdrop) {
      backdrop.classList.remove('show');
      setTimeout(() => {
        if (!document.querySelector('.custom-dropdown-mobile.is-open')) {
          backdrop.remove();
        }
      }, 300);
    }
  }

  static closeAll() {
    document.querySelectorAll('.custom-dropdown-mobile.is-open').forEach(wrapper => {
      const trigger = wrapper.querySelector('.custom-dropdown-trigger-mobile');
      if (trigger) {
        trigger.click();
      }
    });
  }

  destroy() {
    // Restaurar select original
    this.selectElement.style.display = '';
    this.selectElement.removeAttribute('tabindex');

    // Remover wrapper
    this.wrapper.parentNode.insertBefore(this.selectElement, this.wrapper);
    this.wrapper.remove();
  }
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================

class CustomDropdownManager {
  constructor() {
    this.dropdowns = new Map();
    this.isMobile = window.innerWidth <= 768;
    this.init();
  }

  init() {
    // Inicializar en móviles
    if (this.isMobile) {
      this.replaceSelects();
    }

    // Escuchar cambios de tamaño
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;

        if (wasMobile !== this.isMobile) {
          if (this.isMobile) {
            this.replaceSelects();
          } else {
            this.restoreSelects();
          }
        }
      }, 250);
    });

    console.log('✅ CustomDropdownManager initialized');
  }

  replaceSelects() {
    // Buscar todos los select que deben reemplazarse
    const selects = document.querySelectorAll('select.form-select-premium, select.category-select');

    selects.forEach(select => {
      // No reemplazar si ya está reemplazado
      if (this.dropdowns.has(select)) return;

      // Crear custom dropdown
      const dropdown = new CustomDropdownMobile(select);
      this.dropdowns.set(select, dropdown);
    });

    console.log(`✅ Replaced ${this.dropdowns.size} native selects with custom dropdowns`);
  }

  restoreSelects() {
    // Restaurar todos los selects
    this.dropdowns.forEach((dropdown, select) => {
      dropdown.destroy();
    });
    this.dropdowns.clear();

    console.log('✅ Restored native selects');
  }

  // Método público para agregar nuevos selects dinámicamente
  addSelect(selectElement) {
    if (this.isMobile && !this.dropdowns.has(selectElement)) {
      const dropdown = new CustomDropdownMobile(selectElement);
      this.dropdowns.set(selectElement, dropdown);
    }
  }
}

// ========================================
// ESTILOS CSS (se inyectan dinámicamente)
// ========================================

function injectCustomDropdownStyles() {
  const styleId = 'custom-dropdown-mobile-styles';

  // No inyectar dos veces
  if (document.getElementById(styleId)) return;

  const styles = `
    /* Custom Dropdown Mobile Wrapper */
    .custom-dropdown-mobile {
      position: relative;
      width: 100%;
    }

    /* Trigger Button */
    .custom-dropdown-trigger-mobile {
      width: 100%;
      padding: 14px 48px 14px 16px;
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
      background-color: #ffffff;
      background-image: url('data:image/svg+xml;utf8,<svg fill="%236366f1" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 24px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      cursor: pointer;
      text-align: left;
      line-height: 1.6;
      min-height: 48px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      position: relative;
    }

    .custom-dropdown-trigger-mobile:hover {
      border-color: #c7d2fe;
      background-color: #fafafa;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
      transform: translateY(-1px);
    }

    .custom-dropdown-trigger-mobile:active,
    .custom-dropdown-trigger-mobile.active {
      border-color: #6366f1;
      background-color: #ffffff;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
    }

    .custom-dropdown-trigger-mobile .trigger-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .custom-dropdown-trigger-mobile .trigger-icon-emoji {
      font-size: 20px;
      line-height: 1;
    }

    .custom-dropdown-mobile.is-open .custom-dropdown-trigger-mobile {
      background-image: url('data:image/svg+xml;utf8,<svg fill="%234f46e5" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 14l5-5 5 5z"/></svg>');
    }

    /* Menu Container */
    .custom-dropdown-menu-mobile {
      position: absolute;
      left: 0;
      right: 0;
      background: #ffffff;
      border: 2px solid #6366f1;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 9999;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
      animation: dropdownSlideIn 0.2s ease-out;
    }

    @keyframes dropdownSlideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .custom-dropdown-mobile.open-upward .custom-dropdown-menu-mobile {
      animation: dropdownSlideInUp 0.2s ease-out;
    }

    @keyframes dropdownSlideInUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Option Items */
    .custom-dropdown-option-mobile {
      padding: 16px 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
      transition: all 0.15s ease;
      min-height: 56px;
      border-bottom: 1px solid #f3f4f6;
    }

    .custom-dropdown-option-mobile:last-child {
      border-bottom: none;
    }

    .custom-dropdown-option-mobile:hover {
      background-color: #f3f4f6;
      color: #6366f1;
    }

    .custom-dropdown-option-mobile:active {
      background-color: #eef2ff;
      transform: scale(0.98);
    }

    .custom-dropdown-option-mobile.selected {
      background-color: #eef2ff;
      color: #4f46e5;
      font-weight: 600;
    }

    .custom-dropdown-option-mobile .option-icon {
      font-size: 24px;
      flex-shrink: 0;
      line-height: 1;
    }

    .custom-dropdown-option-mobile .option-text {
      flex: 1;
    }

    .custom-dropdown-option-mobile .option-check {
      color: #4f46e5;
      font-size: 18px;
      margin-left: auto;
    }

    /* Backdrop */
    .dropdown-backdrop-mobile {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 9998;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .dropdown-backdrop-mobile.show {
      opacity: 1;
      pointer-events: auto;
    }

    /* Scrollbar personalizado */
    .custom-dropdown-menu-mobile::-webkit-scrollbar {
      width: 8px;
    }

    .custom-dropdown-menu-mobile::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .custom-dropdown-menu-mobile::-webkit-scrollbar-thumb {
      background: #c7d2fe;
      border-radius: 10px;
    }

    .custom-dropdown-menu-mobile::-webkit-scrollbar-thumb:hover {
      background: #a5b4fc;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .custom-dropdown-trigger-mobile {
        padding: 16px 52px 16px 18px;
        min-height: 52px;
      }

      .custom-dropdown-option-mobile {
        padding: 18px 22px;
        font-size: 17px;
        min-height: 60px;
      }

      .custom-dropdown-option-mobile .option-icon {
        font-size: 26px;
      }
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// ========================================
// AUTO-INICIALIZACIÓN
// ========================================

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomDropdowns);
} else {
  initCustomDropdowns();
}

function initCustomDropdowns() {
  // Inyectar estilos
  injectCustomDropdownStyles();

  // Inicializar manager
  window.customDropdownManager = new CustomDropdownManager();

  console.log('✅ Custom dropdowns system ready');
}

// Exportar para uso global
window.CustomDropdownMobile = CustomDropdownMobile;
window.CustomDropdownManager = CustomDropdownManager;

console.log('✅ custom-dropdown-mobile.js loaded');
