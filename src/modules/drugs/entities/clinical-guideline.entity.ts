import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenericDrugEntity } from './generic-drug.entity';
import { GenericProductEntity } from './generic-product.entity';
import { GuidelineEvidenceEntity } from './guideline-evidence.entity';

/**
 * Clinical guideline — a versioned treatment guideline document (source of
 * truth for the seed service: the NSTG Nigeria 2022 dump processed into rows,
 * not the raw dump itself).
 *
 * Seed contract (seed/ service, IMPORT_ARCHITECTURE.md): the importer reads
 * seed/seeds/concepts/inline/nigeria_clinical_guidelines_2022.json (a research
 * dump, not seed rows) and transforms it into flat rows where `slug` is the
 * stable business key so child tables can resolve guideline_id relations.
 *
 * Typed speech-act sections stay as JSONB (they are free-form guideline
 * prose); the drug rows a regimen needs are linked out via treatment line
 * references to generic_drugs / generic_products.
 */
@Entity('clinical_guidelines')
@Index(['slug'], { unique: true })
export class ClinicalGuidelineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Stable business key, e.g. 'acne-vulgaris' (condition_slug from NSTG). */
  @Column({ type: 'text', unique: true })
  slug!: string;

  /** Display name, e.g. 'Acne Vulgaris'. */
  @Column({ type: 'text' })
  conditionName!: string;

  /** Guideline edition, e.g. 'NSTG 2022'. */
  @Column({ type: 'text' })
  guidelineSource!: string;

  @Column({ type: 'text', nullable: true })
  introduction!: string | null;

  /** Array of { type, features[] } — clinical feature groupings. */
  @Column({ type: 'jsonb', nullable: true })
  clinicalFeatures!: Array<{ type: string; features: string[] }> | null;

  /** Ordered list of condition entries for canonical complaint search. */
  @Column({ type: 'jsonb', nullable: true })
  differentialDiagnoses!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  complications!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  investigations!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  prevention!: string[] | null;

  /** Free-form treatment narrative (goals, non-drug measures etc.). */
  @Column({ type: 'jsonb', nullable: true })
  treatment!: {
    goals?: string[];
    non_drug?: string[];
    drug?: string[];
    adverse_reactions_and_cautions?: string[];
    supportive_measures?: string[];
  } | null;

  @Column({ type: 'text', nullable: true })
  prognosis!: string | null;

  @Column({ name: 'definitive_treatment', type: 'text', nullable: true })
  definitiveTreatment!: string | null;

  /** Generic drugs (GN-*) this guideline's regimen can involve. */
  @ManyToMany(() => GenericDrugEntity, (drug) => drug.guidelines, { lazy: true })
  @JoinTable({
    name: 'clinical_guideline_generic_drugs',
    joinColumn: { name: 'guideline_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'generic_drug_id', referencedColumnName: 'id' },
  })
  genericDrugs!: GenericDrugEntity[];

  /** Product-level links (for strength/form-specific maps). */
  @ManyToMany(() => GenericProductEntity, (product) => product.guidelines, { lazy: true })
  @JoinTable({
    name: 'clinical_guideline_generic_products',
    joinColumn: { name: 'guideline_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'generic_product_id', referencedColumnName: 'id' },
  })
  genericProducts!: GenericProductEntity[];

  /** Extracted drug lines (per-treatment-line medicine references). */
  @OneToMany(
    () => GuidelineDrugLineEntity,
    (line) => line.guideline,
  )
  drugLines!: GuidelineDrugLineEntity[];

  /** Source citation / reviewer trail rows. */
  @OneToMany(() => GuidelineEvidenceEntity, (ev) => ev.guideline)
  evidence!: GuidelineEvidenceEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}

/**
 * One treatment line extracted from the guideline's treatment.drug[] text,
 * with a resolved link to a GN (generic drug) and an optional GP (a specific
 * product/strength/form). Rows the importer cannot confidently resolve keep
 * `mappingStatus = 'unmapped'` — never guessed.
 */
@Entity('clinical_guideline_drug_lines')
@Index(['guidelineId'])
export class GuidelineDrugLineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'guideline_id', type: 'uuid' })
  guidelineId!: string;

  @ManyToOne(() => ClinicalGuidelineEntity, (g) => g.drugLines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guideline_id' })
  guideline!: ClinicalGuidelineEntity;

  /** Subset indicator from the original string, e.g. 'Comedonal acne'. */
  @Column({ type: 'text', nullable: true })
  indication!: string | null;

  /** Raw verbatim line from the guideline (audit trail). */
  @Column({ type: 'text' })
  rawText!: string;

  @Column({ name: 'generic_drug_id', type: 'uuid', nullable: true })
  genericDrugId!: string | null;

  @ManyToOne(() => GenericDrugEntity, { nullable: true, lazy: true })
  @JoinColumn({ name: 'generic_drug_id' })
  genericDrug!: GenericDrugEntity | null;

  @Column({ name: 'generic_product_id', type: 'uuid', nullable: true })
  genericProductId!: string | null;

  @ManyToOne(() => GenericProductEntity, { nullable: true, lazy: true })
  @JoinColumn({ name: 'generic_product_id' })
  genericProduct!: GenericProductEntity | null;

  /** OPTIONAL | FIRST_LINE | SECOND_LINE | ADD_ON | ALTERNATIVE */
  @Column({ type: 'text', default: 'OPTIONAL' })
  regimenRole!: string;

  /**
   * unmapped | matched_by_name | matched_by_code — 'unmapped' rows MUST NOT
   * be presented as clinical recommendations.
   */
  @Column({ name: 'mapping_status', type: 'text', default: 'unmapped' })
  mappingStatus!: string;

  /** Confidence note recorded by the importer for reviewed mappings. */
  @Column({ type: 'text', nullable: true })
  mappingNote!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
