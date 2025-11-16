// Sitemap generator for stock dashboard
const API_BASE_URL = 'https://7kiye42406.execute-api.us-east-1.amazonaws.com/prod';

export class SitemapGenerator {
  static async generateSitemap(): Promise<string> {
    try {
      // Fetch all stocks to include in sitemap
      const response = await fetch(`${API_BASE_URL}/stocks?limit=1000`);
      const data = await response.json();
      const stocks = data.stocks || [];
      
      const baseUrl = window.location.origin;
      const now = new Date().toISOString();
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>\n`;

      // Add stock detail pages
      stocks.forEach((stock: any) => {
        const stockUrl = `${baseUrl}/#/stock/${encodeURIComponent(stock.ticker)}`;
        sitemap += `  <url>
    <loc>${stockUrl}</loc>
    <lastmod>${stock.last_updated || now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      });
      
      sitemap += `</urlset>`;
      
      return sitemap;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return this.getFallbackSitemap();
    }
  }
  
  private static getFallbackSitemap(): string {
    const baseUrl = window.location.origin;
    const now = new Date().toISOString();
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
  
  static async downloadSitemap() {
    const sitemapContent = await this.generateSitemap();
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}