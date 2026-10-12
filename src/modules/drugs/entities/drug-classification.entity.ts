import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { GenericDrugEntity } from './generic-drug.entity';
import { GenericProductEntity } from './generic-product.entity';

/**
 * Drug classification entity — a therapeutic or pharmaceutical category.
 *
 * Business key is the source classification code (TC/PC/NC/EC and source
 * specific variants). One classification can be reused by many GN/GP rows,
 * and each GN/GP can have several classifications, so assignments are
 * many-to-many through the two explicit junction tables.
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

  /** Source scheme, e.g. therapeutic, pharmaceutical, ndf, emdex_pharmaceutical, or emdex. */
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
