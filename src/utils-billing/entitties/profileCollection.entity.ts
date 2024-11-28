import { ProfileTypes } from './../../lib/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ProfileCollection {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'enum', enum: ProfileTypes })
  profileType: ProfileTypes;

  @Column()
  isAdmin: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  // foreign keys
  @Column({ type: 'bigint' })
  profileTypeId: string;

  @Column({ type: 'bigint' })
  userId: string;
}
