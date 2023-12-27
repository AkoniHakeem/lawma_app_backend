import { SubscriberProfileRoleEnum } from '../../lib/enums';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';
import { Street } from './street.entity';
import { PropertySubscriptionUnit } from './PropertySubscriptionUnit.entity';
import { BillingAccount } from './billingAccount.entity';
import { Billing } from './billing.entity';
import { Payment } from './payments.entity';
import { EntityProfile } from './entityProfile.entity';

@Entity()
export class PropertySubscription {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  propertySubscriptionName: string;

  @Column({ type: 'enum', enum: SubscriberProfileRoleEnum })
  subscriberProfileRole: SubscriberProfileRoleEnum;

  @Column({ type: 'bigint', nullable: true })
  oldCode: string;

  @Column({ type: 'varchar' })
  streetNumber: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  streetId: string;

  @Column({ type: 'bigint' })
  entitySubscriberProfileId: string;

  @Column({ type: 'bigint' })
  entityProfileId: string;

  // relations
  @ManyToOne(() => Street, (street) => street.propertySubscriptions)
  @JoinColumn({ name: 'streetId' })
  street: Street;

  @ManyToOne(
    () => EntitySubscriberProfile,
    (entitySubscriberProfile) => entitySubscriberProfile.propertySubscribers,
  )
  @JoinColumn({ name: 'entitySubscriberProfileId' })
  entitySubscriberProfile: EntitySubscriberProfile;

  @OneToMany(
    () => PropertySubscriptionUnit,
    (unit) => unit.propertySubscription,
  )
  propertySubscriptionUnits: PropertySubscriptionUnit[];

  @OneToMany(() => Billing, (billing) => billing.propertySubscription)
  billings: Billing[];

  @OneToOne(
    () => BillingAccount,
    (billingAccount) => billingAccount.propertySubscription,
  )
  billingAccount: BillingAccount;

  @OneToMany(() => Payment, (payment) => payment.propertySubscription)
  payments: Payment[];

  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.propertySubscriptions,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;
}
