"""
Fixed version of the simplified web interface for Delane Nails.
"""
import logging
from datetime import datetime
from flask import Flask, jsonify, request, redirect

from src.agent import BookingAgent
from src.config import config

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = "delane-nails-secret-key"

# Initialize booking agent
agent = BookingAgent(use_mock_api=True)

# Home page route
@app.route('/')
def home():
    return """
    <html>
        <head>
            <title>Delane Nails</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #9c27b0; }
                .container { max-width: 800px; margin: 0 auto; }
                .btn { display: inline-block; background: #9c27b0; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 4px; margin-right: 10px; }
                footer { margin-top: 50px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Welcome to Delane Nails</h1>
                <p>Professional nail services at your fingertips.</p>
                
                <h2>Quick Links</h2>
                <a href="/services" class="btn">View Services</a>
                <a href="/simple-chat" class="btn">Chat With Us</a>
                <a href="/simple-booking" class="btn">Book Appointment</a>
                
                <h2>About Us</h2>
                <p>At Delane Nails, we provide high-quality nail services in a relaxing environment. 
                Our team of professionals is dedicated to giving you the perfect look.</p>
                
                <h2>Business Hours</h2>
                <ul>
                    <li>Monday - Friday: 9:00 AM - 7:00 PM</li>
                    <li>Saturday: 9:00 AM - 5:00 PM</li>
                    <li>Sunday: Closed</li>
                </ul>
                
                <footer>
                    &copy; 2023 Delane Nails - All Rights Reserved
                </footer>
            </div>
        </body>
    </html>
    """

# Process chat messages API endpoint
@app.route('/api/simple-chat', methods=['POST'])
def process_chat():
    data = request.json
    message = data.get('message', '')
    response = agent.process_message(message)
    return jsonify({'response': response})

# Get available slots API endpoint
@app.route('/api/slots', methods=['GET'])
def api_slots():
    service_id = request.args.get('service_id')
    date_str = request.args.get('date')
    
    if not service_id or not date_str:
        return jsonify([])
        
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        slots = agent.api.get_available_slots(service_id=service_id, start_date=date)
        return jsonify(slots)
    except Exception as e:
        logger.error(f"Error getting slots: {str(e)}")
        return jsonify([])

# Process booking form submission API endpoint
@app.route('/api/simple-booking', methods=['POST'])
def process_booking():
    data = request.json
    
    try:
        customer_details = {
            "name": data.get('customer_name'),
            "email": data.get('customer_email'),
            "phone": data.get('customer_phone')
        }
        
        appointment = agent.api.book_appointment(
            service_id=data.get('service_id'),
            slot_id=data.get('slot_id'),
            customer_details=customer_details
        )
        
        return jsonify(appointment)
    except Exception as e:
        logger.error(f"Error booking appointment: {str(e)}")
        return jsonify({'error': str(e)})

# Services page route
@app.route('/services')
def services():
    services_list = agent.api.get_services()
    
    services_html = ""
    for service in services_list:
        services_html += f"""
        <div class="service">
            <h3>{service['name']} - ${service['price']}</h3>
            <p><strong>Duration:</strong> {service['duration']} minutes</p>
            <p>{service['description']}</p>
            <a href="/simple-booking?service_id={service['id']}" class="btn">Book This Service</a>
        </div>
        <hr>
        """
    
    return f"""
    <html>
        <head>
            <title>Our Services - Delane Nails</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                h1, h2 {{ color: #9c27b0; }}
                .container {{ max-width: 800px; margin: 0 auto; }}
                .service {{ margin-bottom: 20px; }}
                .btn {{ display: inline-block; background: #9c27b0; color: white; padding: 8px 16px; 
                      text-decoration: none; border-radius: 4px; }}
                hr {{ border: 0; height: 1px; background: #eee; margin: 20px 0; }}
                nav {{ margin-bottom: 30px; }}
                nav a {{ margin-right: 15px; color: #9c27b0; text-decoration: none; }}
                nav a:hover {{ text-decoration: underline; }}
                footer {{ margin-top: 50px; text-align: center; color: #666; }}
            </style>
        </head>
        <body>
            <div class="container">
                <nav>
                    <a href="/">Home</a>
                    <a href="/services">Services</a>
                    <a href="/simple-chat">Chat</a>
                    <a href="/simple-booking">Book Appointment</a>
                </nav>
                
                <h1>Our Services</h1>
                <p>Browse our selection of professional nail services.</p>
                
                {services_html}
                
                <footer>
                    &copy; 2023 Delane Nails - All Rights Reserved
                </footer>
            </div>
        </body>
    </html>
    """

