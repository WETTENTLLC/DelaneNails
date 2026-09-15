/**
 * Clean Security System - 2025 Compliant (Fixed Version)
 */

class SecuritySystem2025 {
  constructor() {
    this.init();
  }

  init() {
    this.setupInputSanitization();
    this.setupDataProtection();
    console.log('✅ Security system initialized');
  }

  setupInputSanitization() {
    // Sanitize all form inputs
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        e.target.value = this.sanitizeInput(e.target.value);
      }
    });
  }

  sanitizeInput(input) {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/[<>]/g, '');
  }

  setupDataProtection() {
    // GDPR/CCPA compliance
    this.setupCookieConsent();
  }

  setupCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
      const banner = document.createElement('div');
      banner.id = 'cookie-banner';
      banner.innerHTML = `
        <div style="position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 15px; z-index: 1000000; text-align: center;">
          <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies. 
          <button onclick="this.parentElement.parentElement.remove(); localStorage.setItem('cookieConsent', 'true')" 
                  style="background: #00bcd4; color: white; border: none; padding: 5px 15px; margin-left: 10px; border-radius: 3px; cursor: pointer;">
            Accept
          </button></p>
        </div>
      `;
      document.body.appendChild(banner);
    }
  }
}

// Initialize security system
document.addEventListener('DOMContentLoaded', () => {
  new SecuritySystem2025();
});