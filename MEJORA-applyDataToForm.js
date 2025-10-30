// ========================================
// FUNCIÓN MEJORADA: applyDataToForm()
// Para reemplazar en app.js línea 19829
// ========================================

/**
 * Aplica los datos extraídos por IA al formulario de gastos
 * Mejoras implementadas:
 * - ✅ Llena TODOS los campos incluido USER
 * - ✅ Sincronización bidireccional del campo Usuario
 * - ✅ Feedback visual con clase 'field-filled-by-ai'
 * - ✅ Formateo de items con viñetas
 * - ✅ Contador de campos aplicados
 * - ✅ Focus automático para revisión
 */
applyDataToForm() {
  if (!this.extractedData) {
    this.showToast('No hay datos para aplicar', 'error');
    return;
  }

  console.log('📊 Aplicando datos extraídos:', this.extractedData);
  let fieldsFilledCount = 0;

  // 1. Fill AMOUNT field
  if (this.extractedData.amount) {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
      amountInput.value = this.extractedData.amount;
      amountInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
    }
  }

  // 2. Fill DESCRIPTION field
  if (this.extractedData.description) {
    const descInput = document.getElementById('description');
    if (descInput) {
      descInput.value = this.extractedData.description;
      descInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
    }
  }

  // 3. Fill CATEGORY field (via smartAutoComplete or direct)
  if (this.extractedData.category) {
    if (window.smartAutoComplete) {
      window.smartAutoComplete.fillCategory(this.extractedData.category, { force: true });
      const categorySelect = document.getElementById('category');
      if (categorySelect) {
        categorySelect.classList.add('field-filled-by-ai');
      }
      fieldsFilledCount++;
    } else {
      // Fallback: fill directly
      const categorySelect = document.getElementById('category');
      if (categorySelect) {
        // Buscar si la categoría existe
        const optionExists = Array.from(categorySelect.options)
          .some(opt => opt.value.toLowerCase() === this.extractedData.category.toLowerCase());

        if (optionExists) {
          categorySelect.value = this.extractedData.category;
        } else {
          // Si no existe, usar "Otros" y agregar nota
          categorySelect.value = 'Otros';
          const notesField = document.getElementById('notes');
          if (notesField) {
            const currentNotes = notesField.value || '';
            notesField.value = `Categoría sugerida: ${this.extractedData.category}\n${currentNotes}`;
          }
        }
        categorySelect.classList.add('field-filled-by-ai');
        fieldsFilledCount++;
      }
    }
  }

  // 4. Fill NECESSITY/PRIORITY field (via smartAutoComplete or direct)
  if (this.extractedData.priority || this.extractedData.necessity) {
    const necessityValue = this.extractedData.priority || this.extractedData.necessity;
    if (window.smartAutoComplete) {
      window.smartAutoComplete.fillNecessity(necessityValue, { force: true });
      const necessitySelect = document.getElementById('necessity');
      if (necessitySelect) {
        necessitySelect.classList.add('field-filled-by-ai');
      }
      fieldsFilledCount++;
    } else {
      // Fallback: fill directly
      const necessitySelect = document.getElementById('necessity');
      if (necessitySelect) {
        necessitySelect.value = necessityValue;
        necessitySelect.classList.add('field-filled-by-ai');
        fieldsFilledCount++;
      }
    }
  }

  // 5. Fill DATE field
  if (this.extractedData.date) {
    const dateInput = document.getElementById('date');
    if (dateInput) {
      dateInput.value = this.extractedData.date;
      dateInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
    }
  }

  // 6. Fill USER field ⭐ CRÍTICO - SINCRONIZACIÓN BIDIRECCIONAL
  if (this.extractedData.user) {
    const userSelect = document.getElementById('user');
    const userField = document.getElementById('selectedUserField');

    if (userSelect) {
      // Buscar si el usuario existe en las opciones
      const userExists = Array.from(userSelect.options)
        .some(opt => opt.value.toLowerCase() === this.extractedData.user.toLowerCase());

      if (userExists) {
        userSelect.value = this.extractedData.user;
      } else {
        // Si no existe, usar el usuario actual o "Sin asignar"
        userSelect.value = this.userProfile?.name || '';
      }

      // ⭐ IMPORTANTE: Llamar a la función de actualización visual
      if (typeof this.updateSelectedUserPreview === 'function') {
        this.updateSelectedUserPreview(userSelect);
      }

      userSelect.classList.add('field-filled-by-ai');
      if (userField) {
        userField.classList.add('field-filled-by-ai');
      }
      fieldsFilledCount++;
    }
  }

  // 7. Fill ITEMS field with formatting
  if (this.extractedData.items && Array.isArray(this.extractedData.items) && this.extractedData.items.length > 0) {
    const itemsInput = document.getElementById('items');
    if (itemsInput) {
      // Formatear items como lista con viñetas
      const formattedItems = this.extractedData.items
        .map(item => `• ${item.trim()}`)
        .join('\n');
      itemsInput.value = formattedItems;
      itemsInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
    }
  }

  // 8. Fill NOTES field with additional information
  const notesInput = document.getElementById('notes');
  if (notesInput) {
    const notesParts = [];

    if (this.extractedData.store_name) {
      notesParts.push(`📍 Compra realizada en: ${this.extractedData.store_name}`);
    }

    if (this.extractedData.store_location) {
      notesParts.push(`📌 Ubicación: ${this.extractedData.store_location}`);
    }

    if (this.extractedData.payment_method) {
      notesParts.push(`💳 Método de pago: ${this.extractedData.payment_method}`);
    }

    if (this.extractedData.card_last_digits) {
      notesParts.push(`🔢 Tarjeta terminada en: ${this.extractedData.card_last_digits}`);
    }

    if (this.extractedData.receipt_number) {
      notesParts.push(`📄 Boleta/Factura N°: ${this.extractedData.receipt_number}`);
    }

    if (notesParts.length > 0) {
      // Preservar notas existentes y agregar las nuevas
      const existingNotes = notesInput.value;
      if (existingNotes && !existingNotes.includes('Categoría sugerida')) {
        notesInput.value = existingNotes + '\n\n' + notesParts.join('\n');
      } else {
        notesInput.value = notesParts.join('\n');
      }
      notesInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
    }
  }

  // Trigger smart autocomplete analysis if available
  if (window.smartAutoComplete && typeof window.smartAutoComplete.analyzeAndFill === 'function') {
    window.smartAutoComplete.analyzeAndFill();
  }

  // 9. Close modal
  this.closeModal();

  // 10. Focus first field for review
  const amountInput = document.getElementById('amount');
  if (amountInput) {
    setTimeout(() => {
      amountInput.focus();
      amountInput.select();
    }, 300);
  }

  // 11. Show success message with details
  this.showToast(
    `✅ ${fieldsFilledCount} campos aplicados automáticamente. Revisa antes de guardar.`,
    'success',
    5000
  );

  console.log(`✅ ${fieldsFilledCount} campos rellenados por IA`);
}
