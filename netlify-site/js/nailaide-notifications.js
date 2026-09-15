const NailAideNotifications = {
    config: {
        email: 'maecity@aol.com',
        emailService: 'https://api.emailservice.com'
    },

    async init() {
        // Initialize SendGrid only
        sendgridService.init(process.env.SENDGRID_API_KEY);
    },

    async sendNotification(type, details) {
        const notifications = {
            teamMemberRequest: {
                subject: 'Urgent: Customer Needs Assistance',
                message: `A customer needs to speak with a team member.\nDetails: ${details}`,
                urgent: true
            },
            walkIn: {
                subject: 'New Walk-in Scheduled',
                message: `A new walk-in has been scheduled.\nDetails: ${details}`,
                urgent: true
            },
            appointment: {
                subject: 'New Appointment Booked',
                message: `A new appointment has been booked.\nDetails: ${details}`,
                urgent: false
            }
        };

        const notification = notifications[type];
        
        try {
            // Send email notification
            await this.sendEmail(notification.subject, notification.message);
            return true;
        } catch (error) {
            console.error('Notification failed:', error);
            return false;
        }
    },

    async sendEmail(subject, message) {
        return await sendgridService.sendEmail(
            this.config.email,
            subject,
            message
        );
    }
};
