@echo off
REM ============================================
REM Docker Push Script for Windows
REM ============================================
REM Push image to Docker Hub
REM Usage: docker-push.cmd

REM Docker Hub username (MUST MATCH docker-build-args.cmd!)
set DOCKER_USERNAME=your-dockerhub-username

REM Image name
set IMAGE_NAME=vietexplore-ai

REM Version
set VERSION=3.0.0

echo ================================================
echo Pushing VietExplore-AI to Docker Hub
echo ================================================
echo Username: %DOCKER_USERNAME%
echo Image: %IMAGE_NAME%
echo Version: %VERSION%
echo.
echo Tags to push:
echo   - %DOCKER_USERNAME%/%IMAGE_NAME%:latest
echo   - %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
echo   - %DOCKER_USERNAME%/%IMAGE_NAME%:production
echo ================================================
echo.

REM Check if logged in
echo Checking Docker login...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker daemon not running!
    echo Please start Docker Desktop.
    pause
    exit /b 1
)

REM Verify images exist
echo Verifying images exist...
docker images | findstr %IMAGE_NAME% >nul
if %errorlevel% neq 0 (
    echo ERROR: Image not found!
    echo Please build the image first: docker-build-args.cmd
    pause
    exit /b 1
)

echo.
echo Pushing images to Docker Hub...
echo.

REM Push latest tag
echo [1/3] Pushing %DOCKER_USERNAME%/%IMAGE_NAME%:latest...
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:latest
if %errorlevel% neq 0 (
    echo ERROR: Failed to push latest tag!
    pause
    exit /b 1
)

REM Push version tag
echo.
echo [2/3] Pushing %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%...
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:%VERSION%
if %errorlevel% neq 0 (
    echo ERROR: Failed to push version tag!
    pause
    exit /b 1
)

REM Push production tag
echo.
echo [3/3] Pushing %DOCKER_USERNAME%/%IMAGE_NAME%:production...
docker push %DOCKER_USERNAME%/%IMAGE_NAME%:production
if %errorlevel% neq 0 (
    echo ERROR: Failed to push production tag!
    pause
    exit /b 1
)

echo.
echo ================================================
echo PUSH SUCCESSFUL!
echo ================================================
echo.
echo Your image is now available at:
echo   https://hub.docker.com/r/%DOCKER_USERNAME%/%IMAGE_NAME%
echo.
echo Pull command:
echo   docker pull %DOCKER_USERNAME%/%IMAGE_NAME%:latest
echo.
echo Run command:
echo   docker run -d -p 3000:3000 --env-file .env.production %DOCKER_USERNAME%/%IMAGE_NAME%:latest
echo.
echo ================================================

pause
