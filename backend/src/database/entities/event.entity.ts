import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { IntegrationAppTypeEnum } from "./integration.entity";
import { User } from "./user.entity";
import { Meeting } from "./meeting.entity";
import { Package } from "./package.entity";

export enum EventLocationEnumType {
  FACE_TO_FACE = "FACE_TO_FACE",
  GOOGLE_MEET_AND_CALENDAR = IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR,
  ZOOM_MEETING = IntegrationAppTypeEnum.ZOOM_MEETING,
}

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 30 })
  duration: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ default: false })
  showDateRange: boolean;

  @Column({ nullable: false })
  slug: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ type: "enum", enum: EventLocationEnumType })
  locationType: EventLocationEnumType;

  @ManyToOne(() => User, (user) => user.events)
  user: User;

  @OneToMany(() => Meeting, (meeting) => meeting.event)
  meetings: Meeting[];

  @ManyToMany(() => Package, (package_) => package_.events)
  @JoinTable({
    name: "event_packages",
    joinColumn: {
      name: "eventId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "packageId",
      referencedColumnName: "id",
    },
  })
  packages: Package[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
