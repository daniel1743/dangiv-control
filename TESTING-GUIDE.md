# 🧪 Guía de Testing - FinanciaSuite

## 📋 Checklist Completo de Pruebas

Esta guía te ayudará a verificar que todos los cambios implementados funcionan correctamente.

---

## 1. ✅ Alineación de Botones Flotantes (FAB)

### Desktop (>768px)
**Pasos**:
1. Abrir `index.html` en navegador desktop
2. Verificar botón FAB (+) en esquina inferior derecha
3. Verificar botón Fin (IA) justo arriba del FAB

**Resultado Esperado**:
- ✅ Ambos botones alineados verticalmente (mismo `right`)
- ✅ Gap de 16px entre ellos
- ✅ Mismo tamaño (56x56px)
- ✅ Z-index correcto (Fin:998, FAB:999)

**Visual**:
```
                    ┌─────┐
                    │ FIN │ (bottom: 96px)
                    └─────┘
                      16px gap
                    ┌─────┐
                    │  +  │ (bottom: 24px)
                    └─────┘
```

### Tablet (768px)
**Pasos**:
1. Redimensionar ventana a 768px de ancho
2. Verificar posición de ambos botones

**Resultado Esperado**:
- ✅ Ambos alineados a la derecha (right: 16px)
- ✅ Gap de 16px entre ellos
- ✅ Tamaños: Fin 52x52px, FAB según su estilo

### Mobile (<480px)
**Pasos**:
1. Redimensionar ventana a 480px o menos
2. Verificar posición

**Resultado Esperado**:
- ✅ No se solapan
- ✅ Fin a 148px desde abajo
- ✅ Tamaño Fin: 48x48px
- ✅ Visualmente limpio y profesional

**Cómo Verificar en DevTools**:
```javascript
// Abrir consola del navegador
const fab = document.querySelector('.fab');
const fin = document.querySelector('.fin-floating-btn');

console.log('FAB:', {
  bottom: getComputedStyle(fab).bottom,
  right: getComputedStyle(fab).right,
  size: getComputedStyle(fab).width
});

console.log('Fin:', {
  bottom: getComputedStyle(fin).bottom,
  right: getComputedStyle(fin).right,
  size: getComputedStyle(fin).width
});
```

---

## 2. ✅ Errores de Consola Corregidos

### Test 1: X-Frame-Options
**Pasos**:
1. Abrir `index.html`
2. Abrir DevTools → Console
3. Buscar errores relacionados con "X-Frame-Options" o "iframe"

**Resultado Esperado**:
- ✅ NO debe haber error "Refused to display in a frame"
- ✅ Iframes deben cargar correctamente (si existen)

**Verificación Manual**:
```bash
# Verificar header en vercel.json
grep -A 2 "X-Frame-Options" vercel.json
# Debe mostrar: "value": "SAMEORIGIN"
```

### Test 2: Permissions Policy
**Pasos**:
1. Abrir consola
2. Buscar warnings de "Permissions Policy" o "microphone"

**Resultado Esperado**:
- ✅ NO debe haber warning "[Violation] Potential permissions policy violation: microphone"
- ✅ Consola limpia de violaciones de permisos

**Verificación Manual**:
```bash
# Verificar que microphone fue removido
grep "microphone" vercel.json
# No debe retornar nada o solo en comentarios

grep "allow=\"microphone\"" fin-widget.js
# No debe retornar nada
```

### Test 3: Saludo de Usuario
**Pasos**:
1. Configurar usuario con nombre "Luisa" en perfil
2. Recargar página
3. Verificar saludo en dashboard

**Resultado Esperado**:
- ✅ Debe mostrar "¡Buenos días, Luisa!" (o "Buenas tardes/noches" según hora)
- ✅ NO debe mostrar "¡Buenos días, Usuario!"

**Verificación en Consola**:
```javascript
// En consola del navegador
console.log(financeApp.userProfile.name); // Debe mostrar "Luisa"
// Verificar saludo
document.querySelector('.greeting').textContent; // Debe incluir "Luisa"
```

---

## 3. ✅ Onboarding - Plan Financiero

