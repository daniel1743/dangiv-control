# 🔧 Solución: Error "Missing or insufficient permissions"

## ❌ Problema

Estás viendo este error en la consola:
```
FirebaseError: Missing or insufficient permissions.
```

Esto ocurre cuando intentas guardar datos en Firestore pero las reglas de seguridad no lo permiten.

## ✅ Solución Rápida

### Paso 1: Ir a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto **Finantel**
3. Ve a **Firestore Database** → **Rules**

### Paso 2: Reemplazar las Reglas

Copia y pega el contenido completo de `firestore-rules-complete.txt` en el editor de reglas.

### Paso 3: Publicar

1. Haz clic en **"Publish"** o **"Publicar"**
2. Espera a que se actualicen las reglas (unos segundos)

## 🔍 Verificar que Funciona

Después de actualizar las reglas:

1. Recarga tu aplicación
2. Intenta crear un gasto
3. El error debería desaparecer

## 📝 Reglas Incluidas

Las reglas permiten:

✅ **Usuarios autenticados** pueden:
- Crear/leer/actualizar/eliminar sus propios datos
- Crear eventos en `system_events`

✅ **Administradores** pueden:
- Leer todos los datos
- Gestionar eventos del sistema
- Ver analytics

❌ **Usuarios no autenticados** NO pueden:
- Leer ni escribir datos

## 🛡️ Seguridad

Las reglas aseguran que:
- Cada usuario solo puede acceder a sus propios datos
- Los datos están protegidos por autenticación
- Los administradores tienen acceso completo

## ⚠️ Si el Error Persiste

1. **Verifica que el usuario esté autenticado:**
   ```javascript
   console.log('Usuario:', firebase.auth().currentUser);
   ```

2. **Verifica la estructura de tus documentos:**
   - Los documentos deben tener un campo `userId` que coincida con `request.auth.uid`

3. **Revisa la consola de Firebase:**
   - Ve a Firestore Database → Usage
   - Revisa si hay errores de permisos

## 🔄 Estructura Esperada

Para que las reglas funcionen, tus documentos deben tener esta estructura:

```javascript
{
  userId: "uid-del-usuario-autenticado",
  // ... otros campos
}
```

Si tus documentos tienen otro campo (como `user`, `owner`, etc.), ajusta las reglas:

```javascript
// Cambiar esto:
resource.data.userId == request.auth.uid

// Por esto (si usas 'user'):
resource.data.user == request.auth.uid
```

## 📞 Soporte

Si después de aplicar estas reglas el error persiste, revisa:
1. Que el usuario esté autenticado correctamente
2. Que el campo `userId` exista en tus documentos
3. Los logs de Firebase Console para más detalles

