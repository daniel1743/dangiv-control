// Data Storage (using in-memory variables instead of localStorage)
let expenses = [];
let users = [
  { name: "Juan", emoji: "👨" },
  { name: "María", emoji: "👩" },
  { name: "Pedro", emoji: "👦" }
];

const categories = [
  { name: "Alimentación", icon: "🍕" },
  { name: "Transporte", icon: "🚗" },
  { name: "Entretenimiento", icon: "🎬" },
  { name: "Salud", icon: "💊" },
  { name: "Educación", icon: "📚" },
  { name: "Otros", icon: "📌" }
];

const emojiOptions = ["👨", "👩", "👦", "👧", "👴", "👵", "🧑", "👶"];

const sampleDescriptions = [
  "Compra en supermercado",
  "Gasolina",
  "Película en cine",
  "Consulta médica",
  "Libro",
  "Cena con amigos"
];

// State Variables
let selectedCategory = null;
let selectedUser = null;
let selectedNecessity = null;
let selectedEmoji = null;

// DOM Elements
const aiScannerBtn = document.getElementById('aiScannerBtn');
const aiLoader = document.getElementById('aiLoader');
const expenseForm = document.getElementById('expenseForm');
const clearBtn = document.getElementById('clearBtn');
const submitBtn = document.getElementById('submitBtn');

const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');
const itemsInput = document.getElementById('items');
const notesInput = document.getElementById('notes');

// Category Dropdown
const categoryDropdown = document.getElementById('categoryDropdown');
const categoryToggle = document.getElementById('categoryToggle');
const categoryMenu = document.getElementById('categoryMenu');
const categorySearch = document.getElementById('categorySearch');
const categoryItems = document.getElementById('categoryItems');
const selectedCategoryIcon = document.getElementById('selectedCategoryIcon');
const selectedCategoryText = document.getElementById('selectedCategoryText');

// User Dropdown
const userDropdown = document.getElementById('userDropdown');
const userToggle = document.getElementById('userToggle');
const userMenu = document.getElementById('userMenu');
const userItems = document.getElementById('userItems');
const selectedUserEmoji = document.getElementById('selectedUserEmoji');
const selectedUserText = document.getElementById('selectedUserText');
const addUserBtn = document.getElementById('addUserBtn');

// Modal
const modalOverlay = document.getElementById('modalOverlay');
const addUserModal = document.getElementById('addUserModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');
const newUserNameInput = document.getElementById('newUserName');
const emojiSelector = document.getElementById('emojiSelector');

// Toast
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// History
const emptyState = document.getElementById('emptyState');
const historyList = document.getElementById('historyList');

// Necessity Buttons
const necessityBtns = document.querySelectorAll('.necessity-btn');

// Initialize App
function init() {
  // Set today's date
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;

  // Populate categories
  populateCategories();

  // Populate users
  populateUsers();

  // Populate emoji selector
  populateEmojiSelector();

  // Event Listeners
  setupEventListeners();
}

// Populate Categories
function populateCategories() {
  categoryItems.innerHTML = '';
  categories.forEach(category => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.innerHTML = `
      <span style="font-size: 20px;">${category.icon}</span>
      <span>${category.name}</span>
    `;
    item.addEventListener('click', () => selectCategory(category));
    categoryItems.appendChild(item);
  });
}

// Select Category
function selectCategory(category) {
  selectedCategory = category;
  selectedCategoryIcon.textContent = category.icon;
  selectedCategoryText.textContent = category.name;
  categoryDropdown.classList.remove('active');
  clearError('categoryError');
}

// Populate Users
function populateUsers() {
  userItems.innerHTML = '';
  users.forEach(user => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.innerHTML = `
      <span style="font-size: 20px;">${user.emoji}</span>
      <span>${user.name}</span>
    `;
    item.addEventListener('click', () => selectUser(user));
    userItems.appendChild(item);
  });
}

// Select User
function selectUser(user) {
  selectedUser = user;
  selectedUserEmoji.textContent = user.emoji;
  selectedUserText.textContent = user.name;
  userDropdown.classList.remove('active');
  clearError('userError');
}

// Populate Emoji Selector
function populateEmojiSelector() {
  emojiSelector.innerHTML = '';
  emojiOptions.forEach(emoji => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'emoji-option';
    option.textContent = emoji;
    option.addEventListener('click', () => selectEmojiOption(emoji, option));
    emojiSelector.appendChild(option);
  });
}