# Simple chat interface route
@app.route('/simple-chat')
def simple_chat():
    return """
    <html>
        <head>
            <title>Chat - Delane Nails</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1, h2 { color: #9c27b0; }
                .container { max-width: 800px; margin: 0 auto; }
                #chatbox { border: 1px solid #ccc; padding: 10px; height: 300px; overflow-y: auto; margin-bottom: 10px; }
                #messageForm { display: flex; }
                #message { flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
                button { background: #9c27b0; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 4px; margin-left: 10px; }
                .message { margin-bottom: 10px; padding: 8px; border-radius: 4px; }
                .agent { background-color: #f0f0f0; }
                .user { background-color: #e0f0ff; text-align: right; }
                nav { margin-bottom: 30px; }
                nav a { margin-right: 15px; color: #9c27b0; text-decoration: none; }
                nav a:hover { text-decoration: underline; }
                footer { margin-top: 50px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <nav>
                    <a href="/">Home</a>
                    <a href="/services">Services</a>
                    <a href="/simple-chat">Chat</a>
                    <a href="/simple-booking">Book Appointment</a>
                </nav>
                
                <h1>Chat with Delane Nails</h1>
                <div id="chatbox">
                    <div class="message agent">Hello! How can I help you today?</div>
                </div>
                <form id="messageForm">
                    <input type="text" id="message" placeholder="Type your message..." autofocus>
                    <button type="submit">Send</button>
                </form>
                
                <footer>
                    &copy; 2023 Delane Nails - All Rights Reserved
                </footer>
            </div>
            
            <script>
                document.getElementById('messageForm').addEventListener('submit', function(e) {
                    e.preventDefault();
                    var message = document.getElementById('message').value.trim();
                    if (!message) return;
                    
                    // Add user message
                    var chatbox = document.getElementById('chatbox');
                    chatbox.innerHTML += '<div class="message user">' + message + '</div>';
                    document.getElementById('message').value = '';
                    
                    // Send to server
                    fetch('/api/simple-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message })
                    })
                    .then(function(response) { return response.json(); })
                    .then(function(data) {
                        chatbox.innerHTML += '<div class="message agent">' + data.response + '</div>';
                        chatbox.scrollTop = chatbox.scrollHeight;
                    })
                    .catch(function(error) {
                        console.error('Error:', error);
                        chatbox.innerHTML += '<div class="message error">Error communicating with server</div>';
                        chatbox.scrollTop = chatbox.scrollHeight;
                    });
                    
                    chatbox.scrollTop = chatbox.scrollHeight;
                });
            </script>
        </body>
    </html>
    """

# Simple booking form route
@app.route('/simple-booking')
def simple_booking():
    services_list = agent.api.get_services()
    
    service_options = ""
    for service in services_list:
        service_options += f'<option value="{service["id"]}">{service["name"]} - ${service["price"]} ({service["duration"]} min)</option>'
    
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    return f"""
    <html>
        <head>
            <title>Book Appointment - Delane Nails</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                h1, h2 {{ color: #9c27b0; }}
                .container {{ max-width: 800px; margin: 0 auto; }}
                form {{ background: #f9f9f9; padding: 20px; border-radius: 8px; }}
                .form-group {{ margin-bottom: 15px; }}
                label {{ display: block; margin-bottom: 5px; font-weight: bold; }}
                input, select, textarea {{ width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }}
                button {{ background: #9c27b0; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; }}
                nav {{ margin-bottom: 30px; }}
                nav a {{ margin-right: 15px; color: #9c27b0; text-decoration: none; }}
                nav a:hover {{ text-decoration: underline; }}
                footer {{ margin-top: 50px; text-align: center; color: #666; }}
                #availableSlots {{ display: none; }}
            </style>
        </head>
        <body>
            <div class="container">
                <nav>
                    <a href="/">Home</a>
                    <a href="/services">Services</a>
                    <a href="/simple-chat">Chat</a>
                    <a href="/simple-booking">Book Appointment</a>
                </nav>
                
                <h1>Book Your Appointment</h1>
                <p>Please fill out the form below to book your appointment.</p>
                
                <form id="bookingForm">
                    <div class="form-group">
                        <label for="service">Select Service</label>
                        <select id="service" name="service_id" required>
                            <option value="">Choose a service...</option>
                            {service_options}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="date">Select Date</label>
                        <input type="date" id="date" name="date" required min="{current_date}">
                    </div>
                    
                    <div class="form-group" id="availableSlots">
                        <label for="slot">Select Time</label>
                        <select id="slot" name="slot_id" required>
                            <option value="">Select date and service first</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="name">Your Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email">
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Special Requests (Optional)</label>
                        <textarea id="notes" name="notes" rows="3"></textarea>
                    </div>
                    
                    <button type="submit">Book Appointment</button>
                </form>
                
                <footer>
                    &copy; 2023 Delane Nails - All Rights Reserved
                </footer>
            </div>
            
            <script>
document.addEventListener('DOMContentLoaded', function() {{
    var serviceSelect = document.getElementById('service');
    var dateInput = document.getElementById('date');
    var slotSelect = document.getElementById('slot');
    var slotsDiv = document.getElementById('availableSlots');
    var bookingForm = document.getElementById('bookingForm');
    
    function updateSlots() {{
        var serviceId = serviceSelect.value;
        var date = dateInput.value;
        
        if (!serviceId || !date) {{
            slotsDiv.style.display = 'none';
            return;
        }}
        
        // Show loading state
        slotsDiv.style.display = 'block';
        slotSelect.innerHTML = '<option value="">Loading available times...</option>';
        
        // Fetch available slots
        fetch('/api/slots?service_id=' + serviceId + '&date=' + date)
            .then(function(response) {{ return response.json(); }})
            .then(function(slots) {{
                slotSelect.innerHTML = '';
                
                if (slots.length === 0) {{
                    slotSelect.innerHTML = '<option value="">No available slots for this date</option>';
                    return;
                }}
                
                slotSelect.innerHTML = '<option value="">Choose a time...</option>';
                
                for (var i = 0; i < slots.length; i++) {{
                    var slot = slots[i];
                    var option = document.createElement('option');
                    option.value = slot.id;
                    var startTime = slot.start_time.substring(11, 16);
                    var hour = parseInt(startTime.split(':')[0]);
                    var ampm = hour >= 12 ? 'PM' : 'AM';
                    option.textContent = startTime + ' (' + ampm + ')';
                    slotSelect.appendChild(option);
                }}
            }})
            .catch(function(error) {{
                console.error('Error:', error);
                slotSelect.innerHTML = '<option value="">Error loading times</option>';
            }});
    }}
    
    serviceSelect.addEventListener('change', updateSlots);
    dateInput.addEventListener('change', updateSlots);
    
    bookingForm.addEventListener('submit', function(e) {{
        e.preventDefault();
        
        var formData = {{
            service_id: serviceSelect.value,
            slot_id: slotSelect.value,
            customer_name: document.getElementById('name').value,
            customer_email: document.getElementById('email').value,
            customer_phone: document.getElementById('phone').value,
            notes: document.getElementById('notes').value
        }};
        
        if (!formData.service_id || !formData.slot_id || !formData.customer_name || !formData.customer_phone) {{
            alert('Please fill all required fields');
            return;
        }}
        
        // Submit booking
        fetch('/api/simple-booking', {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify(formData)
        }})
        .then(function(response) {{ return response.json(); }})
        .then(function(data) {{
            if (data.appointment_id) {{
                window.location.href = '/simple-confirmation?id=' + data.appointment_id;
            }} else if (data.error) {{
                alert('Error: ' + data.error);
            }}
        }})
        .catch(function(error) {{
            console.error('Error:', error);
            alert('There was an error booking your appointment. Please try again.');
        }});
    }});
}});
            </script>
        </body>
    </html>
    """

