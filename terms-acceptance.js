// ========================================
// SISTEMA DE ACEPTACIÓN DE TÉRMINOS Y POLÍTICAS
// ========================================

class TermsAcceptanceManager {
  constructor() {
    this.storageKey = 'termsAccepted';
    this.versionKey = 'termsVersion';
    this.currentVersion = '1.0'; // Incrementar cuando cambien los términos
    this.modal = null;
  }

  // ========================================
  // VERIFICAR SI SE ACEPTARON LOS TÉRMINOS
  // ========================================
  hasAcceptedTerms() {
    const accepted = localStorage.getItem(this.storageKey);
    const version = localStorage.getItem(this.versionKey);

    // Si la versión cambió, requiere nueva aceptación
    return accepted === 'true' && version === this.currentVersion;
  }

  // ========================================
  // MOSTRAR MODAL DE TÉRMINOS
  // ========================================
  showTermsModal() {
    if (this.modal) {
      this.modal.style.display = 'flex';
      return;
    }

    this.createModal();
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // ========================================
  // CREAR MODAL
  // ========================================
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay terms-modal';
    this.modal.id = 'termsAcceptanceModal';

    this.modal.innerHTML = `
      <div class="modal-content terms-content">
        <div class="terms-header">
          <div class="terms-icon">
            <i class="fas fa-file-contract"></i>
          </div>
          <h2>Bienvenido a Financia Suite</h2>
          <p class="terms-subtitle">Para continuar, por favor acepta nuestros términos</p>
        </div>

        <div class="terms-body">
          <div class="terms-scroll-area">
            <h3>📋 Resumen de Términos de Servicio</h3>
            <ul>
              <li>✅ Financia Suite es una herramienta de gestión financiera personal</li>
              <li>✅ Plan gratuito: 10 mensajes/día con Fin + 3 recomendaciones</li>
              <li>✅ Plan Premium (próximamente): Funciones ilimitadas</li>
              <li>⚠️ Las recomendaciones de IA son orientativas, no asesoría profesional</li>
              <li>⚠️ No nos responsabilizamos por decisiones financieras tomadas</li>
            </ul>

            <h3>🔒 Resumen de Política de Privacidad</h3>
            <ul>
              <li>🔐 Tus datos están protegidos con encriptación</li>
              <li>📊 Almacenamos: gastos, metas, perfil, conversaciones con Fin</li>
              <li>🤖 Usamos Google Gemini API para recomendaciones (datos anonimizados)</li>
              <li>🚫 NO vendemos tus datos personales a terceros</li>
              <li>✅ Puedes exportar o eliminar tus datos cuando quieras</li>
              <li>🍪 Usamos cookies para mantener tu sesión</li>
            </ul>

            <h3>📞 Contacto</h3>
            <p>Para consultas: <a href="mailto:privacidad@financiasuite.com" target="_blank">privacidad@financiasuite.com</a></p>

            <div class="terms-full-link">
              <a href="terminos-y-politicas.html" target="_blank">
                📄 Lee los Términos Completos y Política de Privacidad
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          </div>

          <div class="terms-checkbox-container">
            <label class="terms-checkbox-label">
              <input
                type="checkbox"
                id="termsCheckbox"
                class="terms-checkbox"
              />
              <span class="checkbox-text">
                He leído y acepto los
                <a href="terminos-y-politicas.html" target="_blank">Términos de Servicio y Política de Privacidad</a>
              </span>
            </label>
          </div>
        </div>

        <div class="terms-actions">
          <button
            class="btn btn-primary btn-accept"
            id="acceptTermsBtn"
            disabled
            onclick="acceptTerms()"
          >
            <i class="fas fa-check-circle"></i> Aceptar y Continuar
          </button>
          <button
            class="btn btn-secondary btn-decline"
            onclick="declineTerms()"
          >
            <i class="fas fa-times-circle"></i> No Acepto
          </button>
        </div>

        <p class="terms-footer">
          Al aceptar, confirmas que tienes al menos 16 años de edad
        </p>
      </div>
    `;

    document.body.appendChild(this.modal);

    // Event listener para el checkbox
    const checkbox = document.getElementById('termsCheckbox');
    const acceptBtn = document.getElementById('acceptTermsBtn');

    checkbox.addEventListener('change', (e) => {
      acceptBtn.disabled = !e.target.checked;
      if (e.target.checked) {
        acceptBtn.classList.add('enabled');
      } else {
        acceptBtn.classList.remove('enabled');
      }
    });

    // Prevenir cierre con clic fuera
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.showMustAcceptMessage();
      }
    });
  }

  // ========================================
  // ACEPTAR TÉRMINOS
  // ========================================
  acceptTerms() {
    const checkbox = document.getElementById('termsCheckbox');

    if (!checkbox.checked) {
      alert('Por favor, marca la casilla para aceptar los términos.');
      return;
    }

    // Guardar aceptación
    localStorage.setItem(this.storageKey, 'true');
    localStorage.setItem(this.versionKey, this.currentVersion);
    localStorage.setItem('termsAcceptedDate', new Date().toISOString());

    // Cerrar modal
    this.closeModal();

    // Mostrar mensaje de bienvenida
    this.showWelcomeMessage();

    // Disparar evento personalizado
    window.dispatchEvent(new Event('termsAccepted'));
  }

  // ========================================
  // RECHAZAR TÉRMINOS
  // ========================================
  declineTerms() {
    if (confirm('Para usar Financia Suite debes aceptar los términos. ¿Estás seguro de que quieres salir?')) {
      // Redirigir a página de salida o mostrar mensaje
      this.showDeclineMessage();
    }
  }

  showDeclineMessage() {
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
        color: white;
        padding: 20px;
      ">
        <div>
          <i class="fas fa-hand-paper" style="font-size: 80px; margin-bottom: 20px;"></i>
          <h1>Esperamos verte pronto</h1>
          <p style="font-size: 1.2em; margin: 20px 0;">
            Financia Suite requiere la aceptación de términos para funcionar.
          </p>
          <button
            onclick="location.reload()"
            style="
              padding: 15px 30px;
              background: white;
              color: #667eea;
              border: none;
              border-radius: 25px;
              font-size: 1.1em;
              cursor: pointer;
              margin-top: 20px;
            "
          >
            ← Volver
          </button>
        </div>
      </div>
    `;
  }

  // ========================================
  // CERRAR MODAL
  // ========================================
  closeModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  }

  // ========================================
  // MENSAJES
  // ========================================
  showMustAcceptMessage() {
    const toast = document.createElement('div');
    toast.className = 'toast warning';
    toast.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <span>Debes aceptar los términos para continuar</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showWelcomeMessage() {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>¡Bienvenido a Financia Suite! 🎉</span>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========================================
  // VERIFICAR Y MOSTRAR SI ES NECESARIO
  // ========================================
  checkAndShow() {
    if (!this.hasAcceptedTerms()) {
      // Esperar a que el DOM esté listo
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.showTermsModal();
        });
      } else {
        this.showTermsModal();
      }
      return false; // No ha aceptado
    }
    return true; // Ya aceptó
  }

  // ========================================
  // RESETEAR (solo para admin)
  // ========================================
  reset() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.versionKey);
    localStorage.removeItem('termsAcceptedDate');
    console.log('✅ Términos reseteados. Recarga para ver el modal.');
  }
}

// ========================================
// FUNCIONES GLOBALES
// ========================================
function acceptTerms() {
  if (window.termsManager) {
    window.termsManager.acceptTerms();
  }
}

function declineTerms() {
  if (window.termsManager) {
    window.termsManager.declineTerms();
  }
}

// ========================================
// INICIALIZAR
// ========================================
window.termsManager = new TermsAcceptanceManager();

// Auto-verificar al cargar
window.termsManager.checkAndShow();

console.log('✅ Terms Acceptance Manager loaded');
