import "dotenv/config";
import axios from "axios";

async function testUserManagementAPI() {
  try {
    console.log("🧪 Testing User Management API endpoints...");
    
    const baseURL = "http://localhost:8000/api";
    
    // First, login as admin to get token
    console.log("\n1. Logging in as admin...");
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: "admin@meetly.com",
      password: "admin123"
    });
    
    const token = loginResponse.data.accessToken;
    console.log("✅ Login successful, got token");
    
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    
    // Test 1: Get all users
    console.log("\n2. Testing GET /api/admin/ (get all users)...");
    try {
      const allUsersResponse = await axios.get(`${baseURL}/admin/`, { headers });
      console.log("✅ Get all users successful");
      console.log("📊 Response:", {
        total: allUsersResponse.data.total,
        page: allUsersResponse.data.page,
        usersCount: allUsersResponse.data.users?.length || 0
      });
    } catch (error: any) {
      console.log("❌ Get all users failed:", error.response?.data || error.message);
    }
    
    // Test 2: Search users
    console.log("\n3. Testing GET /api/admin/search (search users)...");
    try {
      const searchResponse = await axios.get(`${baseURL}/admin/search?q=john`, { headers });
      console.log("✅ Search users successful");
      console.log("📊 Response:", {
        total: searchResponse.data.total,
        page: searchResponse.data.page,
        usersCount: searchResponse.data.users?.length || 0
      });
    } catch (error: any) {
      console.log("❌ Search users failed:", error.response?.data || error.message);
    }
    
    // Test 3: Get specific user
    console.log("\n4. Testing GET /api/admin/:userId (get specific user)...");
    try {
      // First get a user ID from the all users response
      const allUsersResponse = await axios.get(`${baseURL}/admin/`, { headers });
      if (allUsersResponse.data.users && allUsersResponse.data.users.length > 0) {
        const userId = allUsersResponse.data.users[0].id;
        const userResponse = await axios.get(`${baseURL}/admin/${userId}`, { headers });
        console.log("✅ Get specific user successful");
        console.log("📊 User:", userResponse.data.user);
      }
    } catch (error: any) {
      console.log("❌ Get specific user failed:", error.response?.data || error.message);
    }
    
    // Test 4: Update user role
    console.log("\n5. Testing PATCH /api/admin/:userId/role (update user role)...");
    try {
      // Get a non-admin user
      const allUsersResponse = await axios.get(`${baseURL}/admin/`, { headers });
      const nonAdminUser = allUsersResponse.data.users?.find((user: any) => user.role === "user");
      
      if (nonAdminUser) {
        const updateResponse = await axios.patch(
          `${baseURL}/admin/${nonAdminUser.id}/role`,
          { role: "admin" },
          { headers }
        );
        console.log("✅ Update user role successful");
        console.log("📊 Updated user:", updateResponse.data.user);
        
        // Change back to user
        await axios.patch(
          `${baseURL}/admin/${nonAdminUser.id}/role`,
          { role: "user" },
          { headers }
        );
        console.log("✅ Reverted user role back to user");
      } else {
        console.log("⚠️ No non-admin users found to test role update");
      }
    } catch (error: any) {
      console.log("❌ Update user role failed:", error.response?.data || error.message);
    }
    
    // Test 5: Delete user
    console.log("\n6. Testing DELETE /api/admin/:userId (delete user)...");
    try {
      // Get a non-admin user to delete
      const allUsersResponse = await axios.get(`${baseURL}/admin/`, { headers });
      const userToDelete = allUsersResponse.data.users?.find((user: any) => user.role === "user");
      
      if (userToDelete) {
        const deleteResponse = await axios.delete(`${baseURL}/admin/${userToDelete.id}`, { headers });
        console.log("✅ Delete user successful");
        console.log("📊 Response:", deleteResponse.data);
        
        // Verify user was deleted
        const verifyResponse = await axios.get(`${baseURL}/admin/`, { headers });
        const userStillExists = verifyResponse.data.users?.find((user: any) => user.id === userToDelete.id);
        if (!userStillExists) {
          console.log("✅ User successfully deleted from database");
        } else {
          console.log("❌ User still exists in database");
        }
      } else {
        console.log("⚠️ No non-admin users found to test deletion");
      }
    } catch (error: any) {
      console.log("❌ Delete user failed:", error.response?.data || error.message);
    }
    
    console.log("\n🎉 User Management API tests completed!");
    
  } catch (error: any) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
testUserManagementAPI()
  .then(() => {
    console.log("✅ API tests completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ API tests failed:", error);
    process.exit(1);
  }); 