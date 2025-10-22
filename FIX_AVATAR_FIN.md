# FIX: Avatar de Fin como Placeholder por Defecto

## Objetivo

Usar la imagen de Fin (`img/FIN.png`) como avatar por defecto para que el círculo del perfil no quede vacío cuando los usuarios aún no han configurado su foto.

## Archivos a Modificar

### 1. `app.js` - Línea 392

**Buscar:**
```javascript
    this.defaultAvatars = [
      'https://ui-avatars.com/api/?name=U1&background=21808D&color=fff&size=128&font-size=0.6', // Teal 500
      'https://ui-avatars.com/api/?name=U2&background=1D7480&color=fff&size=128&font-size=0.6', // Teal 600
```

**Reemplazar con:**
```javascript
    this.defaultAvatars = [
      'img/FIN.png', // Avatar de Fin por defecto - Índice 0
      'https://ui-avatars.com/api/?name=U2&background=1D7480&color=fff&size=128&font-size=0.6', // Teal 600
```

### 2. `app.js` - Línea 383-384 (userProfile por defecto)

**Buscar:**
```javascript
      avatar:
        'https://ui-avatars.com/api/?name=Usuario&background=21808D&color=fff&size=128',
```

**Reemplazar con:**
```javascript
      avatar: 'img/FIN.png', // Avatar de Fin por defecto
```

### 3. `app.js` - Línea 2202-2203 (usuarios anónimos)

**Buscar:**
```javascript
    if (this.currentUser === 'anonymous' || !this.currentUser) {
      avatarSrc =
        'https://ui-avatars.com/api/?name=Usuario&background=21808D&color=fff&size=128&font-size=0.6';
```

**Reemplazar con:**
```javascript
    if (this.currentUser === 'anonymous' || !this.currentUser) {
      avatarSrc = 'img/FIN.png'; // Avatar de Fin para usuarios anónimos
```

### 4. `index.html` - Línea 825 (avatar-sidebar)

**Buscar:**
```html
            src="https://ui-avatars.com/api/?name=Usuario&background=21808D&color=fff&size=128&font-size=0.6"
```

**Reemplazar con:**
```html
            src="img/FIN.png"
```

## Resultado Esperado

✅ **Usuarios Nuevos**: Verán el avatar de Fin automáticamente
✅ **Usuarios Anónimos**: Verán el avatar de Fin en el landing
✅ **Sin Avatar Vacío**: El círculo siempre tendrá una imagen de Fin
✅ **Personalizable**: Los usuarios pueden cambiar su avatar después

## Verificación

Después de aplicar los cambios:

1. **Recarga la página** sin autenticarte
2. **Verifica** que el avatar muestre la imagen de Fin
3. **Regístrate** con una nueva cuenta
4. **Confirma** que también muestre el avatar de Fin por defecto

## Ubicaciones donde se Verá el Avatar

- ✅ Navbar (esquina superior derecha)
- ✅ Sidebar móvil
- ✅ Menú de perfil
- ✅ Avatar sidebar (menú lateral)
- ✅ Sección de configuración

## Código CSS (Ya Existe - No Requiere Cambios)

El CSS ya está preparado para manejar imágenes en los avatares con clases como:
- `.profile-avatar`
- `.mobile-avatar`
- `.avatar-sidebar__image`

Estas clases ya tienen estilos para imágenes circulares con `border-radius: 50%` y `object-fit: cover`.

## Alternativa: Avatar Gris Estático

Si prefieres un avatar gris neutro en lugar de Fin, puedes usar:

```javascript
'https://ui-avatars.com/api/?name=?&background=cccccc&color=666&size=128&font-size=0.6'
```

O crear un archivo `img/default-avatar.png` con un icono de usuario genérico.

## Pasos de Aplicación

1. ✅ **Cerrar servidor** de desarrollo
2. ✅ **Abrir** `app.js`
3. ✅ **Hacer los 3 cambios** en app.js (líneas 384, 392, 2202)
4. ✅ **Abrir** `index.html`
5. ✅ **Hacer el cambio** en línea 825
6. ✅ **Guardar** ambos archivos
7. ✅ **Iniciar servidor** y probar

## Nota Importante

La imagen `img/FIN.png` ya existe en tu proyecto, así que no necesitas crear ningún archivo nuevo. Solo actualizar las referencias en el código.

---

**Archivos Modificados**: 2 (`app.js`, `index.html`)
**Líneas Cambiadas**: 4 líneas en total
**Tiempo Estimado**: 2 minutos
