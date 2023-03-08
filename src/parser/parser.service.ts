import { Injectable, Logger } from '@nestjs/common';
import { parsingKeywords } from './data/parsing-keywords.data';
import { ConfigService } from '@nestjs/config';
import { ContentService } from '../content/content.service';

@Injectable()
export class ParserService {

    constructor(
        private readonly configService: ConfigService,
        private readonly contentService: ContentService,
    ) {
    }

    private logger = new Logger('Parser');
    private isStopped = false;
    private readonly searchKeywords = parsingKeywords;
    private guildId = this.configService.get('guildId');
    private channelId = this.configService.get('channelId');
    private pauseBetween = +this.configService.get('pauseBetween');
    private maxAttempts = +this.configService.get('maxAttempts');
    private maxThreads = +this.configService.get('maxThreads');
    private readUntil = +this.configService.get('readUntil');
    private authorization = this.configService.get('authorization');
    private superProperties = this.configService.get('superProperties');
    private currentKeyword = this.searchKeywords[0];
    private lastQueryTime = 0;
    private currentPage = 0;
    private totalMessages = 0;
    private openedThreads = 0;

    ///////////////////////////////////////////////////////////////
    // Functions used by controller
    async sendToAihance() {
        this.isStopped = false;
        this.contentService.findNotUploaded();
    }

    async parseContent() {
        this.isStopped = false;
        this.firstPage();
    }

    async stopAll() {
        this.isStopped = true;
    }

    ///////////////////////////////////////////////////////////////
    // Page/keyword switching functions
    private firstPage = () => this.queryRunner(0);

    private nextPage = () => this.queryRunner(++this.currentPage);

    private reloadPage = (page: number, attempt: number) => this.queryRunner(page, attempt);

    private nextKeyword() {
        const usingIndex = this.searchKeywords.findIndex(phrase => phrase === this.currentKeyword);
        const nextIndex = usingIndex + 1 === this.searchKeywords.length ? 0 : usingIndex + 1;
        this.currentKeyword = this.searchKeywords[nextIndex];
        this.totalMessages = 0;
        this.currentPage = 0;
        this.firstPage();
    }

    ///////////////////////////////////////////////////////////////
    // Time related functions
    private timeDiff = () => new Date().getTime() - this.lastQueryTime;

    private setTimestamp(increment) {
        this.lastQueryTime = new Date().getTime() + increment;
    }

    private queryRunner(page: number, attempt = 0) {
        this.openedThreads++;
        if (this.timeDiff() >= this.pauseBetween) { // Instant start
            this.setTimestamp(0);
            this.searchQuery(page, attempt);
        } else { // Delayed start
            const startIn = this.lastQueryTime + this.pauseBetween - new Date().getTime();
            this.setTimestamp(startIn);
            setTimeout(() => this.searchQuery(page, attempt), startIn);
        }
    }

    ///////////////////////////////////////////////////////////////
    // Queries related functions
    private runThreads() {
        for (let i = 0; i < this.maxThreads; i++) {
            this.nextPage();
        }
    }

    private searchQuery(page: number, attempt: number) {
        const offset = page * 25;
        if (attempt >= this.maxAttempts) {
            this.noMoreAttempts();
        } else if (
            offset < this.readUntil &&
            (this.currentPage === 0 || offset < this.totalMessages)
        ) {
            this.doFetch(page, attempt);
        } else {

            if (this.openedThreads > 1) {
                this.logger.log(`Connection killed, waiting for search switching`);
                this.openedThreads--;
            } else {
                this.nextKeyword();
                this.openedThreads--;
            }

        }
    }

    private async doFetch(page: number, attempt: number) {
        const offset = page * 25;
        const response = await fetch(`https://discord.com/api/v9/guilds/${ this.guildId }/messages/search?content=${ this.currentKeyword }&offset=${ offset }`, {
            'credentials': 'include',
            'headers': {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/109.0',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.5',
                'Authorization': this.authorization,
                'X-Super-Properties': this.superProperties,
                'X-Discord-Locale': 'en',
                'X-Debug-Options': 'bugReporterEnabled',
                'Alt-Used': 'discord.com',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
            },
            'referrer': `https://discord.com/channels/${ this.guildId }/${ this.channelId }`,
            'method': 'GET',
            'mode': 'cors',
        });
        if (response.status === 200) {
            const json = await response.json();
            json.messages.length ? this.processFetchResult(json, page) : this.processEmptyResult(page, attempt);
        } else {
            console.log(response.status);
            console.log(`https://discord.com/api/v9/guilds/${ this.guildId }/messages/search?content=${ this.currentKeyword }&offset=${ offset }`);
            this.setLongPause(page, attempt);
        }
    }

    private async processFetchResult(json, page: number): Promise<void> {
        this.totalMessages = Number(json.total_results) > this.totalMessages ? Number(json.total_results) : this.totalMessages;
        for (let message of json.messages) {
            message = message[0];
            if (
                message.author &&
                message.author.username === 'Midjourney Bot' &&
                message.attachments &&
                message.attachments.length === 1 &&
                message.attachments[0].url &&
                message.attachments[0].content_type === 'image/png'
            ) {
                const guildId = this.guildId;
                const channelId = message.channel_id;
                const messageId = message.id;

                const keywords = message.content;
                const link = `${ guildId }/${ channelId }/${ messageId }`;
                const imageUrl = message.attachments[0].url;
                const width = message.attachments[0].width;
                const height = message.attachments[0].height;

                await this.contentService.create({
                    remoteId: messageId,
                    remoteUserId: '0',
                    image: imageUrl,
                    permalink: link,
                    keywords,
                    width,
                    height,
                    isUpscaled: false,
                });
            }
        }

        this.openedThreads--;

        if (page === 0) {
            this.logger.log(`Initial page downloaded (${ this.currentKeyword })`);
            this.runThreads();
        } else {
            this.logger.log(`Page ${ page } (${ this.currentKeyword }) downloaded`);
            this.nextPage();
        }
    }

    private processEmptyResult(page: number, attempt: number) {
        this.logger.warn(`Page ${ this.currentPage } (${ this.currentKeyword }): empty. Restarting query`);
        this.openedThreads--;
        this.reloadPage(page, attempt);
    }

    private setLongPause(page: number, attempt: number) {
        this.logger.error(`Page ${ this.currentPage } (${ this.currentKeyword }): loading failed. Restarting query`);
        this.openedThreads--;
        this.setTimestamp(120000);
        this.reloadPage(page, attempt);
    }

    private noMoreAttempts() {
        this.logger.error(`Page ${ this.currentPage } (${ this.currentKeyword }): The maximum of attempts exceeded, loading next page`);
        this.openedThreads--;
        this.nextPage();
    }
}
