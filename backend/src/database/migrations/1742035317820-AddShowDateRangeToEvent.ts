import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShowDateRangeToEvent1742035317820 implements MigrationInterface {
    name = 'AddShowDateRangeToEvent1742035317820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if showDateRange column exists before adding it
        const showDateRangeExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' 
                AND column_name = 'showDateRange'
            )
        `);
        
        if (!showDateRangeExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "events" ADD "showDateRange" BOOLEAN NOT NULL DEFAULT false`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN IF EXISTS "showDateRange"`);
    }
} 