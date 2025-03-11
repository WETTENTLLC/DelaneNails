/**
 * DelaneNails Main JavaScript File
 * 
 * This file serves as the entry point for browser-based functionality.
 * Note: This is separate from the AI testing system, which is in the root directory.
 */

// Wait for DOM content to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DelaneNails website initialized');
    initializeUI();
});

/**
 * Initialize UI components
 */
function initializeUI() {
    // Initialize form handlers
    initForms();
    
    // Initialize navigation
    initNavigation();
    
    // Set up modals if any
    initModals();
    
    // Set up any dynamic content
    loadDynamicContent();
}

/**
 * Initialize form validation and submission
 */
function initForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            // Prevent default submission
            e.preventDefault();
            
            // Check if form is valid
            if (validateForm(this)) {
                // Submit form data
                submitFormData(this);
            }
        });
    });
}

/**
 * Validate form inputs
 */
function validateForm(form) {
    let isValid = true;
    
    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            highlightError(field);
        } else {
            removeError(field);
        }
    });
    
    return isValid;
}

/**
 * Highlight field with error
 */
function highlightError(field) {
    field.classList.add('error');
    
    // Create or show error message
    let errorMsg = field.nextElementSibling;
    if (!errorMsg || !errorMsg.classList.contains('error-message')) {
        errorMsg = document.createElement('div');
        errorMsg.classList.add('error-message');
        errorMsg.textContent = 'This field is required.';
        field.parentNode.insertBefore(errorMsg, field.nextSibling);
    }
}

/**
 * Remove error highlighting
 */
function removeError(field) {
    field.classList.remove('error');
    
    // Remove error message if it exists
    const errorMsg = field.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
        errorMsg.remove();
    }
}

/**
 * Submit form data to server
 */
function submitFormData(form) {
    const formData = new FormData(form);
    const action = form.getAttribute('action') || '/submit-form';
    
    // Show loading state
    toggleLoadingState(form, true);
    
    // Submit the form data using fetch
    fetch(action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        toggleLoadingState(form, false);
        
        if (data.success) {
            showSuccessMessage(form);
            form.reset();
        } else {
            showErrorMessage(form, data.message || 'Form submission failed.');
        }
    })
    .catch(error => {
        console.error('Form submission error:', error);
        toggleLoadingState(form, false);
        showErrorMessage(form, 'An unexpected error occurred. Please try again.');
    });
}

/**
 * Toggle loading state on form
 */
function toggleLoadingState(form, isLoading) {
    const submitBtn = form.querySelector('[type="submit"]');
    
    if (isLoading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
    }
}

/**
 * Show success message after form submission
 */
function showSuccessMessage(form) {
    const container = document.createElement('div');
    container.classList.add('success-message');
    container.innerHTML = '<p>Thank you! Your submission has been received.</p>';
    
    form.style.display = 'none';
    form.parentNode.insertBefore(container, form.nextSibling);
    
    // Optional: Remove the success message after some time
    setTimeout(() => {
        container.remove();
        form.style.display = 'block';
    }, 5000);
}

/**
 * Show error message if form submission fails
 */
function showErrorMessage(form, message) {
    let errorContainer = form.querySelector('.form-error');
    
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.classList.add('form-error');
        form.prepend(errorContainer);
    }
    
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    // Hide the message after some time
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
}

/**
 * Initialize mobile and desktop navigation
 */
function initNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

/**
 * Initialize modal windows
 */
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                openModal(modal);
            }
        });
    });
    
    // Close modals with close button
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });
}

/**
 * Open a modal window
 */
function openModal(modal) {
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // Add animation class
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * Close a modal window
 */
function closeModal(modal) {
    modal.classList.remove('show');
    
    // Wait for animation to finish
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }, 300);
}

/**
 * Load dynamic content via AJAX
 */
function loadDynamicContent() {
    const dynamicSections = document.querySelectorAll('[data-dynamic-content]');
    
    dynamicSections.forEach(section => {
        const contentUrl = section.getAttribute('data-dynamic-content');
        
        if (contentUrl) {
            fetch(contentUrl)
                .then(response => response.text())
                .then(html => {
                    section.innerHTML = html;
                    
                    // Initialize any new UI elements in the loaded content
                    initDynamicContent(section);
                })
                .catch(error => {
                    console.error('Error loading dynamic content:', error);
                    section.innerHTML = '<p>Failed to load content. Please refresh the page.</p>';
                });
        }
    });
}

/**
 * Initialize elements within dynamically loaded content
 */
function initDynamicContent(container) {
    // Re-initialize any components that need it
    // For example, if there are forms in the dynamic content
    const dynamicForms = container.querySelectorAll('form');
    if (dynamicForms.length > 0) {
        initForms();
    }
}
