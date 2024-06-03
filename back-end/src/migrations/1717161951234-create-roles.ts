import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoles1717161951234 implements MigrationInterface {
    name = 'CreateRoles1717161951234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`role\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`roles\` ADD CONSTRAINT \`FK_c8db5603420d119933bbc5c398c\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_c8db5603420d119933bbc5c398c\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
    }

}
