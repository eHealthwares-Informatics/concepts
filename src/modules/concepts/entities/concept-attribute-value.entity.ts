import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CodingConcept } from '../../../common/enums/concept.enum';
import { ConceptCodingEntity } from './concept-coding.entity';
import { ConceptAttributeEntity } from './concept-attribute.entity';
import { FacilityEntity } from '../../facilities/entities/facility.entity';

@Entity('concept_values')
@Index(['conceptCode', 'attribute'])
export class ConceptAttributeValueEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // The concept coding row that owns this value (e.g. FACILITY coding row).
  @ManyToOne(() => ConceptCodingEntity, (conceptCode) => conceptCode.conceptValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entity', referencedColumnName: 'id' })
  conceptCode!: ConceptCodingEntity;

  @Column('varchar', { length: 50 })
  concept!: CodingConcept;

  @ManyToOne(() => ConceptAttributeEntity, { eager: true })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ConceptAttributeEntity;

  @ManyToOne(() => FacilityEntity, (facility) => facility.attributes, { nullable: true })
  @JoinColumn({ name: 'facility_id' })
  facility?: FacilityEntity;

  @Column('text')
  value!: string;

  @Column('varchar', { length: 100, nullable: true })
  valueFormat?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
