import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { compareValue, hashValue } from "../../utils/bcrypt";
// Integrations removed
import { Event } from "./event.entity";
import { Availability } from "./availability.entity";
import { Meeting } from "./meeting.entity";
import { Package } from "./package.entity";

// Role enum for RBAC
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ 
    type: "enum", 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role: UserRole;

  @OneToMany(() => Event, (event) => event.user, {
    cascade: true,
  })
  events: Event[];

  // Integrations removed

  @OneToOne(() => Availability, (availability) => availability.user, {
    cascade: true,
  })
  @JoinColumn()
  availability: Availability;

  @OneToMany(() => Meeting, (meeting) => meeting.user, {
    cascade: true,
  })
  meetings: Meeting[];

  @OneToMany(() => Package, (package_) => package_.user, {
    cascade: true,
  })
  packages: Package[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return compareValue(candidatePassword, this.password);
  }

  omitPassword(): Omit<User, "password"> {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword as Omit<User, "password">;
  }

  // Helper method to check if user is admin
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
