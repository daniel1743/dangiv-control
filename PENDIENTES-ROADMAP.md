# 📋 ROADMAP DE PENDIENTES - Dan&Giv Control

**Última actualización:** 2025-01-20

---

## ✅ COMPLETADOS

### **Sesión Actual (2025-01-20)**

1. ✅ **Sistema de Categorías Personalizadas**
   - Modal para agregar categorías
   - Guardado en Firebase/localStorage
   - Población dinámica de modales

2. ✅ **Sistema de Necesidades Personalizadas**
   - Modal para agregar niveles de necesidad
   - Fix visual: Estrellas no se montan sobre texto (reducción de font-size y letter-spacing)

3. ✅ **Sistema de Notificaciones Push**
   - Service Worker (`firebase-messaging-sw.js`)
   - Modal de permisos con UI atractiva
   - Firebase Cloud Messaging configurado
   - VAPID key integrada: `BGbDQL5BNEtTwX9jNXs8dMs0sibK2FSTty0SQD85is4qXT2KXnfxHMLdFDCFngybks0clXFbFcu0SgpRdNiDXXs`
   - 4 tipos de notificaciones: prueba, metas, resumen, presupuesto
   - Fix: Errores 404 resueltos con SVG emojis en data URIs

### **Sesiones Anteriores**

4. ✅ **Sistema Freemium de Fin (IA)**
   - 3 preguntas gratis para anónimos
   - Modal de conversión persuasivo
   - Sistema de memoria persistente de conversaciones

5. ✅ **Mejoras de Fin**
   - Modal de bienvenida con 6 ejemplos clicables
   - Fix: No saludar en cada respuesta
   - Fix: No mostrar modal a usuarios anónimos
   - Fix: Eliminar chat automático de onboarding

6. ✅ **Eliminación de Selects Duplicados**
   - Solo sistema de modales (no selects nativos)

7. ✅ **SEO y Google Search Console**
   - Redirects HTTP→HTTPS
   - Canonical URLs
   - robots.txt optimizado
   - sitemap.xml accesible

---

## 🔥 EN PROGRESO

### **2. Notificaciones Automáticas** 🏗️ (TRABAJANDO AHORA)
**Tiempo estimado:** 1 hora
**Archivos a modificar:** `app.js`, `push-notifications.js`

**Tareas:**
- [ ] Notificación al agregar gasto > $50.000
- [ ] Alerta cuando meta llegue al 90%
- [ ] Resumen diario automático (8 PM)
- [ ] Alerta de presupuesto mensual excedido
- [ ] Notificación cuando se complete una meta
- [ ] Recordatorio semanal si no se han registrado gastos

---

## ⏳ PENDIENTES (Priorizados)

### **🔥 PRIORIDAD ALTA** (Mayor impacto en usuarios)

#### **1. PWA (Progressive Web App) - Hacer instalable**
**Tiempo estimado:** 30-45 minutos
**Impacto:** ALTO - Mejora retención y engagement
**Archivos a crear:** `manifest.json`, iconos PNG

**Tareas:**
- [ ] Crear `manifest.json` con metadata de la app
- [ ] Generar iconos en múltiples tamaños (192x192, 512x512, etc.)
- [ ] Configurar Service Worker para funcionalidad offline
- [ ] Agregar botón "Instalar App" en el dashboard
- [ ] Testing en Chrome (Android) y Safari (iOS)

**Beneficios:**
- App instalable en pantalla de inicio del móvil
- Funciona offline (datos en caché)
- Experiencia nativa en móviles
- Mayor retención de usuarios

---

#### **3. Landing Page Optimizada**
**Tiempo estimado:** 1-2 horas
**Impacto:** ALTO - Mejora conversión de visitantes
**Archivos a modificar:** `index.html`, `style.css`, crear `landing.html`

**Tareas:**
- [ ] Hero section clara con:
  - Problema que resuelve la app
  - Solución (propuesta de valor única)
  - CTA principal ("Empieza Gratis")
