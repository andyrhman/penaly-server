import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Article } from "./article.entity";

@Entity('article_likes')
export class Likes {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    likes: number;

    @Column({ name: "user_id", nullable: true })
    user_id: string;

    @Column({ name: "article_id" })
    article_id: string;

    @ManyToOne(() => User, user => user.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Article, article => article.likes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "article_id" })
    article: Article;
}