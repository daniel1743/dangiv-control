// Smart Forms - Sistema de Dropdowns Personalizados y Autocompletado Inteligente
// Dan&Giv Control - 2024

class SmartDropdown {
  constructor(selectElement, options = {}) {
    this.select = selectElement;
    this.options = {
      searchable: true,
      customizable: true,
      placeholder: 'Seleccionar...',
      addNewText: 'Agregar nueva opción',
      ...options
    };

    this.selectedValue = this.select.value;
    this.customOptions = this.loadCustomOptions();
    this.isOpen = false;

    this.init();
  }

  init() {
    // Crear el wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'custom-dropdown-wrapper';

    // Mover el select original dentro del wrapper
    this.select.parentNode.insertBefore(this.wrapper, this.select);
    this.wrapper.appendChild(this.select);

    // Crear el dropdown custom
    this.createDropdown();

    // Event listeners
    this.attachEvents();
  }

  createDropdown() {
    // Crear trigger
    this.trigger = document.createElement('div');
    this.trigger.className = 'custom-dropdown-trigger';
    this.trigger.setAttribute('tabindex', '0');
    this.updateTriggerText();

    // Crear menú - AGREGAR AL BODY con position fixed
    this.menu = document.createElement('div');
    this.menu.className = 'custom-dropdown-menu';

    // Crear buscador si está habilitado
    if (this.options.searchable) {
      this.createSearchInput();
    }

    // Crear contenedor de opciones
    this.optionsContainer = document.createElement('div');
    this.optionsContainer.className = 'custom-dropdown-options';

    this.menu.appendChild(this.optionsContainer);

    // Renderizar opciones
    this.renderOptions();

    // Agregar trigger al wrapper
    this.wrapper.appendChild(this.trigger);

    // Agregar menú directamente al body (fuera del flujo del formulario)
    document.body.appendChild(this.menu);
  }

  createSearchInput() {
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'custom-dropdown-search';

    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Buscar...';
    this.searchInput.addEventListener('input', () => this.filterOptions());
    this.searchInput.addEventListener('keydown', (e) => e.stopPropagation());

    searchWrapper.appendChild(this.searchInput);
    this.menu.appendChild(searchWrapper);
  }

  getAllOptions() {
    const nativeOptions = Array.from(this.select.options).map(opt => ({
      value: opt.value,
      text: opt.textContent.trim(),
      icon: opt.dataset.icon || '',
      custom: false
    })).filter(opt => opt.value !== ''); // Filtrar placeholder

    // Agregar opciones personalizadas
    const customOpts = this.customOptions.map(opt => ({
      ...opt,
      custom: true
    }));

    return [...nativeOptions, ...customOpts];
  }

  renderOptions(filter = '') {
    this.optionsContainer.innerHTML = '';

    const allOptions = this.getAllOptions();
    const filteredOptions = filter
      ? allOptions.filter(opt =>
          opt.text.toLowerCase().includes(filter.toLowerCase())
        )
      : allOptions;

    if (filteredOptions.length === 0) {
      this.optionsContainer.innerHTML = `
        <div class="custom-dropdown-empty">
          <i class="fas fa-search"></i>
          <div>No se encontraron resultados</div>
        </div>
      `;
      return;
    }

    filteredOptions.forEach(opt => {
      const option = document.createElement('div');
      option.className = 'custom-dropdown-option';
      if (opt.value === this.selectedValue) {
        option.classList.add('selected');
      }

      // Si es personalizada, agregar botón de eliminar
      const deleteBtn = opt.custom ?
        `<button class="delete-custom-option" data-value="${opt.value}" title="Eliminar">
          <i class="fas fa-trash-alt"></i>
        </button>` : '';

      option.innerHTML = `
        ${opt.icon ? `<span class="option-icon">${opt.icon}</span>` : ''}
        <span class="option-text">${opt.text}</span>
        ${deleteBtn}
      `;

      // Click en la opción (pero no en el botón eliminar)
      option.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-custom-option')) {
          this.selectOption(opt);
        }
      });

