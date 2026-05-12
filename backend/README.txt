Flask backend for Neburix API proxy

Run steps:
1. cd backend
2. pip install -r requirements.txt
3. set WAQI_TOKEN=your_token_here  (optional; token is auto-read from ../../token.txt)
4. python app.py

Routes:
- GET /api/health
- GET /api/aqi?city=manila
