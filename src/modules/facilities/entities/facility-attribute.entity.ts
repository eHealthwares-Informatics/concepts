import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { FacilityEntity } from './facility.entity';
import { ConceptAttributeEntity } from '../../concepts/entities/concept-attribute.entity';

/**
 * Pure join entity linking a Facility to a ConceptAttribute definition.
 *
 * The actual value is stored on ConceptAttributeValueEntity
 * (concept + conceptCode + attribute + value), so this entity only carries
 * the facility ↔ attribute-definition relationship.
 */
@Entity('facility_attributes')
@Index(['facility', 'attribute'])
export class FacilityAttributeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => FacilityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility!: FacilityEntity;

  @ManyToOne(() => ConceptAttributeEntity)
  @JoinColumn({ name: 'attribute_code', referencedColumnName: 'code' })
  attribute!: ConceptAttributeEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
