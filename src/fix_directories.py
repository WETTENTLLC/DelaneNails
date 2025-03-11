"""
Utility script to create necessary directories.
"""
import os

def ensure_directories_exist():
    """Ensure all necessary directories exist for the application."""
    base_dir = os.path.dirname(os.path.dirname(__file__))
    
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

if __name__ == "__main__":
    ensure_directories_exist()
    print("All necessary directories have been created.")
