import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";
import * as bcrypt from "bcryptjs";
import {Group} from "./group";
import {classToPlain, Exclude} from "class-transformer";
import {Post} from "./post";

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
  groups!: Group[];

  @ManyToMany(() => Group, group => group.moderators)
  moderatedGroups!: Group[];

  @ManyToMany(() => Group, group => group.pendingUsers)
  pendingGroups!: Group[];

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  hashPassword() {
      this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
      return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  toJSON() {
    return classToPlain(this);
  }
}
