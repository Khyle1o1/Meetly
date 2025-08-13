import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMeetingTable1742039170939 implements MigrationInterface {
    name = 'UpdateMeetingTable1742039170939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if calendarAppType column exists before adding it
        const calendarAppTypeExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'meetings' 
                AND column_name = 'calendarAppType'
            )
        `);
        
        if (!calendarAppTypeExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "meetings" ADD "calendarAppType" character varying NOT NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "meetings" DROP COLUMN IF EXISTS "calendarAppType"`);
    }

}
