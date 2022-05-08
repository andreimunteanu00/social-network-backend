import {Column, Entity, ManyToMany, PrimaryGeneratedColumn, Unique} from "typeorm";
import * as bcrypt from "bcryptjs";
import {Group} from "./group";
import {classToPlain, Exclude} from "class-transformer";

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

  @ManyToMany(() => Group, group => group.users)
  groups!: Group[];

  @ManyToMany(() => Group, group => group.moderators)
  moderatedGroups!: Group[];

  @ManyToMany(() => Group, group => group.pendingUsers)
  pendingGroups!: Group[];

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
