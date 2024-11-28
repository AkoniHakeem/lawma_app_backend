import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne as OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertySubscription } from './propertySubscription.entity';

@Entity()
export class BillingAccount {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'numeric', default: '0' })
  totalBillings: string;

  @Column({ type: 'numeric', default: '0' })
  totalPayments: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  // foreign keys
  @Column({ type: 'bigint' })
  propertySubscriptionId: string;

  // relations
  @OneToOne(
    () => PropertySubscription,
    (entitySubscriberProperty) => entitySubscriberProperty.billingAccount,
  )
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;
}
