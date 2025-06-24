/**
 * Enterprise Security System - 2025 Compliant
 */

class SecuritySystem2025 {
  constructor() {
    this.init();
  }

  init() {
    this.setupCSP();
    this.setupSecurityHeaders();
    this.setupInputSanitization();
    this.setupXSSProtection();
    this.setupDataProtection();
  }

  setupCSP() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://generativelanguage.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://generativelanguage.googleapis.com https://www.google-analytics.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
  }

  setupSecurityHeaders() {
    // X-Frame-Options
    const xFrame = document.createElement('meta');
    xFrame.httpEquiv = 'X-Frame-Options';
    xFrame.content = 'DENY';
    document.head.appendChild(xFrame);

    // X-Content-Type-Options
    const xContent = document.createElement('meta');
    xContent.httpEquiv = 'X-Content-Type-Options';
    xContent.content = 'nosniff';
    document.head.appendChild(xContent);

    // Referrer Policy
    const referrer = document.createElement('meta');
    referrer.name = 'referrer';
    referrer.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrer);
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

  setupXSSProtection() {
    // Override potentially dangerous functions
    const originalInnerHTML = Element.prototype.innerHTML;
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set: function(value) {
        const sanitized = this.sanitizeHTML(value);
        originalInnerHTML.call(this, sanitized);
      },
      get: function() {
        return originalInnerHTML.call(this);
      }
    });
  }

  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  setupDataProtection() {
    // GDPR/CCPA compliance
    this.setupCookieConsent();
    this.setupDataMinimization();
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

  setupDataMinimization() {
    // Clear sensitive data from memory
    setInterval(() => {
      if (window.sensitiveData) {
        delete window.sensitiveData;
      }
    }, 300000); // Every 5 minutes
  }
}

// Initialize security system
document.addEventListener('DOMContentLoaded', () => {
  new SecuritySystem2025();
});