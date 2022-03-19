import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Feed {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

}
