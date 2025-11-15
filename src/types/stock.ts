export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  pe: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  avgVolume: number;
  sector: string;
  industry: string;
  rsi: number;
  ma20: number;
  ma50: number;
  ma200: number;
  lastUpdated: string;
  type: string;
}

// For backward compatibility with existing components
export interface LegacyStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  peRatio: number;
  dayHigh: number;
  dayLow: number;
  avgVolume: number;
  avgVolume20D: number;
  dividend: number;
  dividendYield: number;
}