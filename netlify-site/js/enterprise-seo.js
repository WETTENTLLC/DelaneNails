/**
 * Enterprise SEO System - 2025 Compliant
 */

class EnterpriseSEO {
  constructor() {
    this.init();
  }

  init() {
    this.setupStructuredData();
    this.setupMetaTags();
    this.setupAnalytics();
    this.setupPerformanceOptimization();
    this.setupLocalSEO();
  }

  setupStructuredData() {
    const businessData = {
      "@context": "https://schema.org",
      "@type": "NailSalon",
      "name": "Delane's Natural Nail Care & Medi-Spa",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "333 Estudillo Ave, Suite 204",
        "addressLocality": "San Leandro",
        "addressRegion": "CA",
        "postalCode": "94577"
      },
      "telephone": "(510) 346-2457",
      "email": "delane@delanesnails.com",
      "url": window.location.origin,
      "openingHours": [
        "We 11:00-19:00",
        "Th 11:00-19:00", 
        "Fr 11:00-19:00",
        "Sa 09:00-15:00"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "500"
      },
      "priceRange": "$45-$200",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Nail Care Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Luxurious Express Pedicure",
              "description": "30-minute express pedicure service"
            },
            "price": "45",
            "priceCurrency": "USD"
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Mobile Pedicure",
              "description": "2-hour mobile pedicure service at your location"
            },
            "price": "135",
            "priceCurrency": "USD"
          }
        ]
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(businessData);
    document.head.appendChild(script);
  }

  setupMetaTags() {
    const metaTags = [
      { name: 'description', content: 'Premium nail care & medi-spa services in San Leandro, CA. 4.9-star rated salon offering manicures, pedicures, mobile services. Book online via Booksy.' },
      { name: 'keywords', content: 'nail salon san leandro, manicure pedicure, mobile nail service, natural nail care, medi spa, nail art, gel manicure' },
      { property: 'og:title', content: 'Delane\'s Natural Nail Care & Medi-Spa - San Leandro' },
      { property: 'og:description', content: 'Premium nail care services with 4.9-star rating. Specializing in natural nail health, mobile services, and specialized treatments.' },
      { property: 'og:type', content: 'business.business' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:image', content: `${window.location.origin}/images/logo-images.png` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      { name: 'googlebot', content: 'index, follow' }
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      if (tag.name) meta.name = tag.name;
      if (tag.property) meta.property = tag.property;
      meta.content = tag.content;
      document.head.appendChild(meta);
    });
  }

  setupAnalytics() {
    // Google Analytics 4
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
    window.gtag = gtag;
  }

  setupPerformanceOptimization() {
    // DNS prefetch for external resources
    const dnsPrefetch = ['//fonts.googleapis.com', '//www.google-analytics.com'];
    dnsPrefetch.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  setupLocalSEO() {
    // Local business markup
    const localBusiness = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Delane's Natural Nail Care & Medi-Spa",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "37.7249",
        "longitude": "-122.1561"
      },
      "areaServed": ["San Leandro", "Oakland", "Hayward", "Castro Valley"],
      "knowsAbout": ["nail care", "pedicure", "manicure", "mobile services", "natural nail health"]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(localBusiness);
    document.head.appendChild(script);
  }
}

// Initialize SEO system
document.addEventListener('DOMContentLoaded', () => {
  new EnterpriseSEO();
});