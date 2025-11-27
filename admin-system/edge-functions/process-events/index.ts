/**
 * ========================================
 * SUPABASE EDGE FUNCTION
 * Procesar Eventos del Sistema
 * ========================================
 * 
 * Esta función procesa eventos en tiempo real
 * y genera análisis automáticos.
 * 
 * Desplegar con:
 * supabase functions deploy process-events
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obtener eventos del último día
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: events, error: eventsError } = await supabase
      .from('system_events')
      .select('*')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    // Generar análisis
    const analysis = generateAnalysis(events || []);

    // Guardar análisis en la tabla
    const { error: analysisError } = await supabase
      .from('system_analytics')
      .upsert({
        analysis_type: 'daily_summary',
        period: 'day',
        period_date: new Date().toISOString().split('T')[0],
        data: analysis,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: 'analysis_type,period,period_date',
      });

    if (analysisError) throw analysisError;

    // Detectar anomalías
    const anomalies = detectAnomalies(events || []);

    // Crear alertas si hay anomalías críticas
    if (anomalies.length > 0) {
      for (const anomaly of anomalies) {
        await supabase.from('system_events').insert({
          type: 'alert',
          origin: 'backend',
          event: 'anomaly_detected',
          message: {
            text: anomaly.description,
            severity: anomaly.severity,
          },
          metadata: anomaly.metadata,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        eventsProcessed: events?.length || 0,
        anomaliesDetected: anomalies.length,
        analysis,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error procesando eventos:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Generar análisis de eventos
 */
function generateAnalysis(events: any[]) {
  const bugs = events.filter((e) => e.type === 'bug');
  const activities = events.filter((e) => e.type === 'activity');
  const apiUsage = events.filter((e) => e.type === 'api_usage');

  // Errores por severidad
  const errorsBySeverity = {
    critical: bugs.filter((b) => b.severity === 'critical').length,
    high: bugs.filter((b) => b.severity === 'high').length,
    medium: bugs.filter((b) => b.severity === 'medium').length,
    low: bugs.filter((b) => b.severity === 'low').length,
  };

  // Endpoints con más errores
  const endpointErrors: Record<string, number> = {};
  bugs.forEach((bug) => {
    const url = bug.url || 'unknown';
    endpointErrors[url] = (endpointErrors[url] || 0) + 1;
  });

  const topErrorEndpoints = Object.entries(endpointErrors)
    .map(([endpoint, count]) => ({ endpoint, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Actividades más comunes
  const activityCounts: Record<string, number> = {};
  activities.forEach((activity) => {
    activityCounts[activity.event] = (activityCounts[activity.event] || 0) + 1;
  });

  const topActivities = Object.entries(activityCounts)
    .map(([activity, count]) => ({ activity, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Fallos de micrófono
  const microphoneFailures = activities.filter((a) =>
    a.event.includes('microphone') && a.event.includes('denied')
  ).length;

  // Uso de IA
  const aiUsage = activities.filter((a) =>
    a.event.includes('ai') || a.event.includes('gemini') || a.event.includes('openai')
  ).length;

  // Conversiones de voz
  const voiceConversions = {
    total: activities.filter((a) => a.event.includes('voice')).length,
    success: activities.filter((a) =>
      a.event.includes('voice') && a.metadata?.success !== false
    ).length,
  };

  // Errores de API
  const apiErrors = apiUsage.filter((a) => a.metadata?.statusCode >= 400).length;

  // Usuarios activos
  const activeUsers = new Set(events.map((e) => e.user_id).filter(Boolean)).size;

  return {
    errors_today: {
      total: bugs.length,
      ...errorsBySeverity,
    },
    top_error_endpoints: topErrorEndpoints,
    top_activities: topActivities,
    microphone_failures: microphoneFailures,
    ai_usage: {
      count: aiUsage,
    },
    voice_conversions: voiceConversions,
    api_errors: apiErrors,
    active_users: activeUsers,
  };
}

/**
 * Detectar anomalías
 */
function detectAnomalies(events: any[]): any[] {
  const anomalies: any[] = [];

  // Anomalía: Muchos errores críticos en poco tiempo
  const recentCritical = events.filter(
    (e) =>
      e.type === 'bug' &&
      e.severity === 'critical' &&
      new Date(e.created_at) > new Date(Date.now() - 60 * 60 * 1000) // Última hora
  );

  if (recentCritical.length > 5) {
    anomalies.push({
      severity: 'critical',
      description: `Se detectaron ${recentCritical.length} errores críticos en la última hora`,
      metadata: {
        count: recentCritical.length,
        timeWindow: '1 hour',
      },
    });
  }

  // Anomalía: Tasa alta de fallos de API
  const recentApiErrors = events.filter(
    (e) =>
      e.type === 'api_usage' &&
      e.metadata?.statusCode >= 400 &&
      new Date(e.created_at) > new Date(Date.now() - 30 * 60 * 1000) // Últimos 30 minutos
  );

  if (recentApiErrors.length > 10) {
    anomalies.push({
      severity: 'high',
      description: `Tasa alta de errores de API: ${recentApiErrors.length} en los últimos 30 minutos`,
      metadata: {
        count: recentApiErrors.length,
        timeWindow: '30 minutes',
      },
    });
  }

  // Anomalía: Muchos fallos de micrófono
  const recentMicFailures = events.filter(
    (e) =>
      e.type === 'activity' &&
      e.event.includes('microphone') &&
      e.event.includes('denied') &&
      new Date(e.created_at) > new Date(Date.now() - 60 * 60 * 1000)
  );

  if (recentMicFailures.length > 20) {
    anomalies.push({
      severity: 'medium',
      description: `Muchos usuarios están teniendo problemas con el micrófono: ${recentMicFailures.length} denegaciones en la última hora`,
      metadata: {
        count: recentMicFailures.length,
        timeWindow: '1 hour',
      },
    });
  }

  return anomalies;
}

