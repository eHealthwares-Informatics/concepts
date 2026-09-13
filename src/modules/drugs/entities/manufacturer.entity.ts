import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenericProductEntity } from './generic-product.entity';

/**
 * Manufacturer entity — represents a pharmaceutical company.
 *
 * Sourced from EMDEx manufacturer index (139 companies) and formulary brand
 * mappings. Each manufacturer may produce multiple generic products.
 *
 * Fields capture contact info extracted from EMDEx (phone, email, website,
 * address) as structured columns.
 */
@Entity('manufacturers')
export class ManufacturerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Business key (e.g. "MFR-GSK", "MFR-PFIZER"). */
  @Column({ type: 'text', unique: true })
  code!: string;

  /** Official company name — "GlaxoSmithKline", "Pfizer", etc. */
  @Column({ type: 'text' })
  name!: string;

  /** Country of origin / headquarters. */
  @Column({ type: 'text', nullable: true })
  country!: string | null;

  /** Phone numbers (pipe-separated if multiple). */
  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  /** Primary email contact. */
  @Column({ type: 'text', nullable: true })
  email!: string | null;

  /** Company website URL. */
  @Column({ type: 'text', nullable: true })
  website!: string | null;

  /** Physical address (street, city, state). */
  @Column({ type: 'text', nullable: true })
  address!: string | null;

  // ── Relations ──────────────────────────────────────────────────────────

  @OneToMany(() => GenericProductEntity, (gp) => gp.manufacturer)
  genericProducts!: GenericProductEntity[];

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
