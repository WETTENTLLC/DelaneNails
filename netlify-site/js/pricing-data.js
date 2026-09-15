// Pricing data structure for services and products
const pricingData = {
    services: {
        mobile: {
            mobilePedi: { name: "Mobile Pedicure", price: 135, priceRange: "135+", duration: "2h" },
            mobileCombo: { name: "Mobile Manicure and Pedicure", price: 175, priceRange: "175+", duration: "3h" }
        },
        pedicure: {
            express: { name: "Luxurious Express Pedicure", price: 45, duration: "30 min" },
            waterless: { name: "Luxurious Waterless Pedicure", price: 45, duration: "30 min" },
            spa: { name: "Spa Pedicure", price: 65, duration: "1h" },
            gelPedi: { name: "Gel Pedicure - No Gel Removal", price: 75, duration: "1h" },
            spaCandy: { name: "Spa Pedicure w/Candy's Touch", price: 75, duration: "1h" }
        },
        specializedFootcare: {
            crackedHeels: { name: "Special Focus Cracked Heels", price: 75, duration: "1h" },
            specialized1: { name: "Specialized Pedicure I", price: 75, duration: "1h" },
            specialized2: { name: "Specialized Pedicure II", price: 85, duration: "1h" },
            specialized3: { name: "Specialized Pedicure III", price: 100, duration: "1h" },
            keryflex: { name: "Keryflex (Prosthetic Nail Care)", price: 200, duration: "1h 30min" }
        },
        manicure: {
            gelishNoRemoval: { name: "Gelish Manicure - No Gel Removal", price: 55, duration: "1h" },
            gelishWithRemoval: { name: "Gelish Manicure WITH Gel Removal", price: 60, duration: "1h 15min" },
            gelIbxFirst: { name: "Gel IBX Restorative Manicure - First Time", price: 75, duration: "1h 30min" },
            gelIbxReturn: { name: "Gel IBX Restorative Manicure - Returning", price: 65, duration: "1h 15min" },
            ibxFirst: { name: "IBX Restorative Manicure - First Time", price: 55, duration: "1h 15min" },
            ibxReturn: { name: "IBX Restorative Manicure - Returning", price: 50, duration: "1h" },
            candyTouch: { name: "Manicure w/Candy's Touch", price: 55, duration: "1h" },
            spaParaffin: { name: "Spa Manicure w/ Paraffin Wax", price: 65, duration: "1h 15min" },
            psoriasHand: { name: "Psoriasis Hand Treatment", price: 55, duration: "30min" }
        },
        addOns: {
            gelRemoval: { name: "Gel Polish Removal", price: 15, duration: "30min" },
            hardGelRemoval1: { name: "Hard Gel/Acrylic Removal - Option 1", price: 40, duration: "1h" },
            hardGelRemoval2: { name: "Hard Gel/Acrylic Removal - Option 2", price: 60, duration: "1h 30min" },
            paraffin: { name: "Paraffin Wax - Add On", price: 20, duration: "15min" },
            ibxTreatment: { name: "IBX Treatment - Add On", price: 20, duration: "20min" },
            nailRepair: { name: "Nail Repair - Add On", price: 10, duration: "10min" }
        },
        newTechSpecials: {
            newTechGelPediNo: { name: "New Tech Gel Pedicure - No Removal", price: 50, duration: "1h 15min" },
            newTechGelPediWith: { name: "New Tech Gel Pedicure - With Removal", price: 60, duration: "1h 30min" }
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