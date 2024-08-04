import 'dotenv/config';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Tag } from "./tag.entity";
import { Komentar } from "./komentar.entity";
import { ArticlePublish } from "./article-publish.entity";
import { Likes } from "./article-like.entity";

@Entity('artikel')
export class Article {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    slug: string;

    @Column()
    deskripsi_kecil: string;

    @Column({ type: 'text' })
    deskripsi_panjang: string;

    @Column()
    estimasi_membaca: string;

    @Column({ default: `${process.env.SERVER_ENDPOINT}uploads/default-article.jpg` })
    gambar: string;

    @CreateDateColumn()
    dibuat_pada: string;

    @Column({ name: "penulis" })
    penulis: string;

    @Column({ name: "tag_id" })
    tag_id: string;

    @ManyToOne(() => User, user => user.article, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'penulis' })
    user: User;

    @ManyToOne(() => Tag, tag => tag.article, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "tag_id" })
    tag: Tag;

    @OneToMany(() => Komentar, (komentar) => komentar.article)
    komentar: Komentar[];

    @OneToMany(() => ArticlePublish, (status_publish) => status_publish.article)
    status_publish: ArticlePublish[];

    @OneToMany(() => Likes, (likes) => likes.article)
    likes: Likes[];
}