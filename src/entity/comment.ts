import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./user";
import {Post} from "./post";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    text!: string;

    @ManyToOne(() => User, user => user.comments)
    author!: User;

    @ManyToMany(() => User, user => user.likedComments)
    userLikes!: User[];

    @ManyToOne(() => Post, post => post.comments)
    post!: Post

    @CreateDateColumn()
    createDate!: Date;

    /* --- */
    likeCount!: number;
    alreadyLiked!: boolean;
    timeCreatedString!: string;
}