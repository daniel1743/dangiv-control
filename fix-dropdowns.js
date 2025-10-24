// FIX TEMPORAL: Forzar creación de triggers para dropdowns
// Ejecuta este script después de que la página cargue

console.log('🔧 Iniciando fix de dropdowns...');

// Esperar a que el DOM esté completamente cargado
function initDropdownFix() {
  console.log('📦 Verificando elementos...');

  // Verificar que los elementos existan
  const categorySelect = document.getElementById('category');
  const necessitySelect = document.getElementById('necessity');
  const categoryContainer = document.getElementById('categoryTriggerContainer');
  const necessityContainer = document.getElementById('necessityTriggerContainer');

  console.log('Category Select:', categorySelect);
  console.log('Necessity Select:', necessitySelect);
  console.log('Category Container:', categoryContainer);
  console.log('Necessity Container:', necessityContainer);

  if (!categorySelect || !necessitySelect || !categoryContainer || !necessityContainer) {
    console.error('❌ Algunos elementos no se encontraron');
    return;
  }

  // Función para crear un trigger manualmente
  function createTrigger(select, modalId, placeholder, icon) {
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'modal-trigger-select';
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

    function updateText() {
      const value = select.value;
      const selectedOption = select.querySelector(`option[value="${value}"]`);
      const text = selectedOption && value ? selectedOption.textContent : placeholder;

      trigger.innerHTML = `
        <span style="flex: 1; ${!value ? 'color: #9ca3af;' : ''}">${text}</span>
        <i class="fas fa-chevron-down" style="color: #6b7280; margin-left: 8px;"></i>
      `;
    }

    updateText();

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
      this.style.borderColor = '#00c2ff';
    });

    trigger.addEventListener('mouseleave', function() {
      this.style.borderColor = '#e5e7eb';
    });

    // Actualizar cuando cambie el select
    select.addEventListener('change', updateText);

    return trigger;
  }

  // Limpiar contenedores
  categoryContainer.innerHTML = '';
  necessityContainer.innerHTML = '';

  // Crear triggers
  const categoryTrigger = createTrigger(
    categorySelect,
    'categoryModal',
    '🏷️ Selecciona una categoría',
    'fa-tag'
  );

  const necessityTrigger = createTrigger(
    necessitySelect,
    'necessityModal',
    '⭐ Selecciona nivel de necesidad',
    'fa-chart-line'
  );

  // Agregar triggers a los contenedores
  categoryContainer.appendChild(categoryTrigger);
  necessityContainer.appendChild(necessityTrigger);

  console.log('✅ Triggers creados exitosamente');
  console.log('Category Trigger:', categoryTrigger);
  console.log('Necessity Trigger:', necessityTrigger);

  // Verificar que las funciones globales existan
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

// También ejecutar después de un pequeño delay para asegurarse
setTimeout(initDropdownFix, 1000);
setTimeout(initDropdownFix, 2000);

console.log('✅ Fix de dropdowns cargado');
