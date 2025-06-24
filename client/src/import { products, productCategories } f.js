import { products, productCategories } from '../data/productData';

// Helper function to check if a string contains any keywords from an array
const containsAnyKeyword = (text, keywords) => {
  const lowercaseText = text.toLowerCase();
  return keywords.some(keyword => lowercaseText.includes(keyword.toLowerCase()));
};

// Generate product list for responses
const generateProductList = (productType) => {
  if (!products[productType]) return "We don't have that product type available.";
  
  const productList = products[productType].map(product => 
    `${product.name} (${product.price.toFixed(2)}) - ${product.description}`
  ).join('\n• ');
  
  return `Here are our ${productType} products:\n• ${productList}`;
};

// Generate response based on product category
const generateCategoryResponse = (category) => {
  const categoryInfo = productCategories.find(cat => 
    cat.name.toLowerCase().includes(category.toLowerCase())
  );
  
  if (!categoryInfo) return null;
  
  const productList = generateProductList(categoryInfo.products);
  return `In our ${categoryInfo.name} category: ${categoryInfo.description}\n\n${productList}`;
};

export const generateAIResponse = (userInput) => {
  const input = userInput.toLowerCase();
  
  // Check for product-related queries
  if (containsAnyKeyword(input, ['product', 'shop', 'buy', 'purchase', 'sale'])) {
    return `We have several product categories in our shop including nail polish, gel polish, nail care products, and professional tools. What specific products are you interested in?`;
  }
  
  // Check for nail polish queries
  if (containsAnyKeyword(input, ['nail polish', 'polish color', 'regular polish'])) {
    return generateCategoryResponse('Nail Polish');
  }
  
  // Check for gel polish queries
  if (containsAnyKeyword(input, ['gel', 'gel polish', 'long-lasting'])) {
    return generateCategoryResponse('Gel Polish');
  }
  
  // Check for nail care product queries
  if (containsAnyKeyword(input, ['care', 'cuticle', 'strengthener', 'remover'])) {
    return generateCategoryResponse('Nail Care');
  }
  
  // Check for tool queries
  if (containsAnyKeyword(input, ['tool', 'file', 'buffer'])) {
    return generateCategoryResponse('Tools');
  }
  
  // Check for price queries
  if (containsAnyKeyword(input, ['price', 'cost', 'expensive', 'cheap'])) {
    return `Our product prices range from $7.99 for basic items to $22.99 for premium gel collections. Most regular nail polishes are between $12.99-$16.99, and nail care products average around $10-15. Is there a specific product you'd like to know the price of?`;
  }
  
  // Check for best seller queries
  if (containsAnyKeyword(input, ['best seller', 'popular', 'recommended'])) {
    const bestSellers = Object.values(products)
      .flat()
      .filter(product => product.bestseller)
      .map(product => `${product.name} (${product.brand}) - $${product.price.toFixed(2)}`);
    
    return `Our current best sellers are:\n• ${bestSellers.join('\n• ')}`;
  }
  
  // Default response
  return `Thank you for your interest in our products! We offer a variety of nail polishes, gel polishes, nail care products, and professional tools. Can you please specify what type of products you're looking for so I can provide more detailed information?`;
};
