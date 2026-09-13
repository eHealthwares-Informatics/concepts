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
 * Dosage form entity — represents a specific pharmaceutical dosage form.
 *
 * Examples: "Tablet", "Capsule", "Oral Suspension", "Injection",
 *           "Ointment", "Cream", "Eye Drops", "Inhaler", "Suppository".
 *
 * This is the physical presentation of a drug product. Distinct from
 * `FormulationEntity` which captures the route/category.
 *
 * Sourced from EMDEx and Nigeria NDF product catalogs.
 */
@Entity('dosage_forms')
export class DosageFormEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Business key (e.g. "DF-TAB", "DF-INJ"). */
  @Column({ type: 'text', unique: true })
  code!: string;

  /** Display name — "Tablet", "Oral Suspension", etc. */
  @Column({ type: 'text' })
  name!: string;

  /** Optional description / scope note. */
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // ── Relations ──────────────────────────────────────────────────────────

  @OneToMany(() => GenericProductEntity, (gp) => gp.dosageFormRef)
  genericProducts!: GenericProductEntity[];

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
