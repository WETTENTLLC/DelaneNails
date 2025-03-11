/**
 * NailAide Shop Parser
 * Extracts product information from the shop page for use in the chat widget
 */

const ShopParser = (function() {
  // Where we'll store all the products
  const shopProducts = {
    categories: [],
    items: []
  };

  // Parse the current page if it's the shop page
  function parseShopPage() {
    console.log("Parsing shop page...");
    
    // Check if we're on the shop page
    const isShopPage = window.location.pathname.includes('shop') || 
                       document.title.toLowerCase().includes('shop') ||
                       document.querySelector('h1, h2')?.textContent.toLowerCase().includes('shop');
                       
    if (!isShopPage) {
      console.log("Not on shop page, skipping parser");
      return null;
    }
    
    // Expanded selectors to find more product containers
    const productContainers = document.querySelectorAll(
      '.product, .product-item, [class*="product"], [id*="product"], .item, .shop-item, ' + 
      'article, .card, .item-card, .shop-card, .woocommerce-loop-product, ' +
      '.product-container, .product-wrapper, .goods-item'
    );
    
    if (productContainers.length === 0) {
      console.log("No product containers found, trying generic elements");
      // Fallback to more generic elements that might contain products
      const genericContainers = document.querySelectorAll('.col, .column, .grid-item, .flex-item');
      if (genericContainers.length > 0) {
        console.log(`Found ${genericContainers.length} generic containers, checking for products`);
        
        // Process each generic container
        genericContainers.forEach((container, index) => {
          try {
            const product = extractProductInfo(container, index);
            if (product && product.name) {
              shopProducts.items.push(product);
              
              // Add category if it's new
              if (product.category && !shopProducts.categories.includes(product.category)) {
                shopProducts.categories.push(product.category);
              }
            }
          } catch (err) {
            console.error("Error extracting product info from generic container:", err);
          }
        });
      } else {
        console.log("No product or generic containers found");
        // Last resort: look for any elements with product-like text content
        findProductsInPageContent();
      }
      
      return shopProducts;
    }
    
    console.log(`Found ${productContainers.length} potential product containers`);
    
    // Parse each product
    productContainers.forEach((container, index) => {
      try {
        const product = extractProductInfo(container, index);
        if (product) {
          shopProducts.items.push(product);
          
          // Add category if it's new
          if (product.category && !shopProducts.categories.includes(product.category)) {
            shopProducts.categories.push(product.category);
          }
        }
      } catch (err) {
        console.error("Error extracting product info:", err);
      }
    });
    
    console.log(`Successfully parsed ${shopProducts.items.length} products`);
    
    // Save the products to sessionStorage for other pages
    saveProductsToStorage();
    
    return shopProducts;
  }
  
  // New function to scan page content for product mentions
  function findProductsInPageContent() {
    console.log("Scanning page content for product mentions...");
    
    // Get all text elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
    
    // Common product indicators
    const productIndicators = ['oil', 'polish', 'nail', 'cream', 'lotion', 'kit', 'set', 'treatment', 'file', 'buffer'];
    
    // Product names already found (to avoid duplicates)
    const foundProductNames = new Set();
    
    // Scan all text elements
    textElements.forEach(el => {
      const text = el.textContent.trim().toLowerCase();
      
      // Skip very short text or generic text
      if (text.length < 3 || ['menu', 'home', 'about', 'contact', 'search'].includes(text)) {
        return;
      }
      
      // Check if this looks like a product name
      if (productIndicators.some(indicator => text.includes(indicator)) &&
          !foundProductNames.has(text)) {
        
        foundProductNames.add(text);
        
        // Try to find an image near this text
        let image = '';
        let imgElem = el.querySelector('img') || 
                     el.previousElementSibling?.querySelector('img') ||
                     el.parentElement?.querySelector('img');
        
        if (imgElem) {
          image = imgElem.src || imgElem.getAttribute('data-src') || '';
        }
        
        // Try to find a price near this text
        let price = '';
        const priceRegex = /\$\d+(\.\d{2})?|\d+\.\d{2}/;
        const priceMatch = el.textContent.match(priceRegex) || 
                          el.nextElementSibling?.textContent.match(priceRegex) ||
                          el.parentElement?.textContent.match(priceRegex);
        
        if (priceMatch) {
          price = priceMatch[0];
        }
        
        // Create product
        const productName = el.textContent.trim();
        const product = {
          id: productName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          name: productName,
          price: price || '$0.00',
          description: '',
          image: image,
          category: determineCategory(productName),
          url: window.location.href,
          keywords: [productName.toLowerCase()]
        };
        
        shopProducts.items.push(product);
        
        if (product.category && !shopProducts.categories.includes(product.category)) {
          shopProducts.categories.push(product.category);
        }
      }
    });
    
    console.log(`Found ${foundProductNames.size} potential products from page content`);
  }
  
  // New function to categorize products based on keywords
  function determineCategory(productName) {
    productName = productName.toLowerCase();
    
    if (productName.includes('polish') || productName.includes('color') || 
        productName.includes('lacquer') || productName.includes('truth') || 
        productName.includes('freedom')) {
      return 'polish';
    } else if (productName.includes('oil') || productName.includes('serum') || 
               productName.includes('cream') || productName.includes('lotion') ||
               productName.includes('treatment')) {
      return 'care';
    } else if (productName.includes('file') || productName.includes('buffer') || 
               productName.includes('tool') || productName.includes('kit') ||
               productName.includes('clipper') || productName.includes('pusher')) {
      return 'accessories';
    } else {
      return 'other';
    }
  }
  
  // Extract information from a product element - Improved
  function extractProductInfo(container, index) {
    // Title/Name - expanded selectors
    const nameEl = container.querySelector('h1, h2, h3, h4, h5, h6, .product-title, .title, .product-name, .name, [class*="product-name"], [class*="product-title"]');
    const name = nameEl ? nameEl.textContent.trim() : `Product ${index + 1}`;
    
    // Price - expanded selectors
    const priceEl = container.querySelector('.price, .product-price, [class*="price"], .amount');
    let price = priceEl ? priceEl.textContent.trim() : '';
    
    // If no price element was found, look for price in text
    if (!price) {
      const priceRegex = /\$\d+(\.\d{2})?|\d+\.\d{2}/;
      const textContent = container.textContent;
      const priceMatch = textContent.match(priceRegex);
      if (priceMatch) {
        price = priceMatch[0];
      }
    }
    
    // Image - expanded selectors
    const imageEl = container.querySelector('img[src], img[data-src], [class*="image"] img, [class*="thumb"] img');
    const image = imageEl ? (imageEl.src || imageEl.getAttribute('data-src') || '') : '';
    
    // Description - expanded selectors
    const descEl = container.querySelector('.description, .product-description, [class*="description"], .excerpt, .summary, .details');
    const description = descEl ? descEl.textContent.trim() : '';
    
    // Category
    let category = 'uncategorized';
    
    // Try to find category from container classes or parent elements
    const categoryEl = container.closest('[class*="category"], [id*="category"]');
    if (categoryEl) {
      const categoryMatch = categoryEl.className.match(/category[-_]([a-z0-9_-]+)/i) || 
                            categoryEl.id.match(/category[-_]([a-z0-9_-]+)/i);
      if (categoryMatch) {
        category = categoryMatch[1].replace(/-|_/g, ' ').toLowerCase();
      }
    }
    
    // Attempt to detect Truth & Freedom products
    if (name.toLowerCase().includes('truth') || name.toLowerCase().includes('freedom')) {
      category = 'polish';
    }
    
    // Generate an ID from name
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Get URL
    const url = findProductUrl(container) || window.location.href;
    
    // keywords for improved matching
    const keywords = [name.toLowerCase()];
    const nameWords = name.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    keywords.push(...nameWords);
    
    if (description) {
      const descWords = description.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      keywords.push(...descWords);
    }
    
    return {
      id,
      name,
      price: price || '$0.00',
      description,
      image,
      category: determineCategory(name),
      url,
      keywords
    };
  }
  
  // Helper to find product URL
  function findProductUrl(container) {
    const linkEl = container.querySelector('a[href]') || container.closest('a[href]');
    return linkEl ? linkEl.href : null;
  }
  
  // Save products to sessionStorage
  function saveProductsToStorage() {
    if (shopProducts.items.length > 0) {
      try {
        window.sessionStorage.setItem('nailaide_shop_products', JSON.stringify(shopProducts));
        console.log("Saved products to sessionStorage");
      } catch (err) {
        console.error("Failed to save products to sessionStorage:", err);
      }
    }
  }
  
  // Load products from sessionStorage
  function loadProductsFromStorage() {
    try {
      const data = window.sessionStorage.getItem('nailaide_shop_products');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.items && parsed.items.length > 0) {
          Object.assign(shopProducts, parsed);
          console.log(`Loaded ${shopProducts.items.length} products from sessionStorage`);
          return true;
        }
      }
    } catch (err) {
      console.error("Failed to load products from sessionStorage:", err);
    }
    
    return false;
  }
  
  // Update NailAide configuration with shop products
  function updateNailAideConfig() {
    if (!window.NAILAIDE_CONFIG) {
      console.warn("NailAide configuration not found");
      return;
    }
    
    // Initialize products config if it doesn't exist
    if (!window.NAILAIDE_CONFIG.products) {
      window.NAILAIDE_CONFIG.products = {
        enabled: true,
        categories: [],
        items: []
      };
    }
    
    // Merge parsed shop products with existing configuration
    if (shopProducts.items.length > 0) {
      // Add any new categories
      shopProducts.categories.forEach(category => {
        if (!window.NAILAIDE_CONFIG.products.categories.includes(category)) {
          window.NAILAIDE_CONFIG.products.categories.push(category);
        }
      });
      
      // Add products that don't already exist (based on ID)
      const existingIds = window.NAILAIDE_CONFIG.products.items.map(item => item.id);
      shopProducts.items.forEach(product => {
        if (!existingIds.includes(product.id)) {
          window.NAILAIDE_CONFIG.products.items.push(product);
        }
      });
      
      console.log(`NailAide config updated with shop products (total: ${window.NAILAIDE_CONFIG.products.items.length})`);
    }
  }
  
  // Initialize the parser
  function init() {
    // First try to load from storage
    const loaded = loadProductsFromStorage();
    
    // If we're on the shop page or nothing was loaded, parse the page
    if (!loaded || window.location.pathname.includes('shop')) {
      parseShopPage();
    }
    
    // Update NailAide configuration if needed
    if (shopProducts.items.length > 0) {
      updateNailAideConfig();
    }
    
    return shopProducts;
  }
  
  // Public API
  return {
    init,
    getProducts: () => shopProducts,
    parseShopPage
  };
})();

// Auto-initialize if NailAide is loaded
document.addEventListener('DOMContentLoaded', function() {
  ShopParser.init();
  
  // Make sure we update NailAide if it's already loaded or when it loads
  if (window.NailAide) {
    console.log("NailAide already loaded, updating with shop products");
    ShopParser.init();
  } else {
    window.addEventListener('nailaide:loaded', function() {
      console.log("NailAide loaded event detected, updating with shop products");
      ShopParser.init();
    });
    
    // Fallback check after a delay
    setTimeout(() => {
      if (window.NailAide) {
        console.log("NailAide loaded after delay, updating with shop products");
        ShopParser.init();
      }
    }, 2000);
  }
});

// Export to global scope
window.ShopParser = ShopParser;
