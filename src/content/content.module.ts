import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { ContentService } from './content.service';
import { Content } from './entities/content.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Content]),
    ],
    providers: [ContentService, ConfigService],
    exports: [ContentService],
})
export class ContentModule {
}
