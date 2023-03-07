import { Injectable } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';

@Injectable()
export class ContentService {
    create(createContentDto: CreateContentDto) {
        return 'This action adds a new content';
    }

    async uploaded(id: number) {

    }
}
