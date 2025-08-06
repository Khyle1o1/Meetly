import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserFields1754480489313 implements MigrationInterface {
    name = 'AddUserFields1754480489313'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_integrations_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_integrations_app_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_packages_is_active"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_meetings_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_meetings_event_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_meetings_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_meetings_start_time"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_meetings_guest_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_events_user_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_events_slug"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_events_is_private"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_events_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_day_availability_availability_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_day_availability_day"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_users_username"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "middleName" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phoneNumber" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "middleName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
        await queryRunner.query(`CREATE INDEX "IDX_users_username" ON "users" ("username") `);
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_day_availability_day" ON "day_availability" ("day") `);
        await queryRunner.query(`CREATE INDEX "IDX_day_availability_availability_id" ON "day_availability" ("availabilityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_events_created_at" ON "events" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_events_is_private" ON "events" ("isPrivate") `);
        await queryRunner.query(`CREATE INDEX "IDX_events_slug" ON "events" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_events_user_id" ON "events" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_meetings_guest_email" ON "meetings" ("guestEmail") `);
        await queryRunner.query(`CREATE INDEX "IDX_meetings_start_time" ON "meetings" ("startTime") `);
        await queryRunner.query(`CREATE INDEX "IDX_meetings_status" ON "meetings" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_meetings_event_id" ON "meetings" ("eventId") `);
        await queryRunner.query(`CREATE INDEX "IDX_meetings_user_id" ON "meetings" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_packages_is_active" ON "packages" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_packages_user_id" ON "packages" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_integrations_app_type" ON "integrations" ("app_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_integrations_user_id" ON "integrations" ("userId") `);
    }

}
