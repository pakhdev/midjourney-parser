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
        @InjectRepository(Content) private readonly contentRepository: Repository<Content>,
    ) {
    }

    public isStopped = true;

    async create(createContentDto: CreateContentDto) {

        const idExists = await this.contentRepository.findOneBy({ remoteId: createContentDto.remoteId });
        if (idExists)
            return false;

        createContentDto.remoteUserId = this.extractUserId(createContentDto.keywords);
        createContentDto.isUpscaled = this.isUpscaled(createContentDto.keywords);
        createContentDto.keywords = this.titleClear(createContentDto.keywords);

        const picture = this.contentRepository.create(createContentDto);
        await this.contentRepository.save(picture);

        if (this.configService.get('sendToAihance') === 'true') {
            await this.sendToAihance(picture);
        }
    }

    async findNotUploaded() {
        this.isStopped = false;
        const pictures = await this.contentRepository.find({
            where: {
                downloaded: false,
            },
            take: 500,
        });
        for (const picture of pictures) {
            if (this.isStopped) break;
            await this.sendToAihance(picture);
        }
    }

    async sendToAihance(picture: Content) {

        const token = this.configService.get('aihanceToken');
        const aihanceUrl = this.configService.get('aihanceUrl');

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ token }`,
            },
            body: JSON.stringify({
                keywords: picture.keywords,
                width: picture.width,
                height: picture.height,
                url: picture.image,
                isUpscaled: picture.isUpscaled,
                permalink: picture.permalink,
                author_id: picture.remoteUserId,
            }),
        };

        await fetch(aihanceUrl, options)
            .catch(error => {
                console.error('Error:', error);
            });

        const downloaded = await this.contentRepository.preload({
            ...picture,
            downloaded: true,
        });
        await this.contentRepository.save(downloaded);
    }

    private isUpscaled(title: string): boolean {
        const regex = /Upscaled(?: \([^)]*\))? by <@\d+>/;
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
        title = title.replace(/[^\w\d\s,:/]+/g, '');
        title = title.replace(/,/g, ' ');
        title = title.replace(/\s{2,}/g, ' ');
        return title.trim().toLowerCase();
    }
}
