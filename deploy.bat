@echo off
chcp 65001 >nul

REM ===========================================
REM Скрипт деплоя на Яндекс Cloud Run (Windows)
REM ===========================================

REM Замени на свой REGISTRY_ID (из команды: yc container registry list)
set REGISTRY_ID=crpxxxxxxxxxx

REM Имя контейнера
set CONTAINER_NAME=webstudio

REM Тег с датой
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TAG=%datetime:~0,8%-%datetime:~8,6%

set IMAGE=cr.yandex/%REGISTRY_ID%/%CONTAINER_NAME%

echo.
echo ======================================
echo   Деплой %CONTAINER_NAME%
echo   Версия: %TAG%
echo ======================================
echo.

echo [1/3] Сборка Docker образа...
docker build -t %IMAGE%:%TAG% .
if %ERRORLEVEL% neq 0 (
    echo ОШИБКА: Не удалось собрать образ
    pause
    exit /b 1
)

echo.
echo [2/3] Отправка образа в Яндекс Cloud...
docker push %IMAGE%:%TAG%
if %ERRORLEVEL% neq 0 (
    echo ОШИБКА: Не удалось отправить образ
    pause
    exit /b 1
)

echo.
echo [3/3] Деплой контейнера...
yc serverless container revision deploy --container-name %CONTAINER_NAME% --image %IMAGE%:%TAG% --memory 256m --execution-timeout 30s --min-instances 0 --concurrency 4
if %ERRORLEVEL% neq 0 (
    echo ОШИБКА: Не удалось задеплоить контейнер
    pause
    exit /b 1
)

echo.
echo ======================================
echo   ГОТОВО!
echo   Версия %TAG% успешно задеплоена
echo ======================================
echo.

yc serverless container get %CONTAINER_NAME%

pause
