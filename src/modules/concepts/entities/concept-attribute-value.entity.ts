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

@Entity('concept_values')
@Index(['conceptCode', 'attribute'])
export class ConceptAttributeValueEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ConceptCodingEntity, (conceptCode) => conceptCode.conceptValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entity', referencedColumnName: 'id' })
  conceptCode!: ConceptCodingEntity;

  @Column('simple-enum', { enum: CodingConcept })
  concept!: CodingConcept;

  @ManyToOne(() => ConceptAttributeEntity, { eager: true })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ConceptAttributeEntity;

  @Column('text')
  value!: string;

  @Column('varchar', { length: 100, nullable: true })
  valueFormat?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