### Test Completo del Onboarding
**Pasos**:
1. Limpiar localStorage:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
2. Completar pasos del onboarding:
   - Paso 1: Ingresar nombre (ej: "Luisa")
   - Paso 2: Ingresar ingreso mensual (ej: 5000000)
   - Paso 3: Seleccionar objetivos financieros
   - Paso 4: Esperar generación de plan

**Resultado Esperado**:
- ✅ Se muestra "Creando tu plan financiero personalizado..."
- ✅ NO se queda cargando infinitamente
- ✅ En 3-5 segundos muestra el plan generado
- ✅ Plan tiene estructura correcta:
  - Presupuesto (esenciales, ocio, ahorro)
  - Ahorro mensual sugerido
  - Consejos personalizados
  - Mensaje motivacional

### Test con IA (Gemini API)
**Requisito**: API key configurada en `firebase-config.js`

**Pasos**:
1. Configurar API key válida
2. Completar onboarding
3. Verificar consola

**Resultado Esperado en Consola**:
```
✅ Plan generado por IA: {presupuesto: {…}, ahorroMensual: 1000000, …}
```

### Test sin IA (Fallback)
**Pasos**:
1. NO configurar API key (dejar `null` o inválida)
2. Completar onboarding
3. Verificar consola

**Resultado Esperado en Consola**:
```
⚠️ No hay API Key de Gemini disponible
✅ Usando plan básico
```

**Verificar Plan Básico**:
- ✅ Presupuesto: esenciales 50%, ocio 30%, ahorro 20%
- ✅ Ahorro mensual: 20% del ingreso
- ✅ Consejos genéricos pero útiles
- ✅ Mensaje personalizado con nombre

### Test de Respuesta con Markdown (Edge Case)
**Simular respuesta de Gemini con markdown**:

```javascript
// En consola, antes de completar paso 4
const onboarding = financeApp.onboardingManager;

// Simular respuesta de Gemini con markdown
const fakeResponse = `\`\`\`json
{
  "presupuesto": {"esenciales": 60, "ocio": 20, "ahorro": 20},
  "ahorroMensual": 1000000,
  "consejos": ["Consejo 1", "Consejo 2"],
  "mensaje": "¡Bien hecho!"
}
\`\`\``;

// El sistema debe limpiar esto y extraer el JSON
```

**Resultado Esperado**:
- ✅ Sistema limpia los ` ```json ` y ` ``` `
- ✅ Extrae el JSON correctamente
- ✅ Parsea sin errores
- ✅ Muestra el plan

### Test de JSON Inválido (Edge Case)
**Simular respuesta de Gemini con JSON mal formado**:

```javascript
// Simular respuesta sin estructura correcta
const fakeInvalidResponse = {
  "datos": {"info": "algo"}
  // ❌ Falta 'presupuesto.esenciales'
};

// El sistema debe detectar esto
```

**Resultado Esperado**:
- ✅ Sistema detecta estructura inválida
- ✅ Consola muestra: `⚠️ Plan de IA con formato incorrecto, usando plan básico`
- ✅ Genera plan básico automáticamente
- ✅ Onboarding continúa sin errores

---

## 4. ✅ Recomendaciones IA Personalizadas

### Test Inicial - Primera Carga
**Pasos**:
1. Tener datos en la app (gastos, metas, ingreso)
2. Ir al Dashboard
3. Buscar tarjeta "Recomendaciones de Ahorro"
4. Verificar consola

**Resultado Esperado**:
- ✅ Consola muestra uno de:
  - `✅ IA generó 10 recomendaciones personalizadas` (con API)
  - `✅ Usando recomendaciones genéricas` (sin API)
- ✅ Se muestran 3 tarjetas inicialmente
- ✅ Cada tarjeta tiene:
  - Avatar de Fin (circular, 48x48px)
  - Badge "IA"
  - Número de consejo
  - Texto de recomendación

### Test de Avatar de Fin
**Pasos**:
1. Inspeccionar una tarjeta de recomendación
2. Verificar elemento `<img>` dentro de `.ai-rec-icon`

**Resultado Esperado**:
```html
<div class="ai-rec-icon">
  <img src="img/FIN.png" alt="Fin" class="fin-avatar">
