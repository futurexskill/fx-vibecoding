// SEO utility functions for dynamic meta tag updates
export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export class SEOManager {
  static updateMeta(data: SEOData) {
    // Update title
    document.title = data.title;
    
    // Update meta description
    this.updateMetaTag('name', 'description', data.description);
    
    // Update keywords if provided
    if (data.keywords) {
      this.updateMetaTag('name', 'keywords', data.keywords);
    }
    
    // Update Open Graph tags
    this.updateMetaTag('property', 'og:title', data.title);
    this.updateMetaTag('property', 'og:description', data.description);
    
    // Update Twitter tags
    this.updateMetaTag('property', 'twitter:title', data.title);
    this.updateMetaTag('property', 'twitter:description', data.description);
    
    // Update canonical URL if provided
    if (data.canonicalUrl) {
      this.updateCanonicalUrl(data.canonicalUrl);
    }
    
    // Update OG URL
    this.updateMetaTag('property', 'og:url', window.location.href);
    this.updateMetaTag('property', 'twitter:url', window.location.href);
  }
  
  private static updateMetaTag(attribute: string, name: string, content: string) {
    let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (element) {
      element.content = content;
    } else {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      element.content = content;
      document.head.appendChild(element);
    }
  }
  
  private static updateCanonicalUrl(url: string) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (canonical) {
      canonical.href = url;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = url;
      document.head.appendChild(canonical);
    }
  }
  
  // Generate structured data for stock pages
  static generateStockStructuredData(stock: any) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FinancialProduct",
      "name": stock.name,
      "identifier": stock.ticker,
      "description": `${stock.name} (${stock.ticker}) stock information including current price, market data, and technical indicators.`,
      "category": "Stock",
      "provider": {
        "@type": "Organization",
        "name": "VibeCoding Stock Dashboard"
      },
      "offers": {
        "@type": "Offer",
        "price": stock.current_price?.toString() || "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "additionalProperty": [
        {
          "@type": "PropertyValue",
          "name": "Market Cap",
          "value": stock.market_cap?.toString() || "N/A"
        },
        {
          "@type": "PropertyValue",
          "name": "Volume",
          "value": stock.volume?.toString() || "N/A"
        },
        {
          "@type": "PropertyValue",
          "name": "Sector",
          "value": stock.sector || "N/A"
        }
      ]
    };
    
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"][data-stock]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-stock', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
  
  // SEO-friendly URL generation
  static generateStockUrl(ticker: string): string {
    return `#/stock/${encodeURIComponent(ticker)}`;
  }
  
  // Format numbers for better readability in meta descriptions
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }
  
  static formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  }
}