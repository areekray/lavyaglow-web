import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
}

export function useSEO({
  title = 'LavyaGlow - Premium Handcrafted Scented Candles | Pan India Delivery',
  description = 'Shop premium handcrafted scented candles online. 100% soy wax, 20+ unique fragrances, made in Bangalore. Pan-India delivery. Perfect for gifting, home decor & aromatherapy.',
  keywords = 'candles, scented candles, handcrafted candles, soy candles, luxury candles',
  image = 'https://lavyaglow.com/og-image.jpg',
  url = 'https://lavyaglow.com',
  canonical
}: SEOProps = {}) {
  useEffect(() => {
    // Set page title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', 'website', true);

    // Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:card', 'summary_large_image');

    // Canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonical || url);

  }, [title, description, keywords, image, url, canonical]);
}
