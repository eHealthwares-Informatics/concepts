import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenericProductEntity } from './generic-product.entity';
import { DrugClassificationEntity } from './drug-classification.entity';

/**
 * Generic drug entity — the active generic (GN-xxxxx from genericDrugs.csv).
 *
 * One generic drug can have MANY generic products (strengths/forms); each
 * GenericProductEntity links back via its genericDrug relation.
 */
@Entity('generic_drugs')
export class GenericDrugEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Business key (GN-xxxxx from genericDrugs.csv). */
  @Column({ type: 'text', unique: true })
  code!: string;

  /** Generic name (INN or combination). */
  @Column({ type: 'text' })
  name!: string;

  /** Therapeutic class (from genericDrugs.csv). */
  @Column({ name: 'generic_class', type: 'text', nullable: true })
  genericClass!: string | null;

  /** Pharmaceutical class. */
  @Column({ name: 'pharmaceutical_class', type: 'text', nullable: true })
  pharmaceuticalClass!: string | null;

  /** ATC code (genericDrugs.csv emdexCode). */
  @Column({ name: 'emdex_code', type: 'text', nullable: true })
  emdexCode!: string | null;

  /** Origin ('' = NDF, 'EMDEx/GP crosswalk mint', 'user/manual', ...). */
  @Column({ type: 'text', nullable: true })
  source!: string | null;

  /** Therapeutic classification codes (drugs.com → THER-*). */
  @Column({ name: 'therapeutic_category_codes', type: 'simple-array', nullable: true })
  therapeuticCategoryCodes!: string[] | null;

  /** Pharmaceutical classification codes (goodrx → PHA-*). */
  @Column({ name: 'pharmaceutical_category_codes', type: 'simple-array', nullable: true })
  pharmaceuticalCategoryCodes!: string[] | null;

  /** NDF classification codes (curated from genericClass → NDF-*). */
  @Column({ name: 'ndf_category_codes', type: 'simple-array', nullable: true })
  ndfCategoryCodes!: string[] | null;

  /** EMDEx (ATC body-system) classification codes (→ EMDX-*). */
  @Column({ name: 'emdex_category_codes', type: 'simple-array', nullable: true })
  emdexCategoryCodes!: string[] | null;

  @OneToMany(() => GenericProductEntity, (gp) => gp.genericDrug)
  genericProducts!: GenericProductEntity[];

  @ManyToMany(() => DrugClassificationEntity, (c) => c.genericDrugs)
  @JoinTable({
    name: 'generic_drug_classifications',
    joinColumn: { name: 'generic_drug_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'drug_classification_id', referencedColumnName: 'id' },
  })
  classifications!: DrugClassificationEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}