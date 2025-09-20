// Dan&Giv Control - Personal Finance Application
// Main JavaScript file with all functionality

class FinanceApp {
  resetPasswords() {
    this.securityPasswords = {
      Daniel: CryptoJS.SHA256("1234").toString(),
      Givonik: CryptoJS.SHA256("5678").toString(),
    };
    this.saveData();
    this.showToast("Contraseñas reseteadas a valores por defecto", "success");
  }

  constructor() {
    // ===== Intentar cargar datos previos desde LocalStorage =====
    const savedData = JSON.parse(localStorage.getItem("danGivControlData"));

    this.expenses = savedData?.expenses || [
      {
        id: 1,
        description: "Supermercado",
        amount: 150,
        category: "Alimentación",
        necessity: "Muy Necesario",
        date: "2025-09-10",
        user: "Daniel",
        protected: false,
      },
      {
        id: 2,
        description: "Gasolina",
        amount: 80,
        category: "Transporte",
        necessity: "Necesario",
        date: "2025-09-08",
        user: "Givonik",
        protected: false,
      },
      {
        id: 3,
        description: "Netflix",
        amount: 12,
        category: "Entretenimiento",
        necessity: "Poco Necesario",
        date: "2025-09-05",
        user: "Daniel",
        protected: false,
      },
      {
        id: 4,
        description: "Bombona de gas",
        amount: 45,
        category: "Servicios",
        necessity: "Muy Necesario",
        date: "2025-09-03",
        user: "Daniel",
        protected: false,
      },
      {
        id: 5,
        description: "Cine",
        amount: 25,
        category: "Entretenimiento",
        necessity: "No Necesario",
        date: "2025-09-02",
        user: "Givonik",
        protected: false,
      },
    ];

    this.goals = savedData?.goals || [
      {
        id: 1,
        name: "Vacaciones en la playa",
        target: 1500,
        current: 350,
        deadline: "2025-12-15",
      },
      {
        id: 2,
        name: "Fondo de emergencia",
        target: 1000,
        current: 750,
        deadline: "2025-11-30",
      },
      {
        id: 3,
        name: "Nueva laptop",
        target: 800,
        current: 200,
        deadline: "2025-10-31",
      },
    ];

    this.shoppingItems = savedData?.shoppingItems || [
      {
        id: 1,
        product: "Leche",
        quantity: 2,
        necessary: true,
        selected: false,
      },
      { id: 2, product: "Pan", quantity: 1, necessary: true, selected: false },
      {
        id: 3,
        product: "Queso",
        quantity: 1,
        necessary: false,
        selected: false,
      },
    ];

    this.monthlyIncome = savedData?.monthlyIncome || 2500;

    // 🔑 Reinicio forzado de contraseñas
    this.securityPasswords = {
      Daniel: CryptoJS.SHA256("1234").toString(),
      Givonik: CryptoJS.SHA256("5678").toString(),
    };

    // --- NUEVAS FUNCIONES ---
    this.verifyPassword = (user, input) => {
      const hash = CryptoJS.SHA256(input).toString();
      return this.securityPasswords[user] === hash;
    };

    this.updatePassword = (user, newPass) => {
      this.securityPasswords[user] = CryptoJS.SHA256(newPass).toString();
      this.saveData();
    };

    this.categories = [
      "Alimentación",
      "Transporte",
      "Entretenimiento",
      "Salud",
      "Servicios",
      "Compras",
      "Otros",
    ];
    this.necessityLevels = [
      "Muy Necesario",
      "Necesario",
      "Poco Necesario",
      "No Necesario",
      "Compra por Impulso",
    ];
    this.users = ["Daniel", "Givonik", "Otro"];

    this.aiRecommendations = [
      "Reduce gastos de entretenimiento en un 20% este mes",
      "Has gastado $25 en cine este mes, considera alternativas gratuitas",
      "Tu gasto en alimentación está dentro del presupuesto recomendado",
      "Recuerda que tienes metas de ahorro pendientes",
    ];

    this.charts = {};
    this.currentSection = "dashboard";

    // === Persistir cambios ===
    this.saveData = () => {
      const data = {
        expenses: this.expenses,
        goals: this.goals,
        shoppingItems: this.shoppingItems,
        monthlyIncome: this.monthlyIncome,
        securityPasswords: this.securityPasswords,
      };
      localStorage.setItem("danGivControlData", JSON.stringify(data));
    };

    // 🟢 Guardamos inmediatamente el reset
    this.saveData();
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupApp());
    } else {
      this.setupApp();
    }
  }

  // Quedará así
  setupApp() {
    this.setupEventListeners();
    this.setupCurrentDate();
    this.renderDashboard();
    this.renderExpenses();
    this.renderGoals();
    this.renderShoppingList();
    this.renderConfig();

    // 👉 inicializamos la campana
    this.setupNotificationBell();
  }

  setupEventListeners() {
    // Navigation - Fix event handling
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const section = e.currentTarget.getAttribute("data-section");
        console.log("Navigating to:", section);
        this.showSection(section);
        const resetBtn = document.getElementById("resetPasswordsBtn");
        if (resetBtn) {
          resetBtn.addEventListener("click", () => {
            this.resetPasswords();
          });
        }
      });
    });
    // Abrir modal de seguridad desde el botón de Configuración
    const changePassBtn = document.getElementById("changePasswordsBtn");
    if (changePassBtn) {
      changePassBtn.addEventListener("click", () => {
        this.openSecurityModal();
      });
    }

    // Guardar nuevas contraseñas desde el modal
    // --- Estado global del modal ---
    this.modalMode = "change"; // 'change' | 'auth-delete'
    this.pendingDeleteId = null;

    // Botón principal del modal (función según modo)
    const modalSaveBtn = document.getElementById("modalSavePasswordsBtn");
    if (modalSaveBtn) {
      modalSaveBtn.addEventListener("click", () => {
        if (this.modalMode === "change") {
          this.savePasswordsFromModal(); // Cambiar contraseñas
        } else if (this.modalMode === "auth-delete") {
          this.confirmDeleteFromModal(); // Autenticar y eliminar
        }
      });
    }

    // Forms - Fix form submission
    const expenseForm = document.getElementById("expenseForm");
    if (expenseForm) {
      expenseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addExpense(e);
      });
    }

    const goalForm = document.getElementById("goalForm");
    if (goalForm) {
      goalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addGoal(e);
      });
    }

    const shoppingForm = document.getElementById("shoppingForm");
    if (shoppingForm) {
      shoppingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addShoppingItem(e);
      });
    }

    const incomeForm = document.getElementById("incomeForm");
    if (incomeForm) {
      incomeForm.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.updateIncome(e);
      });
    }

    // Shopping list actions
    const generateListBtn = document.getElementById("generateList");
    if (generateListBtn) {
      generateListBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.generateShoppingList();
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleTheme();
      });
    }
  }

  setupCurrentDate() {
    const dateField = document.getElementById("date");
    if (dateField) {
      const today = new Date().toISOString().split("T")[0];
      dateField.value = today;
    }
  }

  showSection(sectionId) {
    console.log("Showing section:", sectionId);

    // Update navigation active state
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });

    const activeNavItem = document.querySelector(
      `[data-section="${sectionId}"]`
    );
    if (activeNavItem) {
      activeNavItem.classList.add("active");
    }

    // Update sections visibility
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active");
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    this.currentSection = sectionId;

    // Render section-specific content
    setTimeout(() => {
      if (sectionId === "analysis") {
        this.renderAnalysis();
      } else if (sectionId === "dashboard") {
        this.renderDashboard();
      }
    }, 100);
  }

  // Dashboard Methods
  renderDashboard() {
    this.updateStats();
    setTimeout(() => {
      this.renderExpenseChart();
    }, 200);
    this.renderGoalsProgress();
    this.renderAIRecommendations();
    this.renderRecentTransactions();

    // 👉 aquí actualizamos la campana
    this.updateNotifications();
  }
