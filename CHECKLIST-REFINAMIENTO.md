# ✅ CHECKLIST DE REFINAMIENTO
## Marca cada tarea al completarla

---

## 🚨 FASE 1: CORRECCIONES CRÍTICAS

### Tarea 1.1: Resolver Conflictos de Git ✅ COMPLETADA
- [x] Abrir `landing-styles.css`
- [x] Buscar marcadores `<<<<<<<`, `=======`, `>>>>>>>`
- [x] Decidir qué versión mantener (HEAD - paleta negra/dorada)
- [x] Eliminar marcadores y unificar código
- [x] Verificar que no quedan conflictos
- [ ] Probar visualmente en navegador (pendiente de usuario)
- [ ] Commit: "Fix: Resolver conflictos Git en landing-styles.css" (pendiente de usuario)

### Tarea 1.2: Fix Loading Infinito
- [ ] Verificar timeout de seguridad en `app.js` (10s)
- [ ] Agregar contenido estático visible inmediatamente
- [ ] Implementar skeleton screens
- [ ] Probar en conexión lenta
- [ ] Commit: "Fix: Reducir tiempo de loading inicial"

### Tarea 1.3: Eliminar Console.logs
- [ ] Buscar `console.log` en todos los archivos JS
- [ ] Reemplazar por `console.debug` o eliminar
- [ ] Mantener solo `console.error` y `console.warn`
- [ ] Probar que no hay logs en producción
- [ ] Commit: "Fix: Eliminar console.logs de producción"

### Tarea 1.4: Fix Error Focusable
- [ ] Buscar función `applyDataToForm()` en `app.js`
- [ ] Remover `required` de campos ocultos
- [ ] Agregar validación manual
- [ ] Probar formulario de gastos
- [ ] Commit: "Fix: Error focusable en formularios"

### Tarea 1.5: Optimizar Carga CSS
- [ ] Identificar archivos CSS relacionados
- [ ] Combinar archivos similares
- [ ] Minificar CSS
- [ ] Agregar `preload` para CSS crítico
- [ ] Medir tiempo de carga
- [ ] Commit: "Perf: Optimizar carga de CSS"

---

## ⚡ FASE 2: OPTIMIZACIONES

### Tarea 2.1: Lazy Loading Imágenes
- [ ] Agregar `loading="lazy"` a todas las imágenes
- [ ] Agregar `width` y `height` para evitar layout shift
- [ ] Probar en Lighthouse
- [ ] Commit: "Perf: Implementar lazy loading en imágenes"

### Tarea 2.2: Optimizar Animaciones
- [ ] Revisar `landing-animations.js`
- [ ] Agregar `will-change` solo cuando necesario
- [ ] Reducir animaciones en móvil
- [ ] Usar `requestAnimationFrame`
- [ ] Probar FPS (objetivo: 60 FPS)
- [ ] Commit: "Perf: Optimizar animaciones"

### Tarea 2.3: Code Splitting
- [ ] Separar código landing vs dashboard
- [ ] Implementar dynamic imports
- [ ] Cargar scripts solo cuando se necesiten
- [ ] Medir tamaño de bundle inicial
- [ ] Commit: "Perf: Implementar code splitting"

### Tarea 2.4: Service Worker Cache
- [ ] Crear/mejorar service worker
- [ ] Implementar cache de assets estáticos
- [ ] Estrategia cache-first para imágenes
- [ ] Probar segunda visita
- [ ] Commit: "Perf: Implementar service worker cache"

### Tarea 2.5: Optimizar Fuentes
- [ ] Agregar `font-display: swap`
- [ ] Preload fuentes críticas
- [ ] Probar FOIT
- [ ] Commit: "Perf: Optimizar carga de fuentes"

---

## 🎨 FASE 3: UI/UX

### Tarea 3.1: Navbar Sticky
- [ ] Agregar `position: sticky` al navbar
- [ ] Agregar backdrop blur
- [ ] Crear menú de navegación en landing
- [ ] Implementar scroll suave
- [ ] Probar en móvil y desktop
- [ ] Commit: "UI: Navbar sticky con navegación"

### Tarea 3.2: Mejorar Hero
- [ ] Cambiar texto typing a texto fijo
- [ ] Agregar número destacado
- [ ] Mejorar layout de botones
- [ ] Stack vertical en móvil
- [ ] Probar responsive
- [ ] Commit: "UI: Mejorar hero section"

### Tarea 3.3: Mejorar Estadísticas
- [ ] Cambiar "24/7" a estadística real
- [ ] Agregar iconos más grandes
- [ ] Agregar mini gráficos
- [ ] Probar visualmente
- [ ] Commit: "UI: Mejorar estadísticas del hero"

### Tarea 3.4: Botón Volver Arriba
- [ ] Crear FAB con flecha
- [ ] Aparece después de 300px scroll
- [ ] Scroll suave al hacer click
- [ ] Probar funcionalidad
- [ ] Commit: "UI: Agregar botón volver arriba"

### Tarea 3.5: Mejorar "Tu Dinero"
- [ ] Decidir: video, demo o eliminar
- [ ] Implementar solución elegida
- [ ] Mejorar lista de bullets
- [ ] Probar visualmente
- [ ] Commit: "UI: Mejorar sección Tu Dinero"

### Tarea 3.6: Reducir Testimonios
- [ ] Seleccionar 3-4 mejores testimonios
- [ ] Variar ratings (4.5, 5, 4.8)
- [ ] Mejorar avatares
- [ ] Implementar carousel si necesario
- [ ] Commit: "UI: Reducir y mejorar testimonios"

