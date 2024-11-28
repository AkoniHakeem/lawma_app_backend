import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertySubscription } from './propertySubscription.entity';
import { EntityUserProfile } from './entityUserProfile.entity';

@Entity()
export default class ArrearsUpdate {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'numeric', nullable: false })
  amountBeforeUpdate: string;

  @Column({ type: 'numeric', nullable: false })
  amountAfterUpdate: string;

  @Column({ type: 'varchar', nullable: false })
  reasonToUpdate: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // foreign keys
  @Column({ type: 'bigint', nullable: false })
  propertySubscriptionId: string;

  @Column({ type: 'bigint', nullable: true })
  updatedByUserId: string;

  // relations
  @ManyToOne(
    () => PropertySubscription,
    (propertySubscription) => propertySubscription.arrearsUpdates,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;

  @ManyToOne(() => EntityUserProfile, (entityUser) => entityUser.arrearsUpdates)
  @JoinColumn({ name: 'updatedByUserId' })
  entityUser: EntityUserProfile;
}
