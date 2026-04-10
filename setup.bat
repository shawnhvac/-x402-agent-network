@echo off
echo Installing dependencies...
pip install httpx
echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Open TWO separate PowerShell windows
echo 2. In window 1: python burner_wallet_mock_server.py
echo 3. In window 2: python burner_wallet_detector.py
echo.
pause
