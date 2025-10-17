// ========================================
// SISTEMA DE HISTORIAL DE BALANCE
// Modal interactivo con gráfico animado
// ========================================

let balanceHistoryChart = null;

// ========================================
// EFECTO RIPPLE AL HACER CLICK
// ========================================
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.add('ripple');

  button.appendChild(ripple);

  setTimeout(() => ripple.remove(), 600);
}

// ========================================
// ABRIR MODAL
// ========================================
function openBalanceHistoryModal(event) {
  // Crear efecto ripple si se pasó el evento
  if (event) {
    createRipple(event);
  }

  const modal = document.getElementById('balanceHistoryModal');
  if (!modal) {
    console.error('Modal de historial de balance no encontrado');
    return;
  }

  console.log('📊 Abriendo modal de historial de balance...');

  // Obtener datos de la aplicación (primero intentar window.app, luego window.financeApp)
  const app = window.app || window.financeApp;

  if (!app) {
    console.error('❌ No se encontró la aplicación (window.app o window.financeApp)');
    alert('Error: No se pudo cargar los datos de la aplicación');
    return;
  }

  const expenses = app.expenses || [];
  const monthlyIncome = app.monthlyIncome || 0;

  console.log('💰 Datos obtenidos:', {
    expensesCount: expenses.length,
    monthlyIncome: monthlyIncome,
    monthlyIncomeType: typeof monthlyIncome,
    firstExpense: expenses[0],
    firstExpenseAmount: expenses[0]?.amount,
    firstExpenseAmountType: typeof expenses[0]?.amount
  });

  if (expenses.length === 0) {
    // Verificar si existe la función showToast
    if (typeof showToast === 'function') {
      showToast('No hay datos de gastos para mostrar el historial', 'warning');
    } else {
      alert('No hay datos de gastos para mostrar el historial');
    }
    return;
  }

  // Preparar datos para el gráfico
  console.log('📈 Preparando datos del historial...');
  const historyData = prepareBalanceHistoryData(expenses, monthlyIncome);
  console.log('✅ Datos preparados:', historyData);

  // Actualizar tarjetas de resumen
  console.log('📋 Actualizando tarjetas de resumen...');
  updateSummaryCards(historyData);

  // Crear gráfico
  console.log('📊 Creando gráfico...');
  createBalanceChart(historyData);

  // Mostrar modal con animación
  console.log('🎭 Mostrando modal...');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  console.log('✅ Modal mostrado correctamente');

  // Animar entrada de tarjetas de resumen
  setTimeout(() => {
    const cards = modal.querySelectorAll('.balance-summary-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'all 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 50);
      }, index * 100);
    });
  }, 100);

  // Inicializar efectos adicionales
  initBalanceModalEffects(historyData);
}

