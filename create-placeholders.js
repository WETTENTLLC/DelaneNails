/**
 * This is a utility script to create placeholder product images
 * You can run this in a browser console while on your site
 */

function createPlaceholderImages() {
    const productImages = [
        'truth-freedom-red.jpg',
        'truth-freedom-pink.jpg',
        'truth-freedom-purple.jpg',
        'cuticle-oil.jpg',
        'nail-file.jpg'
    ];

    // Create images directory if it doesn't exist
    const productsDir = document.createElement('div');
    productsDir.innerHTML = `
        <p>Place these placeholder images in: /c:/Users/wette/OneDrive/Documents/GitHub/DelaneNails/images/products/</p>
        <p>Or update the image paths in nailaide-config.js to point to existing images</p>
    `;
    document.body.appendChild(productsDir);
    
    // Create a placeholder for each product
    productImages.forEach((fileName, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        
        const ctx = canvas.getContext('2d');
        
        // Fill with color based on the filename
        let bgColor = '#FFF';
        if (fileName.includes('red')) bgColor = '#ffdddd';
        else if (fileName.includes('pink')) bgColor = '#ffd6eb';
        else if (fileName.includes('purple')) bgColor = '#e6d6ff';
        else if (fileName.includes('cuticle')) bgColor = '#ffecdb';
        else if (fileName.includes('file')) bgColor = '#e8e8e8';
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(fileName.replace('.jpg', ''), 100, 100);
        
        // Create a download link
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/jpeg');
        link.textContent = `Download ${fileName}`;
        link.style.display = 'block';
        link.style.margin = '10px';
        
        productsDir.appendChild(link);
    });
}

createPlaceholderImages();
