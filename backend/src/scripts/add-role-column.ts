import "dotenv/config";
import { AppDataSource } from "../config/database.config";

async function addRoleColumn() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Check if role column already exists
    const columnExists = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);

    if (columnExists.length > 0) {
      console.log("✅ Role column already exists!");
      return;
    }

    // Create the enum type if it doesn't exist
    try {
      await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
      console.log("✅ Created users_role_enum type");
    } catch (error) {
      console.log("ℹ️ users_role_enum type already exists");
    }

    // Add the role column
    await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);
    console.log("✅ Added role column to users table");

    // Update existing admin user to have admin role
    await queryRunner.query(`UPDATE "users" SET "role" = 'admin' WHERE "email" = 'admin@meetly.com'`);
    console.log("✅ Updated admin user role to 'admin'");

    await queryRunner.release();
    console.log("🎉 Role column added successfully!");

  } catch (error) {
    console.error("❌ Error adding role column:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
addRoleColumn(); 