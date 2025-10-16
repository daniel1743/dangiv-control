# 🎁 CÓDIGOS PROMOCIONALES PRO - 15 DÍAS DE PRUEBA

## 📋 Lista de Códigos Válidos

Cada código otorga **15 días de acceso completo a FinanciaSuite Pro**.

```
1.  FINPRO2025-A1B2
2.  FINPRO2025-C3D4
3.  FINPRO2025-E5F6
4.  FINPRO2025-G7H8
5.  FINPRO2025-I9J0
6.  FINPRO2025-K1L2
7.  FINPRO2025-M3N4
8.  FINPRO2025-O5P6
9.  FINPRO2025-Q7R8
10. FINPRO2025-S9T0
11. FINPRO2025-U1V2
12. FINPRO2025-W3X4
13. FINPRO2025-Y5Z6
14. FINPRO2025-AA7B
15. FINPRO2025-CC8D
16. FINPRO2025-EE9F
17. FINPRO2025-GG0H
18. FINPRO2025-II1J
19. FINPRO2025-KK2L
20. FINPRO2025-MM3N
```

---

## 🔐 Características del Sistema

### ✅ Validaciones Implementadas

1. **Código válido**: Debe estar en la lista de códigos autorizados
2. **Código único**: No puede usarse más de una vez por usuario
3. **Sin duplicados**: Si ya activaste un código, no puedes usar otro
4. **Formato correcto**: Case-insensitive, limpia espacios automáticamente

### ⏰ Duración y Expiración

- **Duración**: 15 días desde activación
- **Conteo**: Días restantes se actualizan en tiempo real
- **Expiración**: Al cumplirse 15 días, acceso Pro se desactiva automáticamente
- **Notificación**: Al expirar, se muestra mensaje invitando a suscribirse

### 💾 Persistencia

- Los datos se guardan en **localStorage**:
  - `premiumStatus`: Estado actual de suscripción
  - `usedPromoCodes`: Lista de códigos ya utilizados
- Información persiste entre sesiones
- Funciona offline

---

## 🎨 UI del Sistema

### Modal de Código Promocional

**Ubicación**: Debajo del botón "Suscribirse" en el modal Premium

**Elementos**:
- Input para ingresar código
- Botón "Activar código"
- Mensaje de estado (éxito/error)
- Link "¿Tienes un código promocional?"

### Mensajes del Sistema

**Éxito**:
```
🎉 ¡Código activado! Tienes 15 días de FinanciaSuite Pro.
```

**Error - Código inválido**:
```
❌ Código inválido. Por favor verifica e intenta de nuevo.
```

**Error - Código usado**:
```
⚠️ Este código ya fue utilizado anteriormente.
```

**Error - Ya tiene premium**:
```
✅ Ya tienes una suscripción Premium activa.
```

---

## 🚀 Funcionalidades Pro Actualmente Disponibles

### 1. ✅ **Chat Fin - Mensajes Ilimitados**
- **Gratis**: 10 mensajes por día
- **Pro**: ∞ mensajes ilimitados
- **Estado**: FUNCIONAL ✅
- **Archivo**: `chat-fin.js` - contador de mensajes bypass

### 2. ✅ **Recomendaciones IA - Todas Desbloqueadas**
- **Gratis**: Solo 3 de 15 recomendaciones visibles
- **Pro**: Ver todas las 15 recomendaciones
- **Estado**: FUNCIONAL ✅
- **Archivo**: `app.js` - método `renderAIRecommendations()`

### 3. 🔜 **Registro de Gastos con IA (Próximamente)**
- **Descripción**: Conversación con Fin para registrar gastos
- **Proceso**: IA pregunta categoría, prioridad, fecha
- **Ventaja**: No abrir formularios, solo conversar
- **Estado**: PENDIENTE 🔜

### 4. 🔜 **Logros Premium (Próximamente)**
- **Fin Morado** (150 pts): Nueva apariencia morada
- **Fin Dorado** (250 pts): Nueva apariencia dorada
- **Gráficos Personalizados** (200 pts): 5 tipos de gráficos adicionales
- **Fin Cyberpunk** (300 pts): Apariencia futurista
- **Dashboard Animado** (180 pts): Efectos visuales premium
- **Fin Navideño** (150 pts): Apariencia de temporada
- **Estado**: PENDIENTE 🔜

### 5. 🔜 **Exportación de Datos (Próximamente)**
- Excel (.xlsx)
- PDF con gráficos
- CSV
- **Estado**: PENDIENTE 🔜

