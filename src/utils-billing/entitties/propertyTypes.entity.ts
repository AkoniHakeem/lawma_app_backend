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
import { EntitySubscriberProperty } from './entitySubscriberProperty.entity';
import { EntityProfile } from './entityProfile.entity';

@Entity()
export class PropertyType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'numeric' })
  unitPrice: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  // foreign keys
  @Column({ type: 'bigint' })
  entityProfileId: string;

  // relations
  @OneToMany(
    () => EntitySubscriberProperty,
    (property) => property.propertyType,
  )
  subscriberProperties: EntitySubscriberProperty[];

  @ManyToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.propertyTypes,
  )
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;
}
