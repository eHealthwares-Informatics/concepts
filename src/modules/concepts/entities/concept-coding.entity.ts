import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CodingConcept } from '../../../common/enums/concept.enum';
import { ExternalConceptMappingEntity } from './external-concept-mapping.entity';
import { ConceptAttributeValueEntity } from './concept-attribute-value.entity';

@Entity('concept_codes')
@Index(['concept', 'code'])
export class ConceptCodingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('simple-enum', { enum: CodingConcept })
  concept!: CodingConcept;

  @Column('varchar', { length: 255 })
  code!: string;

  @Column('varchar', { length: 255, nullable: true })
  name?: string;

  @Column('varchar', { length: 255, nullable: true })
  shortName?: string;

  @Column('varchar', { length: 500, nullable: true })
  longName?: string;

  @Column('text', { nullable: true })
  shortDescription?: string;

  @Column('text', { nullable: true })
  longDescription?: string;

  @OneToMany(() => ConceptAttributeValueEntity, (value) => value.conceptCode, {
    cascade: true,
  })
  conceptValues?: ConceptAttributeValueEntity[];

  @OneToMany(() => ExternalConceptMappingEntity, (mapping) => mapping.conceptCode, {
    cascade: true,
  })
  externalMappings?: ExternalConceptMappingEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