### 6. 🔜 **Análisis Avanzado (Próximamente)**
- Predicciones de gasto
- Detección de patrones
- Alertas inteligentes
- **Estado**: PENDIENTE 🔜

---

## 📊 Resumen de Estado Pro

### ✅ Funcional Ahora (2 features)
1. Chat Fin - Mensajes ilimitados
2. Recomendaciones IA - Todas desbloqueadas

### 🔜 Próximamente (4 features)
3. Registro de gastos con IA
4. 6 Logros premium con recompensas
5. Exportación de datos
6. Análisis avanzado

---

## 🔧 Uso del Sistema

### Para Desarrolladores

**Verificar si usuario es Premium**:
```javascript
if (isPremiumUser()) {
  // Mostrar feature premium
} else {
  // Mostrar upgrade prompt
}
```

**Obtener días restantes**:
```javascript
const daysLeft = getTrialDaysRemaining();
console.log(`Quedan ${daysLeft} días de prueba`);
```

**Obtener status completo**:
```javascript
const status = window.promoCodesSystem.getPremiumStatus();
console.log(status);
// {
//   isPremium: true,
//   type: 'trial',
//   activatedAt: 1234567890,
//   expiresAt: 1234567890,
//   code: 'FINPRO2025-A1B2',
//   daysRemaining: 12
// }
```

### Para Testing

**Activar código manualmente**:
```javascript
// En consola del navegador
window.promoCodesSystem.validateAndActivateCode('FINPRO2025-A1B2');
```

**Reset de códigos usados**:
```javascript
localStorage.removeItem('usedPromoCodes');
localStorage.removeItem('premiumStatus');
location.reload();
```

**Simular expiración**:
```javascript
const status = JSON.parse(localStorage.getItem('premiumStatus'));
status.expiresAt = Date.now() - 1000; // Hace 1 segundo
localStorage.setItem('premiumStatus', JSON.stringify(status));
location.reload();
```

---

## 🎯 Flujo de Usuario

### Primera Vez (Usuario Gratis)

1. Usuario ve funcionalidad limitada (3 recomendaciones, 10 mensajes/día)
2. Click en "Actualizar a Pro" o botón premium
3. Ve modal con "Próximamente" en suscripción
4. Click en "¿Tienes un código promocional?"
5. Ingresa código: `FINPRO2025-A1B2`
6. Click "Activar código"
7. ✅ Mensaje: "¡Código activado! Tienes 15 días..."
8. Página se recarga automáticamente
9. Ahora tiene acceso completo Pro

### Durante Trial

- Badge "PRO" visible en UI
- Contador de días restantes en perfil
- Todas las features Pro desbloqueadas
- Sin restricciones de uso

### Al Expirar (Día 16)

1. Sistema detecta expiración automáticamente
2. Muestra notificación: "Tu prueba ha expirado"
3. Vuelve a modo gratis (3 recomendaciones, 10 msg/día)
4. Invita a suscribirse para continuar

---

## 🔒 Seguridad

### Validaciones
- ✅ Códigos hardcodeados en sistema (no generables por usuarios)
- ✅ Cada código solo se usa una vez
- ✅ Fecha de expiración estricta (15 días)
- ✅ No se pueden extender trials con nuevos códigos

### Limitaciones Actuales
- ⚠️ LocalStorage puede ser manipulado (inspeccionar/editar)
- ⚠️ Para producción real: mover validación a backend/Firebase
- ⚠️ Códigos están en código fuente (visible en DevTools)

### Recomendación para Producción
Migrar a Firebase Firestore:
```javascript
// Backend valida códigos
// Guarda activaciones en base de datos
// Frontend solo lee estado desde Firebase
```

---

## 📝 Testing Checklist

- [ ] Activar código válido → Debe funcionar
- [ ] Activar código inválido → Debe rechazar
- [ ] Activar mismo código 2 veces → Debe rechazar segunda vez
- [ ] Verificar 15 días de duración → Contador correcto
- [ ] Simular expiración → Debe volver a gratis
- [ ] Verificar mensajes ilimitados en Chat Fin
- [ ] Verificar 15 recomendaciones desbloqueadas
- [ ] Verificar persistencia entre sesiones

---

## 🎉 Resultado Final

**Sistema completo de códigos promocionales funcional con**:
- ✅ 20 códigos únicos de 15 días
- ✅ Validación y activación automática
- ✅ UI integrada en modal premium
- ✅ Tracking de expiración
- ✅ 2 features Pro activas (chat ilimitado + recomendaciones completas)
- ✅ 4 features preparadas para implementar

**Listo para pruebas de producción!** 🚀
