# Navigate to your project directory (if not already there)
cd /c:/Users/wette/OneDrive/Documents/GitHub/DelaneNails

# Check status of your files
git status

# Add all modified files
git add .

# Alternatively, if you want to add specific files only, uncomment and modify:
# git add js/widget-doctor.js js/emergency-widget.js js/nailaide.js index.html css/nailaide.css

# Commit the changes with a meaningful message
git commit -m "Fix AI widget visibility issues and add emergency fallback implementation"

# Push to the main branch (or whatever your default branch is called)
git push origin main

# If you're using a different branch name, replace 'main' with your branch name
# For example: git push origin master
