import { Stock } from '../types/stock';
import './StockCard.css';

interface StockCardProps {
  stock: Stock;
}

const StockCard = ({ stock }: StockCardProps) => {
  const isPositive = stock.change >= 0;
  
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  return (
    <div className="stock-card">
      <div className="stock-header">
        <div className="stock-symbol">
          <h2>{stock.symbol}</h2>
          <p className="stock-name">{stock.name}</p>
        </div>
        <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
          <span className="change-amount">
            {isPositive ? '+' : ''}${stock.change.toFixed(2)}
          </span>
          <span className="change-percent">
            ({isPositive ? '+' : ''}{((stock.change / (stock.price - stock.change)) * 100).toFixed(2)}%)
          </span>
        </div>
      </div>
      
      <div className="stock-price">
        <span className="current-price">${stock.price.toFixed(2)}</span>
      </div>
      
      <div className="stock-details">
        <div className="detail-row">
          <span className="label">Day Range:</span>
          <span className="value">${stock.dayLow.toFixed(2)} - ${stock.dayHigh.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">52W Range:</span>
          <span className="value">${stock.yearLow.toFixed(2)} - ${stock.yearHigh.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Volume:</span>
          <span className="value">{formatVolume(stock.volume)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Market Cap:</span>
          <span className="value">{formatNumber(stock.marketCap)}</span>
        </div>
        <div className="detail-row">
          <span className="label">P/E Ratio:</span>
          <span className="value">{stock.pe > 0 ? stock.pe.toFixed(2) : 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="label">RSI:</span>
          <span className="value">{stock.rsi.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default StockCard;