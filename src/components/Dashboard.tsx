import { useState, useEffect } from 'react';
import StockCard from './StockCard';
import VolumeChart from './VolumeChart';
import { Stock } from '../types/stock';
import { VolumeChartData } from '../types/chart';
import './Dashboard.css';

const API_BASE_URL = 'https://7kiye42406.execute-api.us-east-1.amazonaws.com/prod';

const Dashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/stocks?limit=50`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStocks(data.stocks || []);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-state">
          <h3>Unable to load stock data</h3>
          <p>{error}</p>
          <button onClick={fetchStocks} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleStockClick = (symbol: string) => {
    // URL encode the symbol to handle special characters
    const encodedSymbol = encodeURIComponent(symbol);
    window.location.hash = `#/stock/${encodedSymbol}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Stock Market Dashboard</h2>
        <p>Live data from {stocks.length} stocks • Click any stock for details</p>
        <button onClick={fetchStocks} className="refresh-button">
          Refresh Data
        </button>
      </div>
      
      <div className="stocks-grid">
        {stocks.map((stock) => (
          <div 
            key={stock.symbol} 
            className="stock-item clickable"
            onClick={() => handleStockClick(stock.symbol)}
          >
            <StockCard stock={stock} />
            <VolumeChart 
              data={{
                todayVolume: stock.volume,
                avgVolume20D: stock.avgVolume,
                symbol: stock.symbol
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="dashboard-footer">
        <p>Real-time data from AWS • Click any stock for detailed analysis</p>
      </div>
    </div>
  );
};

export default Dashboard;