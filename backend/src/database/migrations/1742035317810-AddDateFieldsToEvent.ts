import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateFieldsToEvent1742035317810 implements MigrationInterface {
    name = 'AddDateFieldsToEvent1742035317810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "startDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "events" ADD "endDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "startDate"`);
    }
} 