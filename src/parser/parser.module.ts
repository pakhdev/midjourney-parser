import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { ParserController } from './parser.controller';
import { ConfigService } from '@nestjs/config';

@Module({
    controllers: [ParserController],
    providers: [ParserService, ConfigService],
})
export class ParserModule {
}
