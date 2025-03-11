"""
Simple web interface for chatting with NailAide.
"""
import asyncio
import os
import sys
import base64
import uuid
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

# Ensure we can import from src directory
sys.path.insert(0, os.path.dirname(__file__))

# Import agent after path setup
from src.agent import Agent

app = FastAPI()

# Create templates and static folders
os.makedirs("templates", exist_ok=True)
os.makedirs("static", exist_ok=True)

# Setup templates
templates = Jinja2Templates(directory="templates")

# Create agent
agent = Agent()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[Dict[str, Any]] = []
        self.user_sessions: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        connection = {"websocket": websocket, "session_id": session_id}
        self.active_connections.append(connection)
        
        # Initialize session if needed
        if session_id not in self.user_sessions:
            self.user_sessions[session_id] = {
                "customer_info": {},
                "conversation_history": []
            }
        
        return connection

    def disconnect(self, websocket: WebSocket):
        for connection in self.active_connections:
            if connection["websocket"] == websocket:
                self.active_connections.remove(connection)
                break

    async def send_response(self, connection, message: Dict[str, Any]):
        await connection["websocket"].send_json(message)
        
    def get_session(self, session_id: str) -> Dict:
        return self.user_sessions.get(session_id, {
            "customer_info": {},
            "conversation_history": []
        })

manager = ConnectionManager()

# Route for the main page
@app.get("/", response_class=HTMLResponse)
async def get_homepage(request: Request):
    # Create a simple HTML interface
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NailAide Chat</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                color: #333;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .chat-container {
                display: flex;
                flex-direction: column;
                height: 70vh;
                border: 1px solid #ddd;
                border-radius: 8px;
                background-color: white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .chat-header {
                background-color: #d14d72;
                color: white;
                padding: 15px;
                border-radius: 8px 8px 0 0;
            }
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }
            .message {
                margin-bottom: 15px;
                padding: 10px 15px;
                border-radius: 18px;
                max-width: 75%;
                word-wrap: break-word;
            }
            .user-message {
                align-self: flex-end;
                background-color: #007bff;
                color: white;
                margin-left: auto;
            }
            .assistant-message {
                background-color: #e9e9eb;
                color: #333;
                margin-right: auto;
            }
            .chat-input {
                display: flex;
                padding: 15px;
                border-top: 1px solid #ddd;
            }
            #messageInput {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #ddd;
                border-radius: 20px;
                margin-right: 10px;
            }
            button {
                background-color: #d14d72;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 10px 15px;
                cursor: pointer;
            }
            button:hover {
                background-color: #b83e61;
            }
            .voice-button {
                background-color: #28a745;
            }
            .voice-button:hover {
                background-color: #218838;
            }
            .voice-button.recording {
                background-color: #dc3545;
            }
            .slot-list {
                margin-top: 10px;
                background-color: #f8f9fa;
                padding: 10px;
                border-radius: 10px;
            }
            .slot {
                padding: 8px;
                border-bottom: 1px solid #eee;
            }
            .customer-info {
                margin-top: 20px;
                background-color: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .customer-info h3 {
                margin-top: 0;
                color: #d14d72;
            }
            .form-group {
                margin-bottom: 15px;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
            }
            .form-group input {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Chat with NailAide</h1>
            
            <div class="chat-container">
                <div class="chat-header">
                    <h2>Delane Nails Virtual Assistant</h2>
                </div>
                <div class="chat-messages" id="chatMessages">
                    <div class="message assistant-message">
                        <p>Hello! I'm NailAide, your virtual assistant for Delane Nails. How can I help you today?</p>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="messageInput" placeholder="Type your message here..." />
                    <button id="sendButton">Send</button>
                    <button id="voiceButton" class="voice-button">🎤</button>
                </div>
            </div>
            
            <div class="customer-info">
                <h3>Your Information</h3>
                <div class="form-group">
                    <label for="nameInput">Name:</label>
                    <input type="text" id="nameInput" placeholder="Your name" />
                </div>
                <div class="form-group">
                    <label for="emailInput">Email:</label>
                    <input type="email" id="emailInput" placeholder="Your email" />
                </div>
                <div class="form-group">
                    <label for="phoneInput">Phone:</label>
                    <input type="tel" id="phoneInput" placeholder="Your phone number" />
                </div>
                <button id="updateInfoButton">Update Information</button>
            </div>
        </div>
        
        <script>
            let sessionId = localStorage.getItem('sessionId');
            if (!sessionId) {
                sessionId = generateUUID();
                localStorage.setItem('sessionId', sessionId);
            }
            
            // Load customer info from local storage if available
            const loadCustomerInfo = () => {
                const info = JSON.parse(localStorage.getItem('customerInfo') || '{}');
                if (info.name) document.getElementById('nameInput').value = info.name;
                if (info.email) document.getElementById('emailInput').value = info.email;
                if (info.phone) document.getElementById('phoneInput').value = info.phone;
                return info;
            };
            
            let customerInfo = loadCustomerInfo();
            
            // WebSocket connection
            const ws = new WebSocket(`ws://${window.location.host}/ws/${sessionId}`);
            
            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);
                displayMessage(data.message, 'assistant');
                
                // Handle special responses
                if (data.action === 'display_slots' && data.data && data.data.available_slots) {
                    displaySlots(data.data.available_slots);
                }
            };
            
            ws.onclose = function() {
                displayMessage('Connection closed. Please refresh the page.', 'system');
            };
            
            // Display a message in the chat
            function displayMessage(message, sender) {
                const chatMessages = document.getElementById('chatMessages');
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${sender}-message`;
                
                const paragraph = document.createElement('p');
                paragraph.textContent = message;
                messageDiv.appendChild(paragraph);
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // Display available slots
            function displaySlots(slots) {
                const chatMessages = document.getElementById('chatMessages');
                const slotsDiv = document.createElement('div');
                slotsDiv.className = 'slot-list';
                
                const header = document.createElement('h4');
                header.textContent = 'Available Appointment Slots:';
                slotsDiv.appendChild(header);
                
                slots.forEach((slot, index) => {
                    const slotDiv = document.createElement('div');
                    slotDiv.className = 'slot';
                    slotDiv.textContent = `${index + 1}. ${slot.formatted_time} with ${slot.staff_name}`;
                    slotDiv.onclick = () => {
                        document.getElementById('messageInput').value = `I'd like to book slot ${index + 1}`;
                    };
                    slotsDiv.appendChild(slotDiv);
                });
                
                chatMessages.appendChild(slotsDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // Send message when button is clicked
            document.getElementById('sendButton').addEventListener('click', function() {
                sendMessage();
            });
            
            // Send message when Enter key is pressed
            document.getElementById('messageInput').addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    sendMessage();
                }
            });
            
            // Update customer info
            document.getElementById('updateInfoButton').addEventListener('click', function() {
                customerInfo = {
                    name: document.getElementById('nameInput').value,
                    email: document.getElementById('emailInput').value,
                    phone: document.getElementById('phoneInput').value
                };
                
                localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
                alert('Your information has been updated!');
            });
            
            // Send message function
            function sendMessage() {
                const messageInput = document.getElementById('messageInput');
                const message = messageInput.value.trim();
                
                if (message) {
                    // Display user message
                    displayMessage(message, 'user');
                    
                    // Send to server
                    ws.send(JSON.stringify({
                        message: message,
                        customer_info: customerInfo
                    }));
                    
                    // Clear input
                    messageInput.value = '';
                }
            }
            
            // Voice button functionality
            let mediaRecorder;
            let audioChunks = [];
            let isRecording = false;
            
            document.getElementById('voiceButton').addEventListener('click', function() {
                const voiceButton = document.getElementById('voiceButton');
                
                if (!isRecording) {
                    // Start recording
                    navigator.mediaDevices.getUserMedia({ audio: true })
                        .then(stream => {
                            isRecording = true;
                            voiceButton.classList.add('recording');
                            voiceButton.textContent = '⏹️';
                            
                            mediaRecorder = new MediaRecorder(stream);
                            mediaRecorder.start();
                            
                            mediaRecorder.ondataavailable = function(event) {
                                audioChunks.push(event.data);
                            };
                            
                            mediaRecorder.onstop = function() {
                                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                                sendVoiceMessage(audioBlob);
                                audioChunks = [];
                                stream.getTracks().forEach(track => track.stop());
                            };
                        })
                        .catch(err => {
                            console.error('Error accessing microphone:', err);
                            alert('Could not access microphone. Please check permissions.');
                        });
                } else {
                    // Stop recording
                    isRecording = false;
                    voiceButton.classList.remove('recording');
                    voiceButton.textContent = '🎤';
                    mediaRecorder.stop();
                }
            });
            
            // Send voice message
            function sendVoiceMessage(audioBlob) {
                displayMessage('Processing voice message...', 'system');
                
                const formData = new FormData();
                formData.append('audio', audioBlob);
                formData.append('session_id', sessionId);
                
                fetch('/voice', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.transcription) {
                        displayMessage(data.transcription, 'user');
                    }
                })
                .catch(error => {
                    console.error('Error sending voice message:', error);
                    displayMessage('Error processing voice message. Please try again.', 'system');
                });
            }
            
            // Generate UUID function
            function generateUUID() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0,
                          v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

