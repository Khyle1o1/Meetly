import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";
import { hashValue } from "../utils/bcrypt";

async function verifyAdminAccount() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);

    // Find the admin user
    const adminUser = await userRepository.findOne({
      where: { email: "admin@meetly.com" },
    });

    if (!adminUser) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("✅ Admin user found!");
    console.log("📧 Email:", adminUser.email);
    console.log("👤 Username:", adminUser.username);
    console.log("🆔 User ID:", adminUser.id);
    console.log("🔐 Role:", adminUser.role);
    console.log("🔑 Hashed Password:", adminUser.password.substring(0, 20) + "...");

    // Test password comparison
    const testPassword = "admin123";
    const isPasswordValid = await adminUser.comparePassword(testPassword);
    console.log("🔐 Password 'admin123' is valid:", isPasswordValid);

    // Test with wrong password
    const isWrongPasswordValid = await adminUser.comparePassword("wrongpassword");
    console.log("🔐 Password 'wrongpassword' is valid:", isWrongPasswordValid);

  } catch (error) {
    console.error("❌ Error verifying admin account:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
verifyAdminAccount(); 