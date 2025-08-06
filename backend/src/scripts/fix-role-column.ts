import "dotenv/config";
import { AppDataSource } from "../config/database.config";

async function fixRoleColumn() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Check current schema
    const currentSchema = await queryRunner.query(`SELECT current_schema()`);
    console.log("Current schema:", currentSchema);

    // Drop the existing role column if it exists (it might be in wrong schema)
    try {
      await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
      console.log("✅ Dropped existing role column");
    } catch (error) {
      console.log("ℹ️ No existing role column to drop");
    }

    // Drop the enum type if it exists
    try {
      await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum"`);
      console.log("✅ Dropped existing enum type");
    } catch (error) {
      console.log("ℹ️ No existing enum type to drop");
    }

    // Create the enum type
    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM('user', 'admin')`);
    console.log("✅ Created users_role_enum type");

    // Add the role column
    await queryRunner.query(`ALTER TABLE "users" ADD "role" "users_role_enum" NOT NULL DEFAULT 'user'`);
    console.log("✅ Added role column to users table");

    // Update existing admin user to have admin role
    await queryRunner.query(`UPDATE "users" SET "role" = 'admin' WHERE "email" = 'admin@meetly.com'`);
    console.log("✅ Updated admin user role to 'admin'");

    // Verify the column was added
    const columnExists = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);
    console.log("Role column info:", columnExists);

    // Test querying the admin user
    const adminUser = await queryRunner.query(`
      SELECT id, name, email, role
      FROM users 
      WHERE email = 'admin@meetly.com'
    `);
    console.log("Admin user info:", adminUser);

    await queryRunner.release();
    console.log("🎉 Role column fixed successfully!");

  } catch (error) {
    console.error("❌ Error fixing role column:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
fixRoleColumn(); 