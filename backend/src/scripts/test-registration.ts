import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User, UserRole } from "../database/entities/user.entity";
import { registerService } from "../services/auth.service";

async function testRegistration() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);

    // Test registration data
    const testUserData = {
      firstName: "Test",
      lastName: "User",
      middleName: "",
      email: "testuser@example.com",
      password: "password123",
      phoneNumber: "1234567890"
    };

    console.log("🧪 Testing user registration...");
    console.log("Test data:", testUserData);

    // Check if test user already exists
    const existingUser = await userRepository.findOne({
      where: { email: testUserData.email }
    });

    if (existingUser) {
      console.log("⚠️  Test user already exists, deleting...");
      await userRepository.remove(existingUser);
    }

    // Test registration
    const result = await registerService(testUserData);
    console.log("✅ Registration successful!");
    console.log("User created:", result.user);
    console.log("Role assigned:", result.user.role);

    if (result.user.role === UserRole.USER) {
      console.log("✅ Correct role assigned: USER");
    } else {
      console.log("❌ Incorrect role assigned:", result.user.role);
    }

    // Clean up - delete test user
    console.log("🧹 Cleaning up test user...");
    const testUser = await userRepository.findOne({
      where: { email: testUserData.email }
    });
    if (testUser) {
      await userRepository.remove(testUser);
      console.log("✅ Test user cleaned up");
    }

  } catch (error) {
    console.error("❌ Error testing registration:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
testRegistration(); 