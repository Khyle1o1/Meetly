import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShowDateRangeToEvent1742035317820 implements MigrationInterface {
    name = 'AddShowDateRangeToEvent1742035317820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "showDateRange" BOOLEAN NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "showDateRange"`);
    }
} 