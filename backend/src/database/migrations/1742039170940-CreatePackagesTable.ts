import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePackagesTable1742039170940 implements MigrationInterface {
    name = 'CreatePackagesTable1742039170940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if packages table exists before creating it
        const packagesTableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'packages'
            )
        `);
        
        if (!packagesTableExists[0].exists) {
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
        }

        // Check if event_packages table exists before creating it
        const eventPackagesTableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'event_packages'
            )
        `);
        
        if (!eventPackagesTableExists[0].exists) {
            // Create event_packages junction table
            await queryRunner.query(`
                CREATE TABLE "event_packages" (
                    "eventId" uuid NOT NULL,
                    "packageId" uuid NOT NULL,
                    CONSTRAINT "PK_event_packages" PRIMARY KEY ("eventId", "packageId")
                )
            `);
        }

        // Check if selectedPackageId column exists before adding it
        const selectedPackageIdExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'meetings' 
                AND column_name = 'selectedPackageId'
            )
        `);
        
        if (!selectedPackageIdExists[0].exists) {
            // Add selectedPackageId to meetings table
            await queryRunner.query(`
                ALTER TABLE "meetings" ADD "selectedPackageId" uuid
            `);
        }

        // Add foreign key constraints only if they don't exist
        const constraints = [
            { name: 'FK_packages_user', table: 'packages', column: 'userId', refTable: 'users', refColumn: 'id' },
            { name: 'FK_event_packages_event', table: 'event_packages', column: 'eventId', refTable: 'events', refColumn: 'id' },
            { name: 'FK_event_packages_package', table: 'event_packages', column: 'packageId', refTable: 'packages', refColumn: 'id' },
            { name: 'FK_meetings_selectedPackage', table: 'meetings', column: 'selectedPackageId', refTable: 'packages', refColumn: 'id' }
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
                let onDeleteAction = 'NO ACTION';
                if (constraint.name === 'FK_packages_user') {
                    onDeleteAction = 'CASCADE';
                } else if (constraint.name === 'FK_event_packages_event' || constraint.name === 'FK_event_packages_package') {
                    onDeleteAction = 'CASCADE';
                } else if (constraint.name === 'FK_meetings_selectedPackage') {
                    onDeleteAction = 'SET NULL';
                }
                
                await queryRunner.query(`
                    ALTER TABLE "${constraint.table}" ADD CONSTRAINT "${constraint.name}" 
                    FOREIGN KEY ("${constraint.column}") REFERENCES "${constraint.refTable}"("${constraint.refColumn}") ON DELETE ${onDeleteAction} ON UPDATE NO ACTION
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`ALTER TABLE "meetings" DROP CONSTRAINT IF EXISTS "FK_meetings_selectedPackage"`);
        await queryRunner.query(`ALTER TABLE "event_packages" DROP CONSTRAINT IF EXISTS "FK_event_packages_package"`);
        await queryRunner.query(`ALTER TABLE "event_packages" DROP CONSTRAINT IF EXISTS "FK_event_packages_event"`);
        await queryRunner.query(`ALTER TABLE "packages" DROP CONSTRAINT IF EXISTS "FK_packages_user"`);

        // Drop tables
        await queryRunner.query(`ALTER TABLE "meetings" DROP COLUMN IF EXISTS "selectedPackageId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "event_packages"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "packages"`);
    }
} 