      // Click en el botón eliminar
      if (opt.custom) {
        const deleteButton = option.querySelector('.delete-custom-option');
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteCustomOption(opt);
        });
      }

      this.optionsContainer.appendChild(option);
    });

    // Agregar opción "Agregar nueva" si está habilitado
    if (this.options.customizable) {
      const addNew = document.createElement('div');
      addNew.className = 'custom-dropdown-option add-new';
      addNew.innerHTML = `
        <span class="option-icon"><i class="fas fa-plus-circle"></i></span>
        <span class="option-text">${this.options.addNewText}</span>
      `;

      addNew.addEventListener('click', () => this.openCustomModal());

      this.optionsContainer.appendChild(addNew);
    }
  }

  filterOptions() {
    const filter = this.searchInput.value;
    this.renderOptions(filter);
  }

  selectOption(option) {
    this.selectedValue = option.value;
    this.select.value = option.value;

    // Disparar evento change en el select original
    const event = new Event('change', { bubbles: true });
    this.select.dispatchEvent(event);

    this.updateTriggerText();
    this.close();
  }

  updateTriggerText() {
    const selectedOption = this.getAllOptions().find(
      opt => opt.value === this.selectedValue
    );

    if (selectedOption) {
      this.trigger.innerHTML = `
        ${selectedOption.icon ? `<span class="option-icon">${selectedOption.icon}</span>` : ''}
        <span>${selectedOption.text}</span>
      `;
      this.trigger.classList.remove('placeholder');
    } else {
      this.trigger.textContent = this.options.placeholder;
      this.trigger.classList.add('placeholder');
    }
  }

  open() {
    this.isOpen = true;
    this.trigger.classList.add('open');

    // Calcular posición del trigger
    const triggerRect = this.trigger.getBoundingClientRect();

    // Posicionar el menú usando position fixed
    this.menu.style.position = 'fixed';
    this.menu.style.top = `${triggerRect.bottom + 8}px`;
    this.menu.style.left = `${triggerRect.left}px`;
    this.menu.style.width = `${triggerRect.width}px`;
    this.menu.style.minWidth = `${triggerRect.width}px`;

    this.menu.classList.add('open');

    if (this.searchInput) {
      setTimeout(() => this.searchInput.focus(), 100);
    }

    // BLOQUEAR SCROLL DEL BODY (Fix para móviles)
    // Guardar el scroll actual para restaurarlo después
    this.savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this.savedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Cerrar otros dropdowns
    document.querySelectorAll('.custom-dropdown-menu.open').forEach(menu => {
      if (menu !== this.menu) {
        menu.classList.remove('open');
        const instance = menu._dropdownInstance;
        if (instance && instance.trigger) {
          instance.trigger.classList.remove('open');
        }
      }
    });

    // Guardar referencia a esta instancia en el menú
    this.menu._dropdownInstance = this;
  }

  close() {
    this.isOpen = false;
    this.trigger.classList.remove('open');
    this.menu.classList.remove('open');

    // DESBLOQUEAR SCROLL DEL BODY
    // Restaurar el scroll a la posición guardada
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    // Restaurar la posición del scroll
    if (typeof this.savedScrollY !== 'undefined') {
      window.scrollTo(0, this.savedScrollY);
    }

    if (this.searchInput) {
      this.searchInput.value = '';
      this.renderOptions();
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  attachEvents() {
    // Click en trigger
    this.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    // Keyboard navigation
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!this.wrapper.contains(e.target) && !this.menu.contains(e.target)) {
        this.close();
      }
    });

    // Reposicionar menú al hacer scroll
    const repositionMenu = () => {
      if (this.isOpen) {
        const triggerRect = this.trigger.getBoundingClientRect();
        this.menu.style.top = `${triggerRect.bottom + 8}px`;
        this.menu.style.left = `${triggerRect.left}px`;
      }
    };

    window.addEventListener('scroll', repositionMenu, true);
    window.addEventListener('resize', repositionMenu);

    // Guardar para cleanup
    this.repositionMenu = repositionMenu;
  }

  openCustomModal() {
    // CERRAR EL DROPDOWN PRIMERO
    this.close();

    const fieldName = this.select.id === 'category' ? 'categoría' : 'prioridad';
    const iconPlaceholder = this.select.id === 'category' ? '🏷️' : '⭐';

    const modalHTML = `
      <div class="modal-overlay" id="customOptionModal">
        <div class="modal-content custom-option-modal">
          <div class="modal-header">
            <h3>➕ Agregar ${fieldName} personalizada</h3>
            <button class="modal-close" onclick="document.getElementById('customOptionModal').remove()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group-premium">
              <label class="form-label-premium">
                <i class="fas fa-tag"></i>
                Nombre de la ${fieldName}
              </label>
              <input
                type="text"
                id="customOptionName"
                class="form-input-premium"
                placeholder="Ej: ${this.select.id === 'category' ? 'Mascotas' : 'Ocasional'}"
                autofocus
              />
            </div>

            <div class="form-group-premium">
              <label class="form-label-premium">
                <i class="fas fa-icons"></i>
                Icono (emoji)
              </label>
              <input
                type="text"
                id="customOptionIcon"
                class="form-input-premium"
                placeholder="${iconPlaceholder}"
                maxlength="2"
              />
              <small class="form-hint">Opcional: Copia un emoji desde tu teclado</small>
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn-expense-secondary"
              onclick="document.getElementById('customOptionModal').remove()"
            >
              Cancelar
            </button>
            <button
              class="btn-expense-primary"
              id="saveCustomOption"
            >
              <i class="fas fa-check"></i>
              Guardar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Enfocar el input
    setTimeout(() => {
      document.getElementById('customOptionName').focus();
    }, 100);

    // Guardar opción
    document.getElementById('saveCustomOption').addEventListener('click', () => {
      this.saveCustomOption();
    });

    // Enter para guardar
    document.getElementById('customOptionName').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveCustomOption();
      }
    });
  }

  saveCustomOption() {
    const name = document.getElementById('customOptionName').value.trim();
    const icon = document.getElementById('customOptionIcon').value.trim();

    if (!name) {
      alert('Por favor ingresa un nombre');
      return;
    }

    // VERIFICAR SI YA EXISTE (evitar duplicados)
    const existingCustom = this.customOptions.find(
      opt => opt.value.toLowerCase() === name.toLowerCase()
    );

    const existingNative = Array.from(this.select.options).find(
      opt => opt.value.toLowerCase() === name.toLowerCase()
    );

    if (existingCustom || existingNative) {
      alert(`"${name}" ya existe. Por favor elige otro nombre.`);
      return;
    }

    // Crear nueva opción
    const newOption = {
      value: name,
      text: name,
      icon: icon
    };

    // Agregar al array de custom options
    this.customOptions.push(newOption);

    // Guardar en localStorage
    this.saveCustomOptions();

    // Agregar al select nativo (SOLO si no existe)
    const option = document.createElement('option');
    option.value = newOption.value;
    option.textContent = newOption.text;
    if (newOption.icon) {
      option.dataset.icon = newOption.icon;
    }
    this.select.appendChild(option);

    // Renderizar opciones actualizadas
    this.renderOptions();

    // Seleccionar la nueva opción
    this.selectOption(newOption);

    // Cerrar modal
    document.getElementById('customOptionModal').remove();

    // Mostrar toast
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(`${newOption.icon} ${newOption.text} agregado correctamente`, 'success');
    }
  }

  deleteCustomOption(option) {
    if (!confirm(`¿Eliminar "${option.text}"?`)) {
      return;
    }

    // Eliminar del array de custom options
    this.customOptions = this.customOptions.filter(
      opt => opt.value !== option.value
    );

    // Guardar en localStorage
    this.saveCustomOptions();

    // Eliminar del select nativo
    const nativeOption = Array.from(this.select.options).find(
      opt => opt.value === option.value
    );
    if (nativeOption) {
      this.select.removeChild(nativeOption);
    }

    // Si la opción eliminada estaba seleccionada, limpiar selección
    if (this.selectedValue === option.value) {
      this.selectedValue = '';
      this.select.value = '';
      this.updateTriggerText();
    }

    // Renderizar opciones actualizadas
    this.renderOptions();

    // Mostrar toast
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(`${option.icon} ${option.text} eliminado`, 'success');
    }
  }

  loadCustomOptions() {
    const key = `customOptions_${this.select.id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  saveCustomOptions() {
    const key = `customOptions_${this.select.id}`;
    localStorage.setItem(key, JSON.stringify(this.customOptions));
  }

  destroy() {
    this.wrapper.remove();
  }
}

// Sistema de Autocompletado Inteligente
class SmartAutocomplete {
  constructor() {
    this.patterns = this.loadPatterns();
    this.descriptionInput = document.getElementById('description');
    this.categorySelect = document.getElementById('category');
    this.necessitySelect = document.getElementById('necessity');

    if (this.descriptionInput) {
      this.init();
    }
  }

  init() {
    // Escuchar cambios en descripción con debounce
    let timeout;
    this.descriptionInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this.suggest(), 300);
    });

    // Guardar patrón cuando se registra un gasto
    const form = document.getElementById('expenseForm');
    if (form) {
      form.addEventListener('submit', () => this.savePattern());
    }
  }

  suggest() {
    const description = this.descriptionInput.value.trim().toLowerCase();

    if (description.length < 3) return;

    // Buscar patrón coincidente
    const pattern = this.findPattern(description);

    if (pattern) {
      this.applySuggestion(pattern);
    }
  }

  findPattern(description) {
    // Buscar coincidencia exacta primero
    let match = this.patterns.find(p => p.description.toLowerCase() === description);

    if (match) return match;

    // Buscar coincidencia parcial
    match = this.patterns.find(p =>
      p.description.toLowerCase().includes(description) ||
      description.includes(p.description.toLowerCase())
    );

    return match;
  }

  applySuggestion(pattern) {
    // Aplicar sugerencias solo si los campos están vacíos
    if (!this.categorySelect.value && pattern.category) {
      this.categorySelect.value = pattern.category;
      this.highlightField(this.categorySelect, '✨ Autocompletado');
    }

    if (!this.necessitySelect.value && pattern.necessity) {
      this.necessitySelect.value = pattern.necessity;
      this.highlightField(this.necessitySelect, '✨ Autocompletado');
    }
  }

  highlightField(element, message) {
    // Efecto visual de autocompletado
    element.style.background = 'linear-gradient(to right, #dbeafe, #ffffff)';
    element.style.transition = 'background 0.5s ease';

    setTimeout(() => {
      element.style.background = '';
    }, 2000);

    // Mostrar toast sutil
    if (window.app && typeof window.app.showToast === 'function') {
      window.app.showToast(message, 'info');
    }
  }

  savePattern() {
    const description = this.descriptionInput.value.trim();
    const category = this.categorySelect.value;
    const necessity = this.necessitySelect.value;

    if (!description || !category || !necessity) return;

    // Verificar si ya existe el patrón
    const existingIndex = this.patterns.findIndex(
      p => p.description.toLowerCase() === description.toLowerCase()
    );

    const pattern = {
      description: description,
      category: category,
      necessity: necessity,
      count: 1,
      lastUsed: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Actualizar patrón existente
      this.patterns[existingIndex].category = category;
      this.patterns[existingIndex].necessity = necessity;
      this.patterns[existingIndex].count++;
      this.patterns[existingIndex].lastUsed = pattern.lastUsed;
    } else {
      // Agregar nuevo patrón
      this.patterns.push(pattern);
    }

    // Limitar a los 100 patrones más usados
    if (this.patterns.length > 100) {
      this.patterns.sort((a, b) => b.count - a.count);
      this.patterns = this.patterns.slice(0, 100);
    }

    this.savePatterns();
  }

  loadPatterns() {
    const stored = localStorage.getItem('expensePatterns');
    return stored ? JSON.parse(stored) : [];
  }

  savePatterns() {
    localStorage.setItem('expensePatterns', JSON.stringify(this.patterns));
  }

  clearPatterns() {
    this.patterns = [];
    localStorage.removeItem('expensePatterns');
  }
}

