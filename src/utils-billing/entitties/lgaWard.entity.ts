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
import { Lga } from './lga.entity';
import { Street } from './street.entity';

@Entity()
export class LgaWard {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  // foreign keys
  @Column({ type: 'bigint' })
  lgaId: string;

  // relations
  @ManyToOne(() => Lga, (lga) => lga.lgaWards)
  @JoinColumn({ name: 'lgaId' })
  lga: Lga;

  @OneToMany(() => Street, (street) => street.lgaWard)
  streets: Street[];
}
