import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRole1742039170942 implements MigrationInterface {
    name = 'AddUserRole1742039170942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the enum type first
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        
        // Add the role column with default value
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);
        
        // Update existing admin user to have admin role
        await queryRunner.query(`UPDATE "users" SET "role" = 'admin' WHERE "email" = 'admin@meetly.com'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the role column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        
        // Drop the enum type
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
} 