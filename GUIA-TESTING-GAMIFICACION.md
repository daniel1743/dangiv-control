# 🧪 GUÍA DE TESTING - SISTEMA DE GAMIFICACIÓN

**Fecha:** 2025-10-26
**Sistema:** Detector de Usuarios Gamificado
**Versión:** 1.0

---

## 📋 CHECKLIST DE PRUEBAS

### ✅ PARTE 1: CONFIGURACIÓN INICIAL

#### 1.1 Archivos Vinculados
- [ ] Abrir DevTools (F12) → Console
- [ ] Verificar que no hay errores 404 para:
  - `user-detective-game.css`
  - `user-detective-game.js`
- [ ] Buscar en consola: "🎮 Sistema de Gamificación de Usuario cargado"

#### 1.2 Autenticación
- [ ] Iniciar sesión con usuario (Daniel o Givonik)
- [ ] Verificar que aparece el avatar en la navbar
- [ ] Verificar que `app.currentUser` tiene valor (desde consola: `window.app.currentUser`)

---

### ✅ PARTE 2: PRUEBAS CON ESCÁNER DE IA

#### 2.1 Flujo Básico del Escáner
1. [ ] Ir a la sección "Registro de Gastos"
2. [ ] Hacer clic en botón "Escanear Recibo con IA"
3. [ ] Subir una foto de recibo (o usar imagen de prueba)
4. [ ] Esperar a que la IA procese el recibo
5. [ ] Hacer clic en "Aplicar Datos al Formulario"

#### 2.2 Verificar que Aparece el Modal de Gamificación
- [ ] **Debe aparecer** el modal "¿Quién hizo esta compra?" 🕵️
- [ ] Verificar overlay oscuro con blur de fondo
- [ ] Verificar que el modal muestra:
  - Título: "¿Quién hizo esta compra?"
  - Subtítulo: "Ayúdanos a identificar quién realizó este gasto"
  - Monto del gasto destacado (ej: "$15.000")
  - Categoría y descripción del gasto

#### 2.3 Verificar Avatares Dinámicos
- [ ] Verificar que aparecen los avatares de usuarios registrados
- [ ] Si solo hay Daniel y Givonik:
  - [ ] Ver 2 tarjetas de usuario
  - [ ] Ver 1 tarjeta "Ambos" (Daniel + Givonik)
  - [ ] Ver 1 tarjeta "No lo sé"
  - [ ] **Total: 4 tarjetas**

- [ ] Si hay más usuarios (Juan, Petronila, etc.):
  - [ ] Ver tarjetas para TODOS los usuarios registrados
  - [ ] SI hay exactamente 2 usuarios: ver opción "Ambos"
  - [ ] SI hay 3+ usuarios: NO ver opción "Ambos"
  - [ ] Siempre ver tarjeta "No lo sé"

#### 2.4 Verificar Diseño de Avatares
Para cada tarjeta de avatar:
- [ ] Ver círculo con gradiente azul
- [ ] Ver iniciales del usuario (ej: "D" para Daniel, "G" para Givonik)
- [ ] Ver nombre completo debajo
- [ ] Ver emoji de reacción en esquina (ej: "💰", "🛒", "👍")
- [ ] Al hacer hover:
  - [ ] Tarjeta se eleva con animación
  - [ ] Aparece borde brillante azul/verde
  - [ ] Emoji se mueve (animación wiggle)

#### 2.5 Verificar Tarjeta "Ambos" (Solo con 2 usuarios)
- [ ] Ver icono de usuarios múltiples (👥)
- [ ] Ver texto "Ambos"
- [ ] Ver preview: "Daniel + Givonik"
- [ ] Ver subtexto: "Divide el gasto 50/50"
- [ ] Borde punteado (dashed)

#### 2.6 Verificar Tarjeta "No lo sé"
- [ ] Ver icono de signo de interrogación (❓)
- [ ] Ver texto "No lo sé"
- [ ] Ver subtexto: "Se asignará automáticamente"
- [ ] Borde punteado (dashed)
- [ ] Color gris (diferente a los demás)

---

### ✅ PARTE 3: INTERACCIÓN Y SELECCIÓN

#### 3.1 Selección de Usuario Específico
1. [ ] Hacer clic en avatar de "Daniel"
2. [ ] Verificar:
   - [ ] Modal se cierra con animación
   - [ ] Aparece feedback: "✅ ¡Genial! Asignado a Daniel"
   - [ ] Muestra puntos ganados: "+10 puntos 🌟"
   - [ ] Feedback desaparece después de 2 segundos
