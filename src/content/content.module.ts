import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ContentService } from './content.service';
import { Content } from './entities/content.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Content]),
    ],
    providers: [ContentService],
})
export class ContentModule {
}
