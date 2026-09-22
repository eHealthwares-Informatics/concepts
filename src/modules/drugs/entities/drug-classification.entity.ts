import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { GenericDrugEntity } from './generic-drug.entity';
import { GenericProductEntity } from './generic-product.entity';

/**
 * Drug classification entity — a therapeutic or pharmaceutical category.
 *
 * Business key is the `code` ("TC00001" therapeutic, "PC00001" pharmaceutical).
 * Classifications relate many-to-many to generic drugs (GN) and generic
 * products (GP) via the junction tables generic_drug_classifications and
 * generic_product_classifications.
 */
@Entity('drug_classifications')
@Unique('uq_drug_classifications_code', ['code'])
@Index('idx_drug_classifications_type', ['type'])
export class DrugClassificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Business key (TC/PC-xxxxx). */
  @Column({ type: 'text' })
  code!: string;

  /** 'therapeutic' | 'pharmaceutical'. */
  @Column({ type: 'text' })
  type!: string;

  /** Category name (e.g. "ACE inhibitors"). */
  @Column({ type: 'text' })
  name!: string;

  /** Category description. */
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  /** Provenance (drugs.com, goodrx, RxNorm/NDF-RT ...). */
  @Column({ type: 'text', nullable: true })
  source!: string | null;

  /** Reference URL. */
  @Column({ type: 'text', nullable: true })
  url!: string | null;

  @ManyToMany(() => GenericDrugEntity, (g) => g.classifications)
  genericDrugs!: GenericDrugEntity[];

  @ManyToMany(() => GenericProductEntity, (p) => p.classifications)
  genericProducts!: GenericProductEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}