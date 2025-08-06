import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";
import { hashValue } from "../utils/bcrypt";

async function fixAdminPasswordDirect() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    // Use query builder to update password directly without triggering hooks
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Hash the password
    const hashedPassword = await hashValue("admin123");
    
    // Update password directly in database
    await queryRunner.query(
      'UPDATE "users" SET "password" = $1 WHERE "email" = $2',
      [hashedPassword, "admin@meetly.com"]
    );

    console.log("✅ Admin password updated directly in database!");

    // Verify the update worked
    const adminUser = await AppDataSource.getRepository(User).findOne({
      where: { email: "admin@meetly.com" },
    });

    if (adminUser) {
      const isPasswordValid = await adminUser.comparePassword("admin123");
      console.log("🔐 Password verification test:", isPasswordValid ? "✅ PASS" : "❌ FAIL");
      
      if (isPasswordValid) {
        console.log("\n🎉 SUCCESS! Admin login should now work!");
        console.log("📧 Email: admin@meetly.com");
        console.log("🔑 Password: admin123");
      }
    }

    await queryRunner.release();

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
fixAdminPasswordDirect(); 