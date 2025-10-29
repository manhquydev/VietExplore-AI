@echo off
REM ============================================
REM Docker Build Script for Windows
REM ============================================
REM Usage: docker-build-args.cmd

echo ================================================
echo Docker Build for VietExplore-AI (Windows)
echo ================================================

REM Load environment from .env.production or .env.local
if exist .env.production (
    echo Loading .env.production...
    for /f "usebackq tokens=*" %%a in (".env.production") do set %%a
) else if exist .env.local (
    echo Loading .env.local...
    for /f "usebackq tokens=*" %%a in (".env.local") do set %%a
) else (
    echo ERROR: No .env.local or .env.production found!
    pause
    exit /b 1
)

REM Docker Hub username (CHANGE THIS!)
set DOCKER_USERNAME=manhquydev

REM Image name
set IMAGE_NAME=vietexplore-ai

REM Version
set VERSION=3.0.0

echo.
echo Building image with tags:
echo   - %DOCKER_USERNAME%/%IMAGE_NAME%:latest
echo   - %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
echo   - %DOCKER_USERNAME%/%IMAGE_NAME%:production
echo.
echo Building...

docker build ^
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=%NEXT_PUBLIC_FIREBASE_API_KEY% ^
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN% ^
  --build-arg NEXT_PUBLIC_FIREBASE_DATABASE_URL=%NEXT_PUBLIC_FIREBASE_DATABASE_URL% ^
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=%NEXT_PUBLIC_FIREBASE_PROJECT_ID% ^
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=%NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET% ^
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID% ^
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=%NEXT_PUBLIC_FIREBASE_APP_ID% ^
  --build-arg NEXT_PUBLIC_CLARITY_PROJECT_ID=%NEXT_PUBLIC_CLARITY_PROJECT_ID% ^
  --build-arg NEXT_PUBLIC_APP_URL=%NEXT_PUBLIC_APP_URL% ^
  --build-arg NEXT_PUBLIC_ENABLE_AI_FEATURES=%NEXT_PUBLIC_ENABLE_AI_FEATURES% ^
  --build-arg NEXT_PUBLIC_ENABLE_ANALYTICS=%NEXT_PUBLIC_ENABLE_ANALYTICS% ^
  --build-arg SITE_URL=%SITE_URL% ^
  -t %DOCKER_USERNAME%/%IMAGE_NAME%:latest ^
  -t %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION% ^
  -t %DOCKER_USERNAME%/%IMAGE_NAME%:production ^
  .

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo BUILD SUCCESSFUL!
    echo ================================================
    echo.
    docker images | findstr %IMAGE_NAME%
    echo.
    echo Next steps:
    echo 1. Test locally:
    echo    docker run -p 3000:3000 --env-file .env.production %DOCKER_USERNAME%/%IMAGE_NAME%:latest
    echo.
    echo 2. Push to Docker Hub:
    echo    docker push %DOCKER_USERNAME%/%IMAGE_NAME%:latest
    echo    docker push %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
    echo    docker push %DOCKER_USERNAME%/%IMAGE_NAME%:production
    echo.
    echo 3. Or use: docker-push.cmd
    echo ================================================
) else (
    echo.
    echo ================================================
    echo BUILD FAILED!
    echo ================================================
    echo Check errors above and fix them.
    pause
    exit /b 1
)

pause