3. [ ] Verificar que el formulario tiene:
   - [ ] Campo "Usuario" = "Daniel"
   - [ ] Todos los campos rellenados por IA tienen:
     - Fondo azul claro
     - Borde azul brillante
     - Icono 🤖 en esquina superior derecha
4. [ ] Hacer clic en "Registrar Gasto"
5. [ ] Verificar que el gasto se registra con `user: "Daniel"`

#### 3.2 Selección de "Ambos" (Con 2 usuarios)
1. [ ] Escanear otro recibo
2. [ ] Aplicar datos
3. [ ] En modal, hacer clic en tarjeta "Ambos"
4. [ ] Verificar:
   - [ ] Feedback: "✅ Dividido entre Daniel y Givonik"
   - [ ] Muestra: "+15 puntos 🌟" (más puntos por colaboración)
5. [ ] Verificar formulario:
   - [ ] Campo "Usuario" = "Daniel + Givonik"
6. [ ] Registrar gasto
7. [ ] **IMPORTANTE**: Verificar que el gasto se creó con:
   - `user: "Daniel + Givonik"`
   - En el Dashboard, debe aparecer como gasto compartido

#### 3.3 Selección de "No lo sé"
1. [ ] Escanear otro recibo
2. [ ] Aplicar datos
3. [ ] Hacer clic en "No lo sé"
4. [ ] Verificar:
   - [ ] Feedback: "Asignado automáticamente a [usuario autenticado]"
   - [ ] Puntos: "+5 puntos 🌟" (menos puntos que selección manual)
5. [ ] Verificar formulario:
   - [ ] Campo "Usuario" = nombre del usuario autenticado (Daniel o Givonik)

#### 3.4 Cerrar Modal sin Seleccionar
1. [ ] Escanear recibo
2. [ ] Aplicar datos
3. [ ] Hacer clic en botón "✕" (cerrar) en esquina superior derecha
4. [ ] Verificar:
   - [ ] Modal se cierra
   - [ ] Campo "Usuario" = usuario autenticado (auto-asignación por defecto)
   - [ ] Toast: "Usuario asignado automáticamente"

---

### ✅ PARTE 4: SISTEMA DE PUNTOS Y LOGROS

#### 4.1 Verificar Puntos en LocalStorage
1. [ ] Abrir DevTools → Application → Local Storage
2. [ ] Buscar clave: `userDetectiveStats`
3. [ ] Verificar estructura:
```json
{
  "Daniel": {
    "points": 25,
    "level": 1,
    "assignmentsCount": 3,
    "lastAssignment": "2025-10-26T..."
  },
  "Givonik": {
    "points": 10,
    "level": 1,
    "assignmentsCount": 1,
    "lastAssignment": "2025-10-26T..."
  }
}
```

#### 4.2 Verificar Cálculo de Nivel
- [ ] Nivel 1: 0-99 puntos → Icono "🌟"
- [ ] Nivel 2: 100-249 puntos → Icono "⭐"
- [ ] Nivel 3: 250-499 puntos → Icono "✨"
- [ ] Nivel 4: 500-999 puntos → Icono "💎"
- [ ] Nivel 5: 1000+ puntos → Icono "👑"

**Prueba manual:**
1. [ ] Abrir consola: `localStorage.setItem('userDetectiveStats', JSON.stringify({Daniel: {points: 150, level: 2, assignmentsCount: 15}}))`
2. [ ] Recargar página
3. [ ] Escanear recibo y aplicar
4. [ ] Verificar que en el modal, avatar de Daniel muestra:
   - [ ] Badge de nivel "Nivel 2 ⭐"
   - [ ] 150 puntos

#### 4.3 Verificar Logros (Achievements)
Desde consola, verificar mensajes de logros:

**Primer Gasto:**
```javascript
// Primera asignación
// Debe mostrar toast: "🏆 ¡Logro desbloqueado! Primera asignación"
```

**10 Asignaciones:**
```javascript
// En consola: localStorage.setItem('userDetectiveStats', JSON.stringify({Daniel: {points: 100, level: 2, assignmentsCount: 9}}))
// Asignar un gasto más
// Debe mostrar: "🏆 ¡Logro desbloqueado! Detective experto - 10 asignaciones"
```

**Racha de 5 días:**
```javascript
// Difícil de probar manualmente, requiere 5 días consecutivos
// Revisar código en user-detective-game.js línea ~350
```

---

### ✅ PARTE 5: CASOS EDGE Y ERRORES