// Select Emoji Option
function selectEmojiOption(emoji, element) {
  selectedEmoji = emoji;
  document.querySelectorAll('.emoji-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  element.classList.add('selected');
}

// Setup Event Listeners
function setupEventListeners() {
  // AI Scanner
  aiScannerBtn.addEventListener('click', simulateAIScan);

  // Category Dropdown
  categoryToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(categoryDropdown);
    closeDropdown(userDropdown);
  });

  // Category Search
  categorySearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const items = categoryItems.querySelectorAll('.dropdown-item');
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
  });

  // User Dropdown
  userToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(userDropdown);
    closeDropdown(categoryDropdown);
  });

  // Add User Button
  addUserBtn.addEventListener('click', () => {
    openModal();
    closeDropdown(userDropdown);
  });

  // Modal Controls
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  modalSaveBtn.addEventListener('click', saveNewUser);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Necessity Buttons
  necessityBtns.forEach(btn => {
    btn.addEventListener('click', () => selectNecessity(btn));
  });

  // Form Submit
  expenseForm.addEventListener('submit', handleSubmit);

  // Clear Button
  clearBtn.addEventListener('click', clearForm);

  // Amount Input - Only Numbers
  amountInput.addEventListener('input', (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    e.target.value = value;
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    closeDropdown(categoryDropdown);
    closeDropdown(userDropdown);
  });

  // Close modal with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDropdown(categoryDropdown);
      closeDropdown(userDropdown);
    }
  });
}

// Toggle Dropdown
function toggleDropdown(dropdown) {
  dropdown.classList.toggle('active');
}

// Close Dropdown
function closeDropdown(dropdown) {
  dropdown.classList.remove('active');
}

// Select Necessity
function selectNecessity(btn) {
  necessityBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedNecessity = {
    level: btn.dataset.level,
    color: btn.dataset.color
  };
  clearError('necessityError');
}

// Open Modal
function openModal() {
  modalOverlay.classList.add('active');
  newUserNameInput.value = '';
  selectedEmoji = null;
  document.querySelectorAll('.emoji-option').forEach(opt => {
    opt.classList.remove('selected');
  });
}

// Close Modal
function closeModal() {
  modalOverlay.classList.remove('active');
}

// Save New User
function saveNewUser() {
  const name = newUserNameInput.value.trim();
  
  if (!name) {
    alert('Por favor ingresa un nombre de usuario');
    return;
  }
  
  if (!selectedEmoji) {
    alert('Por favor selecciona un emoji');
    return;
  }
  
  const newUser = { name, emoji: selectedEmoji };
  users.push(newUser);
  populateUsers();
  selectUser(newUser);
  closeModal();
  showToast('Usuario agregado exitosamente', '✅');
}

// Simulate AI Scan
function simulateAIScan() {
  aiScannerBtn.disabled = true;
  aiLoader.classList.add('active');
  
  setTimeout(() => {
    // Generate random data
    const randomAmount = (Math.random() * 49000 + 1000).toFixed(2);
    const randomDescription = sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Fill form
    amountInput.value = randomAmount;
    descriptionInput.value = randomDescription;
    selectCategory(randomCategory);
    
    // Hide loader
    aiLoader.classList.remove('active');
    aiScannerBtn.disabled = false;
    
    showToast('Recibo analizado exitosamente', '📷');
  }, 2500);
}

// Clear Form
function clearForm() {
  // Fade out animation
  expenseForm.style.opacity = '0.5';
  
  setTimeout(() => {
    // Reset inputs
    amountInput.value = '';
    descriptionInput.value = '';
    itemsInput.value = '';
    notesInput.value = '';
    
    // Reset selections
    selectedCategory = null;
    selectedUser = null;
    selectedNecessity = null;
    
    selectedCategoryIcon.textContent = '';
    selectedCategoryText.textContent = 'Seleccionar categoría';
    selectedUserEmoji.textContent = '';
    selectedUserText.textContent = 'Seleccionar usuario';
    
    necessityBtns.forEach(btn => btn.classList.remove('active'));
    
    // Clear errors
    document.querySelectorAll('.error-message').forEach(err => {
      err.classList.remove('active');
      err.textContent = '';
    });
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Fade back in
    expenseForm.style.opacity = '1';
  }, 150);
}

