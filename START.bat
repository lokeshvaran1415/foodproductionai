@echo off
echo ======================================================
echo  FoodProd AI — Starting Application
echo ======================================================
echo.

echo [1/2] Starting Backend (Express on port 5000)...
start "FoodProd Backend" cmd /k "cd /d %~dp0server && node server.js"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend (Vite React on port 5173)...
start "FoodProd Frontend" cmd /k "cd /d %~dp0client && npm run dev"

timeout /t 4 /nobreak > nul

echo.
echo ======================================================
echo  Application Started!
echo  Frontend:  http://localhost:5173
echo  Backend:   http://localhost:5000
echo ======================================================
echo.
echo Demo Credentials (all use password: demo1234)
echo   Admin:              admin@foodprod.com
echo   Production Manager: manager@foodprod.com
echo   Demand Planner:     planner@foodprod.com
echo   Inventory Manager:  inventory@foodprod.com
echo.
echo Opening browser...
timeout /t 2 /nobreak > nul
start http://localhost:5173
