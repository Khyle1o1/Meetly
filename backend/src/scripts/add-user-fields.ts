import "dotenv/config";
import { AppDataSource } from "../config/database.config";

async function addUserFields() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    // Add the new fields
    console.log("Adding firstName field...");
    await AppDataSource.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "firstName" character varying NOT NULL DEFAULT ''`);
    
    console.log("Adding lastName field...");
    await AppDataSource.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastName" character varying NOT NULL DEFAULT ''`);
    
    console.log("Adding middleName field...");
    await AppDataSource.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "middleName" character varying`);
    
    console.log("Adding phoneNumber field...");
    await AppDataSource.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "phoneNumber" character varying`);

    // Update existing users to have default values for firstName and lastName
    console.log("Updating existing users...");
    await AppDataSource.query(`
      UPDATE users 
      SET "firstName" = CASE 
          WHEN name IS NOT NULL AND name != '' THEN 
              CASE 
                  WHEN position(' ' in name) > 0 THEN substring(name from 1 for position(' ' in name) - 1)
                  ELSE name
              END
          ELSE ''
      END,
      "lastName" = CASE 
          WHEN name IS NOT NULL AND name != '' THEN 
              CASE 
                  WHEN position(' ' in name) > 0 THEN substring(name from position(' ' in name) + 1)
                  ELSE ''
              END
          ELSE ''
      END
      WHERE "firstName" = '' OR "lastName" = ''
    `);

    console.log("✅ All user fields added successfully!");
  } catch (error) {
    console.error("❌ Error adding user fields:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

addUserFields(); 