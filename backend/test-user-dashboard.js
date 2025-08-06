const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test the new endpoints
async function testUserDashboardEndpoints() {
  try {
    console.log('Testing User Dashboard Endpoints...\n');

    // Test getting available events (public endpoint)
    console.log('1. Testing GET /event/available...');
    try {
      const availableEventsResponse = await axios.get(`${BASE_URL}/event/available`);
      console.log('✅ Available events endpoint working');
      console.log(`   Found ${availableEventsResponse.data.events?.length || 0} available events`);
    } catch (error) {
      console.log('❌ Available events endpoint failed:', error.response?.data?.message || error.message);
    }

    // Test authentication first
    console.log('\n2. Testing authentication...');
    let authToken = null;
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com', // You'll need to use a real user email
        password: 'password123'
      });
      authToken = loginResponse.data.accessToken;
      console.log('✅ Authentication successful');
    } catch (error) {
      console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
      console.log('   Note: You need to create a test user first or use existing credentials');
      return;
    }

    // Test getting incomplete bookings (authenticated endpoint)
    console.log('\n3. Testing GET /meeting/user/incomplete...');
    try {
      const incompleteBookingsResponse = await axios.get(`${BASE_URL}/meeting/user/incomplete`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      console.log('✅ Incomplete bookings endpoint working');
      console.log(`   Found ${incompleteBookingsResponse.data.incompleteBookings?.length || 0} incomplete bookings`);
      
      if (incompleteBookingsResponse.data.incompleteBookings?.length > 0) {
        console.log('   Sample booking:', {
          id: incompleteBookingsResponse.data.incompleteBookings[0].id,
          event: incompleteBookingsResponse.data.incompleteBookings[0].event?.title,
          status: incompleteBookingsResponse.data.incompleteBookings[0].status,
          guestEmail: incompleteBookingsResponse.data.incompleteBookings[0].guestEmail
        });
      }
    } catch (error) {
      console.log('❌ Incomplete bookings endpoint failed:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ User Dashboard endpoints test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testUserDashboardEndpoints(); 