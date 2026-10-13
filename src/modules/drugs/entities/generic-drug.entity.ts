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
import { ClinicalGuidelineEntity } from './clinical-guideline.entity';

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

  /** ATC code (genericDrugs.csv emdexCode). */
  @Column({ name: 'emdex_code', type: 'text', nullable: true })
  emdexCode!: string | null;

  /** Origin ('' = NDF, 'EMDEx/GP crosswalk mint', 'user/manual', ...). */
  @Column({ type: 'text', nullable: true })
  source!: string | null;

  @OneToMany(() => GenericProductEntity, (gp) => gp.genericDrug)
  genericProducts!: GenericProductEntity[];

  /** All source classifications (NDF, EMDEx and external schemes) via the join table. */
  @ManyToMany(() => DrugClassificationEntity, (c) => c.genericDrugs)
  @JoinTable({
    name: 'generic_drug_classifications',
    joinColumn: { name: 'generic_drug_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'drug_classification_id', referencedColumnName: 'id' },
  })
  classifications!: DrugClassificationEntity[];

  /** Guidelines (e.g. NSTG 2022 conditions) whose regimens reference this GN. */
  @ManyToMany(() => ClinicalGuidelineEntity, (g) => g.genericDrugs, { lazy: true })
  guidelines!: ClinicalGuidelineEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
