import { useState, useEffect } from 'react';
import StockCard from './StockCard';
import VolumeChart from './VolumeChart';
import { Stock } from '../types/stock';
import { VolumeChartData } from '../types/chart';
import stocksData from '../data/stocks.json';
import './Dashboard.css';

const Dashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setStocks(stocksData as Stock[]);
      setLoading(false);
    }, 1000);
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

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Your Portfolio</h2>
        <p>Real-time stock market data</p>
      </div>
      
      <div className="stocks-grid">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="stock-item">
            <StockCard stock={stock} />
            <VolumeChart 
              data={{
                todayVolume: stock.volume,
                avgVolume20D: stock.avgVolume20D,
                symbol: stock.symbol
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="dashboard-footer">
        <p>Data refreshes every 15 seconds • Market data delayed by 15 minutes</p>
      </div>
    </div>
  );
};

export default Dashboard;