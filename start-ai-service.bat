@echo off
echo Starting MapChain AI Service with Nebius Studio integration...
cd ai-service
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
