import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPerformanceIndexes1742039170941 implements MigrationInterface {
    name = 'AddPerformanceIndexes1742039170941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add indexes for frequently queried fields
        
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
        
        // Packages table indexes - check if table exists first
        const packagesTableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'packages'
            )
        `);
        
        if (packagesTableExists[0].exists) {
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_packages_user_id" ON "packages" ("userId")`);
            await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_packages_is_active" ON "packages" ("isActive")`);
        }
        
        // Integrations table indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_integrations_user_id" ON "integrations" ("userId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_integrations_app_type" ON "integrations" ("app_type")`);
        
        // Day availability table indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_day_availability_availability_id" ON "day_availability" ("availabilityId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_day_availability_day" ON "day_availability" ("day")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_username"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_events_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_events_slug"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_events_is_private"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_events_created_at"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_meetings_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_meetings_event_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_meetings_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_meetings_start_time"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_meetings_guest_email"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_packages_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_packages_is_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_integrations_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_integrations_app_type"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_day_availability_availability_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_day_availability_day"`);
    }
} 