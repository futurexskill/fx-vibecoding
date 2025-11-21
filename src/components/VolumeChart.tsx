import { VolumeChartData } from '../types/chart';
import './VolumeChart.css';

interface VolumeChartProps {
  data: VolumeChartData;
}

const VolumeChart = ({ data }: VolumeChartProps) => {
  const { todayVolume, avgVolume20D, symbol } = data;
  
  // Calculate the maximum value for scaling
  const maxVolume = Math.max(todayVolume, avgVolume20D);
  
  // Calculate percentages for bar heights
  const todayPercentage = (todayVolume / maxVolume) * 100;
  const avgPercentage = (avgVolume20D / maxVolume) * 100;
  
  // Format volume numbers
  const formatVolume = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };
  
  // Calculate volume comparison
  const volumeRatio = (todayVolume / avgVolume20D);
  const isAboveAverage = volumeRatio > 1;
  const percentageDiff = ((volumeRatio - 1) * 100).toFixed(1);
  
  return (
    <div className="volume-chart">
      <div className="chart-header">
        <div className="chart-title-row">
          <h3>Volume Analysis - {symbol}</h3>
        </div>
        <div className={`volume-indicator ${isAboveAverage ? 'above-average' : 'below-average'}`}>
          {isAboveAverage ? '↗️' : '↘️'} {isAboveAverage ? '+' : ''}{percentageDiff}% vs 20D Avg
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-bars">
          <div className="bar-group">
            <div className="bar-label">Today's Volume</div>
            <div className="bar-container">
              <div 
                className="bar today-bar" 
                style={{ height: `${todayPercentage}%` }}
              ></div>
            </div>
            <div className="bar-value">{formatVolume(todayVolume)}</div>
          </div>
          
          <div className="bar-group">
            <div className="bar-label">20D Average</div>
            <div className="bar-container">
              <div 
                className="bar avg-bar" 
                style={{ height: `${avgPercentage}%` }}
              ></div>
            </div>
            <div className="bar-value">{formatVolume(avgVolume20D)}</div>
          </div>
        </div>
        
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color today-color"></span>
            <span>Today's Volume</span>
          </div>
          <div className="legend-item">
            <span className="legend-color avg-color"></span>
            <span>20-Day Average</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeChart;