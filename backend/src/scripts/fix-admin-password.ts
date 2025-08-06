import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";
import { hashValue } from "../utils/bcrypt";

async function fixAdminPassword() {
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

    // Update the password
    console.log("🔄 Updating admin password...");
    const newHashedPassword = await hashValue("admin123");
    adminUser.password = newHashedPassword;

    // Save the updated user
    await userRepository.save(adminUser);
    console.log("✅ Admin password updated successfully!");

    // Verify the password works
    const testPassword = "admin123";
    const isPasswordValid = await adminUser.comparePassword(testPassword);
    console.log("🔐 Password verification test:", isPasswordValid ? "✅ PASS" : "❌ FAIL");

    console.log("\n📋 Admin Login Details:");
    console.log("📧 Email: admin@meetly.com");
    console.log("🔑 Password: admin123");

  } catch (error) {
    console.error("❌ Error fixing admin password:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
fixAdminPassword(); 