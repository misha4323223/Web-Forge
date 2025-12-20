import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function useBreadcrumbSchema(items: BreadcrumbItem[]) {
  useEffect(() => {
    // Create breadcrumb schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    // Check if there's already a breadcrumb script
    let scriptElement = document.querySelector('script[data-breadcrumb="true"]');
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-breadcrumb', 'true');
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify(schema);

    return () => {
      // Clean up on unmount
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [items]);
}