// Handle Submit
function handleSubmit(e) {
  e.preventDefault();
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(err => {
    err.classList.remove('active');
    err.textContent = '';
  });
  
  // Validate
  let isValid = true;
  
  if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
    showError('amountError', 'Por favor ingresa un monto válido');
    isValid = false;
  }
  
  if (!descriptionInput.value.trim()) {
    showError('descriptionError', 'Por favor ingresa una descripción');
    isValid = false;
  }
  
  if (!selectedCategory) {
    showError('categoryError', 'Por favor selecciona una categoría');
    isValid = false;
  }
  
  if (!selectedNecessity) {
    showError('necessityError', 'Por favor selecciona un nivel de necesidad');
    isValid = false;
  }
  
  if (!dateInput.value) {
    showError('dateError', 'Por favor selecciona una fecha');
    isValid = false;
  }
  
  if (!selectedUser) {
    showError('userError', 'Por favor selecciona un usuario');
    isValid = false;
  }
  
  if (!isValid) return;
  
  // Create expense object
  const expense = {
    id: Date.now(),
    amount: parseFloat(amountInput.value),
    description: descriptionInput.value.trim(),
    category: selectedCategory,
    necessity: selectedNecessity,
    date: dateInput.value,
    user: selectedUser,
    items: itemsInput.value.trim(),
    notes: notesInput.value.trim(),
    timestamp: new Date()
  };
  
  // Add to expenses array
  expenses.unshift(expense);
  
  // Update history
  updateHistory();
  
  // Show success toast
  showToast('¡Gasto registrado exitosamente!', '✅');
  
  // Clear form
  clearForm();
}

// Show Error
function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.classList.add('active');
}

// Clear Error
function clearError(elementId) {
  const errorElement = document.getElementById(elementId);
  errorElement.classList.remove('active');
  errorElement.textContent = '';
}

// Show Toast
function showToast(message, icon = '✅') {
  toastMessage.textContent = message;
  document.querySelector('.toast-icon').textContent = icon;
  toast.classList.add('active');
  
  setTimeout(() => {
    toast.classList.remove('active');
  }, 4000);
}

// Update History
function updateHistory() {
  if (expenses.length === 0) {
    emptyState.style.display = 'block';
    historyList.classList.remove('active');
    return;
  }
  
  emptyState.style.display = 'none';
  historyList.classList.add('active');
  historyList.innerHTML = '';
  
  expenses.forEach(expense => {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    const relativeTime = getRelativeTime(expense.timestamp);
    const formattedDate = formatDate(expense.date);
    
    item.innerHTML = `
      <div class="history-icon">${expense.category.icon}</div>
      <div class="history-details">
        <div class="history-header">
          <span class="history-description">${expense.description}</span>
          <span class="history-category">${expense.category.name}</span>
        </div>
        <div class="history-meta">
          <span>👤 ${expense.user.name}</span>
          <span>📅 ${formattedDate}</span>
          <span>⏰ ${relativeTime}</span>
          <span class="necessity-badge" style="
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            ${getNecessityStyle(expense.necessity.color)}
          ">${expense.necessity.level.toUpperCase()}</span>
        </div>
      </div>
      <div class="history-amount">$${expense.amount.toFixed(2)}</div>
    `;
    
    historyList.appendChild(item);
  });
}

// Get Necessity Style
function getNecessityStyle(color) {
  const styles = {
    success: 'background: rgba(31, 219, 139, 0.2); color: #1fdb8b; border: 1px solid rgba(31, 219, 139, 0.3);',
    warning: 'background: rgba(255, 200, 87, 0.2); color: #ffc857; border: 1px solid rgba(255, 200, 87, 0.3);',
    error: 'background: rgba(255, 92, 92, 0.2); color: #ff5c5c; border: 1px solid rgba(255, 92, 92, 0.3);',
    critical: 'background: rgba(211, 47, 47, 0.2); color: #d32f2f; border: 1px solid rgba(211, 47, 47, 0.3);'
  };
  return styles[color] || styles.success;
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

// Get Relative Time
function getRelativeTime(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Justo ahora';
  if (minutes < 60) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  return formatDate(timestamp.toISOString().split('T')[0]);
}

// Initialize on load
init();