#### 5.1 Sin Usuarios Registrados (Edge Case)
1. [ ] Desde consola: `window.app.customUsers = []`
2. [ ] Escanear recibo y aplicar
3. [ ] Verificar modal muestra:
   - [ ] Solo "Daniel" y "Givonik" (usuarios por defecto)
   - [ ] "Ambos" (si son exactamente 2)
   - [ ] "No lo sé"

#### 5.2 Con Muchos Usuarios (Edge Case)
1. [ ] Desde consola:
```javascript
window.app.customUsers = [
  {name: 'Juan', avatar: '👨'},
  {name: 'Petronila', avatar: '👩'},
  {name: 'Carlos', avatar: '👨‍💼'},
  {name: 'María', avatar: '👩‍💼'}
];
```
2. [ ] Escanear recibo y aplicar
3. [ ] Verificar modal muestra:
   - [ ] Todos los 6 usuarios (Daniel, Givonik, Juan, Petronila, Carlos, María)
   - [ ] **NO debe aparecer** "Ambos" (porque hay más de 2 usuarios)
   - [ ] "No lo sé"
   - [ ] Grid responsive (2 columnas en móvil, 3+ en desktop)

#### 5.3 Doble Click
1. [ ] Escanear recibo
2. [ ] Hacer doble click rápido en un avatar
3. [ ] Verificar:
   - [ ] Solo se registra 1 selección (no duplica)
   - [ ] Modal se cierra correctamente

#### 5.4 Cerrar Modal con ESC
1. [ ] Escanear recibo
2. [ ] Presionar tecla ESC
3. [ ] Verificar:
   - [ ] Modal se cierra
   - [ ] Usuario se auto-asigna

---

### ✅ PARTE 6: REGISTRO MANUAL (SIN ESCÁNER)

#### 6.1 Registro Manual NO muestra Modal
1. [ ] Ir a formulario de gastos
2. [ ] Llenar campos manualmente (sin usar escáner)
3. [ ] Hacer clic en campo de "Usuario"
4. [ ] Verificar:
   - [ ] **NO debe aparecer** el modal de gamificación
   - [ ] Debe aparecer el selector normal de usuarios
5. [ ] Seleccionar usuario manualmente
6. [ ] Registrar gasto
7. [ ] Verificar que funciona normalmente

**IMPORTANTE:** El modal de gamificación SOLO aparece cuando:
- Se usa el escáner de IA
- Se hace clic en "Aplicar Datos al Formulario"

---

### ✅ PARTE 7: INTEGRACIÓN CON DASHBOARD

#### 7.1 Gastos Individuales
1. [ ] Registrar gasto de $10.000 asignado a Daniel
2. [ ] Ir a Dashboard
3. [ ] Verificar:
   - [ ] "Total Gastos" aumenta en $10.000
   - [ ] "Balance Disponible" disminuye en $10.000
   - [ ] Gráfico de gastos por usuario muestra barra para Daniel
   - [ ] Lista de gastos recientes muestra el gasto con icono/nombre de Daniel

#### 7.2 Gastos Compartidos ("Ambos")
1. [ ] Registrar gasto de $20.000 asignado a "Daniel + Givonik"
2. [ ] Ir a Dashboard
3. [ ] Verificar:
   - [ ] "Total Gastos" aumenta en $20.000
   - [ ] Lista de gastos muestra: "Daniel + Givonik"
   - [ ] **Pregunta:** ¿Cómo se visualiza en el gráfico?
     - Opción A: Se divide 50/50 ($10.000 a cada uno)
     - Opción B: Aparece como categoría "Compartido"
     - Opción C: Solo se cuenta como gasto total sin dividir

**NOTA:** Revisar comportamiento y ajustar si es necesario.

---

### ✅ PARTE 8: RESPONSIVE Y ACCESIBILIDAD

#### 8.1 Diseño Responsive
**Desktop (1920x1080):**
- [ ] Modal se ve centrado
- [ ] Avatares en grid de 3-4 columnas
- [ ] Todos los elementos visibles sin scroll

**Tablet (768x1024):**
- [ ] Modal ocupa 90% del ancho
- [ ] Avatares en grid de 2 columnas
- [ ] Scroll si hay muchos usuarios

**Móvil (375x667):**
- [ ] Modal ocupa 95% del ancho
- [ ] Avatares en 1 columna
- [ ] Botón de cerrar accesible
- [ ] Texto legible sin zoom

#### 8.2 Teclado y Accesibilidad
- [ ] Modal se puede cerrar con tecla ESC
- [ ] Avatares tienen focus visible con Tab
- [ ] Se puede seleccionar con Enter/Space
- [ ] Textos con contraste suficiente
- [ ] Iconos con tamaño adecuado (mínimo 24px)

