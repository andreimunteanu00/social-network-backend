import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn, ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import {User} from "./user";
import {Group} from "./group";
import {PostFile} from "./postFile";
import {Comment} from "./comment";

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

    @CreateDateColumn()
    createDate!: Date;

    @OneToMany(() => PostFile, postFile => postFile.post)
    postFiles!: PostFile[]

    @ManyToMany(() => User, user => user.likedPosts)
    userLikes!: User[]

    @OneToMany(() => Comment, comment => comment.post)
    comments!: Comment[];

    /* --- */
    likeCount!: number;
    alreadyLiked!: boolean;
    userLikesIds!: number[];
    timeCreatedString!: string;
}