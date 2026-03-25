# Acme Business Intelligence Dashboard

A full-stack Business Intelligence & Client Analytics Dashboard application built with a modern, minimal SaaS aesthetic.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS (v4), Recharts, Lucide React
- **Backend:** Node.js, Express, mock JSON data services
- **AI Integration:** Google Gemini API (`@google/generative-ai`)

## Project Structure
- `/client`: Frontend React application.
- `/server`: Backend Node.js Express server.

## Installation & Setup

### 1. Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory based on `.env.example`, and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *(Server will run on http://localhost:5000)*

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *(App will open on the provided localhost port, typically http://localhost:5173)*

## How to get your Gemini API key
The Google Gemini API is used to generate intelligent insights on your Dashboard.

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click **"Create API Key"**
4. Copy the key and paste it into `/server/.env` as `GEMINI_API_KEY=paste_here`
5. The free tier is sufficient for this project (no billing required). 

*(Note: If the key is not provided, the dashboard will gracefully fallback to mock AI responses so the UI doesn't break).*
