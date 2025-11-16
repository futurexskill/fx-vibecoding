import { useEffect } from 'react';
import { SEOManager, SEOData } from '../utils/seo';

interface SEOComponentProps extends SEOData {
  structuredData?: object;
}

const SEOComponent = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage,
  structuredData 
}: SEOComponentProps) => {
  useEffect(() => {
    // Update meta tags
    SEOManager.updateMeta({
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage
    });
    
    // Add structured data if provided
    if (structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"][data-seo-component]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-component', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, keywords, canonicalUrl, ogImage, structuredData]);

  return null; // This component doesn't render anything
};

export default SEOComponent;