---

### ✅ PARTE 9: ANIMACIONES Y FEEDBACK

#### 9.1 Animaciones del Modal
- [ ] Overlay: fade in (0.3s)
- [ ] Modal: scale + translateY (efecto bounce)
- [ ] Avatares: slide in secuencial (cada avatar con delay)

#### 9.2 Animaciones de Hover
- [ ] Avatar se eleva (-8px)
- [ ] Avatar escala (1.05x)
- [ ] Borde brillante aparece
- [ ] Emoji de reacción se mueve (wiggle)
- [ ] Círculo del avatar hace bounce

#### 9.3 Animaciones de Selección
- [ ] Avatar seleccionado: scale pulse (1 → 1.1 → 1)
- [ ] Confetti (opcional, si está implementado)
- [ ] Feedback modal: pop + spin
- [ ] Modal cierra con fade out

---

### ✅ PARTE 10: CONSOLA Y DEBUGGING

#### 10.1 Mensajes de Consola
Verificar que aparecen estos logs (con emojis):
```
🎮 Sistema de Gamificación de Usuario cargado
🎮 Interceptando applyDataToForm para gamificación
🎮 Mostrando modal de gamificación para usuario
✅ Usuario seleccionado: Daniel
💾 Guardando stats: {Daniel: {...}}
🏆 Logro desbloqueado: Primera asignación
```

#### 10.2 Errores Comunes a Buscar
❌ `Cannot read property 'push' of undefined`
❌ `this.app.expenses is not an array`
❌ `customUsers is undefined`
❌ `404 Not Found: user-detective-game.css`
❌ `Maximum call stack size exceeded` (recursión infinita)

Si aparece algún error, copiar el mensaje completo y compartir.

---

### ✅ PARTE 11: PRUEBAS DE ESTRÉS

#### 11.1 Múltiples Registros Rápidos
1. [ ] Escanear recibo → aplicar → seleccionar usuario → registrar
2. [ ] Repetir 5 veces seguidas
3. [ ] Verificar:
   - [ ] Todos los gastos se registran correctamente
   - [ ] Puntos se acumulan correctamente
   - [ ] No hay memory leaks (revisar DevTools → Memory)

#### 11.2 Datos Inválidos
1. [ ] Desde consola: `localStorage.setItem('userDetectiveStats', 'invalid json')`
2. [ ] Recargar página
3. [ ] Escanear recibo
4. [ ] Verificar:
   - [ ] No hay crash
   - [ ] Se crea nuevo objeto de stats
   - [ ] Modal funciona normalmente

---

## 📊 RESUMEN DE RESULTADOS

Al finalizar todas las pruebas, llenar esta tabla:

| Categoría | Pruebas Pasadas | Pruebas Totales | % Éxito |
|-----------|----------------|-----------------|---------|
| Configuración | __/2 | 2 | __% |
| Escáner IA | __/6 | 6 | __% |
| Interacción | __/4 | 4 | __% |
| Puntos y Logros | __/3 | 3 | __% |
| Casos Edge | __/4 | 4 | __% |
| Registro Manual | __/1 | 1 | __% |
| Dashboard | __/2 | 2 | __% |
| Responsive | __/2 | 2 | __% |
| Animaciones | __/3 | 3 | __% |
| Consola | __/2 | 2 | __% |
| Estrés | __/2 | 2 | __% |
| **TOTAL** | **__/31** | **31** | **__%** |

---

## 🐛 REPORTE DE BUGS

Si encuentras algún problema, documéntalo aquí:

### Bug #1
**Descripción:**
**Pasos para reproducir:**
**Comportamiento esperado:**
**Comportamiento actual:**
**Screenshot/Error:**

### Bug #2
**Descripción:**
**Pasos para reproducir:**
**Comportamiento esperado:**
**Comportamiento actual:**
**Screenshot/Error:**

---

## ✅ CONCLUSIÓN

- [ ] Todas las pruebas críticas pasadas
- [ ] Sistema funcional y listo para producción
- [ ] Documentación completa
- [ ] Sin errores en consola

**Estado final:** ✅ APROBADO / ⚠️ REQUIERE AJUSTES / ❌ BLOQUEANTE

---

**Probado por:** _____________
**Fecha:** _____________
**Navegador:** Chrome / Firefox / Safari / Edge
**Versión:** _____________
**Sistema Operativo:** Windows / macOS / Linux
