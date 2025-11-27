/**
 * ========================================
 * CENTRO DE NOTIFICACIONES DEL SISTEMA
 * Panel de administrador - Finantel
 * ========================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { translateEventToHuman, generateAnalysisSummary } from '../utils/eventTranslator';
import type { SystemEvent } from '../utils/eventTranslator';

interface NotificationCenterProps {
  supabaseUrl: string;
  supabaseKey: string;
}

type FilterType = 'all' | 'bug' | 'activity' | 'api_usage' | 'anomaly' | 'alert';
type FilterSeverity = 'all' | 'critical' | 'high' | 'medium' | 'low';
type FilterStatus = 'all' | 'new' | 'reviewed' | 'resolved';

export default function NotificationCenter({ supabaseUrl, supabaseKey }: NotificationCenterProps) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'analysis'>('events');

  const supabase = useMemo(() => createClient(supabaseUrl, supabaseKey), [supabaseUrl, supabaseKey]);

  // Cargar eventos
  useEffect(() => {
    loadEvents();
    loadAnalysis();
    setupRealtimeSubscription();
  }, [filterType, filterSeverity, filterStatus]);

  /**
   * Cargar eventos desde Supabase
   */
  const loadEvents = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('system_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEvents(data || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar análisis automáticos
   */
  const loadAnalysis = async () => {
    try {
      // Obtener estadísticas del día
      const { data: stats, error: statsError } = await supabase.rpc('get_system_stats', {
        hours_back: 24,
      });

      if (statsError) throw statsError;

      // Obtener top endpoints con errores
      const { data: topEndpoints } = await supabase
        .from('system_events')
        .select('url, event')
        .eq('type', 'bug')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Obtener top actividades
      const { data: topActivities } = await supabase
        .from('system_events')
        .select('event')
        .eq('type', 'activity')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Procesar datos
      const endpointCounts: Record<string, number> = {};
      topEndpoints?.forEach((event) => {
        const url = event.url || 'unknown';
        endpointCounts[url] = (endpointCounts[url] || 0) + 1;
      });

      const activityCounts: Record<string, number> = {};
      topActivities?.forEach((event) => {
        activityCounts[event.event] = (activityCounts[event.event] || 0) + 1;
      });

      setAnalysis({
        stats,
        top_error_endpoints: Object.entries(endpointCounts)
          .map(([url, count]) => ({ endpoint: url, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        top_activities: Object.entries(activityCounts)
          .map(([activity, count]) => ({ activity, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        microphone_failures: topActivities?.filter((a) => 
          a.event.includes('microphone') && a.event.includes('denied')
        ).length || 0,
      });
    } catch (error) {
      console.error('Error cargando análisis:', error);
    }
  };

  /**
   * Configurar suscripción en tiempo real
   */
  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('system_events_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_events',
        },
        (payload) => {
          // Agregar nuevo evento a la lista
          setEvents((prev) => [payload.new as SystemEvent, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  /**
   * Actualizar estado de un evento
   */
  const updateEventStatus = async (eventId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('system_events')
        .update({
          status,
          admin_notes: notes,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', eventId);

      if (error) throw error;

      // Actualizar en el estado local
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status, admin_notes: notes } : e))
      );

      if (selectedEvent?.id === eventId) {
        setSelectedEvent({ ...selectedEvent, status, admin_notes: notes });
      }
    } catch (error) {
      console.error('Error actualizando evento:', error);
    }
  };

  /**
   * Filtrar eventos
   */
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filterType !== 'all' && event.type !== filterType) return false;
      if (filterSeverity !== 'all' && event.severity !== filterSeverity) return false;
      if (filterStatus !== 'all' && event.status !== filterStatus) return false;
      return true;
    });
  }, [events, filterType, filterSeverity, filterStatus]);

  /**
   * Agrupar eventos por sección
   */
  const groupedEvents = useMemo(() => {
    const groups = {
      bugs: filteredEvents.filter((e) => e.type === 'bug'),
      activities: filteredEvents.filter((e) => e.type === 'activity'),
      apiUsage: filteredEvents.filter((e) => e.type === 'api_usage'),
      anomalies: filteredEvents.filter((e) => e.type === 'anomaly'),
      alerts: filteredEvents.filter((e) => e.type === 'alert'),
    };
    return groups;
  }, [filteredEvents]);

  return (
    <div className="notification-center">
      {/* Header */}
      <div className="nc-header">
        <div>
          <h1>Centro de Notificaciones del Sistema</h1>
          <p className="nc-subtitle">Monitoreo en tiempo real de eventos y errores</p>
        </div>
        <div className="nc-stats">
          <div className="nc-stat">
            <span className="nc-stat-value">{events.filter((e) => e.type === 'bug' && e.status === 'new').length}</span>
            <span className="nc-stat-label">Bugs nuevos</span>
          </div>
          <div className="nc-stat">
            <span className="nc-stat-value">{events.filter((e) => e.type === 'bug' && e.severity === 'critical').length}</span>
            <span className="nc-stat-label">Críticos</span>
          </div>
          <div className="nc-stat">
            <span className="nc-stat-value">{events.length}</span>
            <span className="nc-stat-label">Total eventos</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="nc-tabs">
        <button
          className={`nc-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Eventos
        </button>
        <button
          className={`nc-tab ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          Análisis
        </button>
      </div>

      {/* Filtros */}
      {activeTab === 'events' && (
        <div className="nc-filters">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="nc-filter"
          >
            <option value="all">Todos los tipos</option>
            <option value="bug">Bugs</option>
            <option value="activity">Actividad</option>
            <option value="api_usage">Uso de APIs</option>
            <option value="anomaly">Anomalías</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as FilterSeverity)}
            className="nc-filter"
          >
            <option value="all">Todas las severidades</option>
            <option value="critical">Crítico</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="nc-filter"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevos</option>
            <option value="reviewed">Revisados</option>
            <option value="resolved">Resueltos</option>
          </select>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="nc-loading">Cargando eventos...</div>
      ) : activeTab === 'events' ? (
        <div className="nc-content">
          {/* Sección: Bugs y Errores */}
          {groupedEvents.bugs.length > 0 && (
            <section className="nc-section">
              <h2 className="nc-section-title">
                🚨 Bugs y Errores ({groupedEvents.bugs.length})
              </h2>
              <div className="nc-events-list">
                {groupedEvents.bugs.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={() => setSelectedEvent(event)}
                    onUpdateStatus={updateEventStatus}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sección: Actividad del Usuario */}
          {groupedEvents.activities.length > 0 && (
            <section className="nc-section">
              <h2 className="nc-section-title">
                📊 Actividad del Usuario ({groupedEvents.activities.length})
              </h2>
              <div className="nc-events-list">
                {groupedEvents.activities.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={() => setSelectedEvent(event)}
                    onUpdateStatus={updateEventStatus}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sección: Uso de APIs */}
          {groupedEvents.apiUsage.length > 0 && (
            <section className="nc-section">
              <h2 className="nc-section-title">
                ⚙️ Uso de APIs ({groupedEvents.apiUsage.length})
              </h2>
              <div className="nc-events-list">
                {groupedEvents.apiUsage.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={() => setSelectedEvent(event)}
                    onUpdateStatus={updateEventStatus}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Sección: Anomalías */}
          {groupedEvents.anomalies.length > 0 && (
            <section className="nc-section">
              <h2 className="nc-section-title">
                🧩 Eventos Sospechosos ({groupedEvents.anomalies.length})
              </h2>
              <div className="nc-events-list">
                {groupedEvents.anomalies.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onSelect={() => setSelectedEvent(event)}
                    onUpdateStatus={updateEventStatus}
                  />
                ))}
              </div>
            </section>
          )}

          {filteredEvents.length === 0 && (
            <div className="nc-empty">
              <p>No hay eventos que coincidan con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      ) : (
        <AnalysisTab analysis={analysis} />
      )}

      {/* Modal de detalle */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdateStatus={updateEventStatus}
        />
      )}
    </div>
  );
}

/**
 * Tarjeta de evento
 */
function EventCard({
  event,
  onSelect,
  onUpdateStatus,
}: {
  event: SystemEvent;
  onSelect: () => void;
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
}) {
  const humanMessage = translateEventToHuman(event);
  const statusColor = getStatusColor(event.status);
  const severityColor = event.severity ? getSeverityColor(event.severity) : '';

  return (
    <div
      className={`nc-event-card ${event.status} ${event.severity || ''}`}
      onClick={onSelect}
    >
      <div className="nc-event-header">
        <div className="nc-event-badge" style={{ backgroundColor: severityColor || statusColor }}>
          {event.severity || event.type}
        </div>
        <span className="nc-event-time">{formatTime(event.created_at)}</span>
      </div>
      <p className="nc-event-message">{humanMessage}</p>
      <div className="nc-event-actions">
        <button
          className="nc-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(event.id, 'reviewed');
          }}
        >
          Marcar como revisado
        </button>
        <button
          className="nc-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus(event.id, 'resolved');
          }}
        >
          Resolver
        </button>
      </div>
    </div>
  );
}

/**
 * Modal de detalle del evento
 */
function EventDetailModal({
  event,
  onClose,
  onUpdateStatus,
}: {
  event: SystemEvent;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
}) {
  const [notes, setNotes] = useState(event.admin_notes || '');
  const humanMessage = translateEventToHuman(event);

  return (
    <div className="nc-modal-overlay" onClick={onClose}>
      <div className="nc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="nc-modal-header">
          <h2>Detalle del Evento</h2>
          <button className="nc-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="nc-modal-body">
          <div className="nc-detail-section">
            <h3>Mensaje</h3>
            <p>{humanMessage}</p>
          </div>

          <div className="nc-detail-section">
            <h3>Información Técnica</h3>
            <div className="nc-detail-grid">
              <div>
                <strong>Tipo:</strong> {event.type}
              </div>
              {event.severity && (
                <div>
                  <strong>Severidad:</strong> {event.severity}
                </div>
              )}
              <div>
                <strong>Origen:</strong> {event.origin}
              </div>
              <div>
                <strong>Estado:</strong> {event.status}
              </div>
              {event.user_id && (
                <div>
                  <strong>Usuario:</strong> {event.user_id}
                </div>
              )}
              {event.url && (
                <div>
                  <strong>URL:</strong> {event.url}
                </div>
              )}
              <div>
                <strong>Fecha:</strong> {new Date(event.created_at).toLocaleString('es-ES')}
              </div>
            </div>
          </div>

          {event.device_info && (
            <div className="nc-detail-section">
              <h3>Dispositivo</h3>
              <pre className="nc-code">{JSON.stringify(event.device_info, null, 2)}</pre>
            </div>
          )}

          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="nc-detail-section">
              <h3>Metadata</h3>
              <pre className="nc-code">{JSON.stringify(event.metadata, null, 2)}</pre>
            </div>
          )}

          <div className="nc-detail-section">
            <h3>Notas del Administrador</h3>
            <textarea
              className="nc-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre este evento..."
              rows={4}
            />
          </div>
        </div>
        <div className="nc-modal-footer">
          <button
            className="nc-btn nc-btn-secondary"
            onClick={() => onUpdateStatus(event.id, 'reviewed', notes)}
          >
            Marcar como Revisado
          </button>
          <button
            className="nc-btn nc-btn-primary"
            onClick={() => onUpdateStatus(event.id, 'resolved', notes)}
          >
            Resolver
          </button>
          <button
            className="nc-btn nc-btn-danger"
            onClick={() => onUpdateStatus(event.id, 'ignored', notes)}
          >
            Ignorar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Tab de análisis
 */
function AnalysisTab({ analysis }: { analysis: any }) {
  if (!analysis) {
    return <div className="nc-loading">Cargando análisis...</div>;
  }

  const summary = generateAnalysisSummary(analysis);

  return (
    <div className="nc-analysis">
      <div className="nc-analysis-summary">
        <h2>Resumen del Día</h2>
        <p className="nc-summary-text">{summary}</p>
      </div>

      {analysis.top_error_endpoints && analysis.top_error_endpoints.length > 0 && (
        <div className="nc-analysis-section">
          <h3>Endpoints con Más Errores</h3>
          <div className="nc-stats-list">
            {analysis.top_error_endpoints.map((item: any, index: number) => (
              <div key={index} className="nc-stat-item">
                <span className="nc-stat-label">{item.endpoint}</span>
                <span className="nc-stat-value">{item.count} errores</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.top_activities && analysis.top_activities.length > 0 && (
        <div className="nc-analysis-section">
          <h3>Funcionalidades Más Usadas</h3>
          <div className="nc-stats-list">
            {analysis.top_activities.map((item: any, index: number) => (
              <div key={index} className="nc-stat-item">
                <span className="nc-stat-label">{item.activity}</span>
                <span className="nc-stat-value">{item.count} usos</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: '#3b82f6',
    reviewed: '#f59e0b',
    resolved: '#10b981',
    ignored: '#6b7280',
  };
  return colors[status] || '#6b7280';
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
  };
  return colors[severity] || '#6b7280';
}

