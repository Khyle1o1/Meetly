import "dotenv/config";
import { AppDataSource } from "../src/config/database.config";

async function resetMigrations() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    // Drop the migrations table to reset migration state
    await AppDataSource.query(`DROP TABLE IF EXISTS "migrations"`);
    console.log("Migrations table dropped successfully");

    // Recreate the migrations table
    await AppDataSource.query(`
      CREATE TABLE "migrations" (
        "id" SERIAL PRIMARY KEY,
        "timestamp" bigint NOT NULL,
        "name" character varying NOT NULL
      )
    `);
    console.log("Migrations table recreated successfully");

    console.log("Migration state reset completed. You can now run migrations again.");
  } catch (error) {
    console.error("Error resetting migrations:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

resetMigrations(); 