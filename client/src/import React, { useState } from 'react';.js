import React, { useState } from 'react';
import { 
  Container, Typography, TextField, Button, 
  Paper, Box, Divider, List, ListItem, 
  ListItemText, Card, CardContent
} from '@mui/material';
import { generateAIResponse } from '../utils/aiResponseHandler';

function TestingPage() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');
  const [testResults, setTestResults] = useState([]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim() === '') return;
    
    const aiResponse = generateAIResponse(userInput);
    setResponse(aiResponse);
  };
  
  const runAutomatedTests = () => {
    const testCases = [
      {
        input: "I'd like help with your products on your shop page",
        expectedContains: ["nail polish", "products", "shop"]
      },
      {
        input: "What nail polishes do you sell?",
        expectedContains: ["colors", "brands", "polish"]
      },
      {
        input: "Do you have gel nail products?",
        expectedContains: ["gel", "collection", "options"]
      }
    ];
    
    const results = testCases.map(test => {
      const aiResponse = generateAIResponse(test.input);
      const passed = test.expectedContains.some(keyword => 
        aiResponse.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return {
        input: test.input,
        response: aiResponse,
        passed: passed,
        expected: test.expectedContains.join(', ')
      };
    });
    
    setTestResults(results);
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        AI Response Testing
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Manual Testing
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Enter your query"
            variant="outlined"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Get AI Response
          </Button>
        </Box>
        
        {response && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle1">AI Response:</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>{response}</Typography>
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Automated Testing
        </Typography>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={runAutomatedTests}
          sx={{ mb: 3 }}
        >
          Run Automated Tests
        </Button>
        
        {testResults.length > 0 && (
          <List>
            {testResults.map((result, index) => (
              <Card key={index} sx={{ mb: 2, bgcolor: result.passed ? '#e8f5e9' : '#ffebee' }}>
                <CardContent>
                  <Typography variant="subtitle1">Test Case #{index + 1}</Typography>
                  <Typography variant="body2">Input: "{result.input}"</Typography>
                  <Typography variant="body2">Expected keywords: {result.expected}</Typography>
                  <Typography sx={{ mt: 1 }}>Response: "{result.response}"</Typography>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ mt: 1, color: result.passed ? 'success.main' : 'error.main' }}
                  >
                    Status: {result.passed ? 'PASSED' : 'FAILED'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default TestingPage;
