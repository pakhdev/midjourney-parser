import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { Content } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';

@Injectable()
export class ContentService {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Content) private readonly contentRepository: Repository<Content>
    ) {
    }

    async create(createContentDto: CreateContentDto) {

        createContentDto.remoteUserId = this.extractUserId(createContentDto.keywords);
        createContentDto.isUpscaled = this.isUpscaled(createContentDto.keywords);
        createContentDto.keywords = this.titleClear(createContentDto.keywords);

        const picture = this.contentRepository.create(createContentDto);
        await this.contentRepository.save(picture);

        if (this.configService.get('sendToAihance') === 'true') {
            await this.sendToAihance(picture);
        }
    }

    async sendToAihance(picture: Content) {
        // send
        // mark as downloaded
    }

    private isUpscaled(title: string): boolean {
        const regex = /Upscaled by <@\d+>$/;
        return regex.test(title);
    }

    private extractUserId(title: string): string {
        const match = title.match(/<@!?(\d+)>/);
        return match ? match[1] : null;
    }

    private titleClear(title: string): string {
        const index = title.lastIndexOf('-');
        title = title.slice(0, index !== -1 ? index : title.length);
        title = title.replace(/<[^>]*>/g, '');
        title = title.replace(/[^\w\d\s,:./]+/g, '');
        return title.trim().toLowerCase();
    }
}
