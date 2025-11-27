# 📊 Cómo Ejecutar el Schema SQL en Supabase

## Opción 1: SQL Editor de Supabase (Recomendado)

### Paso 1: Abrir Supabase Dashboard
1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto de Finantel
3. En el menú lateral, haz clic en **"SQL Editor"** (ícono de base de datos)

### Paso 2: Crear Nueva Query
1. Haz clic en el botón **"New query"** o **"Nueva consulta"**
2. Se abrirá un editor de SQL

### Paso 3: Copiar y Pegar el Schema
1. Abre el archivo `admin-system/database/schema.sql`
2. **Copia TODO el contenido** del archivo
3. **Pega** el contenido en el editor SQL de Supabase

### Paso 4: Ejecutar
1. Haz clic en el botón **"Run"** o **"Ejecutar"** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
2. Espera a que termine la ejecución
3. Deberías ver un mensaje de éxito: ✅ "Success. No rows returned"

### Paso 5: Verificar
1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver las nuevas tablas:
   - ✅ `system_events`
   - ✅ `system_analytics`
   - ✅ `notification_settings`

---

## Opción 2: Supabase CLI (Para Desarrolladores)

Si tienes Supabase CLI instalado:

```bash
# 1. Login en Supabase
supabase login

# 2. Link tu proyecto
supabase link --project-ref tu-project-ref

# 3. Ejecutar el schema
supabase db execute -f admin-system/database/schema.sql
```

---

## Opción 3: psql (Línea de Comandos)

Si tienes acceso directo a la base de datos:

```bash
# Conectar a Supabase
psql "postgresql://postgres:[TU-PASSWORD]@db.[TU-PROJECT-REF].supabase.co:5432/postgres"

# Ejecutar el schema
\i admin-system/database/schema.sql
```

---

## ⚠️ Importante

### Antes de Ejecutar:

1. **Backup**: Si ya tienes datos, haz un backup primero
2. **Variables**: El schema asume que tienes una tabla `user_profiles` con campo `role`
3. **Permisos**: Asegúrate de tener permisos de administrador en Supabase

### Si NO tienes la tabla `user_profiles`:

Ejecuta esto ANTES del schema principal:

```sql
-- Crear tabla user_profiles si no existe
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## ✅ Verificación Post-Instalación

Después de ejecutar el schema, verifica que todo esté correcto:

```sql
-- Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('system_events', 'system_analytics', 'notification_settings');

-- Verificar índices
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('system_events', 'system_analytics');

-- Verificar políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('system_events', 'system_analytics', 'notification_settings');
```

---

## 🐛 Solución de Problemas

### Error: "relation user_profiles does not exist"
**Solución**: Ejecuta primero el script de `user_profiles` (ver arriba)

### Error: "permission denied"
**Solución**: Asegúrate de estar usando la cuenta de administrador del proyecto

### Error: "duplicate key value"
**Solución**: Algunas tablas ya existen. Elimínalas primero o modifica el schema para usar `CREATE TABLE IF NOT EXISTS`

### Error: "function does not exist"
**Solución**: Ejecuta el schema completo de nuevo, las funciones se crean al final

---

## 📝 Notas

- El schema es **idempotente** en su mayoría (puedes ejecutarlo varias veces)
- Las tablas se crean con `IF NOT EXISTS` para evitar errores
- Los índices y políticas se recrean si ya existen
- Las funciones se recrean con `CREATE OR REPLACE`

---

## 🎯 Ubicación del Archivo

El archivo está en:
```
admin-system/database/schema.sql
```

Copia TODO el contenido de ese archivo y pégalo en el SQL Editor de Supabase.

