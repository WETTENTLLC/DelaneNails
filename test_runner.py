"""
Test runner script to help test the DelaneNails system.
"""
import os
import sys
import subprocess
import time
import webbrowser
from urllib.request import urlopen
from urllib.error import URLError

def check_port_in_use(port, host='127.0.0.1'):
    """Check if a port is in use."""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0

def wait_for_server(url, timeout=30):
    """Wait until the server is responsive."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            urlopen(url)
            return True
        except URLError:
            time.sleep(0.5)
    return False

def run_tests():
    """Run the basic tests to make sure the system is functioning."""
    print("\n🧪 Running unit tests...")
    result = subprocess.run([sys.executable, "-m", "tests.test_basic"], capture_output=True, text=True)
    if result.returncode == 0:
        print("✅ Unit tests passed!")
    else:
        print("❌ Unit tests failed!")
        print(result.stdout)
        print(result.stderr)
        return False
    return True

def test_cli():
    """Run the command-line interface."""
    print("\n🖥️ Starting command-line interface...")
    print("You can interact with the booking agent via the command line.")
    print("Type 'exit' or 'quit' to return to this menu.")
    subprocess.run([sys.executable, "-m", "src.main"])

def test_web_interface():
    """Run the web interface."""
    print("\n🌐 Starting web interface...")
    if check_port_in_use(5000):
        print("❌ Error: Port 5000 is already in use. Please close other applications using this port.")
        return

    # Start the web server in a subprocess
    web_process = subprocess.Popen([sys.executable, "-m", "src.web"], 
                                   stdout=subprocess.PIPE, 
                                   stderr=subprocess.PIPE)
    
    # Wait for the server to start
    if wait_for_server("http://localhost:5000"):
        print("✅ Web server started successfully!")
        print("Opening browser - you can test the web interface now.")
        webbrowser.open("http://localhost:5000")
        
        try:
            input("\nPress Enter to stop the web server and return to the menu...")
        finally:
            web_process.terminate()
            print("Web server stopped.")
    else:
        print("❌ Failed to start web server.")
        web_process.terminate()

def test_api():
    """Run the API server."""
    print("\n🔌 Starting API server...")
    if check_port_in_use(8000):
        print("❌ Error: Port 8000 is already in use. Please close other applications using this port.")
        return

    # Start the API server in a subprocess
    api_process = subprocess.Popen([sys.executable, "-m", "src.api"], 
                                  stdout=subprocess.PIPE, 
                                  stderr=subprocess.PIPE)
    
    # Wait for the server to start
    if wait_for_server("http://localhost:8000"):
        print("✅ API server started successfully!")
        print("The API is now available at http://localhost:8000")
        print("You can test it with tools like curl, Postman, or the Swagger UI at http://localhost:8000/docs")
        
        try:
            input("\nPress Enter to stop the API server and return to the menu...")
        finally:
            api_process.terminate()
            print("API server stopped.")
    else:
        print("❌ Failed to start API server.")
        api_process.terminate()

def main_menu():
    """Display the main testing menu."""
    while True:
        print("\n" + "=" * 50)
        print("DelaneNails Testing Menu")
        print("=" * 50)
        print("Select a testing option:")
        print("1. Run unit tests")
        print("2. Test command-line interface")
        print("3. Test web interface")
        print("4. Test API server")
        print("0. Exit")
        
        choice = input("\nEnter your choice (0-4): ")
        
        if choice == "1":
            run_tests()
        elif choice == "2":
            test_cli()
        elif choice == "3":
            test_web_interface()
        elif choice == "4":
            test_api()
        elif choice == "0":
            print("\nExiting test runner. Goodbye!")
            break
        else:
            print("\n❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main_menu()
