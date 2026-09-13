import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * A resolved locality (area / neighbourhood / settlement) from the pharmacy
 * locality reconciliation. Intentionally NOT a ConceptCoding: localities are a
 * high-cardinality, geo-specific dataset and are queried by name/relation rather
 * than the terminology service. See PHARMACIES_RECONCILIATION.md.
 */
@Entity('localities')
@Index('idx_localities_code', ['code'], { unique: true })
@Index('idx_localities_type', ['type'])
@Index('idx_localities_name', ['name'])
export class LocalityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Synthetic business key: `${TYPE}:${normalized name}` (e.g. AREA:aba). */
  @Column('varchar', { length: 160, unique: true })
  code!: string;

  /** area | neighbourhood | settlement */
  @Column('varchar', { length: 20 })
  type!: string;

  @Column('varchar', { length: 255 })
  name!: string;

  /** Gazetteer ward code the locality resolved through (provenance). */
  @Column('varchar', { length: 50, nullable: true })
  gazetteerWardCode!: string | null;

  @Column('float', { nullable: true })
  lon!: number | null;

  @Column('float', { nullable: true })
  lat!: number | null;

  @Column('int', { default: 0 })
  pharmacyCount!: number;

  @Column('varchar', { length: 30, nullable: true })
  source!: string | null;

  @Column('varchar', { length: 20, nullable: true })
  confidence!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
