"""
Web interface for Delane Nails using Flask.
"""
import logging
from datetime import datetime
import os
from typing import Dict, Any

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session

from src.agent import BookingAgent
from src.config import config

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, 
           template_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates"),
           static_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), "static"))

app.secret_key = os.getenv("FLASK_SECRET_KEY", "delane-nails-secret-key")

# Initialize booking agent
agent = BookingAgent(use_mock_api=config.get("use_mock_api", True))

@app.route('/')
def home():
    """Render home page."""
    return render_template('index.html', 
                          business_name=config.get("business_name"),
                          business_address=config.get("business_address"),
                          business_hours=config.get("business_hours"))

@app.route('/services')
def services():
    """Render services page."""
    services_list = agent.api.get_services()
    return render_template('services.html', 
                          services=services_list,
                          business_name=config.get("business_name"))

@app.route('/booking', methods=['GET', 'POST'])
def booking():
    """Handle booking page and form submissions."""
    if request.method == 'POST':
        # Process booking form
        service_id = request.form.get('service_id')
        slot_id = request.form.get('slot_id')
        customer_name = request.form.get('customer_name')
        customer_email = request.form.get('customer_email')
        customer_phone = request.form.get('customer_phone')
        
        # Validate inputs
        if not all([service_id, slot_id, customer_name, customer_phone]):
            flash("Please fill out all required fields", "error")
            return redirect(url_for('booking'))
            
        try:
            # Book appointment
            customer_details = {
                "name": customer_name,
                "email": customer_email,
                "phone": customer_phone
            }
            
            appointment = agent.api.book_appointment(
                service_id=service_id,
                slot_id=slot_id,
                customer_details=customer_details
            )
            
            # Store appointment ID in session
            session['last_appointment_id'] = appointment['appointment_id']
            
            flash("Your appointment has been booked successfully!", "success")
            return redirect(url_for('confirmation'))
        except Exception as e:
            logger.error(f"Error booking appointment: {str(e)}")
            flash(f"Error booking appointment: {str(e)}", "error")
            return redirect(url_for('booking'))
    
    # GET request - show booking form
    services_list = agent.api.get_services()
    
    # Get selected service and date from query parameters
    selected_service_id = request.args.get('service_id')
    selected_date_str = request.args.get('date')
    
    selected_date = None
    if selected_date_str:
        try:
            selected_date = datetime.strptime(selected_date_str, "%Y-%m-%d")
        except ValueError:
            selected_date = datetime.now()
    else:
        selected_date = datetime.now()
    
    # Get available slots if service is selected
    available_slots = []
    if selected_service_id:
        available_slots = agent.api.get_available_slots(
            service_id=selected_service_id,
            start_date=selected_date
        )
    
    return render_template('booking.html',
                          services=services_list,
                          selected_service_id=selected_service_id,
                          selected_date=selected_date,
                          available_slots=available_slots,
                          business_name=config.get("business_name"))

@app.route('/confirmation')
def confirmation():
    """Render booking confirmation page."""
    appointment_id = session.get('last_appointment_id')
    if not appointment_id:
        flash("No appointment found", "error")
        return redirect(url_for('home'))
        
    try:
        appointment = agent.api.get_appointment(appointment_id)
        return render_template('confirmation.html',
                              appointment=appointment,
                              business_name=config.get("business_name"),
                              business_address=config.get("business_address"),
                              business_phone=config.get("business_phone"))
    except Exception as e:
        logger.error(f"Error getting appointment: {str(e)}")
        flash(f"Error retrieving appointment: {str(e)}", "error")
        return redirect(url_for('home'))

@app.route('/chat')
def chat():
    """Render chat interface."""
    return render_template('chat.html', 
                          business_name=config.get("business_name"))

@app.route('/api/chat', methods=['POST'])
def api_chat():
    """Handle chat API endpoint."""
    data = request.json
    message = data.get('message', '')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
        
    try:
        response = agent.process_message(message)
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/slots', methods=['GET'])
def api_slots():
    """Get available time slots."""
    service_id = request.args.get('service_id')
    date_str = request.args.get('date')
    
    if not service_id or not date_str:
        return jsonify({'error': 'Missing service_id or date'}), 400
        
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d")
        slots = agent.api.get_available_slots(service_id=service_id, start_date=date)
        return jsonify(slots)
    except Exception as e:
        logger.error(f"Error getting slots: {str(e)}")
        return jsonify({'error': str(e)}), 500

def start_web_server():
    """Start the web server."""
    host = config.get("web_host", "0.0.0.0")
    port = config.get("web_port", 5000)
    debug = config.get("web_debug", True)
    
    app.run(host=host, port=port, debug=debug)

if __name__ == '__main__':
    start_web_server()
