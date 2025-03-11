class ProductsKnowledge {
    constructor() {
        this.productCategories = {
            "truth-freedom-polish": {
                name: "Truth & Freedom Polish Collection",
                description: "Our exclusive nail polish line named after inspirational women throughout history. A portion of all sales goes to our nonprofit, DNNC Steps to Success.",
                items: [
                    {
                        id: "tf-eleanor",
                        name: "Eleanor",
                        color: "Bold Red",
                        price: "$18",
                        description: "A timeless, powerful red named after Eleanor Roosevelt, symbolizing courage and conviction."
                    },
                    {
                        id: "tf-maya",
                        name: "Maya",
                        color: "Deep Purple",
                        price: "$18",
                        description: "A rich, inspirational purple shade named after Maya Angelou, representing wisdom and creativity."
                    },
                    {
                        id: "tf-rosa",
                        name: "Rosa",
                        color: "Soft Pink",
                        price: "$18",
                        description: "A gentle yet determined pink named after Rosa Parks, symbolizing quiet strength and dignity."
                    },
                    {
                        id: "tf-amelia",
                        name: "Amelia",
                        color: "Sky Blue",
                        price: "$18",
                        description: "An adventurous blue named after Amelia Earhart, representing courage to explore new horizons."
                    },
                    {
                        id: "tf-malala",
                        name: "Malala",
                        color: "Vibrant Green",
                        price: "$18",
                        description: "New! A fresh, hopeful green named after Malala Yousafzai, representing perseverance and growth."
                    }
                ]
            },
            "nail-care-essentials": {
                name: "Nail Care Essentials",
                description: "Professional-grade products to maintain healthy, beautiful nails between salon visits.",
                items: [
                    {
                        id: "nce-cuticle-oil",
                        name: "Cuticle Oil Pen",
                        price: "$12",
                        description: "Nourishing cuticle oil in a convenient pen applicator to hydrate and strengthen nails."
                    },
                    {
                        id: "nce-strengthener",
                        name: "Nail Strengthener",
                        price: "$16",
                        description: "Fortifying treatment that helps prevent splitting and breaking of natural nails."
                    },
                    {
                        id: "nce-hand-cream",
                        name: "Hand Cream",
                        price: "$15",
                        description: "Luxurious hand cream with shea butter and essential oils for soft, hydrated skin."
                    },
                    {
                        id: "nce-file-buffer",
                        name: "Professional File & Buffer Set",
                        price: "$10",
                        description: "New! Our salon-quality nail file and buffer for perfect at-home maintenance."
                    }
                ]
            },
            "advanced-care": {
                name: "Advanced Nail Care",
                description: "New! Our advanced nail care line for specialized treatments and concerns.",
                items: [
                    {
                        id: "ac-repair-serum",
                        name: "Nail Repair Serum",
                        price: "$22",
                        description: "Intensive repair treatment for damaged nails with keratin protein and vitamins."
                    },
                    {
                        id: "ac-growth-formula",
                        name: "Nail Growth Formula",
                        price: "$24",
                        description: "Advanced formula to promote stronger, faster nail growth naturally."
                    },
                    {
                        id: "ac-overnight-mask",
                        name: "Overnight Nail Mask",
                        price: "$20",
                        description: "Deeply nourishing overnight treatment to transform dry, brittle nails."
                    }
                ]
            }
        };
    }

    getAllProducts() {
        return this.productCategories;
    }

    getProductCategory(category) {
        return this.productCategories[category] || null;
    }

    searchProducts(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        
        const normalizedQuery = query.toLowerCase().trim();
        const results = [];
        
        // Search through all categories
        Object.values(this.productCategories).forEach(category => {
            category.items.forEach(product => {
                if (
                    product.name.toLowerCase().includes(normalizedQuery) ||
                    product.description.toLowerCase().includes(normalizedQuery) ||
                    category.name.toLowerCase().includes(normalizedQuery)
                ) {
                    results.push({
                        ...product,
                        category: category.name
                    });
                }
            });
        });
        
        return results;
    }
    
    getNewProducts() {
        const newProducts = [];
        
        Object.values(this.productCategories).forEach(category => {
            category.items.forEach(product => {
                if (product.description.toLowerCase().includes('new!')) {
                    newProducts.push({
                        ...product,
                        category: category.name
                    });
                }
            });
        });
        
        return newProducts;
    }
    
    formatProductsResponse(products, includeDetails = true) {
        if (!products || products.length === 0) {
            return "I couldn't find any products matching your query. We offer Truth & Freedom polish collection, Nail Care Essentials, and Advanced Nail Care products. What are you interested in?";
        }
        
        let response = `I found ${products.length} product${products.length > 1 ? 's' : ''} for you:\n\n`;
        
        products.forEach((product, index) => {
            response += `${index + 1}. **${product.name}** - ${product.price}${product.color ? ` (${product.color})` : ''}\n`;
            if (includeDetails) {
                response += `   ${product.description}\n`;
            }
            response += '\n';
        });
        
        response += "Would you like to know more about any specific product?";
        return response;
    }
}

// Export the products knowledge class
window.ProductsKnowledge = ProductsKnowledge;
