/**
 * Website Diagnostics Tool
 * This script checks for common issues that might prevent the website from loading properly.
 */

(function() {
    console.log('=== WEBSITE DIAGNOSTICS STARTING ===');
    
    // Check if document is fully loaded
    if (document.readyState === 'complete') {
        console.log('✅ Document fully loaded');
    } else {
        console.warn('⚠️ Document not fully loaded. Current state:', document.readyState);
    }
    
    // Check for script loading errors
    const scripts = document.getElementsByTagName('script');
    console.log(`📝 Found ${scripts.length} scripts on the page`);
    
    // Check if NailAide is available
    if (typeof NailAide !== 'undefined') {
        console.log('✅ NailAide is defined');
        if (typeof NailAide.mount === 'function') {
            console.log('✅ NailAide.mount is a function');
        } else {
            console.error('❌ NailAide.mount is not a function');
        }
    } else {
        console.error('❌ NailAide is not defined. Check if the script is loading properly.');
    }
    
    // Check for missing images
    const images = document.getElementsByTagName('img');
    console.log(`📝 Found ${images.length} images on the page`);
    let brokenImages = 0;
    
    Array.from(images).forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
            console.error('❌ Broken image:', img.src);
            brokenImages++;
        }
    });
    
    if (brokenImages === 0) {
        console.log('✅ All images are loading correctly');
    } else {
        console.warn(`⚠️ Found ${brokenImages} broken images`);
    }
    
    // Check CSS loading
    const stylesheets = document.styleSheets;
    console.log(`📝 Found ${stylesheets.length} stylesheets`);
    
    try {
        for (let i = 0; i < stylesheets.length; i++) {
            // Accessing rules will throw if there's a CORS issue
            const rules = stylesheets[i].cssRules;
            console.log(`✅ Stylesheet ${i + 1} loaded correctly with ${rules.length} rules`);
        }
    } catch (e) {
        console.warn('⚠️ Could not access CSS rules. Possible CORS issue:', e.message);
    }
    
    console.log('=== WEBSITE DIAGNOSTICS COMPLETE ===');
})();
