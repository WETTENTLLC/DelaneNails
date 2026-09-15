/**
 * Image Optimization & Monetization System
 */

class ImageOptimization {
  constructor() {
    this.init();
  }

  init() {
    this.setupLazyLoading();
    this.setupImageCompression();
    this.setupWebPSupport();
    this.setupImageMonetization();
    this.addMissingImages();
  }

  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  setupImageCompression() {
    document.addEventListener('DOMContentLoaded', () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
        
        // Add responsive sizes
        if (!img.sizes) {
          img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
        }
      });
    });
  }

  setupWebPSupport() {
    const supportsWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    if (supportsWebP()) {
      document.documentElement.classList.add('webp');
    }
  }

  setupImageMonetization() {
    // Add affiliate links and monetization to relevant images
    const productImages = document.querySelectorAll('.product-image, .service-image');
    productImages.forEach(img => {
      const wrapper = document.createElement('div');
      wrapper.className = 'monetized-image';
      wrapper.innerHTML = `
        <div class="image-overlay">
          <button class="shop-now-btn" onclick="window.open('${this.getAffiliateLink(img)}', '_blank')">
            Shop Now
          </button>
        </div>
      `;
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    });
  }

  getAffiliateLink(img) {
    // Return appropriate affiliate/booking links based on image
    const alt = img.alt.toLowerCase();
    if (alt.includes('service') || alt.includes('pedicure') || alt.includes('manicure')) {
      return 'https://booksy.com/en-us/195354_delane-s-natural-nail-care_nail-salon_101290_san-leandro#ba_s=seo';
    }
    return '#shop';
  }

  addMissingImages() {
    // Add optimized placeholder images where missing
    const missingImages = [
      {
        selector: '.medi-spa-item:first-child img',
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwYmNkNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TW9iaWxlIFNlcnZpY2VzPC90ZXh0Pjwvc3ZnPg==',
        alt: 'Mobile Nail Services'
      },
      {
        selector: '.medi-spa-item:last-child img',
        src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwOTdhNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U3BlY2lhbGl6ZWQgQ2FyZTwvdGV4dD48L3N2Zz4=',
        alt: 'Specialized Footcare Services'
      }
    ];

    missingImages.forEach(imgData => {
      const element = document.querySelector(imgData.selector);
      if (!element) {
        const img = document.createElement('img');
        img.src = imgData.src;
        img.alt = imgData.alt;
        img.loading = 'lazy';
        
        const container = document.querySelector(imgData.selector.split(' img')[0]);
        if (container) {
          container.insertBefore(img, container.firstChild);
        }
      }
    });
  }
}

// Initialize image optimization
document.addEventListener('DOMContentLoaded', () => {
  new ImageOptimization();
});