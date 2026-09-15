document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const menuLinks = document.querySelectorAll('nav ul li a');
    
    // Toggle menu when hamburger icon is clicked
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('mobile-open');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Close menu when a link is clicked
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                menuToggle.classList.remove('active');
                nav.classList.remove('mobile-open');
                document.body.classList.remove('menu-open');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (
            nav.classList.contains('mobile-open') && 
            !event.target.closest('nav') && 
            !event.target.closest('.mobile-menu-toggle')
        ) {
            menuToggle.classList.remove('active');
            nav.classList.remove('mobile-open');
            document.body.classList.remove('menu-open');
        }
    });
    
    // Adjust menu on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && nav.classList.contains('mobile-open')) {
            menuToggle.classList.remove('active');
            nav.classList.remove('mobile-open');
            document.body.classList.remove('menu-open');
        }
    });
});
