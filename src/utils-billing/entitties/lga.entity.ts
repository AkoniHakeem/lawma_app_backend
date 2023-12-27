import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Street } from './street.entity';
import { LgaWard } from './lgaWard.entity';

@Entity()
export class Lga {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  abbreviation: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  // relations
  // @OneToMany(() => Street, (street) => street.lga)
  // streets: Street[];

  @OneToMany(() => LgaWard, (lgaWard) => lgaWard.lga)
  lgaWards: LgaWard[];
}
