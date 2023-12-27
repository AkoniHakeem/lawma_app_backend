import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityProfile } from './entityProfile.entity';
import { PhoneCode } from './phoneCode.entity';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';

@Entity()
export class EntityUserProfile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  middleName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // @Column({ type: 'boolean', default: false })
  // isAdmin: boolean;

  // foreign key
  @Column({ type: 'bigint' })
  entityProfileId: string;

  @Column({ type: 'bigint', nullable: true })
  phoneCodeId: string;

  // relations
  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.entityUserProfiles,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;

  @ManyToOne(() => PhoneCode, (phoneCode) => phoneCode.entityUserProfiles)
  @JoinColumn({ name: 'phoneCodeId' })
  phoneCode: PhoneCode;

  @OneToMany(
    () => EntitySubscriberProfile,
    (entitySubscriberProfile) => entitySubscriberProfile.entityUserProfile,
  )
  createdEntitySubscriberProfiles: EntitySubscriberProfile[];
}