# WebSocket endpoint
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    connection = await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Receive message from WebSocket
            data = await websocket.receive_text()
            request = json.loads(data)
            
            # Get message and customer info
            message = request.get("message", "")
            customer_info = request.get("customer_info", {})
            
            # Update session
            session = manager.get_session(session_id)
            session["customer_info"] = customer_info
            
            # Process the message
            request_data = {
                "message": message,
                "customer_info": customer_info if any(customer_info.values()) else None
            }
            
            # Add to conversation history
            session["conversation_history"].append({
                "role": "user",
                "content": message,
                "timestamp": datetime.now().isoformat()
            })
            
            # Process with agent
            response = await agent.process_request(request_data, channel="web")
            
            # Add to conversation history
            session["conversation_history"].append({
                "role": "assistant",
                "content": response.get("message", ""),
                "timestamp": datetime.now().isoformat()
            })
            
            # Send response back to WebSocket
            await manager.send_response(connection, response)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Voice message endpoint
@app.post("/voice")
async def process_voice(audio: UploadFile = File(...), session_id: str = Form(...)):
    try:
        # Read audio file content
        audio_content = await audio.read()
        
        # Process voice with agent
        result = await agent.process_voice_input(audio_content)
        
        # Get session
        session = manager.get_session(session_id)
        
        # Add transcription to conversation history
        if result.get("transcription"):
            session["conversation_history"].append({
                "role": "user",
                "content": result["transcription"],
                "timestamp": datetime.now().isoformat()
            })
        
        # Add response to conversation history
        session["conversation_history"].append({
            "role": "assistant",
            "content": result.get("message", ""),
            "timestamp": datetime.now().isoformat()
        })
        
        # Find associated WebSocket connection and send response
        for connection in manager.active_connections:
            if connection["session_id"] == session_id:
                await manager.send_response(connection, result)
                break
                
        return result
        
    except Exception as e:
        logging.error(f"Error processing voice input: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
