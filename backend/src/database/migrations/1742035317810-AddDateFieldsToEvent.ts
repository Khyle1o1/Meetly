import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateFieldsToEvent1742035317810 implements MigrationInterface {
    name = 'AddDateFieldsToEvent1742035317810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if startDate column exists before adding it
        const startDateExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' 
                AND column_name = 'startDate'
            )
        `);
        
        if (!startDateExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "events" ADD "startDate" TIMESTAMP`);
        }
        
        // Check if endDate column exists before adding it
        const endDateExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' 
                AND column_name = 'endDate'
            )
        `);
        
        if (!endDateExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "events" ADD "endDate" TIMESTAMP`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN IF EXISTS "endDate"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN IF EXISTS "startDate"`);
    }
} 