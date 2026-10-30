import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenericDrugEntity } from '../../drugs/entities';
import { TreatmentPackStatus } from '../types/clinical-triage.types';

/**
 * TreatmentPack — a clinically reviewed plan for a defined indication (§9).
 * Eligibility is status + complaintCodes + rules gated; existence alone never
 * makes a pack recommendable. Edits bump `version` (§9.3 #7).
 *
 * Declared before TreatmentPackItemEntity: the item's `@ManyToOne` emits
 * design-time metadata for the pack type, which cannot reference a class
 * declared later in the same module.
 */
@Entity('treatment_packs')
@Index('idx_treatment_packs_code', ['code'], { unique: true })
@Index('idx_treatment_packs_status', ['status'])
export class TreatmentPackEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Uppercase, e.g. ACNE_SELF_CARE_001. */
  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'complaint_codes', type: 'simple-array', default: '' })
  complaintCodes!: string[];

  /** Patient-context eligibility rules the resolve call evaluates. */
  @Column({ name: 'eligibility_rules', type: 'simple-json', nullable: true })
  eligibilityRules!: Record<string, any> | null;

  /** Exclusion rules (contraindication codes, age bounds, interactions). */
  @Column({ name: 'exclusion_rules', type: 'simple-json', nullable: true })
  exclusionRules!: Record<string, any> | null;

  /** [{ source, version, reference? }] — citations. */
  @Column({ type: 'simple-json', nullable: true })
  evidence!: Record<string, any> | null;

  @Column({ type: 'text', default: TreatmentPackStatus.DRAFT })
  status!: TreatmentPackStatus;

  @Column({ type: 'integer', default: 1 })
  version!: number;

  @OneToMany(() => TreatmentPackItemEntity, (item) => item.pack, {
    cascade: true,
  })
  items!: TreatmentPackItemEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/**
 * TreatmentPackItem — one item inside a pack (§9.1). Medicine items reference
 * an approved generic drug (`generic_drugs`, GN-xxxxx) by id and keep the code
 * as the stable business key across reseeds; brand/product resolution happens
 * later through `generic_products` so clinical and commercial stay separate.
 */
@Entity('treatment_pack_items')
@Index('idx_treatment_pack_items_pack', ['packId'])
@Index('idx_treatment_pack_items_generic_drug', ['genericDrugId'])
export class TreatmentPackItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pack_id', type: 'uuid' })
  packId!: string;

  @ManyToOne(() => TreatmentPackEntity, (pack) => pack.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pack_id' })
  pack!: TreatmentPackEntity;

  /** GENERIC_MEDICINE | SUPPORTIVE_CARE | COUNSELLING. */
  @Column({ name: 'item_type', type: 'text' })
  itemType!: 'GENERIC_MEDICINE' | 'SUPPORTIVE_CARE' | 'COUNSELLING';

  /** FK to `generic_drugs` (nullable for non-medicine items). */
  @Column({ name: 'generic_drug_id', type: 'uuid', nullable: true })
  genericDrugId!: string | null;

  @ManyToOne(() => GenericDrugEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'generic_drug_id' })
  genericDrug!: GenericDrugEntity | null;

  /** GN-xxxxx code of the generic drug (stable business key). */
  @Column({ name: 'generic_drug_code', type: 'text', nullable: true })
  genericDrugCode!: string | null;

  @Column({ name: 'supportive_care_ref', type: 'text', nullable: true })
  supportiveCareRef!: string | null;

  /** Regimen code from the protocol, e.g. 'NSTG-2022:acne:first-line'. */
  @Column({ name: 'protocol_regimen_code', type: 'text', nullable: true })
  protocolRegimenCode!: string | null;

  @Column({ type: 'simple-json', nullable: true })
  instructions!: Record<string, any> | null;

  @Column({ type: 'integer', default: 0 })
  sequence!: number;

  @Column({ type: 'boolean', default: true })
  required!: boolean;
}

/**
 * ClinicalEvidence — source citation row for packs/rules. Seeded alongside
 * clinical content; reviewer + protocolVersion are audit fields.
 */
@Entity('clinical_evidence')
@Index('idx_clinical_evidence_entity', ['referencedEntity'])
export class ClinicalEvidenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** FQN of the referenced document, e.g. 'TreatmentPack:ACNE_SELF_CARE_001'. */
  @Column({ name: 'referenced_entity', type: 'text' })
  referencedEntity!: string;

  /** e.g. NSTG. */
  @Column({ type: 'text' })
  source!: string;

  /** e.g. 2022. */
  @Column({ type: 'text' })
  edition!: string;

  @Column({ type: 'text', nullable: true })
  section!: string | null;

  @Column({ name: 'publication_date', type: 'date', nullable: true })
  publicationDate!: string | null;

  @Column({ name: 'reviewed_by', type: 'text', nullable: true })
  reviewedBy!: string | null;

  @Column({ name: 'protocol_version', type: 'text' })
  protocolVersion!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
