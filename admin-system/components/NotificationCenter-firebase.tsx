/**
 * ========================================
 * CENTRO DE NOTIFICACIONES DEL SISTEMA
 * Panel de administrador - Finantel
 * VERSIÓN FIREBASE
 * ========================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  updateDoc,
  doc,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { translateEventToHuman, generateAnalysisSummary } from '../utils/eventTranslator';

interface NotificationCenterProps {
  firestore: any; // Firestore instance
}

interface SystemEvent {
  id: string;
  type: string;
  severity?: string;
  origin: string;
  event: string;
  userId?: string;
  message: any;
  metadata?: any;
  deviceInfo?: any;
  url?: string;
  createdAt: Timestamp | Date;
  status: string;
  adminNotes?: string;
}

type FilterType = 'all' | 'bug' | 'activity' | 'api_usage' | 'anomaly' | 'alert';
type FilterSeverity = 'all' | 'critical' | 'high' | 'medium' | 'low';
type FilterStatus = 'all' | 'new' | 'reviewed' | 'resolved';

export default function NotificationCenter({ firestore }: NotificationCenterProps) {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'analysis'>('events');

  // Cargar eventos
  useEffect(() => {
    if (!firestore) return;

    loadEvents();
    loadAnalysis();
    setupRealtimeSubscription();
  }, [firestore, filterType, filterSeverity, filterStatus]);

  /**
   * Cargar eventos desde Firestore
   */
  const loadEvents = async () => {
    if (!firestore) return;

    try {
      setLoading(true);

      let q = query(
        collection(firestore, 'system_events'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      // Aplicar filtros
      if (filterType !== 'all') {
        q = query(q, where('type', '==', filterType));
      }

      if (filterSeverity !== 'all') {
        q = query(q, where('severity', '==', filterSeverity));
      }

      if (filterStatus !== 'all') {
        q = query(q, where('status', '==', filterStatus));
      }

      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as SystemEvent[];

      setEvents(eventsData);
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
    if (!firestore) return;

    try {
      // Obtener eventos del último día
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const q = query(
        collection(firestore, 'system_events'),
        where('createdAt', '>=', Timestamp.fromDate(oneDayAgo)),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const allEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));

      // Procesar análisis
      const bugs = allEvents.filter((e) => e.type === 'bug');
      const activities = allEvents.filter((e) => e.type === 'activity');
      const apiUsage = allEvents.filter((e) => e.type === 'api_usage');

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
        .slice(0, 5);

      // Actividades más comunes
      const activityCounts: Record<string, number> = {};
      activities.forEach((activity) => {
        activityCounts[activity.event] = (activityCounts[activity.event] || 0) + 1;
      });

      const topActivities = Object.entries(activityCounts)
        .map(([activity, count]) => ({ activity, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

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
      const activeUsers = new Set(allEvents.map((e) => e.userId).filter(Boolean)).size;

      setAnalysis({
        stats: {
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
        errors_today: {
          total: bugs.length,
          ...errorsBySeverity,
        },
      });
    } catch (error) {
      console.error('Error cargando análisis:', error);
    }
  };

  /**
   * Configurar suscripción en tiempo real
   */
  const setupRealtimeSubscription = () => {
    if (!firestore) return;

    try {
      const q = query(
        collection(firestore, 'system_events'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newEvent = {
              id: change.doc.id,
              ...change.doc.data(),
              createdAt: change.doc.data().createdAt?.toDate() || new Date(),
            } as SystemEvent;

            // Agregar nuevo evento a la lista
            setEvents((prev) => [newEvent, ...prev].slice(0, 100));
          }
        });
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error configurando suscripción:', error);
    }
  };

  /**
   * Actualizar estado de un evento
   */
  const updateEventStatus = async (eventId: string, status: string, notes?: string) => {
    if (!firestore) return;

    try {
      const eventRef = doc(firestore, 'system_events', eventId);
      await updateDoc(eventRef, {
        status,
        adminNotes: notes || null,
        resolvedAt: status === 'resolved' ? new Date() : null,
      });

      // Actualizar en el estado local
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status, adminNotes: notes } : e))
      );

      if (selectedEvent?.id === eventId) {
        setSelectedEvent({ ...selectedEvent, status, adminNotes: notes });
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

// Componentes auxiliares (mismos que la versión Supabase)
function EventCard({
  event,
  onSelect,
  onUpdateStatus,
}: {
  event: SystemEvent;
  onSelect: () => void;
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
}) {
  const humanMessage = translateEventToHuman(event as any);
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
        <span className="nc-event-time">{formatTime(event.createdAt)}</span>
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

function EventDetailModal({
  event,
  onClose,
  onUpdateStatus,
}: {
  event: SystemEvent;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, notes?: string) => void;
}) {
  const [notes, setNotes] = useState(event.adminNotes || '');
  const humanMessage = translateEventToHuman(event as any);

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
              {event.userId && (
                <div>
                  <strong>Usuario:</strong> {event.userId}
                </div>
              )}
              {event.url && (
                <div>
                  <strong>URL:</strong> {event.url}
                </div>
              )}
              <div>
                <strong>Fecha:</strong> {new Date(event.createdAt).toLocaleString('es-ES')}
              </div>
            </div>
          </div>

          {event.deviceInfo && (
            <div className="nc-detail-section">
              <h3>Dispositivo</h3>
              <pre className="nc-code">{JSON.stringify(event.deviceInfo, null, 2)}</pre>
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
function formatTime(date: Date | Timestamp): string {
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)}h`;
  return dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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


