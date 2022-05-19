import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";
import * as bcrypt from "bcryptjs";
import {Group} from "./group";
import {classToPlain, Exclude} from "class-transformer";
import {Post} from "./post";
import {Chat} from "./chat";
import {Comment} from "./comment"

@Entity()
@Unique(["username"])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password!: string;

  @Column()
  role!: string;

  @Column()
  email!: string;

  @Column()
  university!: string;

  @Column()
  profilePic!: string;

  @ManyToMany(() => Group, group => group.users)
  @JoinTable({name: 'group_user'})
  groups!: Group[];

  @ManyToMany(() => Group, group => group.moderators)
  moderatedGroups!: Group[];

  @ManyToMany(() => Group, group => group.pendingUsers)
  pendingGroups!: Group[];

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  @ManyToMany(() => Chat, chat => chat.users, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE"
  })
  @JoinTable({name: 'chat_user'})
  chats!: Chat[];

  @ManyToMany(() => Post, post => post.userLikes)
  @JoinTable({ name: 'user_like' })
  likedPosts!: Post[];

  @OneToMany(() => Comment, comment => comment.author)
  comments!: Comment[];

  @ManyToMany(() => Comment, comment => comment.userLikes)
  @JoinTable({ name: 'user_comment_like' })
  likedComments!: Comment[];

  hashPassword() {
      this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
      return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  getGroupsIndexArray() {
    let array = [];
    for (let group of this.groups) {
      array.push(group.id);
    }

    return array;
  }

  toJSON() {
    return classToPlain(this);
  }
}
