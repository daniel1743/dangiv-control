/* ============================================
   Expenses Modern UI Bridge
   Keeps the new visual experience wired to the
   existing FinanceApp logic.
   ============================================ */

(function () {
  'use strict';

  function onDomReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function onAppReady(callback) {
    if (window.app) {
      callback(window.app);
      return;
    }
    setTimeout(() => onAppReady(callback), 75);
  }

  function bindUserDisplay(userSelect, userDisplay) {
    if (!userDisplay) return;

    const label = userDisplay.querySelector('.selected-user-placeholder') || userDisplay;

    const updateDisplay = () => {
      const value = userSelect && userSelect.value ? userSelect.value : '';
      label.textContent = value || 'Sin asignar';
      userDisplay.classList.toggle('selected-user-display--active', Boolean(value));
    };

    updateDisplay();

    if (userSelect) {
      userSelect.addEventListener('change', updateDisplay);
      const observer = new MutationObserver(updateDisplay);
      observer.observe(userSelect, { childList: true });
    }

    const openModal = () => {
      if (typeof window.openSelectModal === 'function') {
        const current = userSelect ? userSelect.value : '';
        window.openSelectModal('userModal', current);
      }
    };

    userDisplay.setAttribute('role', 'button');
    userDisplay.setAttribute('tabindex', '0');

    userDisplay.addEventListener('click', (event) => {
      event.preventDefault();
      openModal();
    });

    userDisplay.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal();
      }
    });
  }

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

  function initialize(app) {
    const form = document.getElementById('expenseForm');
    if (!form) {
      console.warn('[ExpensesModern] expenseForm not found.');
      return;
    }

    const userSelect = document.getElementById('user');
    const userDisplay = document.getElementById('selectedUserField');
    bindUserDisplay(userSelect, userDisplay);

    bindCustomAddButtons();
    ['category', 'necessity'].forEach((id) => bindSelectState(document.getElementById(id)));

    const amountInput = document.getElementById('amount');
    if (amountInput && typeof app.formatAmountInput === 'function') {
      amountInput.addEventListener('blur', () => app.formatAmountInput(amountInput));
    }

    if (typeof app.setupCurrentDate === 'function') {
      app.setupCurrentDate();
    }

    if (typeof app.updateExpenseStats === 'function') {
      app.updateExpenseStats();
    }

    console.log('[ExpensesModern] bridge ready.');
  }

  onDomReady(() => {
    onAppReady(initialize);
  });
})();
