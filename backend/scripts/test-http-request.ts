import "dotenv/config";
import axios from "axios";

async function testHttpRequest() {
  try {
    console.log("🧪 Testing HTTP request to login endpoint...");
    
    const loginData = {
      email: "admin@meetly.com",
      password: "admin123"
    };

    console.log("📤 Sending request to: http://localhost:8000/api/auth/login");
    console.log("📦 Request data:", loginData);

    const response = await axios.post("http://localhost:8000/api/auth/login", loginData, {
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:5173"
      }
    });

    console.log("✅ Request successful!");
    console.log("📊 Status:", response.status);
    console.log("📄 Response data:", response.data);

  } catch (error: any) {
    console.log("❌ Request failed!");
    console.log("📊 Status:", error.response?.status);
    console.log("📄 Response data:", error.response?.data);
    console.log("🔍 Error message:", error.message);
  }
}

// Run the test
testHttpRequest()
  .then(() => {
    console.log("🎉 Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  }); 