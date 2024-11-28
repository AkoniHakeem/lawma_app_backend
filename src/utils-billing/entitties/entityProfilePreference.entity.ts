import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { EntityProfile } from './entityProfile.entity';

@Entity()
export class EntityProfilePreference {
  @PrimaryColumn({ type: 'bigint' })
  entityProfileId: string;

  @Column({ type: 'varchar' })
  autoGenerateBills: boolean;

  // relationss
  @OneToOne(
    () => EntityProfile,
    (entityProfile) => entityProfile.entityProfilePreference,
  )
  entityProfile: EntityProfile;
}
