# 📈 Stock Dashboard

A modern, mobile-responsive React application for tracking stock market data. Built with React, TypeScript, and Vite.

## Features

- **Real-time Stock Data Display**: Shows comprehensive stock information including price, changes, volume, and market metrics
- **Mobile-Responsive Design**: Optimized for all screen sizes with a modern glassmorphic design
- **NVDA Stock Integration**: Currently displays NVIDIA Corporation stock data with dummy JSON data
- **Modern UI Components**: Clean, professional interface with smooth animations and hover effects
- **TypeScript Support**: Full type safety throughout the application

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard container
│   ├── Header.tsx       # App header with branding
│   └── StockCard.tsx    # Individual stock display card
├── data/               # Static data files
│   └── stocks.json     # NVDA stock dummy data
├── types/              # TypeScript type definitions
│   └── stock.ts        # Stock interface definition
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

Create a production build:
```bash
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features
- **ESLint** - Code linting

## Design Features

- **Glassmorphic UI**: Modern transparent glass effect with backdrop blur
- **Gradient Backgrounds**: Beautiful color gradients for visual appeal
- **Responsive Grid Layout**: Adaptive layout that works on all devices
- **Smooth Animations**: CSS transitions for enhanced user experience
- **Color-coded Changes**: Green for positive, red for negative stock changes

## Stock Data Format

The application expects stock data in the following format:

```typescript
interface Stock {
  symbol: string;           // Stock symbol (e.g., "NVDA")
  name: string;             // Company name
  price: number;            // Current stock price
  change: number;           // Price change ($)
  changePercent: number;    // Price change (%)
  volume: number;           // Trading volume
  marketCap: number;        // Market capitalization
  high52Week: number;       // 52-week high
  low52Week: number;        // 52-week low
  peRatio: number;          // Price-to-earnings ratio
  dayHigh: number;          // Day's high price
  dayLow: number;           // Day's low price
  avgVolume: number;        // Average volume
  dividend: number;         // Dividend amount
  dividendYield: number;    // Dividend yield
}
```

## Future Enhancements

- **Real API Integration**: Connect to live stock market APIs
- **Multiple Stocks**: Support for tracking multiple stocks
- **Charts and Graphs**: Interactive price charts
- **Portfolio Management**: Add/remove stocks from watchlist
- **Price Alerts**: Set up notifications for price changes
- **Historical Data**: View historical stock performance
- **Dark/Light Mode**: Theme switching capability

## Contributing

This is a demo project created for learning purposes. Feel free to use it as a starting point for your own stock dashboard application.

## License

This project is open source and available under the [MIT License](LICENSE).