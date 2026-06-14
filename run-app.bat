@echo off
title HR-Agent Starter
echo ===================================================
echo   KHOI CHAY UNG DUNG HR-AGENT (BACKEND & FRONTEND)
echo ===================================================
echo.

echo [1/2] Dang khoi chay Backend o cua so moi...
start "HR-Agent Backend" cmd /k "cd backend && (pnpm dev || npm run dev)"

echo.
echo [2/2] Dang khoi chay Frontend o cua so moi...
echo (Trinh duyet se tu dong mo trang web http://localhost:5173 sau vai giay)
start "HR-Agent Frontend" cmd /k "cd frontend && (pnpm dev --open || npm run dev -- --open)"

echo.
echo ===================================================
echo   DA KHOI CHAY XONG! Vui long khong tat 2 cua so
echo   cmd moi duoc mo ra cho den khi dung ung dung.
echo ===================================================
pause
