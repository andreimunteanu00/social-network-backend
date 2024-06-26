import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./user";
import {Post} from "./post";

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column()
  image!: string;

  @Column()
  imageString!: string;

  @ManyToMany(() => User, user => user.groups)
  @JoinTable({name: 'group_user'})
  users!: User[];

  @ManyToMany(() => User, user => user.moderatedGroups)
  @JoinTable({name: 'group_moderator'})
  moderators!: User[];

  @ManyToMany(() => User, user => user.pendingGroups)
  @JoinTable({name: 'group_pendinguser'})
  pendingUsers!: User[];

  @OneToMany(() => Post, post => post.group)
  posts!: Post[]
}