</div>
```

**Verificación Visual**:
- ✅ Imagen circular de 48x48px
- ✅ Fondo con gradiente morado
- ✅ Imagen de Fin visible y centrada
- ✅ NO es un icono de robot

**Si la imagen no carga**:
```javascript
// Verificar path en consola
document.querySelector('.fin-avatar').src;
// Debe retornar algo como: "http://localhost:8000/img/FIN.png"
```

### Test de Scroll Infinito
**Pasos**:
1. Ir a "Recomendaciones de Ahorro"
2. Verificar que solo se muestran 3 tarjetas
3. Hacer scroll hacia abajo dentro del contenedor
4. Observar

**Resultado Esperado**:
- ✅ Al llegar cerca del final (100px), cargan 3 más
- ✅ Animación de entrada suave (fade + slide)
- ✅ Delay escalonado de 100ms entre tarjetas
- ✅ Continúa cargando hasta mostrar las 10
- ✅ Después de las 10, loopea al inicio (scroll circular)

**Verificación en Consola**:
```javascript
// Ver total de recomendaciones
financeApp.aiRecommendationsManager.allRecommendations.length; // 10

// Ver índice actual
financeApp.aiRecommendationsManager.currentIndex;

// Ver recomendaciones mostradas
document.querySelectorAll('.ai-recommendation-card').length;
```

### Test de Caché (48 horas)
**Test 1: Caché Válido**
**Pasos**:
1. Generar recomendaciones (primera vez)
2. Verificar localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('aiRecommendationsCache'));
   ```
3. Recargar página
4. Verificar consola

**Resultado Esperado**:
- ✅ Primera carga: `💾 Recomendaciones guardadas en caché (válido por 48h)`
- ✅ Recarga: `✅ Usando recomendaciones en caché`
- ✅ NO llama a Gemini API nuevamente
- ✅ Muestra las mismas recomendaciones

**Test 2: Caché Inválido por Cambios**
**Pasos**:
1. Tener caché válido
2. Agregar 11+ gastos nuevos
3. Recargar página
4. Verificar consola

**Resultado Esperado**:
- ✅ Consola: `📊 Datos del usuario cambiaron, regenerando recomendaciones`
- ✅ Genera nuevas recomendaciones
- ✅ Guarda nuevo caché

**Test 3: Caché Expirado (48h)**
**Simular expiración**:
```javascript
// Modificar timestamp del caché manualmente
const cache = JSON.parse(localStorage.getItem('aiRecommendationsCache'));
cache.timestamp = Date.now() - (49 * 60 * 60 * 1000); // Hace 49 horas
localStorage.setItem('aiRecommendationsCache', JSON.stringify(cache));

// Recargar página
location.reload();
```

**Resultado Esperado**:
- ✅ Consola: `⏰ Caché de recomendaciones expirado (48h)`
- ✅ Genera nuevas recomendaciones
- ✅ Guarda nuevo caché

### Test de Personalización
**Pasos**:
1. Configurar nombre de usuario: "Luisa"
2. Generar recomendaciones
3. Leer el texto de las tarjetas

**Resultado Esperado**:
- ✅ Al menos 8 de 10 recomendaciones mencionan "Luisa"
- ✅ Consejos relevantes a los datos del usuario
- ✅ Menciones específicas a categorías con más gasto
- ✅ Sugerencias basadas en tasa de ahorro actual

**Verificación**:
```javascript
// Contar menciones del nombre
const cards = Array.from(document.querySelectorAll('.ai-recommendation-card p'));
const withName = cards.filter(card => card.textContent.includes('Luisa'));
console.log(`${withName.length}/10 recomendaciones personalizadas con nombre`);
```

### Test de Fallback a Genéricos
**Pasos**:
1. NO configurar API key (o usar inválida)
2. Cargar recomendaciones
3. Verificar consola y tarjetas

**Resultado Esperado**:
- ✅ Consola: `⚠️ No hay API Key de Gemini disponible`
- ✅ Se muestran 10 recomendaciones genéricas
- ✅ Todas están personalizadas con el nombre del usuario
- ✅ Son consejos financieros válidos y útiles

**Recomendaciones Genéricas Esperadas** (ejemplos):
```
"Luisa, registra todos tus gastos diarios, incluso los pequeños. ¡Cada peso cuenta! 💰"
"Establece una meta de ahorro mensual del 20% de tus ingresos, Luisa. ..."
"Revisa tus gastos semanalmente para identificar patrones, Luisa. ..."
```

