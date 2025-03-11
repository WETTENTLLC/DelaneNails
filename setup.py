"""
Setup script for DelaneNails project.
"""
import os
import sys
import subprocess
import importlib

def ensure_directories_exist():
    """Ensure all necessary directories exist for the application."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create templates and static directories if they don't exist
    templates_dir = os.path.join(base_dir, "templates")
    static_dir = os.path.join(base_dir, "static")
    static_css_dir = os.path.join(static_dir, "css")
    static_js_dir = os.path.join(static_dir, "js")
    tests_dir = os.path.join(base_dir, "tests")
    
    for directory in [templates_dir, static_dir, static_css_dir, static_js_dir, tests_dir]:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Created directory: {directory}")

def install_packages(packages):
    """Install a list of Python packages."""
    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"Successfully installed {package}")
        except subprocess.CalledProcessError:
            print(f"Failed to install {package}")
            return False
    return True

def check_package_installed(package_name):
    """Check if a package is already installed."""
    try:
        importlib.import_module(package_name)
        return True
    except ImportError:
        return False

def main():
    """Main setup function."""
    print("Setting up DelaneNails project...")
    ensure_directories_exist()
    
    # List of required packages
    core_packages = [
        "flask==2.0.1",
        "fastapi==0.75.0",
        "uvicorn==0.17.6",
        "requests==2.28.1",
        "python-dotenv==0.20.0",
        "pydantic==1.9.0",  # Using older version that doesn't require Rust
    ]
    
    # Install core packages
    if not install_packages(core_packages):
        print("Some packages couldn't be installed. Please check the errors above.")
        return
    
    print("\nSetup complete! You can now run the application.")
    print("\nTo run the command-line interface:")
    print("  python -m src.main")
    print("\nTo run the simple web server:")
    print("  python -m src.web_simple")
    print("\nTo run the API server:")
    print("  python -m src.api")

if __name__ == "__main__":
    main()
