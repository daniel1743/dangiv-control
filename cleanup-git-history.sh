#!/bin/bash

# ========================================
# SCRIPT DE LIMPIEZA DE HISTORIAL DE GIT
# Dan&Giv Control - Eliminación de API Keys
# ========================================

echo "🔒 LIMPIEZA DE HISTORIAL DE GIT"
echo "================================"
echo ""
echo "⚠️  ADVERTENCIA: Este script reescribirá el historial de Git"
echo "   Esto eliminará permanentemente las API keys del historial"
echo ""
echo "📋 Pasos que se ejecutarán:"
echo "   1. Crear backup del repositorio"
echo "   2. Instalar git-filter-repo (si no está instalado)"
echo "   3. Eliminar firebase-config.js del historial"
echo "   4. Crear commit con la nueva versión segura"
echo ""

read -p "¿Deseas continuar? (s/n): " confirm

if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
    echo "❌ Operación cancelada"
    exit 0
fi

# Paso 1: Crear backup
echo ""
echo "📦 Paso 1: Creando backup..."
BACKUP_DIR="../aplica-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✅ Backup creado en: $BACKUP_DIR"

# Paso 2: Verificar git-filter-repo
echo ""
echo "🔍 Paso 2: Verificando git-filter-repo..."

if ! command -v git-filter-repo &> /dev/null; then
    echo "❌ git-filter-repo no está instalado"
    echo ""
    echo "Opciones de instalación:"
    echo ""
    echo "1. Con pip (Python):"
    echo "   pip install git-filter-repo"
    echo ""
    echo "2. Con Homebrew (Mac):"
    echo "   brew install git-filter-repo"
    echo ""
    echo "3. Con apt (Ubuntu/Debian):"
    echo "   sudo apt install git-filter-repo"
    echo ""
    echo "4. Descarga manual:"
    echo "   https://github.com/newren/git-filter-repo/releases"
    echo ""
    read -p "¿Ya lo instalaste y quieres continuar? (s/n): " installed

    if [ "$installed" != "s" ] && [ "$installed" != "S" ]; then
        echo "❌ Instala git-filter-repo y vuelve a ejecutar este script"
        exit 1
    fi
fi

echo "✅ git-filter-repo disponible"

# Paso 3: Eliminar archivo del historial
echo ""
echo "🗑️  Paso 3: Eliminando firebase-config.js del historial..."
echo ""
echo "⚠️  ÚLTIMA ADVERTENCIA: Esto reescribirá TODO el historial"
read -p "¿Estás ABSOLUTAMENTE seguro? (escribe 'SI' en mayúsculas): " final_confirm

if [ "$final_confirm" != "SI" ]; then
    echo "❌ Operación cancelada"
    echo "✅ Tu repositorio no ha sido modificado"
    exit 0
fi

# Ejecutar git-filter-repo
git filter-repo --path firebase-config.js --invert-paths --force

if [ $? -eq 0 ]; then
    echo "✅ Archivo eliminado del historial"
else
    echo "❌ Error al eliminar archivo"
    echo "Restaurando desde backup..."
    cd ..
    rm -rf aplica
    mv "$BACKUP_DIR" aplica
    exit 1
fi

# Paso 4: Agregar versión segura
echo ""
echo "📝 Paso 4: Agregando versión segura de firebase-config.js..."
git add firebase-config.js
git commit -m "security: migrate Firebase config to use environment variables

- Remove hardcoded API keys from firebase-config.js
- Use import.meta.env for configuration
- Add validation for required environment variables
- Update documentation with security notes

⚠️ BREAKING: Requires .env.local file with Firebase credentials
See .env.example for configuration template"

echo ""
echo "✅ LIMPIEZA COMPLETADA"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Verificar que todo funciona:"
echo "   git log --oneline"
echo ""
echo "2. Forzar push a GitHub (⚠️ CUIDADO):"
echo "   git push origin --force --all"
echo ""
echo "3. Si tienes branches, forzar push de todas:"
echo "   git push origin --force --tags"
echo ""
echo "4. Notificar a colaboradores que deben:"
echo "   - Eliminar su repo local"
echo "   - Hacer clone fresco del repo"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Revocar las API keys antiguas en Google Cloud Console"
echo "   - Crear nuevas API keys con restricciones"
echo "   - Actualizar .env.local con las nuevas keys"
echo ""
echo "🔒 Backup guardado en: $BACKUP_DIR"
