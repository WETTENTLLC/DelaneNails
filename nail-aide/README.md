# NailAide Chat Assistant

NailAide is a virtual assistant for the DelaneNails website, providing instant answers to common customer questions.

## How to Add NailAide to Your Website

1. **Add business metadata** to the `<head>` section of each page:
   ```html
   <meta name="business-name" content="DelaneNails">
   <meta name="business-phone" content="(555) 123-4567">
   <meta name="business-email" content="info@delanenails.com">
   <meta name="business-address" content="123 Beauty Lane, Suite 100, Anytown, USA">
   <meta name="business-hours" content="Mon-Sat: 9am-7pm, Sun: 10am-5pm">
   ```

2. **Add the script** just before your closing `</body>` tag:
   ```html
   <script src="/js/nailaide-global.js"></script>
   ```

3. **Customize appearance and behavior** by editing `js/nailaide-config.js`

## File Structure

- `/js/nailaide-global.js` - Main script to include on all pages
- `/js/nailaide-config.js` - Configuration settings
- `/nail-aide/nailaide-standalone.js` - Core chat assistant functionality
- `/nail-aide/nailaide-demo.html` - Demo page for testing

## Customizing Responses

To customize the chatbot's responses, edit the `processUserMessage()` function in `nailaide-standalone.js`. Look for the section with keyword checks and responses:

```javascript
if (lowerMessage.includes('hour') || lowerMessage.includes('open')) {
    response = `Our business hours are ${businessHours}. We hope to see you soon!`;
}
// Add more keyword-response pairs here
```

## Support

For assistance with NailAide, please contact your web administrator.
