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
import { LgaEntity, StateEntity } from '../../facilities/entities';

/**
 * Diagnostic center directory (crawled from babymigo.com/diagnostic-centers).
 *
 * Every source column from the reconciled crawl is persisted; state_code /
 * lga_code are resolved onto the geo seeds by the reconciler. Rows whose LGA
 * is ambiguous (e.g. plain "Ibadan", "Benin City") import with null FKs and
 * keep their raw names so a later, improved reconciliation can fill them on
 * re-seed.
 */
@Entity('diagnostic_centers')
@Index('idx_diagnostic_centers_code', ['code'], { unique: true })
@Index('idx_diagnostic_centers_state', ['stateId'])
@Index('idx_diagnostic_centers_lga', ['lgaId'])
export class DiagnosticCenterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Stable business key (BMGO-<state-slug>-<detail-slug>). */
  @Column({ type: 'varchar', length: 200 })
  code!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  name!: string | null;

  @Column({ type: 'text', nullable: true })
  address!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Raw location labels as crawled (before reconciliation). */
  @Column({ type: 'varchar', length: 100, nullable: true })
  stateName!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lgaName!: string | null;

  /** Semicolon-joined per-day open hours ("Mon 08:00 am - 06:00 pm; ..."). */
  @Column({ type: 'text', nullable: true })
  openHours!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  rating!: string | null;

  /** babymigo provider id (card data-id). */
  @Column({ type: 'varchar', length: 50, nullable: true })
  providerId!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  sourceUrl!: string | null;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
