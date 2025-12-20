import { useEffect } from 'react';

interface MetaData {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  keywords?: string;
}

export function useDocumentMeta(data: MetaData) {
  useEffect(() => {
    // Update title
    document.title = data.title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      let element = isProperty 
        ? document.querySelector(`meta[property="${name}"]`)
        : document.querySelector(`meta[name="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        isProperty ? element.setAttribute('property', name) : element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMetaTag('description', data.description);
    if (data.keywords) updateMetaTag('keywords', data.keywords);
    if (data.ogTitle) updateMetaTag('og:title', data.ogTitle, true);
    if (data.ogDescription) updateMetaTag('og:description', data.ogDescription, true);
    if (data.ogImage) updateMetaTag('og:image', data.ogImage, true);
    if (data.ogUrl) updateMetaTag('og:url', data.ogUrl, true);
    
    // Handle canonical URL
    if (data.canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', data.canonical);
    }

    return () => {
      // Restore original meta tags if needed
    };
  }, [data]);
}
