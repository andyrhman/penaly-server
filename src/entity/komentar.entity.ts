import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Article } from "./article.entity";
import { User } from "./user.entity";
import { BalasKomentar } from "./balas-komentar.entity";
import { KomentarLikes } from "./komentar-like.entity";

@Entity('komentar')
export class Komentar {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    komentar: string;

    @Column({ name: "user_id" })
    user_id: string;

    @Column({ name: "article_id" })
    article_id: string;

    @CreateDateColumn()
    dibuat_pada: string;

    @ManyToOne(() => Article, (article) => article.komentar, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "article_id" })
    article: Article;

    @ManyToOne(() => User, (user) => user.komentar, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => BalasKomentar, balasKomentar => balasKomentar.komentar)
    balasKomentar: BalasKomentar[];

    @OneToMany(() => KomentarLikes, komentarLike => komentarLike.komentar)
    komentarLike: KomentarLikes[];
}