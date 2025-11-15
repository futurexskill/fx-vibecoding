import json
import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Key

def decimal_default(obj):
    """Convert Decimal to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    API Gateway Lambda function to serve stock data from DynamoDB
    """
    
    # Enable CORS
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    }
    
    try:
        # Initialize DynamoDB
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('StockData')
        
        # Get HTTP method and path
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        
        # Handle preflight OPTIONS request
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }
        
        # Parse path parameters
        if path.startswith('/stocks/'):
            # Get specific stock by symbol
            symbol = path.split('/')[-1].upper()
            
            response = table.get_item(
                Key={'ticker': symbol}
            )
            
            if 'Item' in response:
                stock_data = response['Item']
                # Format the response to match frontend expectations
                formatted_stock = {
                    'symbol': stock_data['ticker'],
                    'name': stock_data['name'],
                    'price': float(stock_data['price']),
                    'change': float(stock_data['pct_change']),
                    'volume': int(stock_data['volume']),
                    'marketCap': float(stock_data.get('market_cap', 0)),
                    'pe': float(stock_data.get('PE', 0)),
                    'dayHigh': float(stock_data['day_high']),
                    'dayLow': float(stock_data['day_low']),
                    'yearHigh': float(stock_data.get('year_high', stock_data['day_high'])),
                    'yearLow': float(stock_data.get('year_low', stock_data['day_low'])),
                    'avgVolume': int(stock_data.get('avg_volume_20d', stock_data['volume'])),
                    'sector': stock_data.get('sector', ''),
                    'industry': stock_data.get('industry', ''),
                    'rsi': float(stock_data.get('RSI', 50)),
                    'ma20': float(stock_data.get('20DMA', 0)),
                    'ma50': float(stock_data.get('50DMA', 0)),
                    'ma200': float(stock_data.get('200DMA', 0)),
                    'lastUpdated': stock_data.get('last_updated', ''),
                    'type': stock_data.get('type', 'stock')
                }
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps(formatted_stock)
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': headers,
                    'body': json.dumps({'error': f'Stock {symbol} not found'})
                }
                
        elif path == '/stocks' or path == '/':
            # Get all stocks with optional filtering
            query_params = event.get('queryStringParameters') or {}
            limit = int(query_params.get('limit', 50))
            stock_type = query_params.get('type', None)
            
            # Scan the table
            scan_kwargs = {'Limit': limit}
            if stock_type:
                scan_kwargs['FilterExpression'] = Key('type').eq(stock_type)
                
            response = table.scan(**scan_kwargs)
            
            stocks = []
            for item in response['Items']:
                formatted_stock = {
                    'symbol': item['ticker'],
                    'name': item['name'],
                    'price': float(item['price']),
                    'change': float(item['pct_change']),
                    'volume': int(item['volume']),
                    'marketCap': float(item.get('market_cap', 0)),
                    'pe': float(item.get('PE', 0)),
                    'dayHigh': float(item['day_high']),
                    'dayLow': float(item['day_low']),
                    'yearHigh': float(item.get('year_high', item['day_high'])),
                    'yearLow': float(item.get('year_low', item['day_low'])),
                    'avgVolume': int(item.get('avg_volume_20d', item['volume'])),
                    'sector': item.get('sector', ''),
                    'industry': item.get('industry', ''),
                    'rsi': float(item.get('RSI', 50)),
                    'ma20': float(item.get('20DMA', 0)),
                    'ma50': float(item.get('50DMA', 0)),
                    'ma200': float(item.get('200DMA', 0)),
                    'lastUpdated': item.get('last_updated', ''),
                    'type': item.get('type', 'stock')
                }
                stocks.append(formatted_stock)
            
            # Sort by market cap (descending) or volume if no market cap
            stocks.sort(key=lambda x: x['marketCap'] if x['marketCap'] > 0 else x['volume'], reverse=True)
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({
                    'stocks': stocks,
                    'count': len(stocks),
                    'total_in_db': response.get('Count', len(stocks))
                })
            }
            
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Endpoint not found'})
            }
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error', 'message': str(e)})
        }