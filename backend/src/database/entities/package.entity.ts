import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Event } from "./event.entity";
import { Meeting } from "./meeting.entity";

@Entity({ name: "packages" })
export class Package {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, type: "text" })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true, type: "text" })
  inclusions: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isRecommended: boolean;

  @ManyToOne(() => User, (user) => user.packages)
  user: User;

  @ManyToMany(() => Event, (event) => event.packages)
  events: Event[];

  @OneToMany(() => Meeting, (meeting) => meeting.selectedPackage)
  meetings: Meeting[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 