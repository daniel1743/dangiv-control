# FIX: Pantalla en Blanco - Landing Page Desaparece

## Problema Identificado

El landing page se muestra inicialmente pero luego desaparece, dejando una pantalla en blanco para usuarios anónimos.

## Causa Raíz

El método `showSection()` en `app.js` (línea 4198) oculta TODAS las secciones antes de mostrar una, sin verificar si el usuario es anónimo. Esto causa que se oculte el landing accidentalmente.

## Solución

Agregar una protección al inicio del método `showSection()` para que usuarios anónimos SIEMPRE vean el landing.

### Paso 1: Abrir `app.js`

Busca la línea **4198** que dice:
```javascript
  showSection(sectionId) {
    // Update navigation
```

### Paso 2: Reemplazar el método

Reemplaza el inicio del método (líneas 4198-4228) con esto:

```javascript
  showSection(sectionId) {
    // IMPORTANTE: Si el usuario es anónimo y se intenta mostrar una sección
    // que no sea el landing, ignorar la solicitud
    if (this.currentUser === 'anonymous' && sectionId !== 'landing') {
      console.log(`⚠️ Usuario anónimo intentó acceder a "${sectionId}" - redirigiendo a landing`);
      sectionId = 'landing'; // Forzar landing para usuarios anónimos
    }

    // Update navigation
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.remove('active');
    });

    const activeNavItem = document.querySelector(
      `[data-section="${sectionId}"]`
    );
    if (activeNavItem) {
      activeNavItem.classList.add('active');
    }

    // Update sections
    document.querySelectorAll('.section').forEach((section) => {
      section.classList.remove('active');
    });

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Scroll to top of page when changing sections
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    this.currentSection = sectionId;
```

### Paso 3: Guardar y probar

1. Guarda el archivo `app.js`
2. Recarga la página en tu navegador
3. El landing page debe mostrarse correctamente sin desaparecer

## ¿Qué hace este fix?

1. **Verifica el estado del usuario**: Antes de cambiar de sección, verifica si el usuario es anónimo
2. **Fuerza el landing**: Si un usuario anónimo intenta acceder a cualquier sección (dashboard, gastos, etc.), lo redirige automáticamente al landing
3. **Log de depuración**: Muestra un mensaje en consola cuando detecta el intento

## Resultado Esperado

✅ Usuarios anónimos: Siempre ven el landing page
✅ Usuarios autenticados: Pueden navegar por todas las secciones normalmente
✅ No más pantallas en blanco

## Archivos Modificados

- ✅ `onboarding-manager.js` - Ya corregido (evita bucle infinito)
- ✅ `index.html` - Ya corregido (onboarding-manager.js comentado)
- ⏳ `app.js` - **PENDIENTE DE APLICAR** (este fix)

---

**Nota**: Si el archivo `app.js` sigue siendo modificado automáticamente por un live server, cierra el servidor temporalmente, aplica el cambio, y vuelve a iniciarlo.
