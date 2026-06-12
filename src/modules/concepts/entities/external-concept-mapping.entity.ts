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

@Entity('external_concept_mappings')
@Index(['externalConcept', 'externalCode'])
export class ExternalConceptMappingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('simple-enum', { enum: CodingConcept })
  externalConcept!: CodingConcept;

  @Column('varchar', { length: 255 })
  externalCode!: string;

  @Column('simple-enum', { enum: CodingConcept })
  internalConcept!: CodingConcept;

  @Column('varchar', { length: 255, nullable: true })
  internalCode?: string;

  @Column('varchar', { length: 255, nullable: true })
  conceptCodeId?: string;

  @ManyToOne(() => ConceptCodingEntity, (conceptCode) => conceptCode.externalMappings, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'conceptCodeId', referencedColumnName: 'id' })
  conceptCode?: ConceptCodingEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
