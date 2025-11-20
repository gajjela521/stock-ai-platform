# AI Stock Analysis Platform

A premium, AI-powered stock analysis platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **AI Market Predictions**: Next-quarter revenue/EPS forecasts and sentiment analysis.
- **Live Market Data**: Real-time price, change, and key financial metrics.
- **Global Market Status**: Live status (Open/Closed) for major exchanges worldwide.
- **Ownership Analysis**: Breakdown of retail vs. institutional ownership.
- **Competitor Comparison**: Quick view of key competitors and their performance.
- **Smart Search**: Autocomplete for top 50 popular stocks.

## Data Sources

- **Financial Modeling Prep (FMP)**: [Developer Dashboard](https://site.financialmodelingprep.com/developer/docs/dashboard)
- **Mock Data**: Fallback for development and testing without an API key.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: GitHub Pages via GitHub Actions

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Create `.env.local` and add your FMP API Key:
   ```bash
   NEXT_PUBLIC_FMP_API_KEY=your_api_key_here
   ```
4. Run development server: `npm run dev`
