# Neburix

Neburix is an asthma intelligence and care companion built with React + Vite.
It helps users track symptoms, monitor air quality, follow medications, and generate a weekly doctor-ready PDF report.

## Features

- Secure authentication with Firebase Email/Password (sign up and sign in)
- Personalized dashboard with:
	- Current AQI by city
	- Daily asthma risk score and explanation
	- Smart trigger/symptom insights
- Quick logging of mood and symptoms
- Health log history synced in real time from Firestore
- Trends page with 7-day symptom charts (Wheezing, Coughing, Shortness)
- Medication reminder and tracker:
	- Mark meds as taken
	- Add new medications
	- View weekly adherence percentage
- Export weekly doctor PDF report
- AQI data via Flask proxy (`/api/aqi`) with client fallback support

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS
- Auth + Database: Firebase Auth, Firestore
- Charts: Chart.js + react-chartjs-2
- Reports: jsPDF
- Optional backend proxy: Flask + requests + flask-cors

## Project Structure

- `src/` React app (pages, components, libs)
- `backend/` Flask proxy for AQI API

## Getting Started

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Run frontend

```bash
npm run dev
```

Frontend runs on Vite default port (usually `http://localhost:5173`).

### 3. (Optional) Run backend AQI proxy

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend routes:

- `GET /api/health`
- `GET /api/aqi?city=manila`

If backend is not running, the frontend AQI logic can still use direct WAQI/fallback behavior.

## Available Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
