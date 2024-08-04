import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Article } from "./article.entity";
import { User } from "./user.entity";

export enum Status {
    pending = 'Pending',
    diterbitkan = 'Diterbitkan',
    ditolak = 'Ditolak'
}

@Entity('publish_article_status')
export class ArticlePublish {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    user_id: string;

    @Column({ name: "article_id" })
    article_id: string;

    @Column({
        type: 'enum',
        enum: Status,
        default: Status.pending
    })
    status: Status;

    @CreateDateColumn()
    dibuat_pada: string;

    @ManyToOne(() => Article, article => article.status_publish, { onDelete: "CASCADE" })
    @JoinColumn({ name: "article_id" })
    article: Article;

    @ManyToOne(() => User, user => user.status_publish, { onDelete: "CASCADE" })
    @JoinColumn({ name: 'user_id' })
    user: User;
}