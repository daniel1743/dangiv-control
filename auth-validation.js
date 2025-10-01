// === FUNCIONES DE VALIDACIÓN Y AUTENTICACIÓN MEJORADAS ===
// Agrega estas funciones a tu clase FinanceApp en app.js

// 1. VALIDACIÓN DE CONTRASEÑA
validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Al menos un número');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Al menos un símbolo (!@#$%...)');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// 2. VALIDACIÓN DE EMAIL
validateEmail(email) {
  // Expresión regular más estricta para emails reales
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Formato de correo inválido'
    };
  }

  // Lista de dominios de email desechables comunes
  const disposableDomains = ['tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com', 'throwaway.email'];
  const domain = email.split('@')[1]?.toLowerCase();

  if (disposableDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'No se permiten correos temporales'
    };
  }

  return { isValid: true };
}

// 3. RECUPERAR CONTRASEÑA
async resetPassword(email) {
  try {
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid) {
      this.showToast(emailValidation.error, 'error');
      return false;
    }

    await FB.auth.sendPasswordResetEmail(email);
    this.showToast(
      '📧 Correo de recuperación enviado. Revisa tu bandeja.',
      'success'
    );
    return true;
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);

    if (error.code === 'auth/user-not-found') {
      this.showToast('No existe una cuenta con este correo.', 'error');
    } else if (error.code === 'auth/invalid-email') {
      this.showToast('Formato de correo inválido.', 'error');
    } else if (error.code === 'auth/too-many-requests') {
      this.showToast('Demasiados intentos. Intenta más tarde.', 'error');
    } else {
      this.showToast('Error al enviar correo de recuperación.', 'error');
    }
    return false;
  }
}

// 4. REGISTRO MEJORADO (REEMPLAZA LA FUNCIÓN EXISTENTE)
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
      this.showToast(
        '✅ ¡Cuenta creada! Verifica tu correo para activarla.',
        'success'
      );
    } catch (emailError) {
      console.warn('No se pudo enviar email de verificación:', emailError);
      this.showToast(
        '✅ ¡Cuenta creada correctamente!',
        'success'
      );
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
    } else if (error.code === 'auth/operation-not-allowed') {
      this.showToast(
        'El registro con email/password no está habilitado en Firebase.',
        'error'
      );
    } else {
      this.showToast(`Error: ${error.message}`, 'error');
    }
    return false;
  }
}

// 5. LOGIN MEJORADO (REEMPLAZA LA FUNCIÓN EXISTENTE)
async loginWithEmail(email, password) {
  try {
    const userCredential = await FB.signInWithEmailAndPassword(
      FB.auth,
      email,
      password
    );

    // Verificar si el email está verificado
    if (!userCredential.user.emailVerified) {
      this.showToast(
        '⚠️ Verifica tu correo antes de continuar. Revisa tu bandeja.',
        'info'
      );
      // Opcionalmente podrías permitir o bloquear el acceso
      // await FB.auth.signOut(); // Descomentar para forzar verificación
    } else {
      this.showToast(
        `¡Bienvenido de nuevo, ${userCredential.user.email}!`,
        'success'
      );
    }

    this.closeAuthModal();
    return true;
  } catch (error) {
    console.error('Error de inicio de sesión:', error.code);

    if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      this.showToast('Correo o contraseña incorrectos.', 'error');
    } else if (error.code === 'auth/too-many-requests') {
      this.showToast('Demasiados intentos fallidos. Espera un momento.', 'error');
    } else if (error.code === 'auth/user-disabled') {
      this.showToast('Esta cuenta ha sido deshabilitada.', 'error');
    } else {
      this.showToast('Error al iniciar sesión.', 'error');
    }
    return false;
  }
}
