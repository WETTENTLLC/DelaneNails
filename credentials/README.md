# Credentials Directory

This directory is used to store API credentials for the DelaneNails application.

## Required Files

Place the following files in this directory:

1. `credentials.json` - Google OAuth 2.0 client credentials
2. `token.json` - This will be generated automatically after authentication

## Obtaining Google API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "OAuth client ID"
6. Choose "Desktop application"
7. Download the JSON file and save it as `credentials.json` in this directory

## Security Warning

**Important:** Never commit these credential files to version control. 
They are automatically excluded via the `.gitignore` file.
