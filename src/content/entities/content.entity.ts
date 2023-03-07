import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'content' })
export class Content {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('bigint', { unique: true })
    remoteId: string;

    @Column('bigint')
    remoteUserId: string;

    @Column('varchar', { length: 255, unique: true })
    image: string;

    @Column('varchar', { length: 255, unique: true })
    permalink: string;

    @Column({ default: false })
    downloaded: boolean;

    @Column({ type: 'text' })
    keywords: string;

    @Column()
    width: number;

    @Column()
    height: number;

    @Column()
    isUpscaled: boolean;
}