// Estilos adicionales para el modal
const modalStyles = `
<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.custom-option-modal {
  background: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}
</style>
`;

// Agregar estilos al documento
if (!document.getElementById('smart-forms-styles')) {
  const styleElement = document.createElement('div');
  styleElement.id = 'smart-forms-styles';
  styleElement.innerHTML = modalStyles;
  document.head.appendChild(styleElement);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Esperar a que app.js se cargue
  setTimeout(() => {
    // Inicializar dropdowns personalizados
    const categorySelect = document.getElementById('category');
    const necessitySelect = document.getElementById('necessity');

    if (categorySelect && !categorySelect.dataset.smartDropdown) {
      new SmartDropdown(categorySelect, {
        placeholder: 'Selecciona categoría',
        addNewText: 'Agregar categoría personalizada'
      });
      categorySelect.dataset.smartDropdown = 'true';
    }

    if (necessitySelect && !necessitySelect.dataset.smartDropdown) {
      new SmartDropdown(necessitySelect, {
        placeholder: 'Nivel de necesidad',
        addNewText: 'Agregar prioridad personalizada'
      });
      necessitySelect.dataset.smartDropdown = 'true';
    }

    // Inicializar autocompletado
    window.smartAutocomplete = new SmartAutocomplete();

    console.log('✅ Smart Forms initialized');
  }, 500);
});

// Exponer clases globalmente
window.SmartDropdown = SmartDropdown;
window.SmartAutocomplete = SmartAutocomplete;
