/**
 * NailAide Standalone Version
 * This is a special version for the demo page that eliminates path dependencies
 */

// Important! Load products from the correct relative path
async function loadProducts() {
  if (window.productsCache) return window.productsCache;
  
  console.log("[NailAide] Loading products data...");
  try {
    // Note the path change to access products from the nail-aide directory
    const response = await fetch('../data/products.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const data = await response.json();
    window.productsCache = data.products;
    console.log(`[NailAide] Loaded ${window.productsCache.length} products`);
    return window.productsCache;
  } catch (error) {
    console.error("[NailAide] Error loading products:", error);
    alert("Could not load product information. Check the browser console for details.");
    return [];
  }
}

// Load the main NailAide script
document.addEventListener('DOMContentLoaded', function() {
  console.log("[NailAide] Demo page loaded, initializing standalone version");
  
  // First load the products to check for path issues
  loadProducts().then(() => {
    console.log("[NailAide] Product check completed, loading main script");
    
    // Override productsCache in the global scope to use our prefetched data
    window.OVERRIDE_PRODUCTS = window.productsCache;
    
    // Load the main script
    const script = document.createElement('script');
    script.src = '../js/nailaide-web.js';
    document.body.appendChild(script);
    
    console.log("[NailAide] Main script requested");
  }).catch(err => {
    console.error("[NailAide] Failed in standalone initialization:", err);
  });
});

// Make sure we have access to the correct path for products
console.log("[NailAide] Standalone script loaded");
