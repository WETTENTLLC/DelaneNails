/**
 * Responsive behavior enhancements
 * Helps optimize the site for both mobile and desktop views
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a mobile device
  const isMobile = window.innerWidth <= 768;
  
  // Apply specific mobile optimizations if needed
  if (isMobile) {
    // Any mobile-specific DOM manipulations can go here
    
    // For example, we could simplify complex layouts for mobile
    const complexElements = document.querySelectorAll('.complex-layout');
    complexElements.forEach(element => {
      element.classList.add('mobile-simplified');
    });
  }
  
  // Handle window resizing
  window.addEventListener('resize', () => {
    // Adjust any elements that need to be responsive on resize
    // This helps when users rotate their devices
    
    const currentWidth = window.innerWidth;
    
    // You could trigger specific layout changes based on width thresholds
    if (currentWidth <= 768 && !document.body.classList.contains('mobile-view')) {
      document.body.classList.add('mobile-view');
    } else if (currentWidth > 768 && document.body.classList.contains('mobile-view')) {
      document.body.classList.remove('mobile-view');
    }
  });
});
