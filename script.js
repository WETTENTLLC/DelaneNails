// Move preference data to user profile and booking form
document.getElementById('addToAppointment').addEventListener('click', function() {
    const music = document.getElementById('music').value;
    const scents = document.getElementById('scents').value;

    // Simulate storing preferences logic (e.g., saving to a user profile or local storage)
    console.log('Preferences added to appointment:', {
        music,
        scents
    });

    alert('Your preferences have been added to your appointment!');
});

// Update booking form to include preferences in submission
document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Retrieve preferences
    const music = document.getElementById('music').value;
    const scents = document.getElementById('scents').value;

    // Simulate storing booking details logic (e.g., saving to a database)
    console.log('Booking details:', {
        music,
        scents,
        // Add other booking form data here
    });

    // Show confirmation message or proceed with booking logic
    alert('Thank you for booking! Your preferences and appointment details have been noted.');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// "Book Now" button functionality
document.getElementById('bookNow').addEventListener('click', function() {
    // Handle the booking logic here
    alert('Booking initiated!');
});

// Contact form submission functionality
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Simulate message storage logic (e.g., saving to a database)
    console.log('Message stored');

    // Show confirmation message
    document.getElementById('confirmationMessage').innerText = 'Thank you! Your message has been sent.';
});

// Modal functionality for News & Updates
function showModal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

document.querySelectorAll('.floating-modal').forEach(button => {
    button.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal');
        showModal(modalId);
    });
});

document.querySelectorAll('.modal .close').forEach(button => {
    button.addEventListener('click', function() {
        const modalId = this.closest('.modal').id;
        closeModal(modalId);
    });
});

// Lazy Loading Images
document.addEventListener('DOMContentLoaded', function() {
    let lazyImages = [].slice.call(document.querySelectorAll('img.lazy'));

    if ('IntersectionObserver' in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazy');
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Fallback for browsers without IntersectionObserver support
        let lazyLoad = function() {
            lazyImages.forEach(function(lazyImage) {
                if (lazyImage.offsetTop < window.innerHeight + window.pageYOffset) {
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove('lazy');
                }
            });
        };
        window.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
        window.addEventListener('orientationchange', lazyLoad);
    }
});

// Menu Toggle for Responsive Navigation
document.getElementById('menuToggle').addEventListener('click', function() {
    document.getElementById('navMenu').classList.toggle('active');
});

// Ensure all interactive elements are focusable
document.querySelectorAll('a, button, input, textarea').forEach(element => {
    if (!element hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0');
    }
});

// Register service worker in your script.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}



