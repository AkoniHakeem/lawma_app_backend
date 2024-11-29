import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntitySubscriberProfile } from './entitySubscriberProfile.entity';
import { PropertySubscription } from './propertySubscription.entity';

@Entity()
export default class SubscriberVirtualAccountDetail {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  account_number: string;

  @Column({ type: 'varchar' })
  account_name: string;

  @Column({ type: 'varchar' })
  bank: string;

  // foreign keys
  @Column({ type: 'bigint' })
  propertySubscriptionId: string;

  // relations
  @ManyToOne(
    () => PropertySubscription,
    (propertySubscription) =>
      propertySubscription.subscriberVirtualAccountDetails,
  )
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;
}
