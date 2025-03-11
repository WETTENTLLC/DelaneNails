"""
Simple setup script for the standalone Delane Nails application.
"""
import sys
import subprocess
import platform

def setup():
    """Install minimal requirements and provide instructions."""
    print("Setting up minimal requirements for Delane Nails web application...")
    
    # Detect Python version
    python_version = platform.python_version()
    print(f"Detected Python version: {python_version}")
    
    # For Python 3.13+, we need specific versions
    if python_version.startswith("3.13"):
        print("Using Python 3.13 compatibility mode")
        packages = [
            "flask==2.2.5",
            "werkzeug==2.2.3",
            "Jinja2>=3.1.2",
            "itsdangerous>=2.1.2",
            "click>=8.1.3",
            "requests>=2.28.1"
        ]
    else:
        # For older Python versions, we can use more recent Flask
        packages = [
            "flask>=2.0.1,<2.1.0",
            "requests>=2.28.1"
        ]
    
    # Install packages
    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"Successfully installed {package}")
        except subprocess.CalledProcessError:
            print(f"Failed to install {package}")
            return False
    
    print("\nSetup complete! You can now run the application with:")
    print("  python super_simple.py")
    print("\nThen visit http://localhost:5000 in your browser")
    return True

if __name__ == "__main__":
    setup()
