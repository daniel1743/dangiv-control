# FIX COMPLETO: Onboarding Solo Después del Registro

## Resumen

Este fix asegura que:
- ✅ El landing page se muestre SIN interferencias para usuarios anónimos
- ✅ El modal de onboarding aparezca SOLO después de que alguien se registre
- ✅ Usuarios anónimos vean el landing limpio y sin modales

## Cambios Aplicados

### 1. ✅ `fin-widget.js` - Ya Aplicado

Se modificó el método `checkFirstVisit()` (línea 183) para que NO muestre el modal automáticamente a usuarios anónimos:

```javascript
async checkFirstVisit() {
  // IMPORTANTE: NO mostrar modal automáticamente para usuarios anónimos
  const isAnonymous = !window.app || window.app.currentUser === 'anonymous';

  if (isAnonymous) {
    console.log('⏭️ Usuario anónimo - No se muestra modal de onboarding automáticamente');
    return; // Salir sin mostrar nada
  }
  // ... resto del código
}
```

También se agregó el método `showOnboardingAfterRegistration()` (línea 538).

### 2. ⏳ `app.js` - PENDIENTE DE APLICAR

**Ubicación**: Busca la línea **2602** en `app.js` que dice:
```javascript
// Cerrar modal y redirigir al dashboard
```

**Reemplazar** las líneas 2602-2614 con:

```javascript
      // Cerrar modal y redirigir al dashboard
      this.closeAuthModal();
      this.showSection('dashboard');

      // Mostrar mensaje de bienvenida personalizado
      if (this.allMessages) {
        this.showWelcomeMessage();
      }

      // NUEVO: Mostrar onboarding de creación de plan después del registro
      setTimeout(() => {
        if (window.showOnboardingAfterRegistration) {
          console.log('✅ Mostrando onboarding para nuevo usuario');
          window.showOnboardingAfterRegistration();
        } else {
          console.warn('⚠️ showOnboardingAfterRegistration no está disponible');
          // Fallback: iniciar tour si el onboarding no está disponible
          this.startTour();
        }
      }, 1000);

      return true;
```

### 3. ✅ `onboarding-manager.js` - Ya Aplicado (sesión anterior)

El script solo se inicializa cuando estamos en `onboarding.html`.

### 4. ✅ `index.html` - Ya Aplicado (sesión anterior)

El script `onboarding-manager.js` está comentado en `index.html`.

## Pasos Para Aplicar el Fix Pendiente

1. **Cierra tu servidor de desarrollo** (si tienes uno activo)
2. **Abre** `app.js`
3. **Busca** la línea 2602 usando Ctrl+G (o Cmd+G en Mac)
4. **Reemplaza** el código según las instrucciones arriba
5. **Guarda** el archivo
6. **Inicia** nuevamente tu servidor
7. **Prueba**:
   - Abre la página como usuario anónimo → Debes ver el landing limpio
   - Regístrate con un nuevo email → Después del registro debe aparecer el modal de onboarding

## Resultado Esperado

### Para Usuarios Anónimos:
```
1. Abren la página
2. Ven el landing page completo
3. NO aparece ningún modal
4. Pueden explorar el landing libremente
```

### Para Usuarios que se Registran:
```
1. Hacen clic en "Registrarse"
2. Completan el formulario
3. Se registran exitosamente
4. Son redirigidos al dashboard
5. Aparece el modal de onboarding (crear plan financiero)
6. Pueden completar el onboarding guiado
```

## Verificación

Abre la consola del navegador y busca estos mensajes:

**Usuario Anónimo:**
```
⏭️ Usuario anónimo - No se muestra modal de onboarding automáticamente
👤 Usuario anónimo: Mostrando landing page
```

**Usuario Registrado:**
```
🎉 Nuevo usuario registrado - Mostrando onboarding
✅ Mostrando onboarding para nuevo usuario
```

## Archivos Modificados

- ✅ `fin-widget.js` (líneas 183-213, 534-547)
- ✅ `onboarding-manager.js` (líneas 807-824)
- ✅ `index.html` (línea 5405-5406)
- ⏳ `app.js` (líneas 2602-2614) **← PENDIENTE**

---

## Troubleshooting

### Si el landing sigue mostrando algo encima:

1. Abre las DevTools (F12)
2. Ve a la pestaña Console
3. Busca mensajes de error
4. Verifica que veas el mensaje de "Usuario anónimo"

### Si el onboarding no aparece después del registro:

1. Verifica que `fin-widget.js` esté cargado
2. Busca en consola el mensaje "Fin Widget está listo"
3. Verifica que `window.showOnboardingAfterRegistration` esté definido

```javascript
// Prueba en consola:
console.log(typeof window.showOnboardingAfterRegistration); // Debe ser "function"
```

---

**Fecha**: $(date)
**Archivos**: 4 archivos modificados
**Estado**: 3/4 completados (falta aplicar cambio en app.js)
