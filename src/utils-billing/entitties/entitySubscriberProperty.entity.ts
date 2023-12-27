import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertyType } from './propertyTypes.entity';
import { Payment } from './payments.entity';
import { PropertySubscriptionUnit } from './PropertySubscriptionUnit.entity';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';

@Entity()
export class EntitySubscriberProperty {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  // @Column({ type: 'bigint' })
  // oldCode: string;

  @Column({ type: 'bigint', nullable: true })
  ownerEntitySubscriberProfileId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  propertyTypeId: string;

  // relations
  @ManyToOne(
    () => PropertyType,
    (propertyType) => propertyType.subscriberProperties,
  )
  @JoinColumn({ name: 'propertyTypeId' })
  propertyType: PropertyType;

  @OneToMany(
    () => PropertySubscriptionUnit,
    (propertySubscriptionUnit) =>
      propertySubscriptionUnit.entitySubscriberProperty,
  )
  propertySubscriptionUnits: PropertySubscriptionUnit[];

  @OneToMany(() => Payment, (payment) => payment.propertySubscription)
  payments: Payment[];

  @ManyToOne(
    () => EntitySubscriberProfile,
    (entitySubscriber) => entitySubscriber.entitySubscriberProperty,
  )
  @JoinColumn({ name: 'ownerEntitySubscriberProfileId' })
  entitySubscriberProfile: EntitySubscriberProfile;
}
