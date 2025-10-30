/* ============================================
   🆕 NUEVO SISTEMA DE REGISTRO DE GASTOS
   Versión 2.0 - Código limpio y funcional
   Fecha: 2025-10-25
   ============================================ */

(function() {
  'use strict';

  console.log('🆕 Nuevo sistema de registro de gastos cargando...');

  // Esperar a que la app esté lista
  function waitForApp() {
    if (typeof window.app !== 'undefined' && window.app) {
      initNewExpenseSystem();
    } else {
      setTimeout(waitForApp, 100);
    }
  }

  function initNewExpenseSystem() {
    const app = window.app;

    console.log('🆕 Inicializando nuevo sistema de registro de gastos...');

    // ============================================
    // FUNCIÓN 1: INICIALIZAR FORMULARIO
    // ============================================
    app.initNewExpenseForm = function() {
      const form = document.getElementById('expenseForm');
      if (!form) {
        console.warn('⚠️ Formulario de gastos no encontrado');
        return;
      }

      console.log('✅ Inicializando nuevo formulario de gastos');

      // 1. Remover listener viejo si existe
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      // 2. Agregar nuevo listener de submit
      newForm.addEventListener('submit', (e) => {
        e.preventDefault();
        app.submitNewExpense();
      });

      // 3. Botón limpiar
      const btnClear = document.getElementById('clearExpenseForm');
      if (btnClear) {
        btnClear.addEventListener('click', () => app.clearNewExpenseForm());
      }

      // 4. Campo de usuario
      app.setupNewUserField();

      // 5. Formateo de monto
      const amountInput = document.getElementById('amount');
      if (amountInput) {
        amountInput.addEventListener('input', (e) => app.formatAmountInput(e.target));
      }

      // 6. Fecha actual
      app.setupCurrentDate();

      // 7. Autocomplete
      if (window.smartAutoComplete) {
        const descInput = document.getElementById('description');
        if (descInput) {
          descInput.addEventListener('input', () => {
            window.smartAutoComplete.analyzeAndFill();
          });
        }
      }

      // 8. Actualizar stats iniciales
      app.updateFormStats();

      console.log('✅ Nuevo formulario inicializado correctamente');
    };

    // ============================================
    // FUNCIÓN 2: SUBMIT NUEVO GASTO
    // ============================================
    app.submitNewExpense = function() {
      console.log('🆕 submitNewExpense ejecutándose...');

      // 1. Verificar autenticación
      if (!this.currentUser || this.currentUser === 'anonymous' || !this.firebaseUser) {
        console.log('❌ Usuario no autenticado');
        this.showAuthRequiredModal();
        return;
      }

      // 2. Validar formulario
      const validation = this.validateExpenseForm();
      if (!validation.isValid) {
        console.log('❌ Validación fallida:', validation.errors);
        this.showToast(`❌ ${validation.firstError.message}`, 'error');
        return;
      }

      // 3. Obtener valores
      const amountInput = document.getElementById('amount');
      const amount = this.unformatNumber(amountInput.value);
      const description = document.getElementById('description').value.trim();
      const category = document.getElementById('category').value;
      const necessity = document.getElementById('necessity').value;
      const date = document.getElementById('date').value;
      const user = document.getElementById('user').value || 'Sin asignar';
      const items = document.getElementById('items')?.value.trim() || '';
      const notes = document.getElementById('notes')?.value.trim() || '';

      // 4. Crear objeto expense
      const expense = {
        id: Date.now(),
        description,
        amount,
        category,
        necessity,
        date,
        user,
        items,
        notes,
        protected: false,
      };

      console.log('💾 Creando expense:', expense);

      // 5. Agregar al array
      this.expenses.push(expense);

      // 6. Registrar en historial
      this.addToHistory({
        type: 'gasto',
        amount: amount,
        description: description,
        date: date,
        category: category,
        necessity: necessity,
        user: user,
      });

      // 7. Guardar en Firebase y localStorage
      this.updateSpecificField('expenses', this.expenses);
      this.saveData();

      // 8. Actualizar UI
      this.renderDashboard();
      this.renderExpenses();
      this.updateTrendChart();
      if (typeof this.updateLastTransaction === 'function') {
        this.updateLastTransaction();
      }
      if (typeof this.checkAchievements === 'function') {
        this.checkAchievements();
      }
      this.updateFormStats();

      // 9. Toast de éxito
      this.showToast(
        `✅ Gasto de $${amount.toLocaleString()} registrado correctamente`,
        'success'
      );

      // 10. Limpiar formulario
      this.clearNewExpenseForm();

      console.log('✅ Expense registrado exitosamente');
    };

    // ============================================
    // FUNCIÓN 3: CONFIGURAR CAMPO DE USUARIO
    // ============================================
    app.setupNewUserField = function() {
      const userDisplay = document.getElementById('selectedUserField');
      const userSelect = document.getElementById('user');
      const addUserBtn = document.getElementById('addUserBtn');

      if (!userDisplay || !userSelect) {
        console.warn('⚠️ Campos de usuario no encontrados');
        return;
      }

      const openUserSelector = () => {
        if (typeof this.showUserSelectionModal === 'function') {
          this.showUserSelectionModal();
        } else if (typeof window.openSelectModal === 'function') {
          window.openSelectModal('userModal');
        }
      };

      // Click en el campo visual
      userDisplay.addEventListener('click', openUserSelector);

      // Tecla Enter/Space
      userDisplay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openUserSelector();
        }
      });

      // Sincronizar cuando cambia el select oculto
      userSelect.addEventListener('change', () => {
        if (typeof this.updateSelectedUserPreview === 'function') {
          this.updateSelectedUserPreview(userSelect);
        } else {
          const selectedValue = userSelect.value;
          userDisplay.textContent = selectedValue || 'Sin asignar';
          userDisplay.style.color = selectedValue
            ? 'var(--color-primary, #0e2a47)'
            : 'var(--color-text-subtle, #4b5c6b)';
          userDisplay.style.fontWeight = selectedValue ? '600' : '400';
        }
      });

      // Estado inicial
      if (typeof this.updateSelectedUserPreview === 'function') {
        this.updateSelectedUserPreview(userSelect);
      } else {
        const initialValue = userSelect.value;
        userDisplay.textContent = initialValue || 'Sin asignar';
        userDisplay.style.color = initialValue
          ? 'var(--color-primary, #0e2a47)'
          : 'var(--color-text-subtle, #4b5c6b)';
        userDisplay.style.fontWeight = initialValue ? '600' : '400';
      }

      // Botón agregar usuario
      if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
          if (typeof window.openSelectModal === 'function') {
            window.openSelectModal('addUserModal');
          } else if (typeof window.openCustomModal === 'function') {
            window.openCustomModal('addUserModal');
          }
        });
      }

      console.log('✅ Campo de usuario configurado');
    };

    // ============================================
    // FUNCIÓN 4: LIMPIAR FORMULARIO
    // ============================================
    app.clearNewExpenseForm = function() {
      const form = document.getElementById('expenseForm');
      if (!form) return;

      // Resetear formulario
      form.reset();

      // Restaurar fecha actual
      this.setupCurrentDate();

      // Limpiar campo visual de usuario
      const userSelect = document.getElementById('user');
      const userDisplay = document.getElementById('selectedUserField');
      if (typeof this.updateSelectedUserPreview === 'function') {
        this.updateSelectedUserPreview(userSelect || undefined);
      } else if (userDisplay) {
        userDisplay.textContent = 'Sin asignar';
        userDisplay.style.color = 'var(--color-text-subtle, #4b5c6b)';
        userDisplay.style.fontWeight = '400';
      }

      // Remover clases de error
      const errorFields = form.querySelectorAll('.field-error');
      errorFields.forEach(field => field.classList.remove('field-error'));

      const errorMessages = form.querySelectorAll('.field-error-message');
      errorMessages.forEach(msg => msg.remove());

      // Remover clases de IA
      const aiFields = form.querySelectorAll('.field-filled-by-ai');
      aiFields.forEach(field => field.classList.remove('field-filled-by-ai'));

      // Focus en monto
      const amountInput = document.getElementById('amount');
      if (amountInput) {
        setTimeout(() => amountInput.focus(), 100);
      }

      this.showToast('Formulario limpiado', 'info');
      console.log('✅ Formulario limpiado');
    };

    // ============================================
    // FUNCIÓN 5: ACTUALIZAR ESTADÍSTICAS
    // ============================================
    app.updateFormStats = function() {
      if (!this.expenses || !Array.isArray(this.expenses)) {
        console.warn('⚠️ No hay expenses para calcular stats');
        return;
      }

      // Gastos de hoy
      const today = new Date().toISOString().split('T')[0];
      const todayExpenses = this.expenses.filter(e => e.date === today);
      const todayCount = todayExpenses.length;
      const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Gastos del mes actual
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthExpenses = this.expenses.filter(e => e.date && e.date.startsWith(currentMonth));
      const monthTotal = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Actualizar DOM
      const todayCountEl = document.getElementById('todayExpensesCount');
      const todayTotalEl = document.getElementById('todayExpensesTotal');
      const monthTotalEl = document.getElementById('monthExpensesTotal');

      if (todayCountEl) todayCountEl.textContent = todayCount;
      if (todayTotalEl) todayTotalEl.textContent = `$${todayTotal.toLocaleString()}`;
      if (monthTotalEl) monthTotalEl.textContent = `$${monthTotal.toLocaleString()}`;

      console.log('📊 Stats actualizados:', { todayCount, todayTotal, monthTotal });
    };

    // ============================================
    // INICIALIZAR AUTOMÁTICAMENTE
    // ============================================
    app.initNewExpenseForm();

    console.log('✅ Nuevo sistema de registro de gastos LISTO');
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForApp);
  } else {
    waitForApp();
  }

})();
