import {Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user";
import {Group} from "./group";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column({default: ""})
    bodyText!: string;

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn()
    author!: User;

    @ManyToOne(() => Group, group => group.posts)
    @JoinColumn()
    group!: Group;

    @Column({default: 0})
    likes!: number;
}