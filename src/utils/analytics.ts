// Google Analytics 4 utility for stock dashboard tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export class GoogleAnalytics {
  private static isInitialized = false;
  private static measurementId = 'GA_MEASUREMENT_ID'; // Replace with your actual GA4 measurement ID

  /**
   * Initialize Google Analytics with your measurement ID
   * Call this once in your app startup
   */
  static initialize(measurementId?: string) {
    if (measurementId) {
      this.measurementId = measurementId;
    }
    
    if (typeof window !== 'undefined' && typeof window.gtag === 'function' && !this.isInitialized) {
      this.isInitialized = true;
      console.log('Google Analytics initialized');
    }
  }

  /**
   * Track page views for single-page application
   */
  static trackPageView(pagePath: string, pageTitle?: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', this.measurementId, {
        page_path: pagePath,
        page_title: pageTitle || document.title,
        page_location: window.location.href
      });
      
      // Send page view event
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle || document.title,
        page_location: window.location.href
      });
      
      console.log(`GA: Page view tracked - ${pagePath}`);
    }
  }

  /**
   * Track stock interactions
   */
  static trackStockView(stockSymbol: string, stockName: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_stock', {
        stock_symbol: stockSymbol,
        stock_name: stockName,
        content_type: 'stock_detail',
        custom_parameter_1: 'stock_dashboard'
      });
      
      console.log(`GA: Stock view tracked - ${stockSymbol}`);
    }
  }

  /**
   * Track dashboard interactions
   */
  static trackDashboardAction(action: string, details?: object) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'dashboard_interaction', {
        action: action,
        ...details
      });
      
      console.log(`GA: Dashboard action tracked - ${action}`);
    }
  }

  /**
   * Track API calls and performance
   */
  static trackAPICall(endpoint: string, success: boolean, responseTime?: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_call', {
        endpoint: endpoint,
        success: success,
        response_time: responseTime,
        event_category: 'api_performance'
      });
    }
  }

  /**
   * Track search and filtering actions
   */
  static trackSearch(searchTerm: string, resultsCount?: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchTerm,
        results_count: resultsCount
      });
    }
  }

  /**
   * Track user engagement events
   */
  static trackEngagement(eventName: string, parameters?: object) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'engagement',
        ...parameters
      });
    }
  }

  /**
   * Track performance metrics
   */
  static trackPerformance(metricName: string, value: number, unit?: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: metricName,
        metric_value: value,
        metric_unit: unit || 'ms',
        event_category: 'performance'
      });
    }
  }

  /**
   * Track errors and exceptions
   */
  static trackError(error: Error, context?: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        context: context
      });
    }
  }

  /**
   * Set user properties for better analytics
   */
  static setUserProperties(properties: object) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', this.measurementId, {
        custom_map: properties
      });
    }
  }

  /**
   * Track conversion events (if you add premium features)
   */
  static trackConversion(eventName: string, value?: number, currency = 'USD') {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: this.measurementId,
        event_name: eventName,
        value: value,
        currency: currency
      });
    }
  }
}

// Enhanced stock-specific tracking
export class StockAnalytics extends GoogleAnalytics {
  /**
   * Track detailed stock analysis views
   */
  static trackDetailedStockView(stock: any) {
    const stockData = {
      stock_symbol: stock.symbol || stock.ticker,
      stock_name: stock.name,
      stock_price: stock.current_price || stock.price,
      stock_sector: stock.sector,
      stock_market_cap: stock.market_cap || stock.marketCap,
      price_change: stock.pct_change || stock.change,
      view_timestamp: new Date().toISOString()
    };

    if (typeof window !== 'undefined' && window.gtag) {
      // Track the stock view
      this.trackStockView(stockData.stock_symbol, stockData.stock_name);
      
      // Track detailed analytics
      window.gtag('event', 'detailed_stock_analysis', stockData);
      
      // Track engagement time (you can call this when user leaves)
      window.gtag('event', 'timing_complete', {
        name: 'stock_page_view_time',
        value: Date.now() // You'll update this on page leave
      });
    }
  }

  /**
   * Track stock comparison actions
   */
  static trackStockComparison(stocks: string[]) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'stock_comparison', {
        compared_stocks: stocks.join(','),
        comparison_count: stocks.length
      });
    }
  }

  /**
   * Track portfolio-like actions (if you add this feature)
   */
  static trackPortfolioAction(action: 'add' | 'remove' | 'view', stockSymbol: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'portfolio_action', {
        action: action,
        stock_symbol: stockSymbol
      });
    }
  }
}