import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('follow')
export class Pengikut {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: "user_id" })
    user_id: string;

    @Column({ name: "follower_user_id", nullable: true })
    follower_user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "follower_user_id" })
    follower: string;
}