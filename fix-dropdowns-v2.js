// FIX MEJORADO: Forzar creación y actualización de triggers para dropdowns
// Versión 2.0 - Soluciona el problema de actualización visual

console.log('🔧 Iniciando fix de dropdowns v2.0...');

// Esperar a que el DOM esté completamente cargado
function initDropdownFix() {
  console.log('📦 Verificando elementos...');

  // Verificar que los elementos existan
  const categorySelect = document.getElementById('category');
  const necessitySelect = document.getElementById('necessity');
  const categoryContainer = document.getElementById('categoryTriggerContainer');
  const necessityContainer = document.getElementById('necessityTriggerContainer');

  if (!categorySelect || !necessitySelect || !categoryContainer || !necessityContainer) {
    console.error('❌ Algunos elementos no se encontraron');
    return;
  }

  console.log('✅ Todos los elementos encontrados');

  // Función para crear un trigger manualmente
  function createTrigger(select, modalId, placeholder) {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'modal-trigger-select';
    trigger.dataset.selectId = select.id;
    trigger.dataset.modalId = modalId;

    trigger.style.cssText = `
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 16px;
      background: #ffffff;
      color: #1f2937;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s ease;
      min-height: 48px;
      text-align: left;
    `;

    // Función para actualizar el texto del trigger
    function updateText() {
      const value = select.value;
      const selectedOption = select.querySelector(`option[value="${value}"]`);
      const text = selectedOption && value ? selectedOption.textContent : placeholder;

      const isPlaceholder = !value;

      trigger.innerHTML = `
        <span style="flex: 1; ${isPlaceholder ? 'color: #9ca3af;' : 'color: #1f2937; font-weight: 500;'}">${text}</span>
        <i class="fas fa-chevron-down" style="color: #6b7280; margin-left: 8px;"></i>
      `;

      console.log(`🔄 Trigger actualizado - ${select.id}: "${text}" (value: ${value})`);
    }

    // Actualizar inicialmente
    updateText();

    // Click para abrir modal
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`🔵 Abriendo modal: ${modalId}`);

      if (typeof window.openSelectModal === 'function') {
        window.openSelectModal(modalId, select.value);
      } else {
        console.error('❌ window.openSelectModal no está definido');
      }
    });

    // Efectos visuales
    trigger.addEventListener('mouseenter', function() {
      this.style.borderColor = '#14b8a6';
      this.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
    });

    trigger.addEventListener('mouseleave', function() {
      this.style.borderColor = '#e5e7eb';
      this.style.boxShadow = 'none';
    });

    // CRÍTICO: Actualizar cuando cambie el select
    select.addEventListener('change', function() {
      console.log(`📢 Evento change disparado en ${select.id}`);
      // Pequeño delay para asegurar que el valor se actualizó
      setTimeout(updateText, 50);
    });

    // ADICIONAL: Observar cambios directos en el DOM
    const observer = new MutationObserver(function(mutations) {
      console.log(`👁️ MutationObserver detectó cambio en ${select.id}`);
      updateText();
    });

    observer.observe(select, {
      attributes: true,
      attributeFilter: ['value'],
      childList: true,
      subtree: true
    });

    // ADICIONAL: Polling cada segundo para forzar sincronización
    let lastValue = select.value;
    setInterval(function() {
      if (select.value !== lastValue) {
        console.log(`⏰ Polling detectó cambio: ${lastValue} → ${select.value}`);
        lastValue = select.value;
        updateText();
      }
    }, 500);

    return trigger;
  }

  // Limpiar contenedores
  categoryContainer.innerHTML = '';
  necessityContainer.innerHTML = '';

  console.log('🧹 Contenedores limpiados');

  // Crear triggers
  const categoryTrigger = createTrigger(
    categorySelect,
    'categoryModal',
    '🏷️ Selecciona una categoría'
  );

  const necessityTrigger = createTrigger(
    necessitySelect,
    'necessityModal',
    '⭐ Selecciona nivel de necesidad'
  );

  // Agregar triggers a los contenedores
  categoryContainer.appendChild(categoryTrigger);
  necessityContainer.appendChild(necessityTrigger);

  console.log('✅ Triggers creados y agregados exitosamente');
  console.log('   - Category Trigger:', categoryTrigger);
  console.log('   - Necessity Trigger:', necessityTrigger);

  // IMPORTANTE: Forzar actualización después de que se cierren los modales
  const originalCloseModal = window.closeSelectModal;
  if (typeof originalCloseModal === 'function') {
    window.closeSelectModal = function(modalId) {
      console.log(`🔒 Cerrando modal: ${modalId}`);

      // Llamar a la función original
      originalCloseModal(modalId);

      // Forzar actualización de triggers después de cerrar
      setTimeout(function() {
        console.log('🔄 Forzando actualización de triggers después de cerrar modal');

        // Disparar evento change manualmente
        if (modalId === 'categoryModal' && categorySelect) {
          const event = new Event('change', { bubbles: true });
          categorySelect.dispatchEvent(event);
        }
        if (modalId === 'necessityModal' && necessitySelect) {
          const event = new Event('change', { bubbles: true });
          necessitySelect.dispatchEvent(event);
        }
      }, 100);
    };

    console.log('✅ closeSelectModal interceptado para forzar actualizaciones');
  }

  // Verificar funciones globales
  console.log('🔍 Verificando funciones globales:');
  console.log('  - openSelectModal:', typeof window.openSelectModal);
  console.log('  - closeSelectModal:', typeof window.closeSelectModal);
  console.log('  - handleModalOptionClick:', typeof window.handleModalOptionClick);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDropdownFix);
} else {
  initDropdownFix();
}

// También ejecutar después de delays
setTimeout(initDropdownFix, 1000);
setTimeout(initDropdownFix, 2000);

console.log('✅ Fix de dropdowns v2.0 cargado');
