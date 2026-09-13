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
 * Formulation entity — represents a drug formulation category/route.
 *
 * Examples: "Oral", "Parenteral", "Inhalation", "Topical", "Rectal",
 *           "Ophthalmic", "Nasal", "Sublingual", "Transdermal".
 *
 * Sourced from EMDEx `drug_formulations` column and Nigeria NDF classification.
 * Normalises what was previously free-text on PharmaceuticsEntity.
 */
@Entity('formulations')
export class FormulationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Business key (e.g. "FR-ORAL", "FR-INJ"). */
  @Column({ type: 'text', unique: true })
  code!: string;

  /** Display name — "Oral", "Parenteral", etc. */
  @Column({ type: 'text' })
  name!: string;

  /** Optional description / scope note. */
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // ── Relations ──────────────────────────────────────────────────────────

  @OneToMany(() => GenericProductEntity, (gp) => gp.formulation)
  genericProducts!: GenericProductEntity[];

  // ── Timestamps ─────────────────────────────────────────────────────────

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
