# Google API Services

This directory contains integration code for various Google APIs used by the DelaneNails application.

## Available APIs

Your API key (AIzaSyCuh2qhjicG2uISz9peedrSf1ehda_UWo8) has access to the following Google APIs:

1. **Google Calendar API** - Schedule and manage appointments
2. **Google Sheets API** - Store and retrieve business data
3. **Gmail API** - Send and receive emails
4. **Cloud Storage APIs** - Store files and media
   - Google Cloud Storage JSON API
   - Cloud Storage API
5. **Cloud Database APIs**
   - Cloud SQL - Relational database services
   - Cloud Datastore API - NoSQL database
6. **Cloud Monitoring & Logging**
   - Cloud Monitoring API
   - Cloud Logging API
   - Cloud Trace API
7. **Data Analytics APIs**
   - Cloud Dataplex API
   - Analytics Hub API
   - Dataform API
8. **Service Management**
   - Service Management API
   - Service Usage API
9. **Google Cloud APIs** - Core platform services

## Using These APIs

Each API requires different dependencies and setup. The most commonly used APIs have utility classes in this directory:

- `calendar.py` - Google Calendar integration
- `gmail.py` - Gmail integration 
- `sheets.py` - Google Sheets integration
- `storage.py` - Cloud Storage integration

## Authentication Methods

Depending on the API, different authentication methods are required:

1. **API Key Only** - For public data access
2. **OAuth2** - For accessing user data (requires user consent)
3. **Service Account** - For server-to-server API access

See the example files in the `/examples` directory for usage demonstrations.

## Setup Instructions

1. Ensure your `.env` file contains the correct API key
2. Install required dependencies: `pip install google-api-python-client google-auth google-auth-oauthlib google-auth-httplib2`
3. For OAuth2 APIs, follow the credentials setup in the main README

## Security Considerations

- Never expose your API key in client-side code
- Store credentials securely and don't commit them to version control
- Use the least privileged access needed for each API call
