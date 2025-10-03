# 🌐 ACTUALIZAR DOMINIO EN LA APP

## Archivos a actualizar después de configurar el dominio

### 1. sitemap.xml
Reemplazar todas las URLs:
```xml
<!-- ANTES -->
<loc>https://dangivcontrol.com/</loc>

<!-- DESPUÉS -->
<loc>https://TU-DOMINIO.com/</loc>
```

### 2. robots.txt
```txt
# ANTES
Sitemap: https://dangivcontrol.com/sitemap.xml

# DESPUÉS
Sitemap: https://TU-DOMINIO.com/sitemap.xml
```

### 3. index.html (meta tags)
Buscar y reemplazar en líneas 20, 24, 35, 42, 58:
```html
<!-- ANTES -->
<link rel="canonical" href="https://dangivcontrol.com" />
<meta property="og:url" content="https://dangivcontrol.com/" />

<!-- DESPUÉS -->
<link rel="canonical" href="https://TU-DOMINIO.com" />
<meta property="og:url" content="https://TU-DOMINIO.com/" />
```

### 4. config.js
```javascript
export const config = {
  appUrl: 'https://TU-DOMINIO.com', // Actualizar
  apiUrl: 'https://TU-DOMINIO.com', // Si usas backend en mismo dominio
  // ...
};
```

### 5. backend/api-proxy.js (si lo usas)
```javascript
const allowedOrigins = [
  'https://TU-DOMINIO.com',
  'https://www.TU-DOMINIO.com',
  // ...
];
```

## 🔄 Comando rápido (Find & Replace)

En VS Code o tu editor:
1. Ctrl+Shift+F (buscar en todos los archivos)
2. Buscar: `dangivcontrol.com`
3. Reemplazar con: `TU-DOMINIO.com`
4. Replace All

## ✅ Verificar después
- [ ] Abrir https://TU-DOMINIO.com
- [ ] Verificar que carga la app
- [ ] Verificar HTTPS (candado verde)
- [ ] Verificar que Firebase conecta
