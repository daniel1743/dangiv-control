# 🔐 Instrucciones para Implementar Autenticación Mejorada

## ✅ Lo que ya está hecho:

1. ✅ Modal de recuperación de contraseña agregado al HTML
2. ✅ Botón "¿Olvidaste tu contraseña?" funcional
3. ✅ Event listeners configurados

## 📝 Lo que debes hacer manualmente:

### Paso 1: Agregar Funciones de Validación

Abre `app.js` y busca la línea **1250** (justo ANTES de `async registerWithEmail`).

Agrega estas 3 funciones:

```javascript
  // === VALIDACIÓN DE CONTRASEÑA ===
  validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Al menos una mayúscula');
    if (!/[a-z]/.test(password)) errors.push('Al menos una minúscula');
    if (!/[0-9]/.test(password)) errors.push('Al menos un número');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Al menos un símbolo (!@#$%...)');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // === VALIDACIÓN DE EMAIL ===
  validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Formato de correo inválido' };
    }

    const disposableDomains = ['tempmail.com', 'guerrillamail.com', 'mailinator.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return { isValid: false, error: 'No se permiten correos temporales' };
    }

    return { isValid: true };
  }

  // === RECUPERAR CONTRASEÑA ===
  async resetPassword(email) {
    try {
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        this.showToast(emailValidation.error, 'error');
        return false;
      }

      await FB.auth.sendPasswordResetEmail(email);
      this.showToast('📧 Correo de recuperación enviado. Revisa tu bandeja.', 'success');
      return true;
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);

      if (error.code === 'auth/user-not-found') {
        this.showToast('No existe una cuenta con este correo.', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        this.showToast('Demasiados intentos. Intenta más tarde.', 'error');
      } else {
        this.showToast('Error al enviar correo de recuperación.', 'error');
      }
      return false;
    }
  }
```

### Paso 2: Actualizar la Función registerWithEmail

Busca la función `async registerWithEmail(email, password)` en la línea **1253**.

REEMPLÁZALA completamente con:

```javascript
  async registerWithEmail(email, password) {
    try {
      // Validar email
      const emailValidation = this.validateEmail(email);
      if (!emailValidation.isValid) {
        this.showToast(emailValidation.error, 'error');
        return false;
      }

      // Validar contraseña
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        this.showToast(
          '🔒 Contraseña débil:\n• ' + passwordValidation.errors.join('\n• '),
          'error'
        );
        return false;
      }

      console.log('Intentando registrar:', email);
      const userCredential = await FB.createUserWithEmailAndPassword(
        FB.auth,
        email,
        password
      );

      // Enviar email de verificación
      try {
        await userCredential.user.sendEmailVerification();
        this.showToast('✅ ¡Cuenta creada! Verifica tu correo.', 'success');
      } catch (emailError) {
        console.warn('No se pudo enviar email de verificación:', emailError);
        this.showToast('✅ ¡Cuenta creada correctamente!', 'success');
      }

      this.closeAuthModal();
      return true;
    } catch (error) {
      console.error('Error completo de registro:', error);

      if (error.code === 'auth/weak-password') {
        this.showToast(
          'La contraseña debe tener al menos 8 caracteres con mayúsculas, números y símbolos.',
          'error'
        );
      } else if (error.code === 'auth/email-already-in-use') {
        this.showToast('Este correo ya está registrado.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        this.showToast('Formato de correo inválido.', 'error');
      } else {
        this.showToast(`Error: ${error.message}`, 'error');
      }
      return false;
    }
  }
```

### Paso 3: Actualizar Firebase Config

Necesitas importar `sendPasswordResetEmail` en `firebase-config.js`.

Busca esta línea (alrededor de la línea 4):

```javascript
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
```

Agrégale `sendPasswordResetEmail`:

```javascript
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
```

Luego busca el objeto `window.FB` (alrededor de la línea 64) y agrégale:

```javascript
window.FB = {
  app,
  auth,
  db,
  storage,
  // Auth methods
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,  // ← AGREGAR ESTA LÍNEA
  // ... resto del código
};
```

## 🧪 Cómo Probar:

1. **Registrar con contraseña débil:**
   - Email: test@example.com
   - Contraseña: `123` → Debe mostrar error

2. **Registrar con contraseña fuerte:**
   - Email: test@gmail.com
   - Contraseña: `Test123!@` → Debe funcionar

3. **Recuperar contraseña:**
   - Click en "¿Olvidaste tu contraseña?"
   - Ingresa un email válido
   - Deberías recibir correo de Firebase

## ✅ Checklist:

- [ ] Agregadas 3 funciones de validación (línea ~1250)
- [ ] Reemplazada función registerWithEmail
- [ ] Importado sendPasswordResetEmail en firebase-config.js
- [ ] Agregado al objeto window.FB
- [ ] Probado registro con contraseña débil (debe fallar)
- [ ] Probado registro con contraseña fuerte (debe funcionar)
- [ ] Probado recuperación de contraseña

## 🚀 Después de completar:

```bash
git add .
git commit -m "feat: validación de email y contraseñas + recuperación de contraseña"
git push
vercel --prod
```

---

**Nota:** Si ves mensajes de "Datos guardados en la nube", búscalos en app.js y elimínalos. Ya deberían estar eliminados según el código anterior.
