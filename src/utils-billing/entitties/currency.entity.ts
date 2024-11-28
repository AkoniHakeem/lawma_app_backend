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
import { Country } from './country.entity';
import WalletReference from './walletReference.entity';

@Entity()
export class Currency {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  fullname: string;

  @Column({ type: 'varchar', nullable: true })
  symbol: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // foreign keys
  @Column({ type: 'bigint' })
  countryId: string;

  // relations
  @ManyToOne(() => Country, (country) => country.currencies)
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @OneToMany(() => WalletReference, (walletRef) => walletRef.currency)
    walletReferences: WalletReference[];
}
