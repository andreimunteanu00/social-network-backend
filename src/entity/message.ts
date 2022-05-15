import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user";
import {Post} from "./post";
import {Chat} from "./chat";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createDate!: Date;

  @Column()
  sender!: string;

  @Column()
  message!: string;

  @ManyToOne(() => Chat, chat => chat.messages)
  chat!: Chat;

}
