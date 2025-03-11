# n8n Integration for DelaneNails

This document explains how to set up and use n8n for automating data workflows with the DelaneNails application.

## Setting Up n8n

1. **Install n8n**:
   - Self-hosted: `npm install n8n -g`
   - Or use the [n8n Cloud](https://www.n8n.cloud/) service

2. **Start n8n**:
   ```bash
   n8n start
   ```

3. **Import the Workflow**:
   - Go to Workflows in n8n
   - Click "Import from File"
   - Select the `n8n-import-workflow.json` file from the workflows directory

## Available Workflows

### Data Import Workflow

This workflow automates the import of data into the DelaneNails application.

**Features**:
- Supports multiple data sources (CSV, JSON, API)
- Validates input data before import
- Supports clearing existing data
- Sends email notification after import
- Returns success/error response

**Parameters**:
- `source`: The source of the data (csv, json, api)
- `dataType`: The type of data to import (customers, appointments, services, etc.)
- `fileData`: The file contents (when source is csv or json)
- `clearExisting`: Whether to clear existing data before import (boolean)

**Setup Required**:
1. Set the following environment variables in n8n:
   - `DELANENAILS_API_URL`: Your DelaneNails API URL
   - `DELANENAILS_API_KEY`: Your API key for authentication

2. Configure the email node with your SMTP settings or email service

## Using the Workflows

### Data Import

1. Access the workflow at: [n8n Data Import](../workflows/n8n-data-import.url)
2. Click "Execute Workflow" in n8n
3. Provide the required parameters:
   - Select data source type
   - Upload data file or configure API source
   - Select data type to import
   - Choose whether to clear existing data

Alternatively, you can trigger the workflow via HTTP request:

```bash
curl -X POST https://your-n8n-instance/webhook/import \
  -H "Content-Type: application/json" \
  -d '{
    "source": "csv", 
    "dataType": "customers", 
    "clearExisting": true,
    "fileData": "name,email,phone\nJohn Doe,john@example.com,123456789"
  }'
```

## Troubleshooting

If you encounter issues with the n8n workflow:

1. Check the execution logs in n8n
2. Verify your environment variables are correctly set
3. Ensure your DelaneNails API is running and accessible
4. Check file format and structure for import operations

For more help, consult the [n8n documentation](https://docs.n8n.io/) or [DelaneNails API documentation](../api/README.md).
