/* ============================================
   SISTEMA DE GASTOS PREMIUM 2025
   Versión mejorada con UX/UI optimizada
   ============================================ */

(function() {
  'use strict';

  console.log('🚀 Sistema de gastos premium cargando...');

  // Esperar a que la app esté lista
  function waitForApp() {
    if (typeof window.app !== 'undefined' && window.app) {
      initPremiumExpenseSystem();
    } else {
      setTimeout(waitForApp, 100);
    }
  }

  function initPremiumExpenseSystem() {
    const app = window.app;

    console.log('✨ Inicializando sistema premium de gastos...');

    // ============================================
    // INICIALIZACIÓN DEL FORMULARIO
    // ============================================
    app.initNewExpenseForm = function() {
      const form = document.getElementById('expenseForm');
      if (!form) {
        console.warn('⚠️ Formulario de gastos no encontrado');
        return;
      }

      console.log('📝 Inicializando formulario premium');

      // Remover listener viejo si existe
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);

      // Nuevo listener de submit
      newForm.addEventListener('submit', (e) => {
        e.preventDefault();
        app.submitNewExpense();
      });

      // Configurar campos opcionales colapsables
      setupOptionalFields();

      // Configurar shortcuts de teclado
      setupKeyboardShortcuts();

      // Configurar autocompletado mejorado
      setupSmartAutocomplete();

      // Configurar sugerencias de monto
      setupAmountSuggestions();

      // Configurar botones de acción rápida
      setupQuickActions();

      // Configurar filtros y búsqueda del historial
      setupHistoryFilters();

      // Configurar botones de añadir personalizados
      bindCustomAddButtons();

      // Configurar estado de selects
      ['category', 'necessity'].forEach((id) =>
        bindSelectState(document.getElementById(id))
      );

      // Campo de usuario
      app.setupNewUserField();
      if (typeof app.updateUserSelectionDropdown === 'function') {
        app.updateUserSelectionDropdown();
      }

      // Formateo de monto
      const amountInput = document.getElementById('amount');
      if (amountInput) {
        amountInput.addEventListener('input', (e) => app.formatAmountInput(e.target));
      }

      // Fecha actual
      app.setupCurrentDate();

      // Actualizar stats iniciales
      app.updateFormStats();

      console.log('✅ Formulario premium inicializado');
    };

    // ============================================
    // CAMPOS OPCIONALES COLAPSABLES
    // ============================================
    function setupOptionalFields() {
      const toggle = document.getElementById('toggleOptionalFields');
      const fields = document.getElementById('optionalFields');

      if (toggle && fields) {
        toggle.addEventListener('click', () => {
          const isActive = toggle.classList.toggle('active');
          fields.classList.toggle('active', isActive);
        });
      }
    }

    // ============================================
    // SHORTCUTS DE TECLADO
    // ============================================
    function setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // Ctrl+Q: Gasto rápido
        if (e.ctrlKey && e.key === 'q') {
          e.preventDefault();
          const quickBtn = document.getElementById('quickExpenseBtn');
          if (quickBtn) quickBtn.click();
        }

        // Ctrl+R: Repetir último
        if (e.ctrlKey && e.key === 'r') {
          e.preventDefault();
          const repeatBtn = document.getElementById('repeatLastBtn');
          if (repeatBtn) repeatBtn.click();
        }

        // Esc: Limpiar formulario
        if (e.key === 'Escape') {
          const form = document.getElementById('expenseForm');
          if (form && document.activeElement.tagName === 'INPUT') {
            app.clearNewExpenseForm();
          }
        }

        // Enter en formulario: Submit (solo si no está en textarea)
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          const form = document.getElementById('expenseForm');
          if (form && form.contains(e.target)) {
            // Permitir Enter solo si no hay dropdown abierto
            const autocomplete = document.getElementById('descriptionAutocomplete');
            if (!autocomplete || autocomplete.classList.contains('hidden')) {
              // No prevenir default aquí, dejar que el form maneje el submit
            }
          }
        }
      });
    }

    // ============================================
    // AUTOCOMPLETADO INTELIGENTE
    // ============================================
    function setupSmartAutocomplete() {
      const descInput = document.getElementById('description');
      const autocomplete = document.getElementById('descriptionAutocomplete');

      if (!descInput || !autocomplete) return;

      let selectedIndex = -1;
      let suggestions = [];

      descInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length < 2) {
          autocomplete.classList.add('hidden');
          return;
        }

        // Obtener sugerencias de gastos anteriores
        if (app.expenses && Array.isArray(app.expenses)) {
          const recentDescriptions = app.expenses
            .map(e => e.description)
            .filter((desc, index, self) => self.indexOf(desc) === index)
            .filter(desc => desc.toLowerCase().includes(query))
            .slice(0, 5);

          suggestions = recentDescriptions;
          renderAutocomplete(suggestions, query);
        }
      });

      descInput.addEventListener('keydown', (e) => {
        if (!autocomplete.classList.contains('hidden') && suggestions.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
            updateAutocompleteSelection();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateAutocompleteSelection();
          } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            selectAutocompleteItem(suggestions[selectedIndex]);
          } else if (e.key === 'Escape') {
            autocomplete.classList.add('hidden');
            selectedIndex = -1;
          }
        }
      });

      function renderAutocomplete(items, query) {
        if (items.length === 0) {
          autocomplete.classList.add('hidden');
          return;
        }

        autocomplete.innerHTML = items.map((item, index) => {
          const highlighted = item.replace(
            new RegExp(`(${query})`, 'gi'),
            '<strong>$1</strong>'
          );
          return `
            <div class="autocomplete-item ${index === selectedIndex ? 'selected' : ''}" 
                 data-value="${item}" 
                 data-index="${index}">
              ${highlighted}
            </div>
          `;
        }).join('');

        autocomplete.classList.remove('hidden');

        // Click en items
        autocomplete.querySelectorAll('.autocomplete-item').forEach(item => {
          item.addEventListener('click', () => {
            selectAutocompleteItem(item.dataset.value);
          });
        });
      }

      function updateAutocompleteSelection() {
        autocomplete.querySelectorAll('.autocomplete-item').forEach((item, index) => {
          item.classList.toggle('selected', index === selectedIndex);
        });
      }

      function selectAutocompleteItem(value) {
        descInput.value = value;
        autocomplete.classList.add('hidden');
        selectedIndex = -1;
        descInput.focus();
      }

      // Cerrar al hacer click fuera
      document.addEventListener('click', (e) => {
        if (!descInput.contains(e.target) && !autocomplete.contains(e.target)) {
          autocomplete.classList.add('hidden');
        }
      });
    }

    // ============================================
    // SUGERENCIAS DE MONTO
    // ============================================
    function setupAmountSuggestions() {
      const amountInput = document.getElementById('amount');
      const suggestions = document.getElementById('amountSuggestions');

      if (!amountInput || !suggestions) return;

      // Montos comunes
      const commonAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

      amountInput.addEventListener('focus', () => {
        if (!amountInput.value) {
          renderAmountSuggestions(commonAmounts);
        }
      });

      amountInput.addEventListener('input', () => {
        if (amountInput.value) {
          suggestions.innerHTML = '';
        }
      });

      function renderAmountSuggestions(amounts) {
        suggestions.innerHTML = amounts.map(amount => {
          return `<button type="button" class="amount-suggestion" data-amount="${amount}">$${amount.toLocaleString()}</button>`;
        }).join('');

        suggestions.querySelectorAll('.amount-suggestion').forEach(btn => {
          btn.addEventListener('click', () => {
            amountInput.value = btn.dataset.amount;
            amountInput.dispatchEvent(new Event('input'));
            suggestions.innerHTML = '';
            amountInput.focus();
          });
        });
      }
    }

    // ============================================
    // ACCIONES RÁPIDAS
    // ============================================
    function setupQuickActions() {
      // Gasto rápido
      const quickBtn = document.getElementById('quickExpenseBtn');
      if (quickBtn) {
        quickBtn.addEventListener('click', () => {
          // Focus en monto y preparar para entrada rápida
          const amountInput = document.getElementById('amount');
          if (amountInput) {
            amountInput.focus();
            amountInput.select();
          }
        });
      }

      // Repetir último gasto
      const repeatBtn = document.getElementById('repeatLastBtn');
      if (repeatBtn) {
        repeatBtn.addEventListener('click', () => {
          if (app.expenses && app.expenses.length > 0) {
            const lastExpense = app.expenses[app.expenses.length - 1];
            fillFormFromExpense(lastExpense);
            app.showToast('Último gasto cargado', 'info');
          } else {
            app.showToast('No hay gastos previos', 'info');
          }
        });
      }

      // Escanear recibo (placeholder)
      const scanBtn = document.getElementById('scanReceiptBtn');
      if (scanBtn) {
        scanBtn.addEventListener('click', () => {
          app.showToast('Función de escaneo próximamente disponible', 'info');
        });
      }
    }

    function fillFormFromExpense(expense) {
      const amountInput = document.getElementById('amount');
      const descInput = document.getElementById('description');
      const categorySelect = document.getElementById('category');
      const necessitySelect = document.getElementById('necessity');
      const dateInput = document.getElementById('date');
      const userSelect = document.getElementById('user');

      if (amountInput && expense.amount) {
        amountInput.value = app.formatNumberWithSeparators ? 
          app.formatNumberWithSeparators(expense.amount.toString()) : 
          expense.amount.toString();
      }
      if (descInput && expense.description) descInput.value = expense.description;
      if (categorySelect && expense.category) categorySelect.value = expense.category;
      if (necessitySelect && expense.necessity) necessitySelect.value = expense.necessity;
      if (dateInput && expense.date) dateInput.value = expense.date;
      if (userSelect && expense.user) userSelect.value = expense.user;
    }

    // ============================================
    // FILTROS Y BÚSQUEDA DEL HISTORIAL
    // ============================================
    function setupHistoryFilters() {
      const filterBtns = document.querySelectorAll('.filter-btn');
      const searchInput = document.getElementById('historySearch');

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.dataset.filter;
          filterExpenses(filter);
        });
      });

      if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(() => {
            searchExpenses(e.target.value);
          }, 300);
        });
      }
    }

    function filterExpenses(filter) {
      // Esta función será llamada desde app.renderExpenses()
      if (typeof app.renderExpenses === 'function') {
        app.currentExpenseFilter = filter;
        app.renderExpenses();
      }
    }

    function searchExpenses(query) {
      if (typeof app.renderExpenses === 'function') {
        app.currentExpenseSearch = query;
        app.renderExpenses();
      }
    }

    // ============================================
    // BOTONES DE AÑADIR PERSONALIZADOS
    // ============================================
    function bindCustomAddButtons() {
      const categoryBtn = document.getElementById('addCategoryBtn');
      if (categoryBtn) {
        categoryBtn.addEventListener('click', (event) => {
          event.preventDefault();
          if (typeof window.openSelectModal === 'function') {
            window.openSelectModal('addCategoryModal');
          }
        });
      }

      const necessityBtn = document.getElementById('addNecessityBtn');
      if (necessityBtn) {
        necessityBtn.addEventListener('click', (event) => {
          event.preventDefault();
          if (typeof window.openSelectModal === 'function') {
            window.openSelectModal('addNecessityModal');
          }
        });
      }

      const userBtn = document.getElementById('addUserBtn');
      if (userBtn) {
        userBtn.addEventListener('click', (event) => {
          event.preventDefault();
          if (typeof window.openSelectModal === 'function') {
            window.openSelectModal('addUserModal');
          }
        });
      }
    }

    function bindSelectState(select) {
      if (!select) return;
      const sync = () => {
        select.classList.toggle('has-value', Boolean(select.value));
      };
      sync();
      select.addEventListener('change', sync);
    }

    // ============================================
    // SUBMIT NUEVO GASTO (mejorado con edición)
    // ============================================
    app.submitNewExpense = function() {
      console.log('💾 Enviando gasto...');

      // Verificar autenticación
      if (!this.currentUser || this.currentUser === 'anonymous' || !this.firebaseUser) {
        this.showAuthRequiredModal();
        return;
      }

      // Validar formulario
      const validation = this.validateExpenseForm();
      if (!validation.isValid) {
        this.showToast(`❌ ${validation.firstError.message}`, 'error');
        return;
      }

      // Obtener valores
      const amountInput = document.getElementById('amount');
      const amount = this.unformatNumber(amountInput.value);
      const description = document.getElementById('description').value.trim();
      const category = document.getElementById('category').value;
      const necessity = document.getElementById('necessity').value;
      const date = document.getElementById('date').value;
      const user = document.getElementById('user').value || 'Sin asignar';
      const items = document.getElementById('items')?.value.trim() || '';
      const notes = document.getElementById('notes')?.value.trim() || '';

      // Verificar si es edición
      if (this.editingExpenseId) {
        const expenseIndex = this.expenses.findIndex(e => e.id === this.editingExpenseId);
        if (expenseIndex !== -1) {
          // Actualizar gasto existente
          this.expenses[expenseIndex] = {
            ...this.expenses[expenseIndex],
            description,
            amount,
            category,
            necessity,
            date,
            user,
            items,
            notes,
          };

          // Registrar en auditoría
          if (typeof this.logAudit === 'function') {
            this.logAudit(
              'expense_edited',
              'edited',
              `Gasto editado: $${amount} - ${description}`,
              '',
              { amount, category, description, user }
            );
          }

          this.showToast(
            `✅ Gasto de $${amount.toLocaleString()} actualizado`,
            'success'
          );

          this.editingExpenseId = null;
        }
      } else {
        // Crear nuevo gasto
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

        // Agregar al array
        this.expenses.push(expense);

        // Registrar en historial
        this.addToHistory({
          type: 'gasto',
          amount: amount,
          description: description,
          date: date,
          category: category,
          necessity: necessity,
          user: user,
        });

        // Registrar en auditoría
        if (typeof this.logAudit === 'function') {
          this.logAudit(
            'expense_added',
            'added',
            `Nuevo gasto: $${amount} - ${description}`,
            '',
            { amount, category, description, user }
          );
        }

        this.showToast(
          `✅ Gasto de $${amount.toLocaleString()} registrado`,
          'success'
        );
      }

      // Guardar
      this.updateSpecificField('expenses', this.expenses);
      this.saveData();

      // Actualizar UI
      this.renderDashboard();
      this.renderExpenses();
      if (typeof this.updateTrendChart === 'function') {
        this.updateTrendChart();
      }
      if (typeof this.updateLastTransaction === 'function') {
        this.updateLastTransaction();
      }
      if (typeof this.checkAchievements === 'function') {
        this.checkAchievements();
      }
      this.updateFormStats();

      // Limpiar formulario
      this.clearNewExpenseForm();

      // Focus en monto para siguiente gasto
      setTimeout(() => {
        const amountInput = document.getElementById('amount');
        if (amountInput) amountInput.focus();
      }, 100);

      console.log('✅ Gasto procesado exitosamente');
    };

    // ============================================
    // CONFIGURAR CAMPO DE USUARIO
    // ============================================
    app.setupNewUserField = function() {
      const userSelect = document.getElementById('user');
      const addUserBtn = document.getElementById('addUserBtn');

      if (!userSelect) {
        console.warn('⚠️ Select de usuario no encontrado');
        return;
      }

      if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
          if (typeof window.openSelectModal === 'function') {
            window.openSelectModal('addUserModal');
          }
        });
      }

      console.log('✅ Campo de usuario configurado');
    };

    // ============================================
    // LIMPIAR FORMULARIO (mejorado)
    // ============================================
    app.clearNewExpenseForm = function() {
      const form = document.getElementById('expenseForm');
      if (!form) return;

      form.reset();

      // Restaurar fecha actual
      this.setupCurrentDate();

      // Limpiar autocompletado
      const autocomplete = document.getElementById('descriptionAutocomplete');
      if (autocomplete) autocomplete.classList.add('hidden');

      // Limpiar sugerencias de monto
      const amountSuggestions = document.getElementById('amountSuggestions');
      if (amountSuggestions) amountSuggestions.innerHTML = '';

      // Cerrar campos opcionales
      const toggle = document.getElementById('toggleOptionalFields');
      const fields = document.getElementById('optionalFields');
      if (toggle && fields) {
        toggle.classList.remove('active');
        fields.classList.remove('active');
      }

      // Remover clases de error
      const errorFields = form.querySelectorAll('.field-error');
      errorFields.forEach(field => field.classList.remove('field-error'));

      // Focus en monto
      const amountInput = document.getElementById('amount');
      if (amountInput) {
        setTimeout(() => amountInput.focus(), 100);
      }
    };

    // ============================================
    // ACTUALIZAR ESTADÍSTICAS
    // ============================================
    app.updateFormStats = function() {
      if (!this.expenses || !Array.isArray(this.expenses)) {
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const todayExpenses = this.expenses.filter(e => e.date === today);
      const todayCount = todayExpenses.length;
      const todayTotal = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthExpenses = this.expenses.filter(e => e.date && e.date.startsWith(currentMonth));
      const monthTotal = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      const todayCountEl = document.getElementById('todayExpensesCount');
      const todayTotalEl = document.getElementById('todayExpensesTotal');
      const monthTotalEl = document.getElementById('monthExpensesTotal');

      if (todayCountEl) todayCountEl.textContent = todayCount;
      if (todayTotalEl) todayTotalEl.textContent = `$${todayTotal.toLocaleString()}`;
      if (monthTotalEl) monthTotalEl.textContent = `$${monthTotal.toLocaleString()}`;
    };

    // ============================================
    // INICIALIZAR AUTOMÁTICAMENTE
    // ============================================
    app.initNewExpenseForm();

    console.log('✅ Sistema premium de gastos LISTO');
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForApp);
  } else {
    waitForApp();
  }

})();
