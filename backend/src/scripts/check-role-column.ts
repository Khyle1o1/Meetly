import "dotenv/config";
import { AppDataSource } from "../config/database.config";

async function checkRoleColumn() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Check if role column exists
    const columnExists = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);

    console.log("Role column info:", columnExists);

    // Check the admin user's role
    const adminUser = await queryRunner.query(`
      SELECT id, name, email, role
      FROM users 
      WHERE email = 'admin@meetly.com'
    `);

    console.log("Admin user info:", adminUser);

    // Check all users and their roles
    const allUsers = await queryRunner.query(`
      SELECT id, name, email, role
      FROM users
    `);

    console.log("All users and their roles:", allUsers);

    await queryRunner.release();

  } catch (error) {
    console.error("❌ Error checking role column:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
checkRoleColumn(); 