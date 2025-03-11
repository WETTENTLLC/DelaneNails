"""
Real-time web interface for Delane Nails using Flask and SocketIO.
"""
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

from src.agent import BookingAgent

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app and SocketIO
app = Flask(__name__)
app.secret_key = "delane-nails-secret-key"
socketio = SocketIO(app)

# Initialize booking agent
agent = BookingAgent(use_mock_api=True)

@app.route('/')
def home():
    """Simple home page."""
    return render_template('index.html')

@app.route('/services')
def services():
    """Display services page."""
    services_list = agent.api.get_services()
    return render_template('services.html', services=services_list)

@app.route('/simple-booking')
def simple_booking():
    """Simple booking form."""
    services_list = agent.api.get_services()
    return render_template('booking.html', services=services_list, current_date=datetime.now().strftime('%Y-%m-%d'))

@app.route('/simple-confirmation')
def simple_confirmation():
    """Simple confirmation page."""
    appointment_id = request.args.get('id')
    if not appointment_id:
        return redirect('/')
    
    try:
        appointment = agent.api.get_appointment(appointment_id)
        return render_template('confirmation.html', appointment=appointment)
    except Exception as e:
        logger.error(f"Error retrieving appointment: {str(e)}")
        return redirect('/')

@socketio.on('message')
def handle_message(data):
    """Handle incoming chat messages."""
    message = data.get('message', '')
    response = agent.process_message(message)
    emit('response', {'response': response})

def start_realtime_web_server():
    """Start the web server."""
    port = 5000
    print(f"Starting real-time web server on http://localhost:{port}")
    socketio.run(app, host="0.0.0.0", port=port, debug=True)

if __name__ == '__main__':
    start_realtime_web_server()
