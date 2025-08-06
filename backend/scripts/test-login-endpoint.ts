import "dotenv/config";
import { AppDataSource } from "../src/config/database.config";
import { loginService } from "../src/services/auth.service";
import { LoginDto } from "../src/database/dto/auth.dto";

async function testLoginEndpoint() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully");

    // Test login with correct credentials
    console.log("🔑 Testing login with correct credentials...");
    const loginDto: LoginDto = {
      email: "admin@meetly.com",
      password: "admin123"
    };

    try {
      const result = await loginService(loginDto);
      console.log("✅ Login successful!");
      console.log("👤 User:", result.user.username);
      console.log("🔐 Role:", result.user.role);
      console.log("🆔 User ID:", result.user.id);
      console.log("🎫 Token received:", !!result.accessToken);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("❌ Login failed:", errorMessage);
    }

    // Test login with wrong password
    console.log("🔑 Testing login with wrong password...");
    const wrongLoginDto: LoginDto = {
      email: "admin@meetly.com",
      password: "wrongpassword"
    };

    try {
      await loginService(wrongLoginDto);
      console.log("❌ Wrong password was accepted (this is bad)!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("✅ Wrong password correctly rejected:", errorMessage);
    }

    // Test login with non-existent email
    console.log("🔑 Testing login with non-existent email...");
    const nonExistentLoginDto: LoginDto = {
      email: "nonexistent@meetly.com",
      password: "admin123"
    };

    try {
      await loginService(nonExistentLoginDto);
      console.log("❌ Non-existent email was accepted (this is bad)!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("✅ Non-existent email correctly rejected:", errorMessage);
    }

  } catch (error) {
    console.error("❌ Error testing login endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("🔌 Database connection closed.");
    }
  }
}

// Run the script
testLoginEndpoint()
  .then(() => {
    console.log("🎉 Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  }); 