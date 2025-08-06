const axios = require('axios');

async function testPackageAssignment() {
  try {
    const response = await axios.post('http://localhost:8000/api/package/assign-to-event', {
      eventId: 'test-event-id',
      packageIds: ['test-package-id']
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
}

testPackageAssignment(); 