// ========================================
// CERRAR MODAL
// ========================================
function closeBalanceHistoryModal() {
  const modal = document.getElementById('balanceHistoryModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Destruir gráfico al cerrar
  if (balanceHistoryChart) {
    balanceHistoryChart.destroy();
    balanceHistoryChart = null;
  }
}

// ========================================
// PREPARAR DATOS DEL HISTORIAL
// ========================================
function prepareBalanceHistoryData(expenses, monthlyIncome) {
  // Asegurar que monthlyIncome sea un número
  console.log('💵 Monthly Income RAW:', monthlyIncome, typeof monthlyIncome);

  if (typeof monthlyIncome === 'string') {
    // Eliminar espacios y símbolos de moneda
    monthlyIncome = monthlyIncome.replace(/[$\s]/g, '');
    // Reemplazar comas por puntos para decimales
    monthlyIncome = monthlyIncome.replace(',', '.');
    // Eliminar puntos que sean separadores de miles (dejar solo el último punto como decimal)
    const parts = monthlyIncome.split('.');
    if (parts.length > 2) {
      // Tiene separadores de miles
      monthlyIncome = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
    }
    monthlyIncome = parseFloat(monthlyIncome);
  }
  monthlyIncome = Number(monthlyIncome) || 0;

  // Si el valor es muy pequeño (menos de 100000), probablemente está en miles, multiplicar por 1000
  if (monthlyIncome > 0 && monthlyIncome < 100000) {
    console.log('⚠️ Valor detectado en miles, multiplicando por 1000');
    monthlyIncome = monthlyIncome * 1000;
  }

  console.log('💵 Monthly Income procesado:', monthlyIncome);

  // Agrupar gastos por fecha
  const expensesByDate = {};

  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!expensesByDate[dateKey]) {
      expensesByDate[dateKey] = {
        date: dateKey,
        expenses: [],
        total: 0
      };
    }

    // Asegurar que el monto sea un número
    let amount = expense.amount;
    if (typeof amount === 'string') {
      // Eliminar espacios y símbolos de moneda
      amount = amount.replace(/[$\s]/g, '');
      // Reemplazar comas por puntos para decimales
      amount = amount.replace(',', '.');
      // Eliminar puntos que sean separadores de miles
      const parts = amount.split('.');
      if (parts.length > 2) {
        amount = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
      }
      amount = parseFloat(amount);
    }
    amount = Number(amount) || 0;

    // Si el valor es muy pequeño (menos de 100000), probablemente está en miles
    if (amount > 0 && amount < 100000) {
      amount = amount * 1000;
    }

    expensesByDate[dateKey].expenses.push({
      description: expense.description || 'Sin descripción',
      amount: amount,
      category: expense.category
    });
    expensesByDate[dateKey].total += amount;
  });

  // Ordenar fechas
  const sortedDates = Object.keys(expensesByDate).sort();

  // Calcular balance día por día
  let currentBalance = monthlyIncome;
  const balanceHistory = [];

  // Agregar punto inicial (ingreso completo)
  const firstDate = new Date(sortedDates[0]);
  firstDate.setDate(firstDate.getDate() - 1);
  balanceHistory.push({
    date: firstDate.toISOString().split('T')[0],
    balance: monthlyIncome,
    spent: 0,
    expenses: [],
    formattedDate: formatDateSpanish(firstDate)
  });

  // Procesar cada fecha
  sortedDates.forEach(dateKey => {
    currentBalance -= expensesByDate[dateKey].total;

    balanceHistory.push({
      date: dateKey,
      balance: currentBalance,
      spent: expensesByDate[dateKey].total,
      expenses: expensesByDate[dateKey].expenses,
      formattedDate: formatDateSpanish(new Date(dateKey))
    });
  });

  return {
    history: balanceHistory,
    initialBalance: monthlyIncome,
    currentBalance: currentBalance,
    totalSpent: monthlyIncome - currentBalance,
    daysCount: balanceHistory.length
  };
}

