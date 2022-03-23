import {
    Column,
    Entity, ManyToMany, ManyToOne,
    PrimaryGeneratedColumn,
    Unique
} from "typeorm";
import * as bcrypt from "bcryptjs";
import {Group} from "./group";

@Entity()
@Unique(["username"])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    username!: string;

    @Column()
    password!: string;

    @Column()
    role!: string;

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
}
