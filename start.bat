@echo off
chcp 65001 >nul
setlocal

echo ============================================
echo   ToDo List - запуск приложения
echo ============================================
echo.

REM --- Проверка зависимостей ---
where docker >nul 2>nul
if errorlevel 1 (
    echo [ОШИБКА] Docker не найден. Установите Docker Desktop.
    pause
    exit /b 1
)

where dotnet >nul 2>nul
if errorlevel 1 (
    echo [ОШИБКА] .NET SDK не найден. Установите .NET 9 SDK.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ОШИБКА] Node.js/npm не найден. Установите Node.js.
    pause
    exit /b 1
)

REM --- Запуск PostgreSQL ---
echo [1/3] Запуск PostgreSQL в Docker...
docker compose up -d
if errorlevel 1 (
    echo [ОШИБКА] Не удалось запустить PostgreSQL.
    pause
    exit /b 1
)

REM --- Ждём готовности БД (на всякий случай) ---
echo Ожидание готовности базы данных...
timeout /t 3 /nobreak >nul

REM --- Запуск бэкенда ---
echo [2/3] Запуск бэкенда (ASP.NET Core)...
start "ToDo Backend" cmd /k "cd /d %~dp0TodoApp.API && dotnet run"

REM --- Запуск фронтенда ---
echo [3/3] Запуск фронтенда (React + Vite)...
timeout /t 2 /nobreak >nul
start "ToDo Frontend" cmd /k "cd /d %~dp0todo-client && npm run dev"

echo.
echo ============================================
echo   Готово! Открывайте http://localhost:5173
echo ============================================
echo.
echo   Backend  - отдельное окно
echo   Frontend - отдельное окно
echo.
echo   Для остановки закройте оба окна и выполните:
echo     docker compose down
echo.
pause
