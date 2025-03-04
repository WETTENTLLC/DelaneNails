/**
 * NailAideTelephony - Handles phone call functionality
 */
const NailAideTelephony = (function() {
    // Private variables
    const businessPhone = '(123) 456-7890'; // Replace with actual business phone
    let callInProgress = false;
    
    /**
     * Format phone number for display
     */
    function formatPhoneNumber(phoneNumberString) {
        const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phoneNumberString;
    }
    
    /**
     * Create call UI elements
     */
    function createCallInterface() {
        const callContainer = document.createElement('div');
        callContainer.className = 'nailaide-call-container';
        callContainer.style.display = 'none';
        
        callContainer.innerHTML = `
            <div class="nailaide-call-header">
                <span class="nailaide-call-status">Calling...</span>
                <button class="nailaide-end-call">End Call</button>
            </div>
            <div class="nailaide-call-body">
                <div class="nailaide-call-avatar">
                    <img src="images/salon-avatar.png" alt="Salon">
                </div>
                <div class="nailaide-call-info">
                    <div class="nailaide-call-name">Delane's Natural Nail Care</div>
                    <div class="nailaide-call-number">${formatPhoneNumber(businessPhone)}</div>
                    <div class="nailaide-call-duration">00:00</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(callContainer);
        
        // Add event listener for ending call
        const endCallButton = callContainer.querySelector('.nailaide-end-call');
        endCallButton.addEventListener('click', function() {
            endCall();
        });
        
        return callContainer;
    }
    
    /**
     * Start call timer
     */
    function startCallTimer(durationElement) {
        let seconds = 0;
        const timerInterval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            durationElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
        
        return timerInterval;
    }
    
    /**
     * Initiate a phone call
     */
    function initiateCall() {
        if (callInProgress) {
            console.log('Call already in progress');
            return false;
        }
        
        // Create call interface if it doesn't exist
        let callContainer = document.querySelector('.nailaide-call-container');
        if (!callContainer) {
            callContainer = createCallInterface();
        }
        
        // Show call interface
        callContainer.style.display = 'block';
        
        // Update call status
        const callStatus = callContainer.querySelector('.nailaide-call-status');
        const callDuration = callContainer.querySelector('.nailaide-call-duration');
        
        // Simulate connecting
        callStatus.textContent = 'Connecting...';
        
        // Simulate call connection after delay
        setTimeout(() => {
            callStatus.textContent = 'Connected';
            callInProgress = true;
            
            // Start call timer
            const timerInterval = startCallTimer(callDuration);
            callContainer.dataset.timerInterval = timerInterval;
            
            // Try to use actual Web API if available
            if (window.Notification && Notification.permission === 'granted') {
                new Notification('Call Connected', {
                    body: `Call with ${formatPhoneNumber(businessPhone)} is active`,
                    icon: 'images/salon-avatar.png'
                });
            }
        }, 2000);
        
        return true;
    }
    
    /**
     * End active call
     */
    function endCall() {
        const callContainer = document.querySelector('.nailaide-call-container');
        if (!callContainer) return false;
        
        // Clear timer
        if (callContainer.dataset.timerInterval) {
            clearInterval(callContainer.dataset.timerInterval);
        }
        
        // Hide call interface
        callContainer.style.display = 'none';
        callInProgress = false;
        
        // Reset call status and duration for next call
        const callStatus = callContainer.querySelector('.nailaide-call-status');
        const callDuration = callContainer.querySelector('.nailaide-call-duration');
        callStatus.textContent = 'Calling...';
        callDuration.textContent = '00:00';
        
        return true;
    }
    
    // Public API
    return {
        /**
         * Initialize telephony features
         */
        init: function(phoneNumber) {
            if (phoneNumber) {
                businessPhone = phoneNumber;
            }
            
            // Request notification permission if available
            if (window.Notification && Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
            
            return true;
        },
        
        /**
         * Start a call to the business
         */
        callBusiness: function() {
            return initiateCall();
        },
        
        /**
         * End current call
         */
        endCall: function() {
            return endCall();
        },
        
        /**
         * Get business phone number
         */
        getBusinessPhone: function() {
            return formatPhoneNumber(businessPhone);
        },
        
        /**
         * Check if a call is in progress
         */
        isCallActive: function() {
            return callInProgress;
        }
    };
})();
