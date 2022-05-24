import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./user";

@Entity()
export class Story {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.stories)
    @JoinColumn({ name: "userId" })
    author!: User;

    @CreateDateColumn()
    createDate!: Date;

    @Column({ default: "" })
    filename!: string;

    timeCreatedString!: string;
    userProfilePhoto!: string;
}