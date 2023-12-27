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
import { PropertySubscription } from './propertySubscription.entity';
import { PhoneCode } from './phoneCode.entity';
import { EntitySubscriberProperty } from './entitySubscriberProperty.entity';
import { EntityProfile } from './entityProfile.entity';
import { EntityUserProfile } from './entityUserProfile.entity';

@Entity()
export class EntitySubscriberProfile {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  @Column({ type: 'varchar', nullable: true })
  middleName: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phone: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // foreign key
  @Column({ type: 'bigint', nullable: true })
  phoneCodeId: string;

  @Column({ type: 'bigint', nullable: true })
  createdByEntityUserProfileId: string;

  @Column({ type: 'bigint', nullable: true })
  createdByEntityProfileId: string;

  // relations
  @OneToMany(
    () => PropertySubscription,
    (propertySubscriber) => propertySubscriber.entitySubscriberProfile,
  )
  propertySubscribers: PropertySubscription[];

  @ManyToOne(() => PhoneCode, (phoneCode) => phoneCode.entitySubscriberProfiles)
  @JoinColumn({ name: 'phoneCodeId' })
  phoneCode: PhoneCode;

  @OneToMany(
    () => EntitySubscriberProperty,
    (entitySubscriberProperty) =>
      entitySubscriberProperty.entitySubscriberProfile,
  )
  entitySubscriberProperty: EntitySubscriberProperty[];

  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.entitySubscriberProfiles,
  )
  @JoinColumn({ name: 'createdByEntityProfileId' })
  entityProfile: EntityProfile;

  @ManyToOne(
    () => EntityUserProfile,
    (entityUserProfile) => entityUserProfile.createdEntitySubscriberProfiles,
  )
  @JoinColumn({ name: 'createdByEntityUserProfileId' })
  entityUserProfile: EntityUserProfile;
}
