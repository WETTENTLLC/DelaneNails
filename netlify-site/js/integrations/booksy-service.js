/**
 * Booksy Integration Service
 * Handles integration with Booksy for appointment scheduling
 */
const BooksyService = {
    widgetId: null,
    businessName: null,
    bookingUrl: null,
    
    init: function(widgetId, businessName) {
        console.log('Initializing BooksyService...');
        this.widgetId = widgetId;
        this.businessName = businessName;
        this.bookingUrl = `https://${businessName.toLowerCase()}.booksy.com`;
        
        if (!widgetId) {
            console.warn('BooksyService initialized without widget ID');
        }
        
        console.log('BooksyService initialized with:', {
            widgetId: this.widgetId,
            businessName: this.businessName,
            bookingUrl: this.bookingUrl
        });
    },
    
    getBookingUrl: function() {
        return this.bookingUrl || 'https://delanesnaturalnailcare.booksy.com/';
    },
    
    openBookingWidget: function() {
        console.log('Opening Booksy booking widget...');
        window.open(this.getBookingUrl(), '_blank');
    }
};

// Make available globally
window.BooksyService = BooksyService;