### Tarea 3.7: Mejorar FAQ
- [ ] Acelerar animación (0.2s)
- [ ] Agregar 3-4 preguntas más
- [ ] Mejorar diseño visual
- [ ] Probar funcionalidad
- [ ] Commit: "UI: Mejorar FAQ"

### Tarea 3.8: Variar CTAs
- [ ] Cambiar texto en hero
- [ ] Cambiar texto en beneficios
- [ ] Cambiar texto en testimonios
- [ ] Cambiar texto en CTA final
- [ ] Probar que todos funcionan
- [ ] Commit: "UI: Variar textos de CTAs"

---

## 🔐 FASE 4: FUNCIONALIDADES

### Tarea 4.1: Registro Progresivo
- [ ] Modificar `registerWithEmail()`
- [ ] Implementar paso 1 (solo email)
- [ ] Implementar paso 2 (completar perfil)
- [ ] Agregar social login prominente
- [ ] Probar flujo completo
- [ ] Commit: "Feat: Registro progresivo"

### Tarea 4.2: Tour Onboarding
- [ ] Crear/mejorar `onboarding-tour.js`
- [ ] Implementar 3 pasos obligatorios
- [ ] Agregar badges por paso
- [ ] Opción de saltar después primera vez
- [ ] Probar flujo completo
- [ ] Commit: "Feat: Tour de onboarding obligatorio"

### Tarea 4.3: Datos de Ejemplo
- [ ] Detectar usuario nuevo
- [ ] Cargar datos de ejemplo
- [ ] Agregar banner explicativo
- [ ] Botón para limpiar ejemplos
- [ ] Probar funcionalidad
- [ ] Commit: "Feat: Datos de ejemplo para nuevos usuarios"

### Tarea 4.4: Primera Meta Pre-configurada
- [ ] Crear meta sugerida después de registro
- [ ] Modal de aceptación
- [ ] Celebrar cuando se completa
- [ ] Probar flujo completo
- [ ] Commit: "Feat: Primera meta pre-configurada"

### Tarea 4.5: Modal Registro Mejorado
- [ ] Agregar preview de dashboard
- [ ] Agregar contador de usuarios
- [ ] Badge de seguridad visible
- [ ] Social login prominente
- [ ] Validación en tiempo real
- [ ] Commit: "UI: Mejorar modal de registro"

### Tarea 4.6: Calculadora Hero
- [ ] Crear `hero-calculator.js`
- [ ] Implementar calculadora simple
- [ ] Agregar al HTML del hero
- [ ] Agregar estilos
- [ ] Probar funcionalidad
- [ ] Commit: "Feat: Calculadora interactiva en hero"

### Tarea 4.7: Email Bienvenida
- [ ] Configurar backend (Firebase Functions)
- [ ] Crear template de email
- [ ] Trigger al registrarse
- [ ] Probar envío
- [ ] Commit: "Feat: Email de bienvenida automático"

---

## 🧪 FASE 5: TESTING

### Tarea 5.1: Cross-Browser
- [ ] Probar en Chrome
- [ ] Probar en Firefox
- [ ] Probar en Safari
- [ ] Probar en Edge
- [ ] Probar en móvil iOS
- [ ] Probar en móvil Android
- [ ] Documentar bugs
- [ ] Corregir incompatibilidades
- [ ] Commit: "Test: Fixes cross-browser"

### Tarea 5.2: Performance
- [ ] Ejecutar Lighthouse
- [ ] Anotar métricas iniciales
- [ ] Corregir problemas identificados
- [ ] Re-ejecutar Lighthouse
- [ ] Verificar Performance >90
- [ ] Commit: "Perf: Optimizaciones finales"

### Tarea 5.3: Accesibilidad
- [ ] Ejecutar axe DevTools
- [ ] Agregar alt text a imágenes
- [ ] Mejorar contraste
- [ ] Agregar ARIA labels
- [ ] Probar navegación por teclado
- [ ] Commit: "A11y: Mejoras de accesibilidad"

### Tarea 5.4: Funcionalidades
- [ ] Probar registro
- [ ] Probar login
- [ ] Probar agregar gasto
- [ ] Probar crear meta
- [ ] Probar chat con Fin
- [ ] Probar dashboard
- [ ] Probar sincronización
- [ ] Probar exportar datos
- [ ] Probar onboarding
- [ ] Documentar bugs
- [ ] Corregir problemas
- [ ] Commit: "Test: Verificación de funcionalidades"

### Tarea 5.5: Documentación
- [ ] Actualizar README.md
- [ ] Actualizar CHANGELOG.md
- [ ] Agregar screenshots
- [ ] Documentar configuración
- [ ] Agregar guía de deployment
- [ ] Commit: "Docs: Actualizar documentación"

---

## 📊 PROGRESO GENERAL

**Total de tareas:** 25  
**Completadas:** 0 / 25  
**En progreso:** 0  
**Pendientes:** 25

### Por Fase:
- Fase 1: 0 / 5 (0%)
- Fase 2: 0 / 5 (0%)
- Fase 3: 0 / 8 (0%)
- Fase 4: 0 / 7 (0%)
- Fase 5: 0 / 5 (0%)

---

## 🎯 PRÓXIMAS 3 TAREAS PRIORITARIAS

1. **Tarea 1.1:** Resolver conflictos Git (30 min)
2. **Tarea 1.2:** Fix loading infinito (2 horas)
3. **Tarea 1.3:** Eliminar console.logs (1 hora)

---

**Última actualización:** [Fecha]  
**Estado:** En progreso