- [ ] Video demo de 30-60 segundos
- [ ] Sección de beneficios principales (3-4 cards)
- [ ] Testimonios de usuarios (mínimo 3)
- [ ] FAQ section con 5-6 preguntas frecuentes
- [ ] Simplificar dashboard inicial con cards colapsables
- [ ] Priorizar información clave (resumen financiero en hero card)

**Beneficios:**
- Mayor tasa de conversión (visitante → usuario registrado)
- Mejor comunicación del valor diferencial
- Reduce tasa de rebote

---

### **📊 PRIORIDAD MEDIA** (Muy solicitado por usuarios)

#### **4. Exportación de Datos (Excel/PDF/CSV)**
**Tiempo estimado:** 1 hora
**Impacto:** MEDIO-ALTO - Feature muy solicitado
**Archivos a crear:** `export-manager.js`
**Librerías:** SheetJS (xlsx), jsPDF, jsPDF-AutoTable

**Tareas:**
- [ ] Exportar gastos a Excel (.xlsx)
  - Tabla con: Fecha, Categoría, Monto, Usuario, Necesidad
  - Formato condicional (gastos altos en rojo)
- [ ] Exportar reportes a PDF
  - Header con logo y título
  - Resumen mensual con gráficos
  - Tabla de gastos detallada
- [ ] Exportar datos raw a CSV
  - Para análisis en Excel/Google Sheets
- [ ] Botón de exportación en sección "Análisis"
- [ ] Selector de rango de fechas para exportación
- [ ] Opción de exportar todo o filtrado por categoría/usuario

**Beneficios:**
- Usuarios pueden hacer análisis externos
- Backup de datos históricos
- Compartir reportes con contadores/asesores

---

#### **5. Panel de Preferencias de Notificaciones**
**Tiempo estimado:** 45 minutos
**Impacto:** MEDIO - Mejora UX y control del usuario
**Archivos a modificar:** `app.js`, `index.html`, `style.css`

**Tareas:**
- [ ] Nueva sección en Config: "Notificaciones"
- [ ] Toggle para cada tipo:
  - ☑️ Recordatorios de metas
  - ☑️ Alertas de presupuesto
  - ☑️ Resúmenes diarios
  - ☑️ Ofertas y promociones
- [ ] Selector de horario para resúmenes diarios
- [ ] Checkbox "No molestar" (horario nocturno)
- [ ] Guardar preferencias en Firestore
- [ ] Respetar preferencias al enviar notificaciones

**Beneficios:**
- Usuario tiene control total
- Reduce notificaciones no deseadas
- Mejora satisfacción del usuario

---

#### **6. Reactivar Sistema de Cuentas Compartidas**
**Tiempo estimado:** 1-2 horas
**Impacto:** MEDIO - Feature completo pero desactivado
**Archivos a revisar:** `app.js` (código ya existe comentado)

**Tareas:**
- [ ] Identificar código deshabilitado
- [ ] Debugging de errores existentes
- [ ] Simplificar flujo de invitación:
  - Generar código de invitación de 6 dígitos
  - Compartir por WhatsApp/Email
  - Aceptar invitación desde Config
- [ ] Sistema de permisos:
  - Admin: Control total
  - Colaborador: Agregar gastos, ver todo
  - Solo lectura: Ver reportes
- [ ] Sincronización en tiempo real con Firestore
- [ ] Testing con múltiples usuarios

**Beneficios:**
- Parejas y familias pueden gestionar finanzas juntos
- Transparencia financiera compartida
- Feature diferenciador vs competencia

---

### **🏦 PRIORIDAD BAJA** (Más complejo, largo plazo)

#### **7. Importación CSV de Bancos**
**Tiempo estimado:** 2 horas
**Impacto:** MEDIO - Reduce fricción de ingreso manual
**Archivos a crear:** `csv-importer.js`

**Tareas:**
- [ ] Detectar formato de CSV (Banco de Chile, Santander, BCI, etc.)
- [ ] Parser de CSV con detección automática de columnas
- [ ] Mapeo de columnas:
  - Fecha → Parsear diferentes formatos
  - Descripción → Detectar categoría automáticamente
  - Monto → Detectar débito/crédito
