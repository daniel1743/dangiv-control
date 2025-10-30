// ========================================
// SCRIPT DE DEBUGGING - CAMPOS REQUIRED
// Ejecutar en la consola del navegador
// ========================================

/**
 * Este script identifica qué campos required están causando problemas
 *
 * CÓMO USAR:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este código completo
 * 3. Presiona Enter
 * 4. Revisa el reporte en la consola
 */

(function() {
  console.log('🔍 INICIANDO ANÁLISIS DE CAMPOS REQUIRED...\n');

  const form = document.getElementById('expenseForm');
  if (!form) {
    console.error('❌ No se encontró el formulario expenseForm');
    return;
  }

  const requiredInputs = form.querySelectorAll('[required]');
  console.log(`📋 Total de campos required encontrados: ${requiredInputs.length}\n`);

  const problematicFields = [];
  const okFields = [];

  requiredInputs.forEach((input, index) => {
    const fieldInfo = {
      index: index + 1,
      id: input.id || '(sin id)',
      name: input.name || '(sin name)',
      type: input.type || input.tagName.toLowerCase(),
      value: input.value || '(vacío)',
      visible: input.offsetParent !== null,
      display: window.getComputedStyle(input).display,
      visibility: window.getComputedStyle(input).visibility,
      disabled: input.disabled,
      readonly: input.readOnly
    };

    // Identificar campos problemáticos
    const isProblematic = (
      !fieldInfo.visible ||
      fieldInfo.display === 'none' ||
      fieldInfo.visibility === 'hidden' ||
      (!fieldInfo.value && fieldInfo.id !== 'amount')
    );

    if (isProblematic) {
      problematicFields.push(fieldInfo);
    } else {
      okFields.push(fieldInfo);
    }
  });

  // Reporte de campos OK
  console.log('✅ CAMPOS REQUIRED SIN PROBLEMAS:');
  console.table(okFields);

  // Reporte de campos problemáticos
  if (problematicFields.length > 0) {
    console.log('\n❌ CAMPOS REQUIRED PROBLEMÁTICOS:');
    console.table(problematicFields);

    console.log('\n🔧 DETALLES DE CAMPOS PROBLEMÁTICOS:\n');
    problematicFields.forEach(field => {
      console.group(`Campo #${field.index}: ${field.id || field.name}`);
      console.log('ID:', field.id);
      console.log('Name:', field.name);
      console.log('Tipo:', field.type);
      console.log('Valor:', field.value);
      console.log('Visible:', field.visible ? '✅ SÍ' : '❌ NO');
      console.log('Display:', field.display);
      console.log('Visibility:', field.visibility);
      console.log('Disabled:', field.disabled);
      console.log('Readonly:', field.readonly);

      // Obtener el elemento real
      const element = document.getElementById(field.id) || document.querySelector(`[name="${field.name}"]`);
      if (element) {
        console.log('Elemento:', element);
      }

      console.groupEnd();
    });

    console.log('\n💡 SOLUCIÓN RECOMENDADA:\n');
    console.log('1. Reemplazar la función applyDataToForm() con FIX-URGENTE-applyDataToForm.js');
    console.log('2. O ejecutar el siguiente código para remover required temporalmente:\n');

    console.log(`
// Remover required de campos problemáticos
const problematicIds = ${JSON.stringify(problematicFields.map(f => f.id))};
problematicIds.forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.removeAttribute('required');
    console.log('✅ Required removido de:', id);
  }
});
    `);

  } else {
    console.log('\n🎉 NO SE ENCONTRARON CAMPOS PROBLEMÁTICOS');
    console.log('El problema puede estar en otro lugar.');
  }

  // Información adicional
  console.log('\n📊 RESUMEN:');
  console.log(`- Campos OK: ${okFields.length}`);
  console.log(`- Campos problemáticos: ${problematicFields.length}`);
  console.log(`- Total: ${requiredInputs.length}`);

  // Verificar custom dropdowns
  console.log('\n🔍 VERIFICANDO CUSTOM DROPDOWNS:');
  const customDropdowns = document.querySelectorAll('.custom-dropdown-mobile');
  console.log(`Encontrados: ${customDropdowns.length}`);

  customDropdowns.forEach(dropdown => {
    const select = dropdown.querySelector('select');
    if (select) {
      console.log(`- Select ID: ${select.id}, Visible: ${select.offsetParent !== null}, Value: ${select.value || '(vacío)'}`);
    }
  });

  console.log('\n✅ ANÁLISIS COMPLETADO\n');
})();

// ========================================
// SOLUCIÓN RÁPIDA TEMPORAL
// ========================================

/**
 * Si necesitas una solución INMEDIATA mientras implementas el fix:
 * Ejecuta este código en la consola:
 */

function fixQuick() {
  const form = document.getElementById('expenseForm');
  if (!form) return;

  // Remover required de campos ocultos
  const requiredInputs = form.querySelectorAll('[required]');
  requiredInputs.forEach(input => {
    if (input.offsetParent === null || input.style.display === 'none') {
      input.removeAttribute('required');
      console.log('✅ Required removido de campo oculto:', input.id || input.name);
    }
  });

  console.log('✅ Fix rápido aplicado. Intenta aplicar datos ahora.');
}

// Descomentar para ejecutar:
// fixQuick();
