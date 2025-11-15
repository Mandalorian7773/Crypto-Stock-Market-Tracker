# MarketTracker - Cryptocurrency and Stock Market Tracker

A comprehensive web application for tracking cryptocurrency and stock market data with real-time prices, historical charts, watchlists, and portfolio management.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

- **Real-time Market Data**: Track cryptocurrency and stock prices in real-time
- **Interactive Charts**: Visualize price history with interactive charts using Plotly.js
- **Watchlist**: Save and track your favorite assets
- **Search Functionality**: Easily search for stocks or cryptocurrencies
- **Responsive Design**: Works on all device sizes
- **User Authentication**: Sign in to save your watchlist and portfolio
- **Technical Indicators**: View SMA and EMA indicators on charts

## Technologies

### Frontend
- **React** with TypeScript
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Reusable component library
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Declarative routing
- **Firebase** - Backend as a Service (Authentication & Firestore)
- **Plotly.js** - Interactive charting library
- **Framer Motion** - Animation library

### Backend
- **Node.js** with Express.js
- **RESTful API** architecture
- **Cors** - Cross-Origin Resource Sharing
- **Axios** - HTTP client
- **Node-Cache** - In-memory caching
- **Dotenv** - Environment variable management

### External APIs
- **CoinGecko API** - Cryptocurrency market data
- **Alpha Vantage API** - Stock market data (historical prices, quotes)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/     → Request handlers for crypto and stocks
│   │   ├── routes/          → API route definitions
│   │   ├── services/        → External API integrations
│   │   └── utils/           → Shared utilities (cache, errors)
│   ├── app.js              → Express app configuration
│   └── server.js           → Server entry point
└── frontend/
    ├── src/
    │   ├── components/      → Reusable UI components
    │   ├── pages/           → Page-level components
    │   ├── hooks/           → Custom React hooks
    │   ├── lib/             → Utility libraries
    │   ├── store/           → Global state management (Zustand)
    │   └── services/        → API service layer
    ├── public/              → Static assets
    └── vite.config.ts       → Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=5001
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The backend server will start on `http://localhost:5001` (or your specified PORT).

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```env
   VITE_API_BASE_URL=http://localhost:5001
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`.

## API Endpoints

### Stock Endpoints
- `GET /api/stocks/search?query=:symbol` - Search for stocks
- `GET /api/stocks/:symbol/quote` - Get stock quote
- `GET /api/stocks/:symbol/history?range=:range` - Get stock history (range: 1D, 7D, 1M, 1Y)

### Cryptocurrency Endpoints
- `GET /api/crypto/price?cryptoId=:id` - Get cryptocurrency price
- `GET /api/crypto/top` - Get top cryptocurrencies

## Deployment

### Backend Deployment
The backend can be deployed to any Node.js hosting platform (Render, Heroku, etc.). Make sure to set the environment variables in your hosting platform.

### Frontend Deployment
The frontend can be deployed to any static hosting platform (Netlify, Vercel, etc.):

1. Build the production version:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory, ready for deployment.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request