### Test de Animaciones
**Pasos**:
1. Limpiar recomendaciones:
   ```javascript
   financeApp.aiRecommendationsManager.clearCache();
   financeApp.aiRecommendationsManager.loadRecommendations();
   ```
2. Observar animación de entrada

**Resultado Esperado**:
- ✅ Tarjetas aparecen con fade-in (opacity 0 → 1)
- ✅ Slide desde la izquierda (translateX(-20px) → 0)
- ✅ Delay escalonado de 100ms entre cada una
- ✅ Transición suave (cubic-bezier)

**Verificación en DevTools**:
```javascript
// Inspeccionar clases
const card = document.querySelector('.ai-recommendation-card');
card.classList.contains('visible'); // Debe ser true después de animar
```

### Test de Hover Effects
**Pasos**:
1. Pasar el mouse sobre una tarjeta de recomendación

**Resultado Esperado**:
- ✅ Se eleva ligeramente (translateY(-4px))
- ✅ Escala sutil (scale(1.02))
- ✅ Sombra más prominente
- ✅ Transición suave

---

## 5. 🔍 Tests de Integración

### Test End-to-End Completo
**Pasos**:
1. Limpiar todo:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
2. Completar onboarding con datos reales
3. Ir al dashboard
4. Verificar todas las secciones

**Checklist**:
- ✅ Onboarding completa sin errores
- ✅ Plan financiero generado
- ✅ Dashboard muestra datos correctos
- ✅ FAB y Fin alineados
- ✅ Recomendaciones IA cargadas
- ✅ Avatar de Fin visible
- ✅ Consola limpia (sin errores)
- ✅ Saludo con nombre correcto

### Test de Performance
**Pasos**:
1. Abrir DevTools → Network
2. Cargar página
3. Ir a "Recomendaciones de Ahorro"
4. Verificar llamadas de red

**Resultado Esperado**:
- ✅ Primera carga: 1 llamada a Gemini API (si hay key)
- ✅ Recarga: 0 llamadas (usa caché)
- ✅ Después de 48h: 1 llamada (regenera)

**Verificar Tokens Ahorrados**:
```javascript
// Después de primera carga
const cache = JSON.parse(localStorage.getItem('aiRecommendationsCache'));
console.log('Caché creado:', new Date(cache.timestamp));
console.log('Expira:', new Date(cache.timestamp + 48*60*60*1000));

// Recargar múltiples veces
// Debe usar caché, no llamar API
```

---

## 6. 📱 Tests Responsive

### Desktop (>1024px)
**Checklist**:
- ✅ FAB y Fin alineados a la derecha
- ✅ Recomendaciones IA en columna de 3
- ✅ Avatar de Fin 48x48px
- ✅ Scroll vertical suave

### Tablet (768px - 1024px)
**Checklist**:
- ✅ FAB y Fin ajustados a 16px del borde
- ✅ Recomendaciones ocupan ancho disponible
- ✅ Tarjetas responsivas

### Mobile (<768px)
**Checklist**:
- ✅ FAB y Fin no se solapan
- ✅ Recomendaciones en columna única
- ✅ Tarjetas con padding ajustado
- ✅ Scroll funciona en móvil

---

## 7. 🐛 Tests de Edge Cases

### Sin Datos del Usuario
**Pasos**:
1. Usar app sin gastos ni metas
2. Generar recomendaciones

**Resultado Esperado**:
- ✅ Usa recomendaciones genéricas
- ✅ Aún personalizadas con nombre
- ✅ Consejos básicos pero útiles

### API Key Inválida
**Pasos**:
1. Configurar API key incorrecta
2. Intentar generar recomendaciones

**Resultado Esperado**:
- ✅ Error capturado silenciosamente
- ✅ Fallback a genéricos
- ✅ Usuario no ve error

### Red Lenta/Timeout
**Simular en DevTools**:
1. Network → Throttling → Slow 3G
2. Generar recomendaciones

**Resultado Esperado**:
- ✅ Muestra indicador de carga (si existe)
- ✅ Timeout después de X segundos
- ✅ Fallback a genéricos
- ✅ No se rompe la UI

