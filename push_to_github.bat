@echo off
set "GIT_CMD=C:\Users\Asus\.gemini\antigravity-ide\scratch\mingit\cmd\git.exe"
cd /d "%~dp0"
echo ========================================================
echo   Pushing Portfolio to github.com/kpjethwa07-stack/protfolio
echo ========================================================
"%GIT_CMD%" add -A
"%GIT_CMD%" commit -m "Modern editorial developer portfolio with ScrollExpandMedia and 3D projects"
"%GIT_CMD%" push -u origin main --force
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   SUCCESS! Your portfolio is now hosted on GitHub:
    echo   https://kpjethwa07-stack.github.io/protfolio/
    echo ========================================================
) else (
    echo.
    echo If prompted by GitHub Credential Manager, complete the sign-in in your browser.
)
pause
