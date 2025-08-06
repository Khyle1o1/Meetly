import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePackagesTable1742039170940 implements MigrationInterface {
    name = 'CreatePackagesTable1742039170940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create packages table
        await queryRunner.query(`
            CREATE TABLE "packages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "price" numeric(10,2) NOT NULL,
                "duration" character varying,
                "inclusions" text,
                "imageUrl" character varying,
                "icon" character varying,
                "isActive" boolean NOT NULL DEFAULT true,
                "isRecommended" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" uuid,
                CONSTRAINT "PK_packages" PRIMARY KEY ("id")
            )
        `);

        // Create event_packages junction table
        await queryRunner.query(`
            CREATE TABLE "event_packages" (
                "eventId" uuid NOT NULL,
                "packageId" uuid NOT NULL,
                CONSTRAINT "PK_event_packages" PRIMARY KEY ("eventId", "packageId")
            )
        `);

        // Add selectedPackageId to meetings table
        await queryRunner.query(`
            ALTER TABLE "meetings" ADD "selectedPackageId" uuid
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "packages" ADD CONSTRAINT "FK_packages_user" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "event_packages" ADD CONSTRAINT "FK_event_packages_event" 
            FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "event_packages" ADD CONSTRAINT "FK_event_packages_package" 
            FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "meetings" ADD CONSTRAINT "FK_meetings_selectedPackage" 
            FOREIGN KEY ("selectedPackageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "meetings" DROP CONSTRAINT "FK_meetings_selectedPackage"`);
        await queryRunner.query(`ALTER TABLE "event_packages" DROP CONSTRAINT "FK_event_packages_package"`);
        await queryRunner.query(`ALTER TABLE "event_packages" DROP CONSTRAINT "FK_event_packages_event"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP CONSTRAINT "FK_packages_user"`);

        // Drop tables
        await queryRunner.query(`ALTER TABLE "meetings" DROP COLUMN "selectedPackageId"`);
        await queryRunner.query(`DROP TABLE "event_packages"`);
        await queryRunner.query(`DROP TABLE "packages"`);
    }
} 