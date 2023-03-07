import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ParserService } from './parser.service';
import { ParserController } from './parser.controller';
import { ContentModule } from '../content/content.module';

@Module({
    imports: [ContentModule],
    controllers: [ParserController],
    providers: [ParserService, ConfigService],
})
export class ParserModule {
}
