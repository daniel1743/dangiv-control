// ═══════════════════════════════════════════════════════════
// NUEVO SISTEMA DE FORMULARIO DE GASTOS - SIMPLE Y FUNCIONAL
// Carga automáticamente al iniciar la app
// ═══════════════════════════════════════════════════════════

console.log('📝 Inicializando nuevo formulario de gastos...');

function initNewExpenseForm() {
  // Establecer fecha actual por defecto
  const dateInput = document.getElementById('date');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    console.log('📅 Fecha establecida:', today);
  }

  // Establecer usuario por defecto si existe
  const userSelect = document.getElementById('user');
  if (userSelect && window.app && window.app.userProfile) {
    const userName = window.app.userProfile.name;
    console.log('🔍 Intentando establecer usuario:', userName);

    if (userName && userName !== 'Usuario') {
      // Buscar si existe una opción con ese nombre
      let userOption = Array.from(userSelect.options).find(
        (opt) => opt.value.toLowerCase() === userName.toLowerCase()
      );

      // Si no existe, crear la opción automáticamente
      if (!userOption) {
        console.log('➕ Agregando usuario personalizado:', userName);
        const newOption = document.createElement('option');
        newOption.value = userName;
        newOption.textContent = `👤 ${userName}`;
        userSelect.appendChild(newOption);
        userOption = newOption;
      }

      // Establecer el valor seleccionado
      userSelect.value = userOption.value;
      console.log('✅ Usuario establecido:', userOption.value);

      // Trigger change event para feedback visual
      userSelect.dispatchEvent(new Event('change'));
    }
  }

  // Mejorar UX de los selects
  const selects = document.querySelectorAll('.form-select-premium');
  selects.forEach((select) => {
    // Evento change para feedback visual
    select.addEventListener('change', function () {
      if (this.value) {
        this.style.borderColor = '#10b981';
        this.style.backgroundColor = '#f0fdf4';
        console.log(`✅ ${this.id} seleccionado:`, this.value);
      } else {
        this.style.borderColor = '';
        this.style.backgroundColor = '';
      }
    });

    // Touch/click feedback
    select.addEventListener('focus', function () {
      this.style.borderColor = '#00c2ff';
      this.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
    });

    select.addEventListener('blur', function () {
      if (!this.value) {
        this.style.boxShadow = '';
      }
    });
  });

  // Validación mejorada del formulario
  const form = document.getElementById('expenseForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      console.log('📤 Formulario enviado');

      // Validar que todos los campos requeridos estén llenos
      const amount = document.getElementById('amount').value;
      const description = document.getElementById('description').value;
      const category = document.getElementById('category').value;
      const necessity = document.getElementById('necessity').value;
      const date = document.getElementById('date').value;

      if (!amount || !description || !category || !necessity || !date) {
        e.preventDefault();
        console.error('❌ Faltan campos obligatorios');

        if (window.app && window.app.showToast) {
          window.app.showToast(
            'Por favor completa todos los campos obligatorios',
            'error'
          );
        } else {
          alert('Por favor completa todos los campos obligatorios');
        }
        return false;
      }

      console.log('✅ Todos los campos válidos');
      console.log('Datos del gasto:', {
        amount,
        description,
        category,
        necessity,
        date,
        user: document.getElementById('user').value,
      });

      // El formulario se enviará normalmente y app.js lo procesará
    });
  }

  console.log('✅ Nuevo formulario de gastos inicializado correctamente');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewExpenseForm);
} else {
  initNewExpenseForm();
}

// También ejecutar después de un delay para asegurar que todo esté cargado
setTimeout(initNewExpenseForm, 1000);
setTimeout(initNewExpenseForm, 2000);

// Exponer función globalmente por si se necesita reinicializar
window.initNewExpenseForm = initNewExpenseForm;

console.log('✅ Script de nuevo formulario cargado');
