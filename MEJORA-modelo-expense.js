// ========================================
// MODELO DE EXPENSE MEJORADO
// Para reemplazar en app.js línea 7500-7511
// ========================================

/**
 * Modelo de gasto mejorado con campos para sincronización bancaria
 * Nuevos campos agregados:
 * - bankTransaction: boolean - Indica si proviene de sincronización bancaria
 * - transactionId: string - ID único de la transacción bancaria para evitar duplicados
 */

const expense = {
  id: Date.now(),
  description: description,
  amount: amount,
  category: category,
  necessity: necessity,
  date: date,
  user: user || 'Sin usuario',
  items: items, // Lista de productos
  notes: notes, // Notas adicionales
  protected: false,
  // ⭐ NUEVOS CAMPOS PARA INTEGRACIÓN BANCARIA
  bankTransaction: false, // Indica si fue creado desde sincronización bancaria
  transactionId: null, // ID de transacción bancaria (para evitar duplicados)
};

// ========================================
// INSTRUCCIONES DE IMPLEMENTACIÓN
// ========================================

/**
 * PASO 1: Reemplazar el objeto expense en la función addExpense()
 * Ubicación: app.js línea 7500-7511
 *
 * PASO 2: Actualizar la función saveData() para incluir los nuevos campos
 * Los campos se guardarán automáticamente al hacer this.saveData()
 *
 * PASO 3: Actualizar addToHistory() si es necesario
 * Agregar los nuevos campos al historial unificado
 */

// ========================================
// EJEMPLO DE USO CON DATOS BANCARIOS
// ========================================

/**
 * Cuando se importan datos desde el banco:
 */
const expenseFromBank = {
  id: Date.now(),
  description: transaction.description || 'Gasto bancario',
  amount: Math.abs(transaction.amount),
  category: this.inferirCategoria(transaction.description),
  necessity: 'Necesario', // Por defecto
  date: transaction.date,
  user: this.currentUser || 'Sin usuario',
  items: '',
  notes: `Importado del banco\n${transaction.details || ''}`,
  protected: false,
  bankTransaction: true, // ✅ Marcado como transacción bancaria
  transactionId: transaction.id, // ✅ ID único para evitar duplicados
};

/**
 * Cuando se crea manualmente:
 */
const expenseManual = {
  id: Date.now(),
  description: description,
  amount: amount,
  category: category,
  necessity: necessity,
  date: date,
  user: user || 'Sin usuario',
  items: items,
  notes: notes,
  protected: false,
  bankTransaction: false, // ✅ NO es transacción bancaria
  transactionId: null, // ✅ Sin ID de transacción
};

/**
 * Cuando se crea desde scanner IA:
 */
const expenseFromAI = {
  id: Date.now(),
  description: this.extractedData.description,
  amount: this.extractedData.amount,
  category: this.extractedData.category,
  necessity: this.extractedData.priority || this.extractedData.necessity,
  date: this.extractedData.date,
  user: this.extractedData.user || this.userProfile?.name || 'Sin usuario',
  items: this.extractedData.items?.join('\n') || '',
  notes: this.extractedData.notes || '',
  protected: false,
  bankTransaction: false, // ✅ Es manual pero asistido por IA
  transactionId: null, // ✅ Sin ID de transacción bancaria
};

// ========================================
// FUNCIÓN AUXILIAR: VERIFICAR DUPLICADOS
// ========================================

/**
 * Verifica si una transacción bancaria ya fue importada
 * @param {string} transactionId - ID de la transacción bancaria
 * @returns {boolean} - true si ya existe
 */
function isDuplicateTransaction(transactionId) {
  if (!transactionId) return false;

  return this.expenses.some(
    expense => expense.transactionId === transactionId
  );
}

/**
 * Ejemplo de uso:
 */
function importarTransaccionBancaria(transaction) {
  // Verificar duplicados
  if (this.isDuplicateTransaction(transaction.id)) {
    console.log(`⚠️ Transacción ${transaction.id} ya existe. Ignorando.`);
    return;
  }

  // Crear expense desde transacción bancaria
  const expense = {
    id: Date.now(),
    description: transaction.description || 'Gasto bancario',
    amount: Math.abs(transaction.amount),
    category: this.inferirCategoria(transaction.description),
    necessity: 'Necesario',
    date: transaction.date,
    user: this.currentUser || 'Sin usuario',
    items: '',
    notes: `Importado del banco\nID: ${transaction.id}`,
    protected: false,
    bankTransaction: true,
    transactionId: transaction.id,
  };

  // Agregar a expenses
  this.expenses.push(expense);
  this.saveData();
  this.renderDashboard();
  this.renderExpenses();
}

// ========================================
// ACTUALIZACIÓN DEL HISTORIAL UNIFICADO
// ========================================

/**
 * También actualizar addToHistory() para incluir los nuevos campos
 * Ubicación: app.js (buscar función addToHistory)
 */
this.addToHistory({
  type: 'gasto',
  amount: amount,
  description: description,
  date: date,
  category: category,
  necessity: necessity,
  user: user || 'Sin usuario',
  bankTransaction: bankTransaction || false, // ⭐ NUEVO
  transactionId: transactionId || null, // ⭐ NUEVO
});