- [ ] Vista previa antes de importar
- [ ] Prevenir duplicados (por fecha + monto)
- [ ] Botón "Importar desde CSV" en sección Gastos
- [ ] Tutorial de cómo descargar CSV de cada banco

**Beneficios:**
- Reducir tiempo de ingreso manual
- Mayor precisión en datos
- Paso intermedio antes de integración bancaria completa

---

#### **8. Machine Learning para Categorización Automática**
**Tiempo estimado:** 3-4 horas
**Impacto:** BAJO-MEDIO - Mejora UX a largo plazo
**Tecnología:** TensorFlow.js o ML5.js

**Tareas:**
- [ ] Recolectar datos de entrenamiento (gastos históricos)
- [ ] Entrenar modelo de clasificación de texto
- [ ] Predecir categoría basado en descripción del gasto
- [ ] Sugerencia de categoría con % de confianza
- [ ] Re-entrenamiento continuo con feedback del usuario

**Beneficios:**
- Reducir tiempo de categorización
- Mejora precisión con el uso
- Feature innovador

---

#### **9. Integración Bancaria con Open Banking / PSD2**
**Tiempo estimado:** 2-3 semanas (complejo)
**Impacto:** ALTO - Pero requiere infraestructura robusta
**Requiere:** Backend Node.js/Python, APIs de bancos

**Tareas:**
- [ ] Investigar APIs disponibles en Chile (¿existe Open Banking?)
- [ ] Implementar backend seguro para almacenar credenciales
- [ ] Conexión read-only con cuentas bancarias
- [ ] Sincronización automática diaria
- [ ] Categorización automática de transacciones
- [ ] Cumplimiento de normativas de seguridad financiera

**Beneficios:**
- Cero fricción (automático)
- Datos siempre actualizados
- Feature premium (monetizable)

---

### **❓ A EVALUAR**

#### **10. Funcionalidad Lista de Compras**
**Tiempo estimado:** Variable (según decisión)
**Estado:** Evaluar si mantener, rediseñar o eliminar

**Opciones:**

**A) Eliminar**
- Reducir complejidad de la app
- Enfoque 100% en finanzas

**B) Rediseñar e Integrar**
- Vincular lista de compras con presupuesto mensual
- Tracking de gastos recurrentes del supermercado
- Comparar precios históricos
- Alertas de "producto caro este mes"

**C) Dejar como está**
- Feature adicional sin mucho mantenimiento

**Decisión pendiente con usuario final**

---

## 📊 MÉTRICAS DE ÉXITO

Para medir el impacto de cada feature:

- **PWA Instalable**: % de usuarios que instalan la app
- **Notificaciones**: Tasa de apertura, engagement
- **Exportación**: Descargas mensuales de reportes
- **Landing Page**: Tasa de conversión visitante → registro
- **Cuentas Compartidas**: % de usuarios con cuentas vinculadas
- **Importación CSV**: Reducción en tiempo de ingreso manual

---

## 🔄 PROCESO DE IMPLEMENTACIÓN

Para cada feature:

1. **Planificación** (10%)
   - Diseño de UI/UX
   - Definir estructura de datos
   - Identificar archivos a modificar

2. **Desarrollo** (60%)
   - Implementar funcionalidad core
   - Integración con Firebase
   - Manejo de errores

3. **Testing** (20%)
   - Casos de uso principales
   - Edge cases
   - Testing en móvil y desktop

4. **Documentación** (10%)
   - Comentarios en código
   - Actualizar CLAUDE.md
   - Crear guía de usuario si es necesario

---

## 📝 NOTAS

- Priorizar features que reduzcan fricción y aumenten retención
- Cada feature debe tener métricas claras de éxito
- Considerar monetización futura (cuentas compartidas, exportación premium, integración bancaria)
- Mantener simplicidad y no sobrecargar la UI
- Mobile-first en todas las implementaciones

---

**Próximo feature a implementar:** 🔥 Notificaciones Automáticas
**Fecha de inicio:** 2025-01-20
