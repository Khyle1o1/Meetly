import { AppDataSource } from "../config/database.config";

async function addIndexes() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    console.log("Adding performance indexes...");

    // Users table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_username" ON "users" ("username")`);
    
    // Events table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_user_id" ON "events" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_slug" ON "events" ("slug")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_is_private" ON "events" ("isPrivate")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_events_created_at" ON "events" ("createdAt")`);
    
    // Meetings table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_meetings_user_id" ON "meetings" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_meetings_event_id" ON "meetings" ("eventId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_meetings_status" ON "meetings" ("status")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_meetings_start_time" ON "meetings" ("startTime")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_meetings_guest_email" ON "meetings" ("guestEmail")`);
    
    // Packages table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_packages_user_id" ON "packages" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_packages_is_active" ON "packages" ("isActive")`);
    
    // Integrations table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_integrations_user_id" ON "integrations" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_integrations_app_type" ON "integrations" ("app_type")`);
    
    // Day availability table indexes
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_day_availability_availability_id" ON "day_availability" ("availabilityId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_day_availability_day" ON "day_availability" ("day")`);

    console.log("Performance indexes added successfully!");
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
    process.exit(0);
  } catch (error) {
    console.error("Error adding indexes:", error);
    process.exit(1);
  }
}

addIndexes(); 