# DynamoDB Table Schema for Stock Data

## Table Name: `StockData`

### Primary Key:
- **Partition Key**: `ticker` (String) - e.g., "NVDA", "AAPL", "MSFT"

### Sample Item Structure:
```json
{
  "ticker": "NVDA",
  "name": "NVIDIA Corporation", 
  "type": "stock",
  "price": 190.17,
  "pct_change": 1.77,
  "day_high": 191.01,
  "day_low": 180.58,
  "day_open": 182.86,
  "volume": 184564476,
  "avg_volume_20d": 186372113,
  "volume_ratio": 0.99,
  "day_range_pct": 5.48,
  "20DMA": 192.87,
  "50DMA": 185.61,
  "100DMA": 178.96,
  "200DMA": 151.19,
  "RSI": 49.07,
  "ATR_14": 8.98,
  "last_updated": "2025-11-14T21:54:22.521325+00:00",
  "processed_at": "2025-11-15T10:30:00.000000",
  "data_source": "cortexalpha-market-data"
}
```

### Key Features:
- **Pay-per-request billing** (no fixed costs)
- **No secondary indexes** needed initially
- **Automatic scaling** based on usage
- **Point-in-time recovery** available
- **Encryption at rest** enabled by default

### Data Types in DynamoDB:
- **Numbers**: All numeric fields (price, volume, etc.) stored as Decimal
- **Strings**: ticker, name, type, timestamps
- **Attributes**: 20+ fields per stock

### Query Patterns:
1. **Get single stock**: `ticker = "NVDA"`
2. **Scan all stocks**: Full table scan (limit 1MB per operation)
3. **Filter by type**: `type = "stock"` (using scan + filter)
4. **Get multiple stocks**: BatchGetItem with list of tickers

### Estimated Costs:
- **113 stocks** ≈ 113 items
- **Item size** ≈ 1KB each
- **Storage**: $0.25/GB/month ≈ **$0.03/month**
- **Read/Write**: First 25 units free daily
- **Total monthly cost**: **~$0.05-0.50/month**