# Confirmation page route
@app.route('/simple-confirmation')
def simple_confirmation():
    appointment_id = request.args.get('id')
    if not appointment_id:
        return redirect('/')
    
    try:
        appointment = agent.api.get_appointment(appointment_id)
        
        return f"""
        <html>
            <head>
                <title>Booking Confirmed - Delane Nails</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }}
                    h1, h2 {{ color: #9c27b0; }}
                    .container {{ max-width: 800px; margin: 0 auto; }}
                    .confirmation {{ background: #f0fff0; padding: 20px; border-radius: 8px; border-left: 5px solid #4CAF50; }}
                    .details {{ background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }}
                    .btn {{ display: inline-block; background: #9c27b0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; }}
                    nav {{ margin-bottom: 30px; }}
                    nav a {{ margin-right: 15px; color: #9c27b0; text-decoration: none; }}
                    nav a:hover {{ text-decoration: underline; }}
                    footer {{ margin-top: 50px; text-align: center; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <nav>
                        <a href="/">Home</a>
                        <a href="/services">Services</a>
                        <a href="/simple-chat">Chat</a>
                        <a href="/simple-booking">Book Appointment</a>
                    </nav>
                    
                    <div class="confirmation">
                        <h1>Booking Confirmed!</h1>
                        <p>Thank you for booking with Delane Nails. Your appointment has been confirmed.</p>
                    </div>
                    
                    <div class="details">
                        <h2>Appointment Details</h2>
                        <p><strong>Service:</strong> {appointment.get('service_name', 'N/A')}</p>
                        <p><strong>Date & Time:</strong> {appointment.get('start_time', 'N/A').replace('T', ' ').replace('Z', '')}</p>
                        <p><strong>Customer:</strong> {appointment.get('customer_name', 'N/A')}</p>
                        <p><strong>Confirmation ID:</strong> {appointment.get('appointment_id', 'N/A')}</p>
                        <p><strong>Status:</strong> {appointment.get('status', 'N/A')}</p>
                    </div>
                    
                    <p>A confirmation has been sent to your email address. If you need to cancel or reschedule, please contact us.</p>
                    
                    <p>
                        <a href="/" class="btn">Return to Home</a>
                    </p>
                    
                    <footer>
                        &copy; 2023 Delane Nails - All Rights Reserved
                    </footer>
                </div>
            </body>
        </html>
        """
    except Exception as e:
        logger.error(f"Error retrieving appointment: {str(e)}")
        return redirect('/')

def start_simple_web_server():
    """Start the web server."""
    port = 5000
    print(f"Starting simple web server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)

if __name__ == '__main__':
    start_simple_web_server()
