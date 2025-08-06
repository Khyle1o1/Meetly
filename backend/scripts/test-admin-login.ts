import "dotenv/config";
import { AppDataSource } from "../src/config/database.config";
import { User } from "../src/database/entities/user.entity";

async function testAdminLogin() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);

    // Find admin user
    const adminUser = await userRepository.findOne({
      where: { email: "admin@meetly.com" },
    });

    if (!adminUser) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("👤 Found admin user:");
    console.log("📧 Email:", adminUser.email);
    console.log("👤 Username:", adminUser.username);
    console.log("🔐 Role:", adminUser.role);
    console.log("🆔 User ID:", adminUser.id);

    // Test password comparison
    console.log("🔑 Testing password comparison...");
    const isPasswordValid = await adminUser.comparePassword("admin123");
    
    if (isPasswordValid) {
      console.log("✅ Password is valid!");
    } else {
      console.log("❌ Password is invalid!");
    }

    // Test with wrong password
    console.log("🔑 Testing with wrong password...");
    const isWrongPasswordValid = await adminUser.comparePassword("wrongpassword");
    
    if (isWrongPasswordValid) {
      console.log("❌ Wrong password was accepted (this is bad)!");
    } else {
      console.log("✅ Wrong password correctly rejected!");
    }

  } catch (error) {
    console.error("❌ Error testing admin login:", error);
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
testAdminLogin()
  .then(() => {
    console.log("🎉 Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Test failed:", error);
    process.exit(1);
  }); 