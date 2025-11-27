/**
 * ========================================
 * EJEMPLO DE INTEGRACIÓN COMPLETA
 * Cómo integrar el sistema en tu app
 * ========================================
 */

import React, { useEffect } from 'react';
import { useEventReporter, useErrorBoundaryReporter, useActivityTracker } from '../hooks/useEventReporter';

// ========================================
// 1. CONFIGURACIÓN GLOBAL (App.tsx)
// ========================================

function App() {
  // Capturar errores globales automáticamente
  useErrorBoundaryReporter();
  
  // Trackear actividad del usuario automáticamente
  useActivityTracker();

  return (
    <div>
      {/* Tu aplicación */}
    </div>
  );
}

// ========================================
// 2. COMPONENTE CON REPORTES DE ERRORES
// ========================================

function VoiceTransactionComponent() {
  const { reportBug, reportActivity } = useEventReporter();
  const [isRecording, setIsRecording] = React.useState(false);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Reportar actividad exitosa
      reportActivity('microphone_accessed', {
        success: true,
        action: 'start_recording',
      });

      // ... lógica de grabación
    } catch (error: any) {
      // Reportar bug
      reportBug({
        severity: 'high',
        origin: 'frontend',
        event: 'microphone_permission_denied',
        message: 'Usuario denegó permiso de micrófono',
        rawError: error,
        metadata: {
          errorName: error.name,
          errorMessage: error.message,
        },
      });

      // Reportar actividad fallida
      reportActivity('microphone_denied', {
        error: error.message,
        errorName: error.name,
      });
    }
  };

  const handleProcessAudio = async (audioBlob: Blob) => {
    try {
      // Simular procesamiento
      const response = await fetch('/api/voice-to-transaction', {
        method: 'POST',
        body: audioBlob,
      });

      if (!response.ok) {
        throw new Error('Error procesando audio');
      }

      const result = await response.json();

      // Reportar actividad exitosa
      reportActivity('voice_to_transaction_success', {
        duration: result.processingTime,
        language: result.detectedLanguage,
      });

      return result;
    } catch (error: any) {
      // Reportar bug crítico
      reportBug({
        severity: 'critical',
        origin: 'frontend',
        event: 'voice_to_transaction_failed',
        message: 'Error al convertir audio a transacción',
        rawError: error,
        metadata: {
          audioSize: audioBlob.size,
          audioDuration: 'unknown',
        },
      });

      throw error;
    }
  };

  return (
    <div>
      <button onClick={handleStartRecording}>
        {isRecording ? 'Grabando...' : 'Iniciar grabación'}
      </button>
    </div>
  );
}

// ========================================
// 3. COMPONENTE CON MONITOREO DE API
// ========================================

function AIChatComponent() {
  const { reportApiUsage, reportBug } = useEventReporter();

  const sendMessage = async (message: string) => {
    const startTime = Date.now();

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: message }],
        }),
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      // Calcular costo estimado (ejemplo para GPT-4)
      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;
      const estimatedCost = (inputTokens / 1000) * 0.03 + (outputTokens / 1000) * 0.06;

      // Reportar uso de API
      reportApiUsage({
        apiName: 'OpenAI',
        endpoint: '/v1/chat/completions',
        method: 'POST',
        statusCode: response.status,
        duration,
        cost: estimatedCost,
        metadata: {
          model: 'gpt-4',
          inputTokens,
          outputTokens,
        },
      });

      return data;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Reportar error de API
      reportApiUsage({
        apiName: 'OpenAI',
        endpoint: '/v1/chat/completions',
        method: 'POST',
        error: {
          message: error.message,
          name: error.name,
        },
        duration,
      });

      // También reportar como bug si es crítico
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        reportBug({
          severity: 'high',
          origin: 'api',
          event: 'openai_rate_limit',
          message: 'Límite de tasa excedido en OpenAI',
          rawError: error,
        });
      }

      throw error;
    }
  };

  return (
    <div>
      {/* Tu componente de chat */}
    </div>
  );
}

// ========================================
// 4. COMPONENTE CON TRACKING DE NAVEGACIÓN
// ========================================

function DashboardComponent() {
  const { reportActivity } = useEventReporter();

  useEffect(() => {
    // Reportar cuando se carga el dashboard
    reportActivity('dashboard_viewed', {
      section: 'overview',
      timestamp: new Date().toISOString(),
    });

    // Trackear tiempo de carga
    const loadStart = performance.now();
    window.addEventListener('load', () => {
      const loadTime = performance.now() - loadStart;
      reportActivity('dashboard_load_complete', {
        loadTime: Math.round(loadTime),
        isSlow: loadTime > 3000,
      });
    });
  }, []);

  const handleButtonClick = (buttonId: string, action: string) => {
    reportActivity('button_click', {
      buttonId,
      action,
      section: 'dashboard',
    });
  };

  return (
    <div>
      <button onClick={() => handleButtonClick('create-transaction', 'create')}>
        Crear Transacción
      </button>
    </div>
  );
}

// ========================================
// 5. MANEJO DE ERRORES DE AUTENTICACIÓN
// ========================================

function LoginComponent() {
  const { reportBug, reportActivity } = useEventReporter();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Reportar error de autenticación
        reportBug({
          severity: 'medium',
          origin: 'auth',
          event: 'login_failed',
          message: `Intento de login fallido para ${email}`,
          rawError: error,
          metadata: {
            email: email, // No incluir password
            statusCode: response.status,
          },
        });

        throw new Error(error.message);
      }

      const data = await response.json();

      // Reportar login exitoso
      reportActivity('login_success', {
        method: 'email',
        userId: data.user.id,
      }, data.user.id);

      return data;
    } catch (error: any) {
      // Reportar actividad fallida
      reportActivity('login_failed', {
        error: error.message,
        method: 'email',
      });

      throw error;
    }
  };

  return (
    <div>
      {/* Formulario de login */}
    </div>
  );
}

// ========================================
// 6. DETECCIÓN DE ANOMALÍAS
// ========================================

function TransactionListComponent() {
  const { reportAnomaly } = useEventReporter();

  useEffect(() => {
    // Detectar si hay muchas transacciones duplicadas
    const checkForDuplicates = async () => {
      const transactions = await fetchTransactions();
      
      const duplicates = findDuplicates(transactions);
      
      if (duplicates.length > 5) {
        reportAnomaly(
          'duplicate_transactions',
          `Se detectaron ${duplicates.length} transacciones duplicadas sospechosas`,
          {
            count: duplicates.length,
            userId: currentUser?.id,
          },
          currentUser?.id
        );
      }
    };

    checkForDuplicates();
  }, []);

  return (
    <div>
      {/* Lista de transacciones */}
    </div>
  );
}

// ========================================
// 7. PANEL DE ADMINISTRADOR
// ========================================

function AdminDashboard() {
  return (
    <div>
      <h1>Panel de Administrador</h1>
      <NotificationCenter
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
      />
    </div>
  );
}

// Helpers (ejemplos)
function fetchTransactions() {
  // Tu lógica
  return Promise.resolve([]);
}

function findDuplicates(transactions: any[]) {
  // Tu lógica de detección
  return [];
}

const currentUser = { id: 'user-123' };

export {
  App,
  VoiceTransactionComponent,
  AIChatComponent,
  DashboardComponent,
  LoginComponent,
  TransactionListComponent,
  AdminDashboard,
};

