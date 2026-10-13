import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PharmaceuticsEntity } from './pharmaceutics.entity';
import { FormulationEntity } from './formulation.entity';
import { DosageFormEntity } from './dosage-form.entity';
import { ManufacturerEntity } from './manufacturer.entity';
import { GenericDrugEntity } from './generic-drug.entity';
import { ClinicalGuidelineEntity } from './clinical-guideline.entity';
import { DrugClassificationEntity } from './drug-classification.entity';

/**
 * Generic product entity — a specific drug product/formulation.
 *
 * Each product references a PharmaceuticsEntity (monograph) and, when linked,
 * a GenericDrugEntity (the GN generic) via generic_generic_drug_id.
 */
@Entity('generic_products')
export class GenericProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Business key (GP-xxxxx from generic_products.csv, EMDEx). */
  @Column({ type: 'text' })
  code!: string;

  /** Product name (INN or combination name). */
  @Column({ type: 'text' })
  name!: string;

  /** Dosage form (tablet, injection, syrup, etc.). */
  @Column({ name: 'dosage_form', type: 'text', nullable: true })
  dosageForm!: string | null;

  /** Strength (e.g. "500mg", "250mg/5ml"). */
  @Column({ type: 'text', nullable: true })
  strength!: string | null;

  /** EMDEx ATC code reference (from genericDrugs.csv emdexCode). */
  @Column({ name: 'emdex_code', type: 'text', nullable: true })
  emdexCode!: string | null;

  /** ATC code resolved via the EMDEx <-> NDF crosswalk. */
  @Column({ name: 'atc_code', type: 'text', nullable: true })
  atcCode!: string | null;

  /** NDF generic code (GN-xxxxx) this EMDEx product maps to. */
  @Column({ name: 'ndf_generic_code', type: 'text', nullable: true })
  ndfGenericCode!: string | null;

  /** Proposed rxsoft item category code (CA-xxxxx) for item creation/alignment. */
  @Column({ name: 'item_category_code', type: 'text', nullable: true })
  itemCategoryCode!: string | null;

  /** Optional base UOM code (UMxxxxx) resolved by RxSoft when creating an item. */
  @Column({ name: 'uom_code', type: 'text', nullable: true })
  uomCode!: string | null;

  /** Prescription required flag. */
  @Column({ name: 'is_prescription_required', type: 'boolean', default: false })
  isPrescriptionRequired!: boolean;

  // ── Relation to Pharmaceutics (monograph) ──────────────────────────────

  @ManyToOne(() => PharmaceuticsEntity, (p) => p.genericProducts, {
    nullable: true,
  })
  @JoinColumn({ name: 'pharmaceutics_id' })
  pharmaceutics!: PharmaceuticsEntity | null;

  // ── Relation to Formulation (route/category) ───────────────────────────

  @ManyToOne(() => FormulationEntity, (f) => f.genericProducts, {
    nullable: true,
  })
  @JoinColumn({ name: 'formulation_id' })
  formulation!: FormulationEntity | null;

  // ── Relation to DosageForm (physical form) ─────────────────────────────

  @ManyToOne(() => DosageFormEntity, (df) => df.genericProducts, {
    nullable: true,
  })
  @JoinColumn({ name: 'dosage_form_id' })
  dosageFormRef!: DosageFormEntity | null;

  // ── Relation to Manufacturer ───────────────────────────────────────────

  @ManyToOne(() => ManufacturerEntity, (m) => m.genericProducts, {
    nullable: true,
  })
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer!: ManufacturerEntity | null;

  // ── Relation to GenericDrug (GN) ───────────────────────────────────────

  /** Generic drug (GN-xxxxx) this product maps to. One GP -> one GN. */
  @ManyToOne(() => GenericDrugEntity, (g) => g.genericProducts, {
    nullable: true,
  })
  @JoinColumn({ name: 'generic_drug_id' })
  genericDrug!: GenericDrugEntity | null;

  // ── Relation to DrugClassification (M:N) ───────────────────────────────

  /** All source classifications via the normalized drug_classifications relation. */
  @ManyToMany(() => DrugClassificationEntity, (c) => c.genericProducts)
  @JoinTable({
    name: 'generic_product_classifications',
    joinColumn: { name: 'generic_product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'drug_classification_id', referencedColumnName: 'id' },
  })
  classifications!: DrugClassificationEntity[];

  /** Guidelines (e.g. NSTG 2022) that reference this specific product/brand. */
  @ManyToMany(() => ClinicalGuidelineEntity, (g) => g.genericProducts, { lazy: true })
  guidelines!: ClinicalGuidelineEntity[];

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
