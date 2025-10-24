// ═══════════════════════════════════════════════════════════
// NUEVO SISTEMA DE GASTOS CON PERSONALIZACIÓN
// Inicializa el sistema de formulario mejorado con opciones personalizables
// Compatible con app.js existente
// ═══════════════════════════════════════════════════════════

console.log('📝 Inicializando nuevo sistema de gastos con personalización...');

(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // CONFIGURACIÓN Y DATOS PERSISTENTES
  // ═══════════════════════════════════════════════════════════

  const STORAGE_KEY_CATEGORIES = 'customCategories';
  const STORAGE_KEY_NECESSITIES = 'customNecessities';
  const STORAGE_KEY_USERS = 'customUsers';

  // Cargar opciones personalizadas del localStorage
  let customCategories = JSON.parse(localStorage.getItem(STORAGE_KEY_CATEGORIES) || '[]');
  let customNecessities = JSON.parse(localStorage.getItem(STORAGE_KEY_NECESSITIES) || '[]');
  let customUsers = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || '[]');

  // ═══════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════

  function initNewExpenseSystem() {
    console.log('🚀 Inicializando sistema de gastos...');

    // Establecer fecha actual
    setupCurrentDate();

    // Establecer usuario actual si está logueado
    setupCurrentUser();

    // Poblar selects con opciones personalizadas
    populateCustomOptions();

    // Configurar eventos de los botones "Añadir"
    setupAddButtons();

    // Configurar eventos de los selects
    setupSelectEvents();

    // Configurar evento de limpieza del formulario
    setupClearButton();

    // Configurar cierre de modales con overlay
    setupModalOverlays();

    console.log('✅ Sistema de gastos inicializado correctamente');
  }

  // ═══════════════════════════════════════════════════════════
  // CONFIGURACIÓN INICIAL
  // ═══════════════════════════════════════════════════════════

  function setupCurrentDate() {
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.value) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      console.log('📅 Fecha establecida:', today);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // SISTEMA COMPLETAMENTE NUEVO PARA SELECT DE USUARIO
  // ═══════════════════════════════════════════════════════════

  function setupCurrentUser() {
    const userSelect = document.getElementById('user');
    if (!userSelect) {
      console.error('❌ Select de usuario NO encontrado');
      return;
    }

    console.log('🔍 Configurando select de usuario...');
    console.log('📊 Estado inicial:', {
      value: userSelect.value,
      options: userSelect.options.length,
      display: userSelect.style.display,
      opacity: userSelect.style.opacity
    });

    // FUNCIÓN PARA FORZAR VISIBILIDAD ABSOLUTA
    function forceVisible() {
      userSelect.style.display = 'block';
      userSelect.style.visibility = 'visible';
      userSelect.style.position = 'relative';
      userSelect.style.opacity = '1';
      userSelect.style.pointerEvents = 'auto';
      userSelect.style.zIndex = '1';

      // Remover cualquier clase que pueda ocultar
      userSelect.classList.remove('hidden', 'hide', 'invisible');

      // Asegurar que el contenedor también sea visible
      const container = userSelect.closest('.select-with-add');
      if (container) {
        container.style.display = 'flex';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
      }
    }

    // APLICAR VISIBILIDAD INMEDIATAMENTE
    forceVisible();

    // PROTECCIÓN CON MUTATIONOBSERVER
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes') {
          const currentOpacity = userSelect.style.opacity;
          const currentDisplay = userSelect.style.display;

          if (currentOpacity === '0' || currentDisplay === 'none' || currentDisplay === '') {
            console.warn('⚠️ Intento de ocultar select detectado - REVERTIENDO');
            forceVisible();
          }
        }
      });
    });

    // Observar cambios en style, class, y atributos
    observer.observe(userSelect, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // EVENTO CHANGE CON CONFIRMACIÓN VISUAL
    userSelect.addEventListener('change', function() {
      const selectedValue = this.value;
      const selectedText = this.options[this.selectedIndex].text;

      console.log('👤 USUARIO SELECCIONADO:');
      console.log('  - Valor:', selectedValue);
      console.log('  - Texto visible:', selectedText);

      // Feedback visual
      this.style.borderColor = '#10b981';
      this.style.backgroundColor = '#f0fdf4';

      // Verificar que el valor se guardó
      setTimeout(() => {
        if (this.value === selectedValue) {
          console.log('✅ Valor confirmado después de 100ms:', this.value);
        } else {
          console.error('❌ Valor cambió después de selección!', this.value);
        }
      }, 100);
    });

    // AUTO-SELECCIONAR USUARIO SI ESTÁ LOGUEADO
    if (window.app && window.app.userProfile) {
      const userName = window.app.userProfile.name;
      if (userName && userName !== 'Usuario' && userName !== 'anonymous') {
        const userOption = Array.from(userSelect.options).find(
          opt => opt.value.toLowerCase() === userName.toLowerCase()
        );
        if (userOption) {
          userSelect.value = userOption.value;
          userSelect.style.borderColor = '#10b981';
          userSelect.style.backgroundColor = '#f0fdf4';
          console.log('👤 Usuario auto-establecido:', userOption.value);
        }
      }
    }

    // VERIFICACIÓN CONTINUA CADA 500ms (solo las primeras 10 veces)
    let verificationCount = 0;
    const verificationInterval = setInterval(() => {
      forceVisible();
      verificationCount++;

      if (verificationCount >= 10) {
        clearInterval(verificationInterval);
        console.log('✅ Verificación de visibilidad completada');
      }
    }, 500);

    console.log('✅ Select de usuario configurado y protegido');
    console.log('📊 Estado final:', {
      value: userSelect.value,
      visible: userSelect.style.opacity === '1',
      display: userSelect.style.display
    });
  }

  // ═══════════════════════════════════════════════════════════
  // POBLAR SELECTS CON OPCIONES PERSONALIZADAS
  // ═══════════════════════════════════════════════════════════

  function populateCustomOptions() {
    populateCustomCategories();
    populateCustomNecessities();
    populateCustomUsers();
  }

  function populateCustomCategories() {
    const categorySelect = document.getElementById('category');
    if (!categorySelect) return;

    // Agregar categorías personalizadas
    customCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.name;
      option.textContent = `${cat.icon} ${cat.name}`;
      option.className = 'custom-category-option';
      categorySelect.appendChild(option);
    });

    console.log(`✅ ${customCategories.length} categorías personalizadas cargadas`);
  }

  function populateCustomNecessities() {
    const necessitySelect = document.getElementById('necessity');
    if (!necessitySelect) return;

    // Agregar necesidades personalizadas
    customNecessities.forEach(nec => {
      const option = document.createElement('option');
      option.value = nec.name;
      option.textContent = `${nec.icon} ${nec.name}`;
      option.className = 'custom-necessity-option';
      necessitySelect.appendChild(option);
    });

    console.log(`✅ ${customNecessities.length} niveles de necesidad personalizados cargados`);
  }

  function populateCustomUsers() {
    const userSelect = document.getElementById('user');
    if (!userSelect) return;

    // Agregar usuarios personalizados
    customUsers.forEach(user => {
      const option = document.createElement('option');
      option.value = user.name;
      option.textContent = `${user.icon} ${user.name}`;
      option.className = 'custom-user-option';
      userSelect.appendChild(option);
    });

    console.log(`✅ ${customUsers.length} usuarios personalizados cargados`);
  }

  // ═══════════════════════════════════════════════════════════
  // CONFIGURAR BOTONES "AÑADIR"
  // ═══════════════════════════════════════════════════════════

  function setupAddButtons() {
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addNecessityBtn = document.getElementById('addNecessityBtn');
    const addUserBtn = document.getElementById('addUserBtn');

    if (addCategoryBtn) {
      addCategoryBtn.addEventListener('click', () => openCustomModal('addCategoryModal'));
    }

    if (addNecessityBtn) {
      addNecessityBtn.addEventListener('click', () => openCustomModal('addNecessityModal'));
    }

    if (addUserBtn) {
      addUserBtn.addEventListener('click', () => openCustomModal('addUserModal'));
    }

    console.log('✅ Botones de añadir configurados');
  }

  // ═══════════════════════════════════════════════════════════
  // CONFIGURAR EVENTOS DE SELECTS
  // ═══════════════════════════════════════════════════════════

  function setupSelectEvents() {
    const selects = document.querySelectorAll('.form-select-native');

    selects.forEach(select => {
      // Feedback visual al seleccionar
      select.addEventListener('change', function() {
        if (this.value) {
          this.classList.remove('error');
          this.classList.add('success');
          console.log(`✅ ${this.id} seleccionado:`, this.value);
        } else {
          this.classList.remove('success');
        }
      });

      // Focus feedback
      select.addEventListener('focus', function() {
        this.style.transform = 'scale(1.01)';
      });

      select.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
      });
    });

    console.log('✅ Eventos de selects configurados');
  }

  // ═══════════════════════════════════════════════════════════
  // GESTIÓN DE MODALES
  // ═══════════════════════════════════════════════════════════

  function openCustomModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error('❌ Modal no encontrado:', modalId);
      return;
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Enfocar el primer input
    setTimeout(() => {
      const firstInput = modal.querySelector('input[type="text"]');
      if (firstInput) firstInput.focus();
    }, 100);

    console.log('📂 Modal abierto:', modalId);
  }

  function closeCustomModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    document.body.style.overflow = '';

    // Limpiar inputs
    modal.querySelectorAll('input[type="text"]').forEach(input => {
      input.value = '';
    });

    console.log('🚪 Modal cerrado:', modalId);
  }

  function setupModalOverlays() {
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function() {
        const modal = this.closest('.custom-modal');
        if (modal) {
          closeCustomModal(modal.id);
        }
      });
    });

    console.log('✅ Overlays de modales configurados');
  }

  // ═══════════════════════════════════════════════════════════
  // GUARDAR NUEVAS OPCIONES
  // ═══════════════════════════════════════════════════════════

  function saveNewCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const iconInput = document.getElementById('newCategoryIconForm') || document.getElementById('newCategoryIcon');

    const name = nameInput.value.trim();
    const icon = iconInput.value.trim() || '📦';

    if (!name) {
      showNotification('Por favor ingresa un nombre para la categoría', 'error');
      nameInput.focus();
      return;
    }

    // Verificar si ya existe
    const exists = customCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      showNotification('Ya existe una categoría con ese nombre', 'error');
      nameInput.focus();
      return;
    }

    // Agregar nueva categoría
    const newCategory = { name, icon };
    customCategories.push(newCategory);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(customCategories));

    // Agregar al select
    const categorySelect = document.getElementById('category');
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${icon} ${name}`;
    option.className = 'custom-category-option';
    categorySelect.appendChild(option);

    // Seleccionar la nueva categoría
    categorySelect.value = name;
    categorySelect.dispatchEvent(new Event('change'));

    closeCustomModal('addCategoryModal');
    showNotification(`✅ Categoría "${name}" añadida correctamente`, 'success');

    console.log('✅ Nueva categoría guardada:', newCategory);
  }

  function saveNewNecessity() {
    const nameInput = document.getElementById('newNecessityName');
    const iconInput = document.getElementById('newNecessityIcon');

    const name = nameInput.value.trim();
    const icon = iconInput.value.trim() || '⭐';

    if (!name) {
      showNotification('Por favor ingresa un nombre para el nivel de necesidad', 'error');
      nameInput.focus();
      return;
    }

    // Verificar si ya existe
    const exists = customNecessities.some(nec => nec.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      showNotification('Ya existe un nivel de necesidad con ese nombre', 'error');
      nameInput.focus();
      return;
    }

    // Agregar nueva necesidad
    const newNecessity = { name, icon };
    customNecessities.push(newNecessity);
    localStorage.setItem(STORAGE_KEY_NECESSITIES, JSON.stringify(customNecessities));

    // Agregar al select
    const necessitySelect = document.getElementById('necessity');
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${icon} ${name}`;
    option.className = 'custom-necessity-option';
    necessitySelect.appendChild(option);

    // Seleccionar la nueva necesidad
    necessitySelect.value = name;
    necessitySelect.dispatchEvent(new Event('change'));

    closeCustomModal('addNecessityModal');
    showNotification(`✅ Nivel de necesidad "${name}" añadido correctamente`, 'success');

    console.log('✅ Nueva necesidad guardada:', newNecessity);
  }

  function saveNewUser() {
    const nameInput = document.getElementById('newUserName');
    const iconInput = document.getElementById('newUserIcon');

    const name = nameInput.value.trim();
    const icon = iconInput.value.trim() || '👤';

    if (!name) {
      showNotification('Por favor ingresa un nombre para el usuario', 'error');
      nameInput.focus();
      return;
    }

    // Verificar si ya existe
    const exists = customUsers.some(user => user.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      showNotification('Ya existe un usuario con ese nombre', 'error');
      nameInput.focus();
      return;
    }

    // Agregar nuevo usuario
    const newUser = { name, icon };
    customUsers.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(customUsers));

    // Agregar al select
    const userSelect = document.getElementById('user');
    const option = document.createElement('option');
    option.value = name;
    option.textContent = `${icon} ${name}`;
    option.className = 'custom-user-option';
    userSelect.appendChild(option);

    // Seleccionar el nuevo usuario
    userSelect.value = name;
    userSelect.dispatchEvent(new Event('change'));
    if (window.app && typeof window.app.updateSelectedUserPreview === 'function') {
      window.app.updateSelectedUserPreview(userSelect);
    }

    closeCustomModal('addUserModal');
    showNotification(`✅ Usuario "${name}" añadido correctamente`, 'success');

    console.log('✅ Nuevo usuario guardado:', newUser);
  }

  // ═══════════════════════════════════════════════════════════
  // SELECTOR DE EMOJIS
  // ═══════════════════════════════════════════════════════════

  function selectEmoji(inputId, emoji) {
    const input = document.getElementById(inputId);
    if (input) {
      input.value = emoji;
      input.dispatchEvent(new Event('input'));
    }
  }

  // ═══════════════════════════════════════════════════════════
  // NOTIFICACIONES
  // ═══════════════════════════════════════════════════════════

  function showNotification(message, type = 'info') {
    // Intentar usar el sistema de toast de app.js si existe
    if (window.app && window.app.showToast) {
      window.app.showToast(message, type);
    } else {
      // Fallback a alert nativo
      alert(message);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // BOTÓN LIMPIAR FORMULARIO
  // ═══════════════════════════════════════════════════════════

  function setupClearButton() {
    const clearBtn = document.getElementById('clearExpenseForm');
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        const form = document.getElementById('expenseForm');
        if (form) {
          form.reset();
          setupCurrentDate();

          // Limpiar clases de validación
          document.querySelectorAll('.form-select-native').forEach(select => {
            select.classList.remove('success', 'error');
          });

          console.log('🧹 Formulario limpiado');
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // VALIDACIÓN DEL FORMULARIO
  // ═══════════════════════════════════════════════════════════

  function setupFormValidation() {
    const form = document.getElementById('expenseForm');
    if (!form) return;

    // IMPORTANTE: Interceptar submit ANTES que app.js para asegurar valor correcto
    form.addEventListener('submit', function(e) {
      console.log('📤 Formulario de gasto enviado');

      // Validar campos requeridos
      const amountInput = document.getElementById('amount');
      const amount = amountInput.value;
      const description = document.getElementById('description').value;
      const category = document.getElementById('category').value;
      const necessity = document.getElementById('necessity').value;
      const date = document.getElementById('date').value;

      if (!amount || !description || !category || !necessity || !date) {
        e.preventDefault();
        console.error('❌ Faltan campos obligatorios');

        // Marcar campos vacíos
        [document.getElementById('category'), document.getElementById('necessity')].forEach(select => {
          if (!select.value) {
            select.classList.add('error');
          }
        });

        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return false;
      }

      // CRÍTICO: El valor YA está limpio (solo dígitos) gracias a setupAmountInputFix
      // Solo convertir a número para validar
      const cleanAmount = parseInt(amount) || 0;

      if (cleanAmount <= 0) {
        e.preventDefault();
        console.error('❌ Monto inválido:', cleanAmount);
        showNotification('El monto debe ser mayor a 0', 'error');
        return false;
      }

      // NO modificar el valor del input - mantenerlo exactamente como está
      console.log('✅ Todos los campos válidos');
      console.log('💰 Monto a guardar:', amount, '(valor numérico:', cleanAmount, ')');
      console.log('Datos del gasto:', {
        amount: cleanAmount,
        description,
        category,
        necessity,
        date,
        user: document.getElementById('user').value
      });

      // El formulario se enviará normalmente y app.js lo procesará con el valor correcto
    }, true); // useCapture = true para ejecutar ANTES que app.js
  }

  // ═══════════════════════════════════════════════════════════
  // CAMPO DE MONTO COMPLETAMENTE NUEVO Y SIMPLE
  // ═══════════════════════════════════════════════════════════

  function setupAmountInputFix() {
    const amountInput = document.getElementById('amount');
    if (!amountInput) return;

    // SOLO permitir dígitos - nada más
    amountInput.addEventListener('input', function(e) {
      // Guardar la posición del cursor
      const cursorPos = e.target.selectionStart;
      const oldLength = e.target.value.length;

      // Remover TODO excepto números
      let value = e.target.value.replace(/\D/g, '');

      // Actualizar el campo
      e.target.value = value;

      // Restaurar posición del cursor
      const newLength = value.length;
      const diff = newLength - oldLength;
      e.target.setSelectionRange(cursorPos + diff, cursorPos + diff);
    });

    // No hacer nada en blur - mantener el valor tal cual
    amountInput.addEventListener('blur', function(e) {
      const value = e.target.value.trim();
      if (value === '') {
        e.target.value = '';
      } else {
        // Solo asegurar que sea número
        e.target.value = value.replace(/\D/g, '');
      }
    });

    console.log('✅ Campo de monto configurado (solo dígitos 0-9)');
  }

  // ═══════════════════════════════════════════════════════════
  // SOPORTE DE TECLADO (ACCESIBILIDAD)
  // ═══════════════════════════════════════════════════════════

  function setupKeyboardSupport() {
    // Cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.custom-modal.show');
        if (openModal) {
          closeCustomModal(openModal.id);
        }
      }
    });

    console.log('⌨️ Soporte de teclado configurado');
  }

  // ═══════════════════════════════════════════════════════════
  // EXPONER FUNCIONES GLOBALMENTE
  // ═══════════════════════════════════════════════════════════

  window.openCustomModal = openCustomModal;
  window.closeCustomModal = closeCustomModal;
  window.saveNewCategory = saveNewCategory;
  window.saveNewNecessity = saveNewNecessity;
  window.saveNewUser = saveNewUser;
  window.selectEmoji = selectEmoji;
  window.initNewExpenseSystem = initNewExpenseSystem;

  // ═══════════════════════════════════════════════════════════
  // EJECUTAR INICIALIZACIÓN
  // ═══════════════════════════════════════════════════════════

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initNewExpenseSystem();
      setupFormValidation();
      setupKeyboardSupport();
      setupAmountInputFix();
    });
  } else {
    initNewExpenseSystem();
    setupFormValidation();
    setupKeyboardSupport();
    setupAmountInputFix();
  }

  // También ejecutar después de un delay para asegurar que todo esté cargado
  setTimeout(() => {
    initNewExpenseSystem();
    setupAmountInputFix();
  }, 1000);

  console.log('✅ Script de nuevo sistema de gastos cargado');

})();