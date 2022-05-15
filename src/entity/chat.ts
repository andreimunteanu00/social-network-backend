import {Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./user";
import {Post} from "./post";
import {PostFile} from "./postFile";
import {Message} from "./message";

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToMany(() => User, user => user.groups)
  @JoinTable({name: 'chat_user'})
  users!: User[];

  @OneToMany(() => Message, message => message.chat)
  messages!: Message[];

}