### localStorage Lleno
**Simular**:
```javascript
// Llenar localStorage hasta el límite
try {
  for (let i = 0; i < 10000; i++) {
    localStorage.setItem(`dummy${i}`, 'x'.repeat(1000));
  }
} catch (e) {
  console.log('localStorage lleno');
}

// Intentar guardar caché de recomendaciones
financeApp.aiRecommendationsManager.saveCachedRecommendations([...]);
```

**Resultado Esperado**:
- ✅ Error capturado
- ✅ Consola: `Error guardando caché: ...`
- ✅ App sigue funcionando (solo no guarda caché)

---

## 8. ✅ Checklist Final de Producción

### Pre-Deploy
- [ ] Todos los tests pasan
- [ ] Consola limpia (sin errores)
- [ ] API key configurada (si se usa)
- [ ] Imagen `img/FIN.png` disponible
- [ ] Documentación completa

### Deploy
- [ ] Archivos subidos a servidor/hosting
- [ ] Headers de seguridad aplicados (vercel.json)
- [ ] Scripts cargados en orden correcto
- [ ] CSS aplicado correctamente

### Post-Deploy
- [ ] Verificar en producción:
  - [ ] Onboarding funciona
  - [ ] Recomendaciones IA cargan
  - [ ] FAB alineados
  - [ ] Avatar de Fin visible
  - [ ] Caché funciona
- [ ] Monitorear errores (Sentry, etc.)
- [ ] Verificar consumo de API tokens

---

## 9. 📊 Métricas de Éxito

### KPIs a Monitorear:
- ✅ **Tasa de completación de onboarding**: Debe ser 100%
- ✅ **Errores de consola**: Debe ser 0
- ✅ **Uso de caché IA**: Debe ser >80% de las cargas
- ✅ **Recomendaciones personalizadas**: >90% con nombre del usuario
- ✅ **Performance**: Tiempo de carga <3 segundos

### Logs Esperados (Caso Ideal):
```
[OnboardingManager] Usuario completó paso 1
[OnboardingManager] Usuario completó paso 2
[OnboardingManager] Usuario completó paso 3
[OnboardingManager] Generando plan con IA...
✅ Plan generado por IA: {presupuesto: {...}}
💾 Recomendaciones guardadas en caché (válido por 48h)
[Dashboard] Renderizando recomendaciones...
✅ Usando recomendaciones en caché
[Dashboard] 3 recomendaciones mostradas
[Scroll] Usuario scrolleó, cargando 3 más...
[Scroll] Total mostradas: 6
```

---

## 10. 🆘 Troubleshooting Rápido

### Problema: Recomendaciones no aparecen
**Solución**:
```javascript
// Verificar instancia
financeApp.aiRecommendationsManager; // No debe ser undefined

// Forzar renderizado
financeApp.aiRecommendationsManager.renderRecommendations();

// Verificar container
document.getElementById('aiRecommendations'); // Debe existir
```

### Problema: Avatar de Fin no se ve
**Solución**:
```javascript
// Verificar path
const img = document.querySelector('.fin-avatar');
console.log(img.src); // Debe ser path válido

// Verificar si existe
fetch('img/FIN.png').then(r => console.log('Imagen OK:', r.ok));
```

### Problema: Caché no funciona
**Solución**:
```javascript
// Verificar caché
const cache = localStorage.getItem('aiRecommendationsCache');
console.log(JSON.parse(cache));

// Limpiar y regenerar
financeApp.aiRecommendationsManager.clearCache();
financeApp.aiRecommendationsManager.forceRegenerate();
```

### Problema: Scroll infinito no carga más
**Solución**:
```javascript
// Verificar evento
const scroll = document.getElementById('aiRecommendationsScroll');
scroll.addEventListener('scroll', () => console.log('Scroll detectado'));

// Re-configurar
financeApp.aiRecommendationsManager.setupInfiniteScroll(scroll);
```

---

## ✅ Conclusión

Siguiendo esta guía de testing, puedes verificar que:

1. ✅ Todos los cambios están implementados correctamente
2. ✅ No hay regresiones o errores nuevos
3. ✅ La experiencia de usuario es óptima
4. ✅ El sistema es robusto ante edge cases
5. ✅ La aplicación está lista para producción

**Cualquier test que falle debe ser reportado y corregido antes del deploy final.** 🚀
