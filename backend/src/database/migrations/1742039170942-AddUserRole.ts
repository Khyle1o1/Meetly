import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRole1742039170942 implements MigrationInterface {
    name = 'AddUserRole1742039170942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if enum type exists before creating it
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type 
                WHERE typname = 'users_role_enum' 
                AND typtype = 'e'
            )
        `);
        
        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        }
        
        // Check if role column exists before adding it
        const roleColumnExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name = 'role'
            )
        `);
        
        if (!roleColumnExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'user'`);
            
            // Update existing admin user to have admin role
            await queryRunner.query(`UPDATE "users" SET "role" = 'admin' WHERE "email" = 'admin@meetly.com'`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the role column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
        
        // Drop the enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
    }
} 