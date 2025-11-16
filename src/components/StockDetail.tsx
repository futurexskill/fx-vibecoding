import { useState, useEffect } from 'react';
import { Stock } from '../types/stock';
import { SEOManager } from '../utils/seo';
import { StockAnalytics } from '../utils/analytics';
import './StockDetail.css';

const API_BASE_URL = 'https://7kiye42406.execute-api.us-east-1.amazonaws.com/prod';

interface StockDetailProps {
  symbol: string;
  onBack: () => void;
}

const StockDetail = ({ symbol, onBack }: StockDetailProps) => {
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // URL encode the symbol to handle special characters
      const encodedSymbol = encodeURIComponent(symbol);
      const response = await fetch(`${API_BASE_URL}/stocks/${encodedSymbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${symbol}: ${response.statusText}`);
      }
      
      const stockData = await response.json();
      setStock(stockData);
      
      // Update SEO for stock page
      if (stockData) {
        const currentPrice = SEOManager.formatPrice(stockData.current_price || 0);
        const marketCap = SEOManager.formatMarketCap(stockData.market_cap || 0);
        const changeText = stockData.pct_change >= 0 ? 'up' : 'down';
        
        SEOManager.updateMeta({
          title: `${stockData.name} (${stockData.ticker}) Stock Price - ${currentPrice} | Stock Dashboard`,
          description: `${stockData.name} (${stockData.ticker}) stock is ${changeText} ${Math.abs(stockData.pct_change || 0).toFixed(2)}% with current price ${currentPrice}. Market cap: ${marketCap}. View real-time data, charts, and analytics.`,
          keywords: `${stockData.ticker}, ${stockData.name}, stock price, ${stockData.sector}, market data, financial analytics`,
          canonicalUrl: window.location.origin + `/#/stock/${encodeURIComponent(stockData.ticker)}`
        });
        
        // Generate structured data for this stock
        SEOManager.generateStockStructuredData(stockData);
        
        // Track stock view in Google Analytics
        StockAnalytics.trackDetailedStockView(stockData);
        StockAnalytics.trackPageView(`/stock/${stockData.symbol}`, `${stockData.name} (${stockData.symbol}) - Stock Detail`);
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stock');
      
      // Track error in analytics
      StockAnalytics.trackError(err instanceof Error ? err : new Error('Failed to fetch stock'), `stock_detail_${symbol}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [symbol]);

  if (loading) {
    return (
      <div className="stock-detail">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading {symbol} data...</p>
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="stock-detail">
        <button onClick={onBack} className="back-button">
          ← Back to Dashboard
        </button>
        <div className="error-state">
          <h3>Unable to load {symbol}</h3>
          <p>{error}</p>
          <button onClick={fetchStock} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const changePercent = ((stock.change / (stock.price - stock.change)) * 100);
  const isPositive = stock.change >= 0;

  return (
    <div className="stock-detail">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb navigation">
        <ol>
          <li><a href="#/" onClick={onBack}>Stock Dashboard</a></li>
          <li aria-current="page">{stock.name} ({stock.symbol})</li>
        </ol>
      </nav>
      
      <div className="stock-detail-header">
        <button 
          onClick={onBack} 
          className="back-button"
          aria-label="Go back to stock dashboard"
        >
          ← Back to Dashboard
        </button>
        <button 
          onClick={fetchStock} 
          className="refresh-button"
          aria-label="Refresh stock data"
        >
          Refresh
        </button>
      </div>

      <div className="stock-detail-content">
        <div className="stock-header">
          <div className="stock-main-info">
            <h1 className="stock-symbol">{stock.symbol}</h1>
            <h2 className="stock-name">{stock.name}</h2>
            <div className="stock-type">{stock.type.toUpperCase()}</div>
          </div>
          
          <div className="stock-price-info">
            <div className="current-price">${stock.price.toFixed(2)}</div>
            <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="stock-metrics-grid">
          <div className="metric-card">
            <h3>Trading Data</h3>
            <div className="metric-row">
              <span>Volume:</span>
              <span>{stock.volume.toLocaleString()}</span>
            </div>
            <div className="metric-row">
              <span>Avg Volume:</span>
              <span>{stock.avgVolume.toLocaleString()}</span>
            </div>
            <div className="metric-row">
              <span>Day High:</span>
              <span>${stock.dayHigh.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span>Day Low:</span>
              <span>${stock.dayLow.toFixed(2)}</span>
            </div>
          </div>

          <div className="metric-card">
            <h3>52-Week Range</h3>
            <div className="metric-row">
              <span>Year High:</span>
              <span>${stock.yearHigh.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span>Year Low:</span>
              <span>${stock.yearLow.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span>Market Cap:</span>
              <span>{stock.marketCap > 0 ? `$${(stock.marketCap / 1e9).toFixed(2)}B` : 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span>P/E Ratio:</span>
              <span>{stock.pe > 0 ? stock.pe.toFixed(2) : 'N/A'}</span>
            </div>
          </div>

          <div className="metric-card">
            <h3>Technical Indicators</h3>
            <div className="metric-row">
              <span>RSI:</span>
              <span className={stock.rsi > 70 ? 'overbought' : stock.rsi < 30 ? 'oversold' : ''}>
                {stock.rsi.toFixed(2)}
              </span>
            </div>
            <div className="metric-row">
              <span>20-Day MA:</span>
              <span>${stock.ma20.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span>50-Day MA:</span>
              <span>${stock.ma50.toFixed(2)}</span>
            </div>
            <div className="metric-row">
              <span>200-Day MA:</span>
              <span>${stock.ma200.toFixed(2)}</span>
            </div>
          </div>

          {(stock.sector || stock.industry) && (
            <div className="metric-card">
              <h3>Company Info</h3>
              {stock.sector && (
                <div className="metric-row">
                  <span>Sector:</span>
                  <span>{stock.sector}</span>
                </div>
              )}
              {stock.industry && (
                <div className="metric-row">
                  <span>Industry:</span>
                  <span>{stock.industry}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="stock-footer">
          <p>Last updated: {new Date(stock.lastUpdated).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;