import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./user";

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @ManyToMany(() => User, user => user.groups)
    @JoinTable({name: 'group_user'})
    users!: User[];

    @ManyToMany(() => User, user => user.moderatedGroups)
    @JoinTable({name: 'group_moderator'})
    moderators!: User[];

    // posts!: Post[]
}