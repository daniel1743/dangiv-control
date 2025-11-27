-- ========================================
-- SISTEMA DE REPORTES Y NOTIFICACIONES
-- Base de datos para Finantel Admin
-- ========================================

-- Tabla principal de eventos del sistema
CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de evento
  type TEXT NOT NULL CHECK (type IN ('bug', 'activity', 'alert', 'api_usage', 'anomaly')),
  
  -- Severidad (solo para bugs)
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Origen del evento
  origin TEXT NOT NULL CHECK (origin IN ('frontend', 'backend', 'supabase', 'api', 'auth', 'database', 'user')),
  
  -- Evento específico
  event TEXT NOT NULL,
  
  -- Usuario relacionado (opcional)
  user_id TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Mensaje en formato JSON
  message JSONB NOT NULL,
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Información del dispositivo
  device_info JSONB DEFAULT '{}'::jsonb,
  
  -- URL donde ocurrió
  url TEXT,
  
  -- Estado (nuevo, revisado, resuelto)
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'ignored')),
  
  -- Notas del administrador
  admin_notes TEXT,
  
  -- Resuelto por
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  
  -- Índices para búsquedas rápidas
  CONSTRAINT valid_bug_severity CHECK (
    (type = 'bug' AND severity IS NOT NULL) OR 
    (type != 'bug' AND severity IS NULL)
  )
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(type);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON system_events(severity) WHERE severity IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_system_events_origin ON system_events(origin);
CREATE INDEX IF NOT EXISTS idx_system_events_user_id ON system_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_events_status ON system_events(status);
CREATE INDEX IF NOT EXISTS idx_system_events_type_created ON system_events(type, created_at DESC);

-- Índice compuesto para consultas comunes
CREATE INDEX IF NOT EXISTS idx_system_events_bugs_unresolved ON system_events(type, status, created_at DESC) 
  WHERE type = 'bug' AND status IN ('new', 'reviewed');

-- Tabla de análisis automáticos (cache de métricas)
CREATE TABLE IF NOT EXISTS system_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de análisis
  analysis_type TEXT NOT NULL,
  
  -- Período
  period TEXT NOT NULL CHECK (period IN ('hour', 'day', 'week', 'month')),
  
  -- Fecha del período
  period_date DATE NOT NULL,
  
  -- Datos del análisis en JSON
  data JSONB NOT NULL,
  
  -- Timestamp de generación
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Único por tipo, período y fecha
  UNIQUE(analysis_type, period, period_date)
);

CREATE INDEX IF NOT EXISTS idx_system_analytics_type_period ON system_analytics(analysis_type, period, period_date DESC);

-- Tabla de configuración del sistema de notificaciones
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo de notificación
  notification_type TEXT NOT NULL UNIQUE,
  
  -- Habilitado/deshabilitado
  enabled BOOLEAN DEFAULT true,
  
  -- Nivel mínimo de severidad para notificar
  min_severity TEXT CHECK (min_severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Configuración adicional
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Última actualización
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar configuraciones por defecto
INSERT INTO notification_settings (notification_type, enabled, min_severity) VALUES
  ('bug_critical', true, 'critical'),
  ('bug_high', true, 'high'),
  ('bug_medium', false, 'medium'),
  ('bug_low', false, 'low'),
  ('user_activity', true, NULL),
  ('api_errors', true, 'high'),
  ('auth_errors', true, 'high'),
  ('anomalies', true, 'high')
ON CONFLICT (notification_type) DO NOTHING;

-- Función para limpiar eventos antiguos (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void AS $$
BEGIN
  -- Eliminar eventos resueltos o ignorados de más de 90 días
  DELETE FROM system_events 
  WHERE status IN ('resolved', 'ignored') 
    AND created_at < NOW() - INTERVAL '90 days';
  
  -- Eliminar eventos de actividad de más de 30 días (solo los no críticos)
  DELETE FROM system_events 
  WHERE type = 'activity' 
    AND created_at < NOW() - INTERVAL '30 days'
    AND (metadata->>'is_critical')::boolean IS NOT TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas rápidas
CREATE OR REPLACE FUNCTION get_system_stats(hours_back INTEGER DEFAULT 24)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_events', COUNT(*),
    'bugs', COUNT(*) FILTER (WHERE type = 'bug'),
    'critical_bugs', COUNT(*) FILTER (WHERE type = 'bug' AND severity = 'critical'),
    'high_bugs', COUNT(*) FILTER (WHERE type = 'bug' AND severity = 'high'),
    'activities', COUNT(*) FILTER (WHERE type = 'activity'),
    'api_errors', COUNT(*) FILTER (WHERE origin = 'api'),
    'auth_errors', COUNT(*) FILTER (WHERE origin = 'auth'),
    'unresolved_bugs', COUNT(*) FILTER (WHERE type = 'bug' AND status = 'new')
  ) INTO result
  FROM system_events
  WHERE created_at > NOW() - (hours_back || ' hours')::INTERVAL;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Política RLS: Solo administradores pueden ver eventos
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede insertar (desde la app)
CREATE POLICY "Allow insert events" ON system_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Solo admins pueden leer
CREATE POLICY "Admins can read events" ON system_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Política: Solo admins pueden actualizar
CREATE POLICY "Admins can update events" ON system_events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Políticas similares para analytics
CREATE POLICY "Admins can read analytics" ON system_analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Política: Cualquiera puede insertar analytics (desde edge function)
CREATE POLICY "Allow insert analytics" ON system_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para notification_settings
CREATE POLICY "Admins can manage settings" ON notification_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Trigger para actualizar updated_at en notification_settings
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();

-- Vista materializada para análisis rápido (opcional, se puede refrescar periódicamente)
CREATE MATERIALIZED VIEW IF NOT EXISTS system_events_summary AS
SELECT 
  DATE(created_at) as event_date,
  type,
  severity,
  origin,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as affected_users
FROM system_events
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), type, severity, origin;

CREATE INDEX IF NOT EXISTS idx_system_events_summary_date ON system_events_summary(event_date DESC);

-- Función para refrescar la vista
CREATE OR REPLACE FUNCTION refresh_system_events_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY system_events_summary;
END;
$$ LANGUAGE plpgsql;

