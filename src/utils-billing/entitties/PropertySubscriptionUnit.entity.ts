import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { EntitySubscriberProperty } from './entitySubscriberProperty.entity';
import { PropertySubscription } from './propertySubscription.entity';

@Entity()
export class PropertySubscriptionUnit {
  @PrimaryColumn({ type: 'bigint' })
  propertySubscriptionId: string;

  @PrimaryColumn({ type: 'bigint' })
  entiySubscriberPropertyId: string;

  @Column({ type: 'integer' })
  propertyUnits: number;

  // relations
  @ManyToOne(
    () => PropertySubscription,
    (propertySubscription) => propertySubscription.propertySubscriptionUnits,
  )
  @JoinColumn({ name: 'propertySubscriptionId' })
  propertySubscription: PropertySubscription;

  @ManyToOne(
    () => EntitySubscriberProperty,
    (entitySubscriberProperty) =>
      entitySubscriberProperty.propertySubscriptionUnits,
  )
  @JoinColumn({ name: 'entiySubscriberPropertyId' })
  entitySubscriberProperty: EntitySubscriberProperty;
}
