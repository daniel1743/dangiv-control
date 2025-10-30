// ========================================
// FIX URGENTE: applyDataToForm()
// Soluciona: "An invalid form control is not focusable"
// ========================================

/**
 * PROBLEMA:
 * - Campos required ocultos por custom dropdowns
 * - Campos con name='' que son required
 * - Submit bloqueado por validación HTML5
 *
 * SOLUCIÓN:
 * - Remover temporalmente 'required' antes de aplicar datos
 * - Restaurar 'required' después de aplicar datos
 * - Asegurar que todos los campos tengan valor válido
 */

applyDataToForm() {
  if (!this.extractedData) {
    this.showToast('No hay datos para aplicar', 'error');
    return;
  }

  console.log('📊 Aplicando datos extraídos:', this.extractedData);
  let fieldsFilledCount = 0;

  // ⭐ PASO 0: DESACTIVAR VALIDACIÓN TEMPORAL
  const form = document.getElementById('expenseForm');
  const requiredFields = [];

  if (form) {
    // Guardar campos required y remover atributo temporalmente
    const allRequiredInputs = form.querySelectorAll('[required]');
    allRequiredInputs.forEach(input => {
      requiredFields.push(input);
      input.removeAttribute('required');
      console.log(`🔓 Required removido temporalmente de: ${input.id || input.name}`);
    });
  }

  // 1. Fill AMOUNT field
  if (this.extractedData.amount) {
    const amountInput = document.getElementById('amount');
    if (amountInput) {
      amountInput.value = this.extractedData.amount;
      amountInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
      console.log('✅ Amount aplicado:', this.extractedData.amount);
    }
  }

  // 2. Fill DESCRIPTION field
  if (this.extractedData.description) {
    const descInput = document.getElementById('description');
    if (descInput) {
      descInput.value = this.extractedData.description;
      descInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
      console.log('✅ Description aplicado:', this.extractedData.description);
    }
  }

  // 3. Fill CATEGORY field
  if (this.extractedData.category) {
    // Primero intentar con smartAutoComplete
    if (window.smartAutoComplete) {
      try {
        window.smartAutoComplete.fillCategory(this.extractedData.category, { force: true });
        console.log('✅ Category aplicado via smartAutoComplete:', this.extractedData.category);
        fieldsFilledCount++;
      } catch (error) {
        console.error('❌ Error al aplicar category:', error);
      }
    }

    // Asegurar que el select nativo también tenga el valor (importante para custom dropdowns)
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
      const optionExists = Array.from(categorySelect.options)
        .some(opt => opt.value.toLowerCase() === this.extractedData.category.toLowerCase());

      if (optionExists) {
        categorySelect.value = this.extractedData.category;
        console.log('✅ Select nativo de category actualizado:', categorySelect.value);
      } else {
        categorySelect.value = 'Otros';
        console.log('⚠️ Categoría no existe, usando "Otros"');
      }

      categorySelect.classList.add('field-filled-by-ai');

      // Disparar evento change para custom dropdowns
      const changeEvent = new Event('change', { bubbles: true });
      categorySelect.dispatchEvent(changeEvent);
    }
  }

  // 4. Fill NECESSITY/PRIORITY field
  if (this.extractedData.priority || this.extractedData.necessity) {
    const necessityValue = this.extractedData.priority || this.extractedData.necessity;

    // Intentar con smartAutoComplete
    if (window.smartAutoComplete) {
      try {
        window.smartAutoComplete.fillNecessity(necessityValue, { force: true });
        console.log('✅ Necessity aplicado via smartAutoComplete:', necessityValue);
        fieldsFilledCount++;
      } catch (error) {
        console.error('❌ Error al aplicar necessity:', error);
      }
    }

    // Asegurar que el select nativo también tenga el valor
    const necessitySelect = document.getElementById('necessity');
    if (necessitySelect) {
      necessitySelect.value = necessityValue;
      necessitySelect.classList.add('field-filled-by-ai');

      // Disparar evento change para custom dropdowns
      const changeEvent = new Event('change', { bubbles: true });
      necessitySelect.dispatchEvent(changeEvent);

      console.log('✅ Select nativo de necessity actualizado:', necessitySelect.value);
    }
  }

  // 5. Fill DATE field
  if (this.extractedData.date) {
    const dateInput = document.getElementById('date');
    if (dateInput) {
      dateInput.value = this.extractedData.date;
      dateInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
      console.log('✅ Date aplicado:', this.extractedData.date);
    }
  } else {
    // Si no hay fecha, usar fecha actual
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.value) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      console.log('✅ Date establecido a hoy:', today);
    }
  }

  // 6. Fill USER field ⭐ CRÍTICO - SINCRONIZACIÓN BIDIRECCIONAL
  if (this.extractedData.user) {
    const userSelect = document.getElementById('user');
    const userField = document.getElementById('selectedUserField');

    if (userSelect) {
      const userExists = Array.from(userSelect.options)
        .some(opt => opt.value && opt.value.toLowerCase() === this.extractedData.user.toLowerCase());

      if (userExists) {
        userSelect.value = this.extractedData.user;
      } else {
        // Usar usuario actual o primer usuario disponible
        if (this.userProfile?.name) {
          userSelect.value = this.userProfile.name;
        } else if (userSelect.options.length > 1) {
          userSelect.value = userSelect.options[1].value; // Primer usuario que no sea "Sin asignar"
        } else {
          userSelect.value = '';
        }
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
      console.log('✅ User aplicado:', userSelect.value);
    }
  } else {
    // Si no hay usuario en los datos extraídos, asegurar valor por defecto
    const userSelect = document.getElementById('user');
    if (userSelect && !userSelect.value) {
      if (this.userProfile?.name) {
        userSelect.value = this.userProfile.name;
      } else if (userSelect.options.length > 1) {
        userSelect.value = userSelect.options[1].value;
      }

      if (typeof this.updateSelectedUserPreview === 'function') {
        this.updateSelectedUserPreview(userSelect);
      }
      console.log('✅ User establecido por defecto:', userSelect.value);
    }
  }

  // 7. Fill ITEMS field with formatting
  if (this.extractedData.items && Array.isArray(this.extractedData.items) && this.extractedData.items.length > 0) {
    const itemsInput = document.getElementById('items');
    if (itemsInput) {
      const formattedItems = this.extractedData.items
        .map(item => `• ${item.trim()}`)
        .join('\n');
      itemsInput.value = formattedItems;
      itemsInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
      console.log('✅ Items aplicados:', formattedItems);
    }
  }

  // 8. Fill NOTES field
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
      const existingNotes = notesInput.value;
      if (existingNotes && !existingNotes.includes('Categoría sugerida')) {
        notesInput.value = existingNotes + '\n\n' + notesParts.join('\n');
      } else {
        notesInput.value = notesParts.join('\n');
      }
      notesInput.classList.add('field-filled-by-ai');
      fieldsFilledCount++;
      console.log('✅ Notes aplicadas');
    }
  }

  // ⭐ PASO FINAL: RESTAURAR VALIDACIÓN
  setTimeout(() => {
    // Restaurar atributo required
    requiredFields.forEach(input => {
      input.setAttribute('required', '');
      console.log(`🔒 Required restaurado en: ${input.id || input.name}`);
    });
  }, 500);

  // Trigger smart autocomplete analysis if available
  if (window.smartAutoComplete && typeof window.smartAutoComplete.analyzeAndFill === 'function') {
    try {
      window.smartAutoComplete.analyzeAndFill();
    } catch (error) {
      console.error('Error en smartAutoComplete.analyzeAndFill:', error);
    }
  }

  // 9. Close modal
  this.closeModal();

  // 10. Focus first field for review
  const amountInput = document.getElementById('amount');
  if (amountInput) {
    setTimeout(() => {
      amountInput.focus();
      amountInput.select();
    }, 600);
  }

  // 11. Show success message with details
  this.showToast(
    `✅ ${fieldsFilledCount} campos aplicados automáticamente. Revisa antes de guardar.`,
    'success',
    5000
  );

  console.log(`✅ ${fieldsFilledCount} campos rellenados por IA`);
  console.log('📊 Estado final de campos required restaurado');
}

// ========================================
// INSTRUCCIONES DE USO
// ========================================

/**
 * CÓMO APLICAR ESTE FIX:
 *
 * 1. Abre app.js
 * 2. Busca la función applyDataToForm() (línea ~19829)
 * 3. Reemplaza TODA la función por este código
 * 4. Guarda y recarga la app (Ctrl + F5)
 *
 * VERIFICACIÓN:
 * - Los logs mostrarán "🔓 Required removido temporalmente"
 * - Los logs mostrarán "🔒 Required restaurado"
 * - El botón funcionará sin errores
 */
