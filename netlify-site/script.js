// Move preference data to user profile and booking form
document.getElementById('addToAppointment').addEventListener('click', function() {
    const music = document.getElementById('music').value;
    const scents = document.getElementById('scents').value;

    console.log('Preferences added to appointment:', { music, scents });
    alert('Your preferences have been added to your appointment!');
});

// Update booking form to include preferences in submission
document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const music = document.getElementById('music').value;
    const scents = document.getElementById('scents').value;

    console.log('Booking details:', { music, scents });
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
    alert('Booking initiated!');
});

// Contact form submission functionality
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log('Message stored');
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

document.addEventListener("DOMContentLoaded", function () {
    fetch("fetch_approved_testimonials.php")
        .then(response => response.text())
        .then(data => {
            document.querySelector("#client-testimonials 
.testimonials-container").innerHTML = data;
        });
});


// Ensure all interactive elements are focusable
document.querySelectorAll('a, button, input, textarea').forEach(element => {
    if (!element.hasAttribute('tabindex')) {
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


// Check if service workers are supported
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});


// Close modal on 'Esc' key press
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.service-modal');
        modals.forEach(modal => {
            modal.style.display = "none";
        });
    }
});


// Modal open and close functionality
function openServiceModal(serviceId) {
    const modal = document.getElementById(serviceId);
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.service-modal-content').focus();
}

function closeServiceModal(serviceId) {
    const modal = document.getElementById(serviceId);
    modal.setAttribute('aria-hidden', 'true');
}

window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.service-modal[aria-hidden="false"]').forEach(modal => {
            modal.setAttribute('aria-hidden', 'true');
        });
    }
});

window.onclick = function(event) {
    const modals = document.querySelectorAll('.service-modal[aria-hidden="false"]');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.setAttribute('aria-hidden', 'true');
        }
    });
};


document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    let currentIndex = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    }

    nextButton.addEventListener('click', nextSlide);
    prevButton.addEventListener('click', prevSlide);

    // Auto-rotate slides every 5 seconds
    setInterval(nextSlide, 5000);

    // Initialize the carousel
    showSlide(currentIndex);
});
