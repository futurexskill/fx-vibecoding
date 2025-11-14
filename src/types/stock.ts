export interface Stock {
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