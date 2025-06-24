// Pricing data structure for services and products
const pricingData = {
    services: {
        manicure: {
            ibx: { name: "IBX Restorative Manicure", price: 50, priceRange: "50-55", duration: "60 min" },
            gelish: { name: "Gelish Manicure", price: 60, duration: "45 min" }
        },
        pedicure: {
            express: { name: "Luxurious Express Pedicure", price: 45, duration: "45 min" },
            specialized: { name: "Specialized Pedicure", price: 75, priceRange: "75+", duration: "90 min" },
            psoriasis: { name: "Psoriasis Foot Treatment", price: 95, duration: "90 min" }
        },
        combos: {
            spaCombo: { name: "Spa Mani/Pedi Combo", price: 100, duration: "120 min" },
            gelishCombo: { name: "Gelish Manicure + Spa Pedicure", price: 110, duration: "135 min" }
        },
        addOns: {
            gelRemoval: { name: "Gel Polish Removal", price: 15, duration: "15 min" },
            paraffin: { name: "Paraffin Wax", price: 20, duration: "20 min" }
        }
    },
    products: {
        nailPolish: {
            truthFreedom: { name: "Truth & Freedom Nail Polish", price: 0 }
        },
        treatments: {
            dadiOil: { name: "Dadi Oil Treatment", price: 0 },
            antiFungal: { name: "Anti-Fungal Oil", price: 0 }
        },
        skincare: {
            lotion: { name: "Luxury Lotion", price: 0 },
            sugarScrub: { name: "Sugar Scrub", price: 0 }
        },
        accessories: {
            slippers: { name: "Pedicure Slippers", price: 0 }
        },
        books: {
            annieMalone: { name: "Annie Malone Coloring Book", price: 12.99 }
        }
    }
};

// Function to format price display
function formatPrice(price, priceRange = null) {
    if (priceRange) {
        return `$${priceRange}`;
    }
    return price > 0 ? `$${price.toFixed(2)}` : 'Call for pricing';
}

// Function to get service pricing HTML
function getServicePricing(serviceCategory) {
    const services = pricingData.services[serviceCategory];
    if (!services) return '';
    
    let html = '<div class="pricing-info">';
    Object.values(services).forEach(service => {
        html += `
            <div class="price-item">
                <span class="service-name">${service.name}</span>
                <span class="service-duration">${service.duration}</span>
                <span class="service-price">${formatPrice(service.price, service.priceRange)}</span>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

// Function to get product pricing HTML
function getProductPrice(productCategory, productKey) {
    const product = pricingData.products[productCategory]?.[productKey];
    return product ? formatPrice(product.price) : 'Call for pricing';
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pricingData, formatPrice, getServicePricing, getProductPrice };
}