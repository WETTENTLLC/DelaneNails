document.addEventListener('DOMContentLoaded', function () {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatOutput = document.getElementById('chat-output');

    chatForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const query = chatInput.value;
        chatInput.value = '';

        console.log("Sending chat query:", query); // Add this line for logging

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });
            const data = await response.json();
            console.log("Received chat response:", data.response); // Add this line for logging
            chatOutput.innerHTML += `<div class="chat-message"><strong>You:</strong> ${query}</div>`;
            chatOutput.innerHTML += `<div class="chat-message"><strong>Bot:</strong> ${data.response}</div>`;
        } catch (error) {
            console.error('Error:', error);
            chatOutput.innerHTML += `<div class="chat-message"><strong>Bot:</strong> Sorry, something went wrong. Please try again later.</div>`;
        }
    });
});
