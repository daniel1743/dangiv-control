@echo off
REM ========================================
REM SCRIPT DE LIMPIEZA DE HISTORIAL DE GIT
REM Dan&Giv Control - Eliminación de API Keys
REM ========================================

echo.
echo 🔒 LIMPIEZA DE HISTORIAL DE GIT
echo ================================
echo.
echo ⚠️  ADVERTENCIA: Este script reescribirá el historial de Git
echo    Esto eliminará permanentemente las API keys del historial
echo.
echo 📋 Pasos que se ejecutarán:
echo    1. Crear backup del repositorio
echo    2. Verificar git-filter-repo
echo    3. Eliminar firebase-config.js del historial
echo    4. Crear commit con la nueva versión segura
echo.

set /p confirm="¿Deseas continuar? (s/n): "
if /i not "%confirm%"=="s" (
    echo ❌ Operación cancelada
    exit /b 0
)

REM Paso 1: Crear backup
echo.
echo 📦 Paso 1: Creando backup...
set BACKUP_DIR=..\aplica-backup-%date:~-4%%date:~3,2%%date:~0,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_DIR=%BACKUP_DIR: =0%
xcopy /E /I /H /Y . "%BACKUP_DIR%" >nul
echo ✅ Backup creado en: %BACKUP_DIR%

REM Paso 2: Verificar git-filter-repo
echo.
echo 🔍 Paso 2: Verificando git-filter-repo...

where git-filter-repo >nul 2>&1
if errorlevel 1 (
    echo ❌ git-filter-repo no está instalado
    echo.
    echo Opciones de instalación:
    echo.
    echo 1. Con pip (Python):
    echo    pip install git-filter-repo
    echo.
    echo 2. Descarga manual:
    echo    https://github.com/newren/git-filter-repo/releases
    echo    Descarga git-filter-repo y colócalo en tu PATH
    echo.
    set /p installed="¿Ya lo instalaste y quieres continuar? (s/n): "
    if /i not "!installed!"=="s" (
        echo ❌ Instala git-filter-repo y vuelve a ejecutar este script
        exit /b 1
    )
)

echo ✅ git-filter-repo disponible

REM Paso 3: Eliminar archivo del historial
echo.
echo 🗑️  Paso 3: Eliminando firebase-config.js del historial...
echo.
echo ⚠️  ÚLTIMA ADVERTENCIA: Esto reescribirá TODO el historial
set /p final_confirm="¿Estás ABSOLUTAMENTE seguro? (escribe 'SI' en mayúsculas): "

if not "%final_confirm%"=="SI" (
    echo ❌ Operación cancelada
    echo ✅ Tu repositorio no ha sido modificado
    exit /b 0
)

REM Ejecutar git-filter-repo
git filter-repo --path firebase-config.js --invert-paths --force

if errorlevel 1 (
    echo ❌ Error al eliminar archivo
    echo Restaurando desde backup...
    cd ..
    rmdir /s /q aplica
    move "%BACKUP_DIR%" aplica
    exit /b 1
)

echo ✅ Archivo eliminado del historial

REM Paso 4: Agregar versión segura
echo.
echo 📝 Paso 4: Agregando versión segura de firebase-config.js...
git add firebase-config.js
git commit -m "security: migrate Firebase config to use environment variables" -m "- Remove hardcoded API keys from firebase-config.js" -m "- Use import.meta.env for configuration" -m "- Add validation for required environment variables" -m "- Update documentation with security notes" -m "" -m "⚠️ BREAKING: Requires .env.local file with Firebase credentials" -m "See .env.example for configuration template"

echo.
echo ✅ LIMPIEZA COMPLETADA
echo.
echo 📋 Próximos pasos:
echo.
echo 1. Verificar que todo funciona:
echo    git log --oneline
echo.
echo 2. Forzar push a GitHub (⚠️ CUIDADO):
echo    git push origin --force --all
echo.
echo 3. Si tienes branches, forzar push de todas:
echo    git push origin --force --tags
echo.
echo 4. Notificar a colaboradores que deben:
echo    - Eliminar su repo local
echo    - Hacer clone fresco del repo
echo.
echo ⚠️  IMPORTANTE:
echo    - Revocar las API keys antiguas en Google Cloud Console
echo    - Crear nuevas API keys con restricciones
echo    - Actualizar .env.local con las nuevas keys
echo.
echo 🔒 Backup guardado en: %BACKUP_DIR%
echo.
pause
