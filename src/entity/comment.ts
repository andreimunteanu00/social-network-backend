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
import {classToPlain, Exclude} from "class-transformer";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    text!: string;

    @ManyToOne(() => User, user => user.comments)
    @Exclude({ toPlainOnly: true })
    author!: User;

    @ManyToMany(() => User, user => user.likedComments)
    userLikes!: User[];

    @ManyToOne(() => Post, post => post.comments)
    @Exclude({ toPlainOnly: true })
    post!: Post

    @CreateDateColumn()
    createDate!: Date;

    /* --- */
    likeCount!: number;
    alreadyLiked!: boolean;
    timeCreatedString!: string;

    toJSON() {
        return classToPlain(this);
    }
}