// Reemplaza completamente tu método setupNotificationBell()
setupNotificationBell() {
    const area = document.getElementById('notificationArea');
    const dropdown = document.getElementById('notificationDropdown');
    const badge = document.getElementById('notificationCount');
    
    if (area && dropdown) {
        // Toggle al hacer clic en la campana
        area.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que se propague al document
            dropdown.classList.toggle('hidden');
            
            // Si se abre el dropdown, ocultamos el badge
            if (!dropdown.classList.contains('hidden')) {
                if (badge) badge.style.display = 'none';
            }
        });
        
        // Evitar que se cierre al hacer clic dentro del dropdown
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Cerrar al hacer clic fuera (en cualquier parte de la página)
        document.addEventListener('click', (e) => {
            // Si el dropdown está visible y el clic no fue en la campana ni en el dropdown
            if (!dropdown.classList.contains('hidden')) {
                if (!area.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            }
        });
    }
}


updateNotifications() {
  let notifications = [];
  const today = new Date();
  if (n.type === "goal") {
  li.innerHTML = `<i class="fas fa-flag notification-icon"></i> ${n.text}`;
} else if (n.type === "expense") {
  li.innerHTML = `<i class="fas fa-lock notification-icon"></i> ${n.text}`;
} else {
  li.textContent = n.text;
}

  // metas por vencer
  this.goals.forEach((goal) => {
    const deadline = new Date(goal.deadline);
    const diff = (deadline - today) / (1000 * 60 * 60 * 24);
    if (diff <= 7 && goal.current < goal.target) {
      notifications.push({
        type: "goal",
        text: `Meta "${goal.name}" vence en ${Math.ceil(diff)} días`,
      });
    }
  });

  // gastos protegidos
  this.expenses.forEach((exp) => {
    if (exp.protected) {
      notifications.push({
        type: "expense",
        text: `Gasto protegido: ${exp.description} ($${exp.amount})`,
      });
    }
  });

  // pintar badge SOLO si hay notificaciones
  const badge = document.getElementById("notificationCount");
  if (badge) {
    if (notifications.length > 0) {
      badge.style.display = "flex"; // vuelve a aparecer
      badge.textContent = ""; // solo puntito, sin número
    } else {
      badge.style.display = "none";
    }
  }

  // pintar lista en dropdown
  const list = document.getElementById("notificationList");
  if (list) {
    list.innerHTML = "";
    if (notifications.length === 0) {
      list.innerHTML = "<li>Sin notificaciones</li>";
    } else {
      notifications.forEach((n) => {
        const li = document.createElement("li");
        if (n.type === "goal") {
          li.innerHTML = `<i class="fas fa-flag"></i> ${n.text}`;
        } else if (n.type === "expense") {
          li.innerHTML = `<i class="fas fa-lock"></i> ${n.text}`;
        } else {
          li.textContent = n.text;
        }
        list.appendChild(li);
      });
    }
  }
}


  updateStats() {
    const totalExpenses = this.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const totalSavings = this.goals.reduce(
      (sum, goal) => sum + goal.current,
      0
    );
    const availableBalance = this.monthlyIncome - totalExpenses;

    const balanceEl = document.getElementById("totalBalance");
    const expensesEl = document.getElementById("totalExpenses");
    const savingsEl = document.getElementById("totalSavings");
    const transactionsEl = document.getElementById("totalTransactions");

    if (balanceEl)
      balanceEl.textContent = `$${availableBalance.toLocaleString()}`;
    if (expensesEl)
      expensesEl.textContent = `$${totalExpenses.toLocaleString()}`;
    if (savingsEl) savingsEl.textContent = `$${totalSavings.toLocaleString()}`;
    if (transactionsEl)
      transactionsEl.textContent = this.expenses.length.toString();
  }

  renderExpenseChart() {
    const canvas = document.getElementById("expenseChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Destroy existing chart if it exists
    if (this.charts.expenseChart) {
      this.charts.expenseChart.destroy();
    }

    const categoryData = this.getCategoryData();

    this.charts.expenseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: Object.keys(categoryData),
        datasets: [
          {
            data: Object.values(categoryData),
            backgroundColor: [
              "#1FB8CD",
              "#FFC185",
              "#B4413C",
              "#ECEBD5",
              "#5D878F",
              "#DB4545",
              "#D2BA4C",
            ],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
        },
      },
    });
  }

  getCategoryData() {
    const categoryData = {};
    this.expenses.forEach((expense) => {
      categoryData[expense.category] =
        (categoryData[expense.category] || 0) + expense.amount;
    });
    return categoryData;
  }

  renderGoalsProgress() {
    const container = document.getElementById("goalsProgress");
    if (!container) return;

    container.innerHTML = "";

    if (this.goals.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-target"></i><h3>No hay metas establecidas</h3><p>Crea tu primera meta financiera</p></div>';
      return;
    }

    this.goals.forEach((goal) => {
      const progress = Math.min((goal.current / goal.target) * 100, 100);
      const goalEl = document.createElement("div");
      goalEl.className = "goal-progress";
      goalEl.innerHTML = `
                <div class="goal-name">${goal.name}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="goal-percentage">${progress.toFixed(
                  1
                )}% completado</div>
            `;
      container.appendChild(goalEl);
    });
  }
  // Quedará así
  // Quedará así
 // Quedará así
