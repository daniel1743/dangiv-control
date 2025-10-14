/**
 * ============================================
 * AVATAR SIDEBAR MODULE
 * Menú lateral del avatar con arquitectura moderna
 * ============================================
 * @version 2.0.0
 * @author Financia Suite
 */

(function () {
  'use strict';

  /**
   * Clase AvatarSidebar
   * Gestiona el menú lateral del avatar con patrón Singleton
   */
  class AvatarSidebar {
    constructor() {
      // Elementos del DOM
      this.sidebar = null;
      this.backdrop = null;
      this.closeBtn = null;
      this.hamburgerBtn = null;

      // Estado
      this.isOpen = false;

      // Bindear métodos
      this.open = this.open.bind(this);
      this.close = this.close.bind(this);
      this.toggle = this.toggle.bind(this);
      this.handleBackdropClick = this.handleBackdropClick.bind(this);
      this.handleEscKey = this.handleEscKey.bind(this);
      this.handleAction = this.handleAction.bind(this);

      // Inicializar
      this.init();
    }

    /**
     * Inicializa el sidebar
     */
    init() {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    /**
     * Configura todos los elementos y event listeners
     */
    setup() {
      // Obtener elementos del DOM
      this.sidebar = document.getElementById('avatarSidebar');
      this.backdrop = document.getElementById('avatarSidebarBackdrop');
      this.closeBtn = document.getElementById('avatarSidebarClose');
      this.hamburgerBtn = document.getElementById('mobileHamburgerBtn');

      // Verificar que existan los elementos necesarios
      if (!this.sidebar || !this.backdrop) {
        console.warn('[AvatarSidebar] Elementos necesarios no encontrados');
        return;
      }

      // Event listeners
      this.setupEventListeners();

      console.log('[AvatarSidebar] Inicializado correctamente');
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
      // Botón de cerrar
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', this.close);
      }

      // Botón hamburguesa
      if (this.hamburgerBtn) {
        this.hamburgerBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Evitar que el evento se propague al banner
          this.toggle();
        });
      }

      // Backdrop (cerrar al hacer click fuera)
      if (this.backdrop) {
        this.backdrop.addEventListener('click', this.handleBackdropClick);
      }

      // Tecla ESC
      document.addEventListener('keydown', this.handleEscKey);

      // Acciones de los items del menú
      const actionButtons = this.sidebar.querySelectorAll('[data-action]');
      actionButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
          const action = button.dataset.action;
          this.handleAction(action, e);
        });
      });

      // Toggle de tema
      const themeToggle = document.getElementById('avatarThemeToggle');
      if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
          this.handleThemeToggle(e.target.checked);
        });
      }
    }

    /**
     * Abre el sidebar
     */
    open() {
      if (this.isOpen) return;

      this.sidebar.classList.add('avatar-sidebar--open');
      this.backdrop.classList.add('avatar-sidebar-backdrop--visible');
      this.sidebar.setAttribute('aria-hidden', 'false');
      this.backdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      this.isOpen = true;

      // Actualizar información del usuario
      this.updateUserInfo();

      console.log('[AvatarSidebar] Abierto');
    }

    /**
     * Cierra el sidebar
     */
    close() {
      if (!this.isOpen) return;

      this.sidebar.classList.remove('avatar-sidebar--open');
      this.backdrop.classList.remove('avatar-sidebar-backdrop--visible');
      this.sidebar.setAttribute('aria-hidden', 'true');
      this.backdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      this.isOpen = false;

      console.log('[AvatarSidebar] Cerrado');
    }

    /**
     * Alterna el estado del sidebar
     */
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Maneja el click en el backdrop
     */
    handleBackdropClick() {
      this.close();
    }

    /**
     * Maneja la tecla ESC
     */
    handleEscKey(e) {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    }

    /**
     * Maneja las acciones de los items del menú
     * @param {string} action - Nombre de la acción
     * @param {Event} event - Evento del click
     */
    handleAction(action, event) {
      console.log(`[AvatarSidebar] Acción: ${action}`);

      // Cerrar el sidebar después de la acción
      this.close();

      // Delegar la acción a FinanceApp si existe
      if (window.app && typeof window.app.handleMenuAction === 'function') {
        window.app.handleMenuAction(action);
      } else {
        console.warn(`[AvatarSidebar] No se pudo manejar la acción: ${action}`);
      }
    }

    /**
     * Maneja el toggle de tema
     * @param {boolean} isDark - Si el tema oscuro está activado
     */
    handleThemeToggle(isDark) {
      const theme = isDark ? 'dark' : 'light';

      // Delegar a FinanceApp si existe
      if (window.app && typeof window.app.applyTheme === 'function') {
        window.app.applyTheme(theme);
      }

      console.log(`[AvatarSidebar] Tema cambiado a: ${theme}`);
    }

    /**
     * Actualiza la información del usuario en el sidebar
     */
    updateUserInfo() {
      if (!window.app) return;

      const nameElement = document.getElementById('avatarSidebarName');
      const emailElement = document.getElementById('avatarSidebarEmail');
      const imageElement = document.getElementById('avatarSidebarImage');

      if (nameElement && window.app.userProfile.name) {
        nameElement.textContent = window.app.userProfile.name;
      }

      if (emailElement && window.app.userProfile.email) {
        emailElement.textContent = window.app.userProfile.email;
      }

      if (imageElement && window.app.userProfile.avatar) {
        imageElement.src = window.app.userProfile.avatar;
      }

      // Actualizar estado del tema
      const themeToggle = document.getElementById('avatarThemeToggle');
      if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'light';
        themeToggle.checked = savedTheme === 'dark';
      }
    }

    /**
     * Destructor - Limpia los event listeners
     */
    destroy() {
      if (this.closeBtn) {
        this.closeBtn.removeEventListener('click', this.close);
      }

      if (this.hamburgerBtn) {
        this.hamburgerBtn.removeEventListener('click', this.toggle);
      }

      if (this.backdrop) {
        this.backdrop.removeEventListener('click', this.handleBackdropClick);
      }

      document.removeEventListener('keydown', this.handleEscKey);

      console.log('[AvatarSidebar] Destruido');
    }
  }

  /**
   * Inicializar el sidebar cuando el script se cargue
   * NOTA: Usamos avatarSidebarManager en lugar de avatarSidebar
   * porque el navegador crea automáticamente window.avatarSidebar
   * apuntando al elemento HTML con id="avatarSidebar"
   */
  if (typeof window !== 'undefined') {
    const ensureSidebarInstance = () => {
      // SOLUCIÓN: Usar nombre diferente para evitar conflicto con el ID del elemento
      if (
        !window.avatarSidebarManager ||
        !(window.avatarSidebarManager instanceof AvatarSidebar)
      ) {
        window.avatarSidebarManager = new AvatarSidebar();
        console.log(
          '[AvatarSidebar] Instancia creada en window.avatarSidebarManager'
        );
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureSidebarInstance);
    } else {
      ensureSidebarInstance();
    }

    if (!window.app) {
      const checkApp = setInterval(() => {
        if (window.app) {
          clearInterval(checkApp);
          const sidebarInstance = window.avatarSidebarManager;
          if (
            sidebarInstance &&
            typeof sidebarInstance.updateUserInfo === 'function'
          ) {
            sidebarInstance.updateUserInfo();
          }
        }
      }, 200);
    } else {
      const sidebarInstance = window.avatarSidebarManager;
      if (
        sidebarInstance &&
        typeof sidebarInstance.updateUserInfo === 'function'
      ) {
        sidebarInstance.updateUserInfo();
      }
    }
  }
})();
