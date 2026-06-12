import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CodingConcept } from '../../../common/enums/concept.enum';

@Entity('concept_attributes')
@Index(['concept', 'code'], { unique: true })
export class ConceptAttributeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('simple-enum', { enum: CodingConcept })
  concept!: CodingConcept;

  // machine-friendly key (e.g. "component", "system", "scale")
  @Column('varchar', { length: 100 })
  code!: string;

  // human-readable
  @Column('varchar', { length: 255 })
  name!: string;

  @Column('varchar', { length: 50 })
  dataType!: string; 
  // string | number | boolean | date | coded | json

  @Column({ default: false })
  isRequired!: boolean;

  @Column({ default: false })
  isMultiValued!: boolean;

  @Column({ default: false })
  isSearchable!: boolean;

  @Column({ default: false })
  isFilterable!: boolean;

  @Column('text', { nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}