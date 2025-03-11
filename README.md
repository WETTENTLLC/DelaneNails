# Delane Nails Booking System

A comprehensive booking system for Delane Nails salon, featuring a conversational booking agent, web interface, and REST API.

## Features

- **Conversational Booking Agent**: Natural language interface for booking appointments
- **Web Interface**: User-friendly web application for viewing services and booking appointments
- **REST API**: Backend API for integration with other systems
- **Appointment Management**: Book, reschedule, and cancel appointments
- **Notifications**: Email and SMS reminders for upcoming appointments

## Getting Started

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/DelaneNails.git
   cd DelaneNails
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up configuration:
   - Copy `config-example.json` to `config.json`
   - Edit `config.json` with your settings
   - Alternatively, set environment variables (see Configuration section)

### Running the Application

#### Command Line Interface

Run the interactive command-line booking agent:

# DelaneNails Website

This is the website for Delane's Natural Nail Care & Medi-Spa, featuring an AI-powered chat widget called NailAide.

## Features

- Responsive design for all devices
- Interactive chat widget (NailAide) with:
  - Product information and recommendations
  - Service details
  - Booking capabilities
  - Walk-in appointment scheduling with real-time availability
- User-friendly navigation
- Integration with booking systems via Booksy

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Local storage for persistent data
- SMS notifications for staff (via simulation)

## NailAide Chat Widget

The NailAide chat widget provides visitors with instant information about:

- Services and pricing
- Product information
- Booking appointments
- Walk-in availability
- General business information

### Walk-in Feature

The walk-in appointment feature allows visitors to:
- Check real-time availability
- Select from available time slots
- Choose services
- Receive confirmation with reference numbers
- Book same-day appointments with a 10% premium

## Setup and Installation

1. Clone this repository
2. Open `index.html` in your browser
3. For local testing, use a local server (like Live Server in VSCode)

## License

All rights reserved. This code is not open-source.
