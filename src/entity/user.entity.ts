import 'dotenv/config';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Role } from "./role.entity";
import { Article } from "./article.entity";
import { Komentar } from "./komentar.entity";
import { ArticlePublish } from "./article-publish.entity";
import { Likes } from "./article-like.entity";
import { BalasKomentar } from "./balas-komentar.entity";
import { KomentarLikes } from "./komentar-like.entity";

@Entity("pengguna")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    namaLengkap: string;

    @Column({ default: `${process.env.SERVER_ENDPOINT}uploads/default-profile.jpg` })
    foto: string;

    @Column({ default: "Pengguna website penaly yang ingin mengetahui lebih banyak tentang website ini.", nullable: true })
    bio: string;

    @Column()
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @CreateDateColumn()
    dibuat_pada: string;

    @UpdateDateColumn()
    diupdate_pada: string;

    @Column({ name: "role_id" })
    role_id: number;

    @ManyToOne(() => Role)
    @JoinColumn({ name: "role_id" })
    role: Role;

    @OneToMany(() => Article, article => article.user)
    article: Article[];

    @OneToMany(() => Komentar, (komentar) => komentar.article)
    komentar: Komentar[];

    @OneToMany(() => ArticlePublish, (status_publish) => status_publish.user)
    status_publish: ArticlePublish[];

    @OneToMany(() => Likes, (likes) => likes.user)
    likes: Likes[];

    @OneToMany(() => BalasKomentar, balasKomentar => balasKomentar.user)
    balasKomentar: BalasKomentar[];

    @OneToMany(() => KomentarLikes, komentarLikes => komentarLikes.user)
    komentarLikes: KomentarLikes[];
}