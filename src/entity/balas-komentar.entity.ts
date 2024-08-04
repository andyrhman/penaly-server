import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Komentar } from "./komentar.entity";
import { Article } from "./article.entity";
import { User } from "./user.entity";
import { BalasKomentarLikes } from "./balas-komentar-like.entity";

@Entity('balas_komentar')
export class BalasKomentar {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    reply: string;

    @Column({ name: "komentar_id" })
    komentar_id: string;

    @Column({ name: "user_id" })
    user_id: string;

    @CreateDateColumn()
    dibuat_pada: string;

    @ManyToOne(() => Komentar, (komentar) => komentar.balasKomentar, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "komentar_id" })
    komentar: Komentar;

    @ManyToOne(() => User, (user) => user.balasKomentar, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" }) 
    user: User;

    @OneToMany(() => BalasKomentarLikes, komentarBalasLike => komentarBalasLike.komentarBalas)
    komentarBalasLike: BalasKomentarLikes[];
}