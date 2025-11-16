import { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import StockDetail from './components/StockDetail';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import { SEOManager } from './utils/seo';
import { GoogleAnalytics } from './utils/analytics';
import PerformanceMonitor from './utils/performance';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'stock'>('dashboard');
  const [selectedStock, setSelectedStock] = useState<string>('');

  // Initialize Google Analytics and Performance Monitoring on app startup
  useEffect(() => {
    GoogleAnalytics.initialize();
    PerformanceMonitor.mark('app-initialized');
    
    // Cleanup performance monitoring on unmount
    return () => {
      PerformanceMonitor.cleanup();
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/stock/')) {
        const encodedSymbol = hash.substring(8); // Remove '#/stock/'
        const symbol = decodeURIComponent(encodedSymbol);
        setSelectedStock(symbol);
        setCurrentView('stock');
      } else {
        setCurrentView('dashboard');
        // Update SEO for homepage
        SEOManager.updateMeta({
          title: 'Real-Time Stock Dashboard - Live Market Data & Analytics',
          description: 'Professional stock market dashboard with real-time data for 100+ stocks including NVDA, AAPL, TSLA. Get live prices, technical indicators, and market analytics.',
          keywords: 'stock market, real-time stock prices, stock dashboard, market data, NVDA, AAPL, TSLA, financial analytics',
          canonicalUrl: window.location.origin + '/'
        });
        // Track homepage view
        GoogleAnalytics.trackPageView('/', 'Stock Dashboard - Homepage');
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Check initial hash
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleBackToDashboard = () => {
    window.location.hash = '#/';
    setCurrentView('dashboard');
  };

  return (
    <ErrorBoundary>
      <div className="App">
        {currentView === 'dashboard' && <Header />}
        <main className="main-content">
          <ErrorBoundary>
            {currentView === 'dashboard' ? (
              <Dashboard />
            ) : (
              <StockDetail 
                symbol={selectedStock}
                onBack={handleBackToDashboard}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;