// ========================================
// FORMATEAR FECHA EN ESPAÑOL
// ========================================
function formatDateSpanish(date) {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${dayName} ${day} ${month}`;
}

// ========================================
// ACTUALIZAR TARJETAS DE RESUMEN
// ========================================
function updateSummaryCards(data) {
  console.log('📊 Valores de tarjetas:', {
    initialBalance: data.initialBalance,
    totalSpent: data.totalSpent,
    currentBalance: data.currentBalance,
    daysCount: data.daysCount
  });

  document.getElementById('balanceInitial').textContent = formatCurrency(data.initialBalance);
  document.getElementById('balanceTotalSpent').textContent = formatCurrency(data.totalSpent);
  document.getElementById('balanceCurrent').textContent = formatCurrency(data.currentBalance);
  document.getElementById('balanceDaysCount').textContent = data.daysCount + ' días';

  console.log('📋 Texto de tarjetas actualizado:', {
    initial: document.getElementById('balanceInitial').textContent,
    spent: document.getElementById('balanceTotalSpent').textContent,
    current: document.getElementById('balanceCurrent').textContent
  });
}

// ========================================
// CREAR GRÁFICO DE BALANCE
// ========================================
function createBalanceChart(data) {
  const ctx = document.getElementById('balanceHistoryChart');
  if (!ctx) return;

  // Destruir gráfico anterior si existe
  if (balanceHistoryChart) {
    balanceHistoryChart.destroy();
  }

  // Preparar datos para Chart.js
  const labels = data.history.map(h => h.formattedDate);
  const balanceData = data.history.map(h => h.balance);
  const spentData = data.history.map(h => h.spent);

  // Configuración del gráfico con animaciones suaves
  balanceHistoryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Balance Disponible',
          data: balanceData,
          borderColor: '#21808D',
          backgroundColor: 'rgba(33, 128, 141, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointBackgroundColor: '#21808D',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#21808D',
          pointHoverBorderWidth: 3
        },
        {
          label: 'Gastos del Día',
          data: spentData,
          borderColor: '#FF5459',
          backgroundColor: 'rgba(255, 84, 89, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#FF5459',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 14,
              family: "'Inter', sans-serif",
              weight: '600'
            }
          }
        },
        tooltip: {
          enabled: false, // Deshabilitamos el tooltip por defecto
          external: function(context) {
            customTooltipHandler(context, data);
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            },
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            font: {
              size: 11,
              family: "'Inter', sans-serif"
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            display: false
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeInOutQuart',
        onProgress: function(animation) {
          // Efecto de onda durante la animación
          const progress = animation.currentStep / animation.numSteps;
          this.config.data.datasets.forEach((dataset, i) => {
            const meta = this.getDatasetMeta(i);
            meta.data.forEach((element, index) => {
              const delay = index / meta.data.length;
              if (progress > delay) {
                const localProgress = Math.min((progress - delay) * meta.data.length, 1);
                element.options.pointRadius = dataset.pointRadius * localProgress;
              }
            });
          });
        },
        onComplete: function() {
          // Animación de rebote en los puntos al completar
          this.config.data.datasets.forEach((dataset, i) => {
            const meta = this.getDatasetMeta(i);
            meta.data.forEach((element, index) => {
              setTimeout(() => {
                animatePointBounce(element, dataset.pointRadius);
              }, index * 50);
            });
          });
        }
      },
      onHover: (event, activeElements) => {
        // Cambiar cursor al pasar sobre puntos
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    }
  });
}

// ========================================
// TOOLTIP PERSONALIZADO
// ========================================
function customTooltipHandler(context, historyData) {
  const tooltipModel = context.tooltip;
  const tooltipEl = document.getElementById('balanceTooltip');

  if (!tooltipEl) return;

  // Ocultar si no hay tooltip
  if (tooltipModel.opacity === 0) {
    tooltipEl.style.display = 'none';
    return;
  }

  // Obtener el índice del punto
  const dataIndex = tooltipModel.dataPoints[0].dataIndex;
  const dayData = historyData.history[dataIndex];

  // Construir contenido del tooltip
  let tooltipHTML = `
    <div class="tooltip-date">${dayData.formattedDate}</div>
    <div class="tooltip-balance">Balance: ${formatCurrency(dayData.balance)}</div>
  `;

  // Si hay gastos ese día, mostrarlos con animación
  if (dayData.expenses && dayData.expenses.length > 0) {
    tooltipHTML += '<div class="tooltip-expenses">';
    tooltipHTML += '<div class="expenses-header">Gastos del día</div>';

    // Limitar a máximo 5 gastos
    const expensesToShow = dayData.expenses.slice(0, 5);

    expensesToShow.forEach(expense => {
      tooltipHTML += `
        <div class="expense-item">
          <span class="expense-name" title="${expense.description}">${expense.description}</span>
          <span class="expense-amount">-${formatCurrency(expense.amount)}</span>
        </div>
      `;
    });

    if (dayData.expenses.length > 5) {
      tooltipHTML += `
        <div class="expense-item" style="font-style: italic; opacity: 0.7;">
          <span class="expense-name">+${dayData.expenses.length - 5} más...</span>
          <span class="expense-amount">-${formatCurrency(dayData.spent - expensesToShow.reduce((sum, e) => sum + e.amount, 0))}</span>
        </div>
      `;
    }

    tooltipHTML += `
      <div class="expense-item" style="border-top: 2px solid var(--color-border); margin-top: 0.5rem; padding-top: 0.5rem; font-weight: 700;">
        <span class="expense-name">Total:</span>
        <span class="expense-amount">-${formatCurrency(dayData.spent)}</span>
      </div>
    `;

    tooltipHTML += '</div>';
  }

  tooltipEl.innerHTML = tooltipHTML;

  // Posicionar tooltip
  const position = context.chart.canvas.getBoundingClientRect();
  const tooltipWidth = tooltipEl.offsetWidth;
  const tooltipHeight = tooltipEl.offsetHeight;

  let left = position.left + window.pageXOffset + tooltipModel.caretX;
  let top = position.top + window.pageYOffset + tooltipModel.caretY;

  // Ajustar si se sale de la pantalla
  if (left + tooltipWidth > window.innerWidth) {
    left = left - tooltipWidth - 20;
  } else {
    left = left + 20;
  }

  if (top + tooltipHeight > window.innerHeight) {
    top = top - tooltipHeight - 20;
  } else {
    top = top + 10;
  }

  tooltipEl.style.display = 'block';
  tooltipEl.style.left = left + 'px';
  tooltipEl.style.top = top + 'px';
}

// ========================================
// FORMATEAR MONEDA
// ========================================
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// ========================================
// ANIMACIÓN DE REBOTE EN PUNTOS
// ========================================
function animatePointBounce(element, originalRadius) {
  if (!element || !element.options) return;

  let scale = 1;
  let growing = true;
  let iterations = 0;
  const maxIterations = 3;

  const bounce = setInterval(() => {
    if (growing) {
      scale += 0.1;
      if (scale >= 1.4) {
        growing = false;
      }
    } else {
      scale -= 0.1;
      if (scale <= 1) {
        growing = true;
        iterations++;
      }
    }

    element.options.pointRadius = originalRadius * scale;

    if (iterations >= maxIterations) {
      element.options.pointRadius = originalRadius;
      clearInterval(bounce);
    }
  }, 30);
}

// ========================================
// ANIMACIÓN DE NÚMEROS (CONTADOR)
// ========================================
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = formatCurrency(Math.round(current));
  }, 16);
}

// ========================================
// EFECTO PARALLAX EN TARJETAS
// ========================================
function initParallaxEffect() {
  const modal = document.getElementById('balanceHistoryModal');
  if (!modal) return;

  modal.addEventListener('mousemove', (e) => {
    const cards = modal.querySelectorAll('.balance-summary-card');
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const deltaX = (clientX - cardCenterX) / 50;
      const deltaY = (clientY - cardCenterY) / 50;

      card.style.transform = `perspective(1000px) rotateY(${deltaX}deg) rotateX(${-deltaY}deg) translateY(0)`;
    });
  });

  modal.addEventListener('mouseleave', () => {
    const cards = modal.querySelectorAll('.balance-summary-card');
    cards.forEach(card => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
    });
  });
}

// ========================================
// PARTÍCULAS EN FONDO (EFECTO VISUAL)
// ========================================
function createParticlesBackground() {
  const chartContainer = document.querySelector('.balance-chart-container');
  if (!chartContainer) return;

  // Crear canvas para partículas
  const particlesCanvas = document.createElement('canvas');
  particlesCanvas.style.position = 'absolute';
  particlesCanvas.style.top = '0';
  particlesCanvas.style.left = '0';
  particlesCanvas.style.width = '100%';
  particlesCanvas.style.height = '100%';
  particlesCanvas.style.pointerEvents = 'none';
  particlesCanvas.style.opacity = '0.3';
  particlesCanvas.style.zIndex = '0';

  chartContainer.style.position = 'relative';
  chartContainer.insertBefore(particlesCanvas, chartContainer.firstChild);

  const ctx = particlesCanvas.getContext('2d');
  particlesCanvas.width = chartContainer.offsetWidth;
  particlesCanvas.height = chartContainer.offsetHeight;

  const particles = [];
  const particleCount = 30;

  // Crear partículas
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * particlesCanvas.width,
      y: Math.random() * particlesCanvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    });
  }

  // Animar partículas
  function animateParticles() {
    ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(33, 128, 141, ${particle.opacity})`;
      ctx.fill();

      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Rebotar en los bordes
      if (particle.x < 0 || particle.x > particlesCanvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > particlesCanvas.height) particle.speedY *= -1;
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

// ========================================
// INICIALIZAR EFECTOS ADICIONALES
// ========================================
function initBalanceModalEffects(historyData) {
  setTimeout(() => {
    console.log('🎨 Inicializando efectos visuales...');
    initParallaxEffect();
    createParticlesBackground();

    // Animar números de tarjetas usando los valores numéricos reales
    const balanceInitialEl = document.getElementById('balanceInitial');
    const balanceCurrentEl = document.getElementById('balanceCurrent');
    const balanceTotalSpentEl = document.getElementById('balanceTotalSpent');

    if (balanceInitialEl && historyData) {
      console.log('💫 Animando Balance Inicial:', historyData.initialBalance);
      animateValue(balanceInitialEl, 0, historyData.initialBalance, 1500);
    }

    if (balanceCurrentEl && historyData) {
      console.log('💫 Animando Balance Actual:', historyData.currentBalance);
      animateValue(balanceCurrentEl, 0, historyData.currentBalance, 1500);
    }

    if (balanceTotalSpentEl && historyData) {
      console.log('💫 Animando Total Gastado:', historyData.totalSpent);
      animateValue(balanceTotalSpentEl, 0, historyData.totalSpent, 1500);
    }

    console.log('✅ Efectos inicializados');
  }, 200);
}

// ========================================
// CERRAR MODAL AL HACER CLICK FUERA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Inicializando Balance History System...');

  const modal = document.getElementById('balanceHistoryModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeBalanceHistoryModal();
      }
    });
    console.log('✅ Event listener agregado al modal');
  } else {
    console.warn('⚠️ Modal de balance no encontrado en el DOM');
  }
});

console.log('✅ Balance History System loaded');
