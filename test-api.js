const https = require('https');

// Test registration data
const testData = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  phone: '555-123-4567',
  session: {
    webinar_session_id: 66235, // Tuesday session
    scheduled_at: '2025-01-28T19:00:00Z'
  }
};

// Test API endpoint
const data = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Testing registration API endpoint...');
console.log('Test data:', testData);

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response status:', res.statusCode);
    console.log('Response data:', responseData);
    
    try {
      const parsed = JSON.parse(responseData);
      console.log('Parsed response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(data);
req.end();