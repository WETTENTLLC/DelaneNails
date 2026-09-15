const VisualPreview = {
    serviceGallery: {
        manicure: {
            basic: ['basic-mani-1.jpg', 'basic-mani-2.jpg'],
            deluxe: ['deluxe-mani-1.jpg', 'deluxe-mani-2.jpg'],
            gel: ['gel-mani-1.jpg', 'gel-mani-2.jpg']
        },
        pedicure: {
            basic: ['basic-pedi-1.jpg', 'basic-pedi-2.jpg'],
            deluxe: ['deluxe-pedi-1.jpg', 'deluxe-pedi-2.jpg'],
            medical: ['medical-pedi-1.jpg', 'medical-pedi-2.jpg']
        }
    },

    createPreview(service, type) {
        const preview = document.createElement('div');
        preview.className = 'service-preview';
        preview.innerHTML = `
            <div class="preview-carousel">
                ${this.serviceGallery[service][type].map(img => 
                    `<img src="images/services/${img}" alt="${service} ${type}">`
                ).join('')}
            </div>
            <div class="preview-controls">
                <button class="prev">◀</button>
                <button class="next">▶</button>
            </div>
        `;
        return preview;
    }
};
