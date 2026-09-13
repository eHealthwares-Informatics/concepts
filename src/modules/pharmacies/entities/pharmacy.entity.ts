import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LgaEntity, StateEntity, WardEntity } from '../../facilities/entities';
import { LocalityEntity } from '../../localities/entities';

/**
 * Pharmacy premises register (from pharmacies_reconciled.csv).
 *
 * The reconciler preserves every source column and adds matched area codes
 * (`matchedStateCode`/`matchedLgaCode`/`matchedWardCode`) plus match-status
 * (`stateMatch`/`lgaMatch`/`wardMatch`). Unmatched rows are still imported with
 * null area FKs so a later, improved reconciliation can fill them on re-seed.
 * See PHARMACIES_RECONCILIATION.md.
 */
@Entity('pharmacies')
@Index('idx_pharmacies_premises_id', ['premisesId'], { unique: true })
@Index('idx_pharmacies_state', ['stateId'])
@Index('idx_pharmacies_lga', ['lgaId'])
@Index('idx_pharmacies_ward', ['wardId'])
@Index('idx_pharmacies_area', ['areaId'])
@Index('idx_pharmacies_neighbourhood', ['neighbourhoodId'])
@Index('idx_pharmacies_settlement', ['settlementId'])
@Index('idx_pharmacies_category', ['category'])
export class PharmacyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Stable business key (from the reconciler). */
  @Column({ type: 'text' })
  premisesId!: string;

  @Column({ type: 'text', nullable: true })
  premisesName!: string | null;

  @Column({ type: 'text', nullable: true })
  premisesAddress!: string | null;

  @Column({ type: 'text', nullable: true })
  premisesState!: string | null;

  // ── Pharmacist ─────────────────────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  pharmacistId!: string | null;

  @Column({ type: 'text', nullable: true })
  pharmacistFirstName!: string | null;

  @Column({ type: 'text', nullable: true })
  pharmacistMiddleName!: string | null;

  @Column({ type: 'text', nullable: true })
  pharmacistLastName!: string | null;

  @Column({ type: 'text', nullable: true })
  pharmacist!: string | null;

  // ── Raw location columns (as reconciled) ───────────────────────────────
  @Column({ type: 'text', nullable: true })
  stateCode!: string | null;

  @Column({ type: 'text', nullable: true })
  stateName!: string | null;

  @Column({ type: 'text', nullable: true })
  lgaName!: string | null;

  @Column({ type: 'text', nullable: true })
  lgaCode!: string | null;

  @Column({ type: 'text', nullable: true })
  wardName!: string | null;

  @Column({ type: 'text', nullable: true })
  wardCode!: string | null;

  @Column({ type: 'text', nullable: true })
  area!: string | null;

  @Column({ type: 'text', nullable: true })
  neighbourhood!: string | null;

  @Column({ type: 'text', nullable: true })
  settlement!: string | null;

  @Column({ type: 'text', nullable: true })
  settlementCode!: string | null;

  @Column({ type: 'text', nullable: true })
  settlementX!: string | null;

  @Column({ type: 'text', nullable: true })
  settlementY!: string | null;

  // ── Licence / reconciliation ───────────────────────────────────────────
  @Column({ type: 'text', nullable: true })
  stateMatch!: string | null;

  @Column({ type: 'text', nullable: true })
  certificateNo!: string | null;

  @Column({ type: 'text', nullable: true })
  category!: string | null;

  @Column({ type: 'text', nullable: true })
  yearLicenced!: string | null;

  @Column({ type: 'text', nullable: true })
  dateApproved!: string | null;

  @Column({ type: 'boolean', default: false })
  isLicencePrinted!: boolean;

  @Column({ type: 'text', nullable: true })
  datePrinted!: string | null;

  // Reconciler-matched area codes (kept for future re-reconciliation).
  @Column({ type: 'text', nullable: true })
  matchedStateCode!: string | null;

  @Column({ type: 'text', nullable: true })
  matchedLgaCode!: string | null;

  @Column({ type: 'text', nullable: true })
  matchedWardCode!: string | null;

  @Column({ type: 'text', nullable: true })
  lgaMatch!: string | null;

  @Column({ type: 'text', nullable: true })
  wardMatch!: string | null;

  // ── Resolved relations (nullable; null when reconciliation missed) ─────
  @ManyToOne(() => StateEntity, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state!: StateEntity | null;

  @Column({ name: 'state_id', type: 'uuid', nullable: true })
  stateId!: string | null;

  @ManyToOne(() => LgaEntity, { nullable: true })
  @JoinColumn({ name: 'lga_id' })
  lga!: LgaEntity | null;

  @Column({ name: 'lga_id', type: 'uuid', nullable: true })
  lgaId!: string | null;

  @ManyToOne(() => WardEntity, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward!: WardEntity | null;

  @Column({ name: 'ward_id', type: 'uuid', nullable: true })
  wardId!: string | null;

  // ── Resolved locality relations (nullable) ─────────────────────────────
  @ManyToOne(() => LocalityEntity, { nullable: true })
  @JoinColumn({ name: 'area_id' })
  areaLocality!: LocalityEntity | null;

  @Column({ name: 'area_id', type: 'uuid', nullable: true })
  areaId!: string | null;

  @ManyToOne(() => LocalityEntity, { nullable: true })
  @JoinColumn({ name: 'neighbourhood_id' })
  neighbourhoodLocality!: LocalityEntity | null;

  @Column({ name: 'neighbourhood_id', type: 'uuid', nullable: true })
  neighbourhoodId!: string | null;

  @ManyToOne(() => LocalityEntity, { nullable: true })
  @JoinColumn({ name: 'settlement_id' })
  settlementLocality!: LocalityEntity | null;

  @Column({ name: 'settlement_id', type: 'uuid', nullable: true })
  settlementId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
