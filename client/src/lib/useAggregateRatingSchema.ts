import { useEffect } from 'react';

interface AggregateRatingData {
  ratingValue: number;
  ratingCount: number;
  bestRating?: number;
  worstRating?: number;
}

interface AggregateRatingSchemaProps {
  name: string;
  description: string;
  data: AggregateRatingData;
}

export function useAggregateRatingSchema(props: AggregateRatingSchemaProps) {
  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": props.name,
      "description": props.description,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": props.data.ratingValue,
        "ratingCount": props.data.ratingCount,
        "bestRating": props.data.bestRating || 5,
        "worstRating": props.data.worstRating || 1
      }
    };

    let scriptElement = document.querySelector('script[data-aggregate-rating="true"]');
    
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.type = 'application/ld+json';
      scriptElement.setAttribute('data-aggregate-rating', 'true');
      document.head.appendChild(scriptElement);
    }

    scriptElement.textContent = JSON.stringify(schema);

    return () => {
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [props]);
}
