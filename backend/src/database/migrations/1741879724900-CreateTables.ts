import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1741879724900 implements MigrationInterface {
    name = 'CreateTables1741879724900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if isPrivate column exists
        const isPrivateExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' 
                AND column_name = 'isPrivate'
            )
        `);
        
        if (isPrivateExists[0].exists) {
            // Check the current data type of the column
            const columnInfo = await queryRunner.query(`
                SELECT data_type FROM information_schema.columns 
                WHERE table_name = 'events' 
                AND column_name = 'isPrivate'
            `);
            
            // Only modify if it's not already boolean
            if (columnInfo[0] && columnInfo[0].data_type !== 'boolean') {
                await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "isPrivate"`);
                await queryRunner.query(`ALTER TABLE "events" ADD "isPrivate" boolean NOT NULL DEFAULT false`);
            }
        } else {
            // Column doesn't exist, create it
            await queryRunner.query(`ALTER TABLE "events" ADD "isPrivate" boolean NOT NULL DEFAULT false`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if isPrivate column exists
        const isPrivateExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'events' 
                AND column_name = 'isPrivate'
            )
        `);
        
        if (isPrivateExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "isPrivate"`);
            await queryRunner.query(`ALTER TABLE "events" ADD "isPrivate" character varying NOT NULL DEFAULT false`);
        }
    }

}
