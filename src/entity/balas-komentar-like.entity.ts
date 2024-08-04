import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { BalasKomentar } from "./balas-komentar.entity";

@Entity('balas_komentar_likes')
export class BalasKomentarLikes {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    likes: number;

    @Column({ name: "user_id", nullable: true })
    user_id: string;

    @Column({ name: "komentar_id" })
    komentar_id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => BalasKomentar, komentarBalas => komentarBalas.komentarBalasLike, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "komentar_id" })
    komentarBalas: BalasKomentar;
}