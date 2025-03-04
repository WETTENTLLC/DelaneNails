const sendgridService = {
    apiKey: null,

    init: function(apiKey) {
        this.apiKey = apiKey;
        this.loadSendGridSDK();
    },

    loadSendGridSDK: function() {
        // Load SendGrid's JavaScript SDK
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@sendgrid/mail';
        script.async = true;
        document.head.appendChild(script);
    },

    async sendEmail(to, subject, content, template = null) {
        try {
            const emailData = {
                personalizations: [{
                    to: [{ email: to }]
                }],
                from: { 
                    email: process.env.SENDGRID_FROM_EMAIL,
                    name: 'DNNC & Advanced Pedicures'
                },
                subject: subject,
                content: [{
                    type: 'text/html',
                    value: content
                }]
            };

            // Add template if provided
            if (template) {
                emailData.template_id = template;
            }

            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });

            if (!response.ok) {
                throw new Error(`SendGrid API error: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error('SendGrid error:', error);
            return false;
        }
    },

    // Email templates
    templates: {
        BOOKING_CONFIRMATION: 'd-123456789', // Replace with your template ID
        WALK_IN_NOTIFICATION: 'd-987654321', // Replace with your template ID
        TEAM_MEMBER_REQUEST: 'd-456789123'   // Replace with your template ID
    },

    // Predefined email functions
    async sendBookingConfirmation(to, bookingDetails) {
        return await this.sendEmail(
            to,
            'Booking Confirmation - DNNC & Advanced Pedicures',
            null,
            this.templates.BOOKING_CONFIRMATION,
            {
                booking_date: bookingDetails.date,
                service_type: bookingDetails.service,
                client_name: bookingDetails.name
            }
        );
    },

    async sendWalkInNotification(details) {
        return await this.sendEmail(
            process.env.SENDGRID_TO_EMAIL,
            'New Walk-in Client Alert',
            `A new walk-in client has arrived:\n${JSON.stringify(details, null, 2)}`
        );
    },

    async sendTeamMemberRequest(details) {
        return await this.sendEmail(
            process.env.SENDGRID_TO_EMAIL,
            'Urgent: Customer Needs Assistance',
            `A customer has requested to speak with a team member:\n${JSON.stringify(details, null, 2)}`
        );
    }
};
