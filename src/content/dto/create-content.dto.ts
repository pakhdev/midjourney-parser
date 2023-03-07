import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateContentDto {

    @IsString()
    remoteId: string;

    @IsString()
    remoteUserId: string;

    @IsString()
    image: string;

    @IsString()
    permalink: string;

    @IsString()
    keywords: string;

    @IsNumber()
    width: number;

    @IsNumber()
    height: number;

    @IsBoolean()
    isUpscaled: boolean;
}
