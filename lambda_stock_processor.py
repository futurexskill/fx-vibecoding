import json
import boto3
from decimal import Decimal
from datetime import datetime
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS services
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# DynamoDB table name (will be created if doesn't exist)
TABLE_NAME = 'StockData'

def lambda_handler(event, context):
    """
    Lambda function to read stock data from S3 and store in DynamoDB
    """
    try:
        # S3 bucket and file information
        bucket_name = 'cortexalpha-market-data'
        file_key = 'usa_top_stocks.json'
        
        logger.info(f"Reading file {file_key} from bucket {bucket_name}")
        
        # Read JSON file from S3
        response = s3.get_object(Bucket=bucket_name, Key=file_key)
        stock_data = json.loads(response['Body'].read().decode('utf-8'))
        
        # Get or create DynamoDB table
        table = get_or_create_table()
        
        # Process and store stock data
        processed_count = 0
        failed_count = 0
        
        # Extract metadata
        generated_at = stock_data.get('generated_at')
        total_symbols = stock_data.get('total_symbols', 0)
        
        logger.info(f"Processing {total_symbols} stocks generated at {generated_at}")
        
        # Process each stock
        for symbol, data in stock_data.get('symbols', {}).items():
            try:
                # Convert float values to Decimal for DynamoDB
                stock_item = convert_floats_to_decimal(data)
                
                # Add processing timestamp
                stock_item['processed_at'] = datetime.utcnow().isoformat()
                stock_item['data_source'] = 'cortexalpha-market-data'
                
                # Store in DynamoDB
                table.put_item(Item=stock_item)
                processed_count += 1
                
                if processed_count % 10 == 0:
                    logger.info(f"Processed {processed_count} stocks...")
                    
            except Exception as e:
                logger.error(f"Failed to process {symbol}: {str(e)}")
                failed_count += 1
        
        # Log summary
        logger.info(f"Processing complete: {processed_count} successful, {failed_count} failed")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Stock data processed successfully',
                'processed_count': processed_count,
                'failed_count': failed_count,
                'total_symbols': total_symbols,
                'generated_at': generated_at
            })
        }
        
    except Exception as e:
        logger.error(f"Lambda execution failed: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': 'Failed to process stock data',
                'details': str(e)
            })
        }

def get_or_create_table():
    """
    Get existing DynamoDB table or create new one
    """
    try:
        # Try to get existing table
        table = dynamodb.Table(TABLE_NAME)
        table.load()  # This will raise an exception if table doesn't exist
        logger.info(f"Using existing table: {TABLE_NAME}")
        return table
        
    except dynamodb.meta.client.exceptions.ResourceNotFoundException:
        # Create new table
        logger.info(f"Creating new table: {TABLE_NAME}")
        
        table = dynamodb.create_table(
            TableName=TABLE_NAME,
            KeySchema=[
                {
                    'AttributeName': 'ticker',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'ticker',
                    'AttributeType': 'S'
                }
            ],
            BillingMode='PAY_PER_REQUEST'  # On-demand pricing
        )
        
        # Wait for table to be created
        table.meta.client.get_waiter('table_exists').wait(TableName=TABLE_NAME)
        logger.info(f"Table {TABLE_NAME} created successfully")
        
        return table

def convert_floats_to_decimal(data):
    """
    Recursively convert float values to Decimal for DynamoDB compatibility
    """
    if isinstance(data, dict):
        return {key: convert_floats_to_decimal(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_floats_to_decimal(item) for item in data]
    elif isinstance(data, float):
        return Decimal(str(data))
    else:
        return data

# Test function for local development
if __name__ == "__main__":
    # Test event (can be empty for S3-triggered lambda)
    test_event = {}
    test_context = {}
    
    result = lambda_handler(test_event, test_context)
    print(json.dumps(result, indent=2))