updateNotifications() {
  let notifications = [];
  const today = new Date();

  // metas por vencer
  this.goals.forEach((goal) => {
    const deadline = new Date(goal.deadline);
    const diff = (deadline - today) / (1000 * 60 * 60 * 24);
    if (diff <= 7 && goal.current < goal.target) {
      notifications.push({
        type: "goal",
        text: `Meta "${goal.name}" vence en ${Math.ceil(diff)} días`,
      });
    }
  });

  // gastos protegidos
  this.expenses.forEach((exp) => {
    if (exp.protected) {
      notifications.push({
        type: "expense",
        text: `Gasto protegido: ${exp.description} ($${exp.amount})`,
      });
    }
  });

  // pintar número en campana
  const badge = document.getElementById("notificationCount");
  if (badge) {
    badge.textContent = notifications.length > 0 ? notifications.length : "";
  }

  // pintar lista en dropdown con iconos y textos claros
  const list = document.getElementById("notificationList");
  if (list) {
    list.innerHTML = "";
    if (notifications.length === 0) {
      list.innerHTML = "<li>Sin notificaciones</li>";
    } else {
      notifications.forEach((n) => {
        const li = document.createElement("li");
        if (n.type === "goal") {
          li.innerHTML = `<i class="fas fa-flag"></i> ${n.text}`;
        } else if (n.type === "expense") {
          li.innerHTML = `<i class="fas fa-lock"></i> ${n.text}`;
        } else {
          li.textContent = n.text;
        }
        list.appendChild(li);
      });
    }
  }
}


  renderAIRecommendations() {
    const container = document.getElementById("aiRecommendations");
    if (!container) return;

    container.innerHTML = "";

    this.aiRecommendations.forEach((recommendation) => {
      const recEl = document.createElement("div");
      recEl.className = "recommendation-item";
      recEl.innerHTML = `
                <i class="fas fa-lightbulb recommendation-icon"></i>
                <div class="recommendation-text">${recommendation}</div>
            `;
      container.appendChild(recEl);
    });
  }

  renderRecentTransactions() {
    const container = document.getElementById("recentTransactions");
    if (!container) return;

    container.innerHTML = "";

    const recentExpenses = this.expenses.slice(-5).reverse();

    if (recentExpenses.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-receipt"></i><h3>No hay transacciones</h3></div>';
      return;
    }

    recentExpenses.forEach((expense) => {
      const transactionEl = document.createElement("div");
      transactionEl.className = "transaction-item";
      transactionEl.innerHTML = `
                <div class="transaction-info">
                    <h4>${expense.description}</h4>
                    <div class="transaction-meta">${expense.date} • ${expense.user} • ${expense.category}</div>
                </div>
                <div class="transaction-amount expense">-$${expense.amount}</div>
            `;
      container.appendChild(transactionEl);
    });
  }

  // Expense Methods
  addExpense(e) {
    e.preventDefault();

    const description = document.getElementById("description").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const necessity = document.getElementById("necessity").value;
    const date = document.getElementById("date").value;
    const user = document.getElementById("user").value;

    // Validation
    if (
      !description ||
      !amount ||
      amount <= 0 ||
      !category ||
      !necessity ||
      !date ||
      !user
    ) {
      this.showToast(
        "Por favor completa todos los campos correctamente",
        "error"
      );
      return;
    }

    const expense = {
      id: Date.now(),
      description: description,
      amount: amount,
      category: category,
      necessity: necessity,
      date: date,
      user: user,
      protected: user === "Daniel" || user === "Givonik",
    };

    this.expenses.push(expense);
    this.renderDashboard();
    this.renderExpenses();
    this.showToast("Gasto registrado exitosamente", "success");

    // Reset form
    document.getElementById("expenseForm").reset();
    this.setupCurrentDate();
  }

  renderExpenses() {
    const container = document.getElementById("expenseList");
    if (!container) return;

    container.innerHTML = "";

    if (this.expenses.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-receipt"></i><h3>No hay gastos registrados</h3></div>';
      return;
    }

    const sortedExpenses = [...this.expenses].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    sortedExpenses.forEach((expense) => {
      const expenseEl = document.createElement("div");
      expenseEl.className = "transaction-item";
      expenseEl.innerHTML = `
            <div class="transaction-info">
                <h4>${expense.description}</h4>
                <div class="transaction-meta">
                    ${expense.date} • ${expense.user} • ${expense.category} • ${
        expense.necessity
      }
                    ${expense.protected ? " • 🔒" : ""}
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="transaction-amount expense">$${expense.amount}</div>
                <button type="button" class="btn btn-danger btn-delete" data-id="${
                  expense.id
                }">
                    Eliminar
                </button>
            </div>
        `;

      container.appendChild(expenseEl);

      // --- Botón Eliminar conectado ---
      const delBtn = expenseEl.querySelector(".btn-delete");
      if (delBtn) {
        delBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof this.deleteExpense === "function") {
            this.deleteExpense(expense.id);
          } else {
            console.warn("deleteExpense aún no está implementado.");
            this.showToast(
              "La función de eliminar se activará en el siguiente paso",
              "info"
            );
          }
        });
      }
    });
  }

  // Reemplaza todo tu método deleteExpense por este
  // Reemplaza TODO tu método deleteExpense por este
  // Quedará así
  // Reemplaza TODO tu método deleteExpense por este
  deleteExpense(id) {
    const idx = this.expenses.findIndex((e) => e.id === id);
    if (idx === -1) {
      this.showToast("Gasto no encontrado", "error");
      return;
    }

    const item = this.expenses[idx];

    // Si NO está protegido, eliminar directo
    if (!item.protected) {
      this.expenses.splice(idx, 1);
      this.renderDashboard();
      this.renderExpenses();
      this.showToast("Gasto eliminado", "success");
      return;
    }

    // --- Si ES protegido, usar el modal en modo validación ---
    const modal = document.getElementById("securityModal");
    const curDanielEl = document.getElementById("curDaniel");
    const curGivonikEl = document.getElementById("curGivonik");
    const newPassSection = document.getElementById("newPassSection");
    const saveBtn = document.getElementById("modalSavePasswordsBtn");
    const cancelBtn = modal?.querySelector(".modal-footer .btn-cancel");
    const titleEl = modal?.querySelector(".modal-title");

    if (!modal || !curDanielEl || !curGivonikEl || !saveBtn) {
      this.showToast("Modal de seguridad no disponible", "error");
      return;
    }

    // Limpiar campos
    [curDanielEl, curGivonikEl].forEach((el) => el && (el.value = ""));
    if (newPassSection) {
      newPassSection.querySelectorAll("input").forEach((el) => (el.value = ""));
    }

    // Ocultar inputs de nuevas contraseñas (solo validación)
    if (newPassSection) newPassSection.style.display = "none";

    const originalTitle = titleEl?.textContent || "";
    const originalBtnText = saveBtn.textContent;
    if (titleEl)
      titleEl.innerHTML = `<i class="fas fa-key"></i> Confirmar eliminación`;
    saveBtn.textContent = "Eliminar";

    // Guardar handler original
    if (!this._originalSaveHandler) {
      this._originalSaveHandler = saveBtn.onclick;
    }

    // Restaurar UI/handlers al cancelar o cerrar
    const restoreUI = () => {
      if (newPassSection) newPassSection.style.display = "";
      if (titleEl) titleEl.textContent = originalTitle || "Cambiar Contraseñas";
      saveBtn.textContent = originalBtnText || "Guardar";
      saveBtn.onclick = this._originalSaveHandler || null;
    };

    if (cancelBtn) {
      const onCancel = () => {
        modal.classList.remove("show");
        restoreUI();
        cancelBtn.removeEventListener("click", onCancel);
      };
      cancelBtn.addEventListener("click", onCancel);
    }

    // Nuevo handler del botón principal
    saveBtn.onclick = () => {
      const curDaniel = curDanielEl.value || "";
      const curGivonik = curGivonikEl.value || "";

      if (!this.verifyPassword("Daniel", curDaniel)) {
        this.showToast("Contraseña actual de Daniel incorrecta", "error");
        return;
      }
      if (!this.verifyPassword("Givonik", curGivonik)) {
        this.showToast("Contraseña actual de Givonik incorrecta", "error");
        return;
      }

      // Autorizado: eliminar
      this.expenses.splice(idx, 1);
      modal.classList.remove("show");
      this.renderDashboard();
      this.renderExpenses();
      this.showToast("Gasto eliminado", "success");

      restoreUI();
    };

    modal.classList.add("show");
  }

  changePasswords() {
    this.openSecurityModal("change"); // abre en modo cambio
  }

  openSecurityModal(mode = "change") {
    const modal = document.getElementById("securityModal");
    if (!modal)
      return this.showToast("Modal de seguridad no encontrado", "error");

    // limpiar campos
    [
      "curDaniel",
      "curGivonik",
      "newDaniel",
      "confirmDaniel",
      "newGivonik",
      "confirmGivonik",
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // configurar modo
    this.modalMode = mode;
    const newPassSection = document.getElementById("newPassSection");
    if (newPassSection)
      newPassSection.style.display = mode === "change" ? "" : "none";

    // ajustar texto del botón
    const saveBtn = document.getElementById("modalSavePasswordsBtn");
    if (saveBtn)
      saveBtn.textContent = mode === "change" ? "Guardar" : "Confirmar";

    modal.classList.add("show");
  }

  savePasswordsFromModal() {
    const modal = document.getElementById("securityModal");
    const curDanielEl = document.getElementById("curDaniel");
    const curGivonikEl = document.getElementById("curGivonik");
    const newDanielEl = document.getElementById("newDaniel");
    const confirmDanielEl = document.getElementById("confirmDaniel");
    const newGivonikEl = document.getElementById("newGivonik");
    const confirmGivonikEl = document.getElementById("confirmGivonik");

    if (
      !modal ||
      !curDanielEl ||
      !curGivonikEl ||
      !newDanielEl ||
      !confirmDanielEl ||
      !newGivonikEl ||
      !confirmGivonikEl
    ) {
      this.showToast("Campos del modal incompletos", "error");
      return;
    }

    const curDaniel = curDanielEl.value || "";
    const curGivonik = curGivonikEl.value || "";
    const newDaniel = newDanielEl.value || "";
    const confirmDaniel = confirmDanielEl.value || "";
    const newGivonik = newGivonikEl.value || "";
    const confirmGivonik = confirmGivonikEl.value || "";

    // Validar actuales
    if (!this.verifyPassword("Daniel", curDaniel)) {
      this.showToast("Contraseña actual de Daniel incorrecta", "error");
      return;
    }
    if (!this.verifyPassword("Givonik", curGivonik)) {
      this.showToast("Contraseña actual de Givonik incorrecta", "error");
      return;
    }

    // Validar nuevas
    if (newDaniel.trim().length < 4 || newGivonik.trim().length < 4) {
      this.showToast(
        "Las nuevas contraseñas deben tener al menos 4 caracteres",
        "error"
      );
      return;
    }
    if (newDaniel !== confirmDaniel) {
      this.showToast("Confirmación de Daniel no coincide", "error");
      return;
    }
    if (newGivonik !== confirmGivonik) {
      this.showToast("Confirmación de Givonik no coincide", "error");
      return;
    }

    // Guardar (encriptadas)
    this.updatePassword("Daniel", newDaniel);
    this.updatePassword("Givonik", newGivonik);

    this.saveData();
    modal.classList.remove("show");
    this.showToast(
      "Contraseñas actualizadas con doble autorización",
      "success"
    );
  }

  // Goals Methods
  addGoal(e) {
    e.preventDefault();

    const name = document.getElementById("goalName").value.trim();
    const target = parseFloat(document.getElementById("goalTarget").value);
    const deadline = document.getElementById("goalDeadline").value;

    if (!name || !target || target <= 0 || !deadline) {
      this.showToast(
        "Por favor completa todos los campos correctamente",
        "error"
      );
      return;
    }

    const goal = {
      id: Date.now(),
      name: name,
      target: target,
      current: 0,
      deadline: deadline,
    };

    this.goals.push(goal);
    this.renderGoals();
    this.renderGoalsProgress();
    this.showToast("Meta creada exitosamente", "success");
    document.getElementById("goalForm").reset();
  }

  renderGoals() {
    const container = document.getElementById("goalsList");
    if (!container) return;

    container.innerHTML = "";

    if (this.goals.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-target"></i><h3>No hay metas establecidas</h3></div>';
      return;
    }

    this.goals.forEach((goal) => {
      const progress = Math.min((goal.current / goal.target) * 100, 100);
      const goalEl = document.createElement("div");
      goalEl.className = "goal-card";
      goalEl.innerHTML = `
                <div class="goal-header">
                    <h3 class="goal-title">${goal.name}</h3>
                    <div class="goal-amount">$${goal.current} / $${
        goal.target
      }</div>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="goal-percentage">${progress.toFixed(
                      1
                    )}% completado</span>
                    <span class="goal-deadline">Hasta: ${goal.deadline}</span>
                </div>
            `;
      container.appendChild(goalEl);
    });
  }

  // Analysis Methods
  renderAnalysis() {
    setTimeout(() => {
      this.renderUserExpenseChart();
      this.renderNecessityChart();
    }, 200);
    this.renderUnnecessaryExpenses();
  }

  renderUserExpenseChart() {
    const canvas = document.getElementById("userExpenseChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (this.charts.userExpenseChart) {
      this.charts.userExpenseChart.destroy();
    }

    const userData = this.getUserData();

    this.charts.userExpenseChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(userData),
        datasets: [
          {
            label: "Gastos por Usuario",
            data: Object.values(userData),
            backgroundColor: ["#1FB8CD", "#FFC185", "#B4413C"],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "$" + value;
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  getUserData() {
    const userData = {};
    this.expenses.forEach((expense) => {
      userData[expense.user] = (userData[expense.user] || 0) + expense.amount;
    });
    return userData;
  }

  renderNecessityChart() {
    const canvas = document.getElementById("necessityChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (this.charts.necessityChart) {
      this.charts.necessityChart.destroy();
    }

    const necessaryExpenses = this.expenses
      .filter(
        (exp) =>
          exp.necessity === "Muy Necesario" || exp.necessity === "Necesario"
      )
      .reduce((sum, exp) => sum + exp.amount, 0);

    const unnecessaryExpenses = this.expenses
      .filter(
        (exp) =>
          exp.necessity === "Poco Necesario" ||
          exp.necessity === "No Necesario" ||
          exp.necessity === "Compra por Impulso"
      )
      .reduce((sum, exp) => sum + exp.amount, 0);

    this.charts.necessityChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Necesario", "No Necesario"],
        datasets: [
          {
            data: [necessaryExpenses, unnecessaryExpenses],
            backgroundColor: ["#1FB8CD", "#B4413C"],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  renderUnnecessaryExpenses() {
    const container = document.getElementById("unnecessaryExpenses");
    if (!container) return;

    container.innerHTML = "";

    const unnecessary = this.expenses.filter(
      (exp) =>
        exp.necessity === "No Necesario" ||
        exp.necessity === "Compra por Impulso"
    );

    if (unnecessary.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-thumbs-up"></i><h3>¡Excelente!</h3><p>No tienes gastos innecesarios este mes</p></div>';
      return;
    }

    unnecessary.forEach((expense) => {
      const expenseEl = document.createElement("div");
      expenseEl.className = "unnecessary-expense";
      expenseEl.innerHTML = `
                <div class="unnecessary-info">
                    <h4>${expense.description}</h4>
                    <div class="unnecessary-meta">${expense.date} • ${expense.user} • ${expense.necessity}</div>
                </div>
                <div class="unnecessary-amount">$${expense.amount}</div>
            `;
      container.appendChild(expenseEl);
    });

    const totalUnnecessary = unnecessary.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const summaryEl = document.createElement("div");
    summaryEl.className = "mt-16 p-16 text-center";
    summaryEl.style.backgroundColor = "rgba(var(--color-error-rgb), 0.1)";
    summaryEl.style.borderRadius = "var(--radius-base)";
    summaryEl.innerHTML = `
            <h4 style="color: var(--color-error); margin-bottom: var(--space-8);">
                Total en gastos innecesarios: $${totalUnnecessary}
            </h4>
            <p style="color: var(--color-text-secondary);">
                Podrías haber ahorrado este dinero para tus metas financieras
            </p>
        `;
    container.appendChild(summaryEl);
  }

  // Shopping List Methods
  addShoppingItem(e) {
    e.preventDefault();

    const product = document.getElementById("product").value.trim();
    const quantity = parseInt(document.getElementById("quantity").value);
    const necessary = document.getElementById("necessary").value;

    if (!product || !quantity || quantity <= 0 || necessary === "") {
      this.showToast(
        "Por favor completa todos los campos correctamente",
        "error"
      );
      return;
    }

    const item = {
      id: Date.now(),
      product: product,
      quantity: quantity,
      necessary: necessary === "true",
      selected: false,
    };

    this.shoppingItems.push(item);
    this.renderShoppingList();
    this.showToast("Producto agregado a la lista", "success");
    document.getElementById("shoppingForm").reset();
  }

  renderShoppingList() {
    const container = document.getElementById("shoppingList");
    if (!container) return;

    container.innerHTML = "";

    if (this.shoppingItems.length === 0) {
      container.innerHTML =
        '<div class="empty-state"><i class="fas fa-shopping-cart"></i><h3>Lista vacía</h3><p>Agrega productos a tu lista de compras</p></div>';
      return;
    }

    this.shoppingItems.forEach((item, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "shopping-item";
      itemEl.innerHTML = `
                <input type="checkbox" class="shopping-checkbox" ${
                  item.selected ? "checked" : ""
                } 
                       data-index="${index}">
                <div class="shopping-content">
                    <div class="shopping-product">${item.product}</div>
                    <div class="shopping-details">
                        Cantidad: ${item.quantity} • 
                        <span class="necessity-badge ${
                          item.necessary ? "necessary" : "not-necessary"
                        }">
                            ${item.necessary ? "Necesario" : "No Necesario"}
                        </span>
                    </div>
                </div>
            `;
      container.appendChild(itemEl);

      // Add event listener to checkbox
      const checkbox = itemEl.querySelector(".shopping-checkbox");
      checkbox.addEventListener("change", () => {
        this.toggleShoppingItem(index);
      });
    });
  }

  toggleShoppingItem(index) {
    if (this.shoppingItems[index]) {
      this.shoppingItems[index].selected = !this.shoppingItems[index].selected;
    }
  }

  generateShoppingList() {
    const selectedItems = this.shoppingItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      this.showToast("Selecciona al menos un producto", "error");
      return;
    }

    let listContent = "LISTA DE COMPRAS - Dan&Giv Control\n";
    listContent += "=" + "=".repeat(35) + "\n\n";

    selectedItems.forEach((item) => {
      listContent += `☐ ${item.product} (${item.quantity})\n`;
    });

    listContent += "\n" + "=".repeat(37) + "\n";
    listContent += `Total de productos: ${selectedItems.length}\n`;
    listContent += `Generado: ${new Date().toLocaleDateString("es-ES")}`;

    // Create and download file
    const blob = new Blob([listContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lista-compras-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showToast("Lista de compras descargada", "success");
  }

  // Configuration Methods
  updateIncome(e) {
    e.preventDefault();

    const income = parseFloat(document.getElementById("monthlyIncome").value);

    if (!income || income <= 0) {
      this.showToast("Por favor ingresa un monto válido", "error");
      return;
    }

    this.monthlyIncome = income;
    this.renderConfig();
    this.updateStats();
    this.showToast("Ingresos actualizados", "success");
  }

  renderConfig() {
    const incomeField = document.getElementById("monthlyIncome");
    if (incomeField) {
      incomeField.value = this.monthlyIncome;
    }

    const container = document.getElementById("monthSummary");
    if (!container) return;

    const totalExpenses = this.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const available = this.monthlyIncome - totalExpenses;
    const savingsGoal = this.goals.reduce(
      (sum, goal) => sum + (goal.target - goal.current),
      0
    );

    container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-content">
                        <h3>Ingresos del Mes</h3>
                        <p class="stat-value">$${this.monthlyIncome.toLocaleString()}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <h3>Gastos Totales</h3>
                        <p class="stat-value">$${totalExpenses.toLocaleString()}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <h3>Dinero Disponible</h3>
                        <p class="stat-value" style="color: ${
                          available >= 0
                            ? "var(--color-success)"
                            : "var(--color-error)"
                        }">
                            $${available.toLocaleString()}
                        </p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <h3>Falta para Metas</h3>
                        <p class="stat-value">$${savingsGoal.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div class="card mt-16">
                <div class="card__header">
                    <h3>Análisis del Mes</h3>
                </div>
                <div class="card__body">
                    <div class="recommendation-item">
                        <i class="fas fa-info-circle recommendation-icon"></i>
                        <div class="recommendation-text">
                            ${
                              available >= 0
                                ? `Tienes $${available} disponibles. Considera destinar parte a tus metas de ahorro.`
                                : `Estás gastando $${Math.abs(
                                    available
                                  )} más de tus ingresos. Revisa tus gastos innecesarios.`
                            }
                        </div>
                    </div>
                    ${
                      this.expenses.filter(
                        (exp) => exp.category === "Servicios"
                      ).length > 0
                        ? `
                        <div class="recommendation-item">
                            <i class="fas fa-question-circle recommendation-icon"></i>
                            <div class="recommendation-text">
                                Este mes compraste ${
                                  this.expenses.filter((exp) =>
                                    exp.description
                                      .toLowerCase()
                                      .includes("bombona")
                                  ).length
                                } bombona(s) de gas. ¿Era necesario?
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  // Utility Methods
  showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    const icon = toast.querySelector(".toast-icon");
    const messageEl = toast.querySelector(".toast-message");

    // Set icon based on type
    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      info: "fas fa-info-circle",
    };

    if (icon) icon.className = `toast-icon ${icons[type]}`;
    if (messageEl) messageEl.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
      toast.className = "toast hidden";
    }, 3000);
  }

  toggleTheme() {
    const currentTheme =
      document.documentElement.getAttribute("data-color-scheme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-color-scheme", newTheme);

    const icon = document.querySelector("#themeToggle i");
    if (icon) {
      icon.className = newTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  window.app = new FinanceApp();
  window.app.init();
});

// Fallback initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.app) {
      window.app = new FinanceApp();
      window.app.init();
    }
  });
} else {
  window.app = new FinanceApp();
  window.app.init();
}
// === Toggle mostrar/ocultar contraseña ===
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("toggle-pass")) {
    const input = e.target.previousElementSibling; // el input está justo antes del ojito
    if (input && input.type === "password") {
      input.type = "text";
      e.target.classList.remove("fa-eye");
      e.target.classList.add("fa-eye-slash");
    } else if (input && input.type === "text") {
      input.type = "password";
      e.target.classList.remove("fa-eye-slash");
      e.target.classList.add("fa-eye");
    }
  }
});

// === Animaciones con scroll (Intersection Observer) ===
document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.1 }
  );

  reveals.forEach((el) => observer.observe(el));
});
