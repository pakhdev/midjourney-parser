import { Controller, Get } from '@nestjs/common';
import { ParserService } from './parser.service';

@Controller('parser')
export class ParserController {
    constructor(private readonly parserService: ParserService) {
    }

    @Get('toAihance')
    sendToAihance() {
        return this.parserService.sendToAihance();
    }

    @Get('parse')
    parseContent() {
        return this.parserService.parseContent();
    }

    @Get('stop')
    stopAll() {
        return this.parserService.stopAll();
    }

}
