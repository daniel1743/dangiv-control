# ✅ Sistema de Aceptación de Términos y Políticas

## 📁 Archivos Creados

1. **terminos-y-politicas.html** - Página completa con términos y política de privacidad
2. **terms-acceptance.js** - Sistema de aceptación con modal
3. **Estilos agregados a style.css** (líneas 15017-15295)
4. **Integrado en index.html** (líneas 3788-3802 footer + 4955 script)

---

## 🎯 Funcionalidades

### Modal de Aceptación
- ✅ Aparece automáticamente al primer uso
- ✅ Checkbox obligatorio para habilitar botón
- ✅ Resumen de términos y políticas
- ✅ Link a página completa
- ✅ No se puede cerrar sin aceptar (modal bloqueante)
- ✅ Guarda aceptación en localStorage
- ✅ Control de versiones (si cambian términos, pide nueva aceptación)

### Página de Términos Completos
- ✅ Diseño profesional responsive
- ✅ Términos de servicio detallados
- ✅ Política de privacidad completa
- ✅ Información de contacto
- ✅ Última actualización visible

### Footer con Enlaces
- ✅ Nueva sección "Legal" en footer
- ✅ Enlaces a términos y privacidad

---

## 🧪 Cómo Probar

### 1. Primera vez (Usuario nuevo)
```
1. Abrir index.html en navegador
2. Modal de términos aparece automáticamente
3. Checkbox deshabilitado el botón "Aceptar"
4. Marcar checkbox habilita el botón
5. Click "Aceptar y Continuar" → guarda aceptación
6. Toast de bienvenida
7. No volverá a aparecer
```

### 2. Simular usuario que ya aceptó
```javascript
// En consola del navegador:
localStorage.setItem('termsAccepted', 'true');
localStorage.setItem('termsVersion', '1.0');
// Recargar página → modal NO aparece
```

### 3. Forzar nueva aceptación (cambio de versión)
```javascript
// En consola:
window.termsManager.reset();
// Recargar página → modal aparece de nuevo
```

### 4. Ver página completa de términos
```
1. Click en footer → "Términos de Servicio"
2. O navegar a: terminos-y-politicas.html
3. Ver documento completo formateado
```

### 5. Rechazar términos
```
1. Click en "No Acepto"
2. Confirmar en el alert
3. Página muestra mensaje de despedida
4. Botón "Volver" para reintentar
```

---

## 🗂️ Estructura localStorage

```javascript
{
  termsAccepted: "true",           // Aceptación
  termsVersion: "1.0",             // Versión actual
  termsAcceptedDate: "2025-10-16T..." // Timestamp
}
```

---

## 🔧 Personalización

### Cambiar Versión de Términos
**Archivo:** `terms-acceptance.js` línea 7
```javascript
this.currentVersion = '2.0'; // Incrementar versión
```
Esto forzará a todos los usuarios a aceptar de nuevo.

### Modificar Términos
**Archivo:** `terminos-y-politicas.html`
1. Editar contenido HTML
2. Actualizar fecha: línea 61
3. Incrementar versión en `terms-acceptance.js`

### Personalizar Emails de Contacto
**Archivo:** `terminos-y-politicas.html` líneas 287-291
```html
<p>📧 Email: <a href="mailto:TU_EMAIL">TU_EMAIL</a></p>
```

**Archivo:** `terms-acceptance.js` línea 70
```html
<p>Para consultas: <a href="mailto:TU_EMAIL">TU_EMAIL</a></p>
```

---

## 📊 Contenido Incluido

### Términos de Servicio
- Aceptación de términos
- Descripción del servicio
- Uso aceptable
- Suscripciones y pagos (próximamente)
- Limitación de responsabilidad

### Política de Privacidad
- Información que se recopila
- Cómo se usa la información
- Almacenamiento de datos (Firebase, localStorage)
- Con quién se comparte (Google Gemini API)
- Medidas de seguridad
- Derechos del usuario
- Cookies
- Menores de edad
- Cambios a la política

### Contacto
- Email de privacidad
- Email de soporte
- Sitio web

---

## ⚠️ Importante

1. **Versión de Términos**: Cada vez que modifiques términos o políticas, incrementa `currentVersion` en `terms-acceptance.js`

2. **Emails de Contacto**: Reemplaza los placeholders:
   - `privacidad@financiasuite.com`
   - `soporte@financiasuite.com`
   Por tus emails reales.

3. **Modal Bloqueante**: El modal NO se puede cerrar haciendo clic fuera. Esto es intencional para forzar la aceptación.

4. **Edad Mínima**: El texto indica 16 años como edad mínima (RGPD Europa). Ajusta si es diferente en tu jurisdicción.

---

## 🎨 Estilos

El modal usa:
- Gradiente morado de Financia Suite
- Animación bounceIn al aparecer
- Checkbox grande y visible
- Botón deshabilitado hasta marcar checkbox
- Responsive para móviles
- Scrollbar personalizada

---

## 🚀 Despliegue

Archivos necesarios en producción:
```
/terminos-y-politicas.html
/terms-acceptance.js
/style.css (con nuevos estilos)
/index.html (modificado)
```

No requiere configuración adicional. Funciona automáticamente.

---

## 🔍 Debugging

### Ver estado de aceptación
```javascript
console.log('Términos aceptados:', localStorage.getItem('termsAccepted'));
console.log('Versión:', localStorage.getItem('termsVersion'));
console.log('Fecha:', localStorage.getItem('termsAcceptedDate'));
```

### Forzar mostrar modal
```javascript
window.termsManager.showTermsModal();
```

### Resetear todo
```javascript
window.termsManager.reset();
location.reload();
```

---

## ✅ Checklist Final

- [x] Modal de aceptación creado
- [x] Página de términos completos
- [x] Enlaces en footer
- [x] Sistema de versiones
- [x] localStorage guardado
- [x] Responsive design
- [x] No se puede cerrar sin aceptar
- [x] Toast de bienvenida
- [x] Página de rechazo

---

**🎉 Sistema completo y funcional!**

El modal aparecerá automáticamente la primera vez que un usuario entre a Financia Suite.
