@echo off
:: Altera a codificação de caracteres do terminal para UTF-8 para exibir acentos corretamente
chcp 65001 > nul
title Tabela da Copa - Servidor Local

echo ========================================================
echo Iniciando servidor local para evitar bloqueios CORS...
echo ========================================================
echo.

:: Verifica se o node está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js não foi encontrado no seu sistema.
    echo Por favor, instale o Node.js em: https://nodejs.org/
    echo.
    pause
    exit /b
)

:: Inicia o servidor
node "%~dp0server.js"
