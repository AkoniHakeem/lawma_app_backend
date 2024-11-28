import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lga } from './lga.entity';
import { LgaWard } from './lgaWard.entity';
import { PropertySubscription } from './propertySubscription.entity';
import { EntityProfile } from './entityProfile.entity';

@Entity()
export class Street {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  // foreign key
  // @Column({ type: 'bigint' })
  // lgaId: string;

  @Column({ type: 'bigint' })
  lgaWardId: string;

  @Column({ type: 'bigint' })
  entityProfileId: string;

  // relations
  // @ManyToOne(() => Lga, (lga) => lga.streets)
  // @JoinColumn({ name: 'lgaId' })
  // lga: Lga;

  @ManyToOne(() => LgaWard, (lgaWard) => lgaWard.streets)
  lgaWard: LgaWard;

  @OneToMany(() => PropertySubscription, (property) => property.street)
  propertySubscriptions: PropertySubscription[];

  @ManyToOne(() => EntityProfile, (entityProfile) => entityProfile.streets)
  @JoinColumn({ name: 'entityProfileId' })
  entityProfile: EntityProfile;
}
