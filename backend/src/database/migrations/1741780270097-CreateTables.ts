import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1741780270097 implements MigrationInterface {
    name = 'CreateTables1741780270097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and create enum types only if they don't exist
        const enumTypes = [
            { name: 'integrations_provider_enum', values: ['GOOGLE', 'ZOOM'] },
            { name: 'integrations_category_enum', values: ['CALENDAR_AND_VIDEO_CONFERENCING', 'VIDEO_CONFERENCING', 'CALENDAR'] },
            { name: 'integrations_app_type_enum', values: ['GOOGLE_MEET_AND_CALENDAR', 'ZOOM_MEETING', 'OUTLOOK_CALENDAR'] },
            { name: 'meetings_status_enum', values: ['SCHEDULED', 'CANCELLED'] },
            { name: 'events_locationtype_enum', values: ['GOOGLE_MEET_AND_CALENDAR', 'ZOOM_MEETING'] },
            { name: 'day_availability_day_enum', values: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] }
        ];

        for (const enumType of enumTypes) {
            const exists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT 1 FROM pg_type 
                    WHERE typname = $1 
                    AND typtype = 'e'
                )
            `, [enumType.name]);
            
            if (!exists[0].exists) {
                await queryRunner.query(`CREATE TYPE "public"."${enumType.name}" AS ENUM(${enumType.values.map(v => `'${v}'`).join(', ')})`);
            }
        }

        // Create tables with IF NOT EXISTS
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "integrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" "public"."integrations_provider_enum" NOT NULL, "category" "public"."integrations_category_enum" NOT NULL, "app_type" "public"."integrations_app_type_enum" NOT NULL, "access_token" character varying NOT NULL, "refresh_token" character varying, "expiry_date" bigint, "metadata" json NOT NULL, "isConnected" boolean NOT NULL DEFAULT true, "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9adcdc6d6f3922535361ce641e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "meetings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "guestName" character varying NOT NULL, "guestEmail" character varying NOT NULL, "additionalInfo" character varying, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "meetLink" character varying NOT NULL, "calendarEventId" character varying NOT NULL, "status" "public"."meetings_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "eventId" uuid, CONSTRAINT "PK_aa73be861afa77eb4ed31f3ed57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "slug" character varying NOT NULL, "isPrivate" character varying NOT NULL DEFAULT false, "locationType" "public"."events_locationtype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "imageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "availabilityId" uuid, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_19bdac20a255ec8d172c129158" UNIQUE ("availabilityId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "timeGap" integer NOT NULL DEFAULT '30', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05a8158cf1112294b1c86e7f1d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "day_availability" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "day" "public"."day_availability_day_enum" NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "availabilityId" uuid, CONSTRAINT "PK_dfce5f014ac44f7335585f7d002" PRIMARY KEY ("id"))`);

        // Add foreign key constraints only if they don't exist
        const constraints = [
            { name: 'FK_c32758a01d05d0d1da56fa46ae1', table: 'integrations', column: 'userId', refTable: 'users', refColumn: 'id' },
            { name: 'FK_4b70ab8832f1d7f9a7387d14307', table: 'meetings', column: 'userId', refTable: 'users', refColumn: 'id' },
            { name: 'FK_2e6f88379a7a198af6c0ba2ca02', table: 'meetings', column: 'eventId', refTable: 'events', refColumn: 'id' },
            { name: 'FK_9929fa8516afa13f87b41abb263', table: 'events', column: 'userId', refTable: 'users', refColumn: 'id' },
            { name: 'FK_19bdac20a255ec8d172c1291584', table: 'users', column: 'availabilityId', refTable: 'availability', refColumn: 'id' },
            { name: 'FK_6cf863b682dbf962dec56b3fb37', table: 'day_availability', column: 'availabilityId', refTable: 'availability', refColumn: 'id' }
        ];

        for (const constraint of constraints) {
            const exists = await queryRunner.query(`
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = $1 
                    AND table_name = $2
                )
            `, [constraint.name, constraint.table]);
            
            if (!exists[0].exists) {
                await queryRunner.query(`ALTER TABLE "${constraint.table}" ADD CONSTRAINT "${constraint.name}" FOREIGN KEY ("${constraint.column}") REFERENCES "${constraint.refTable}"("${constraint.refColumn}") ON DELETE NO ACTION ON UPDATE NO ACTION`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "day_availability" DROP CONSTRAINT "FK_6cf863b682dbf962dec56b3fb37"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_19bdac20a255ec8d172c1291584"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_9929fa8516afa13f87b41abb263"`);
        await queryRunner.query(`ALTER TABLE "meetings" DROP CONSTRAINT "FK_2e6f88379a7a198af6c0ba2ca02"`);
        await queryRunner.query(`ALTER TABLE "meetings" DROP CONSTRAINT "FK_4b70ab8832f1d7f9a7387d14307"`);
        await queryRunner.query(`ALTER TABLE "integrations" DROP CONSTRAINT "FK_c32758a01d05d0d1da56fa46ae1"`);
        await queryRunner.query(`DROP TABLE "day_availability"`);
        await queryRunner.query(`DROP TYPE "public"."day_availability_day_enum"`);
        await queryRunner.query(`DROP TABLE "availability"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."events_locationtype_enum"`);
        await queryRunner.query(`DROP TABLE "meetings"`);
        await queryRunner.query(`DROP TYPE "public"."meetings_status_enum"`);
        await queryRunner.query(`DROP TABLE "integrations"`);
        await queryRunner.query(`DROP TYPE "public"."integrations_app_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."integrations_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."integrations_provider_enum"`);
    }

}
