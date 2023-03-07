import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParserModule } from './parser/parser.module';
import { ContentModule } from './content/content.module';
import { envConfiguration } from './config/env.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [envConfiguration],
        }),
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.MYSQL_HOST,
            port: +process.env.MYSQL_PORT,
            username: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB_NAME,
            autoLoadEntities: true,
            synchronize: true,
        }),
        ParserModule,
        ContentModule,

    ],
})
export class AppModule {
}
