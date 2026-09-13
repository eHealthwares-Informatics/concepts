import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { LocalityEntity } from './locality.entity';
import { LgaEntity, StateEntity, WardEntity } from '../../facilities/entities';

/**
 * Resolved admin position of a locality. A locality (especially an area) can
 * map to more than one ward/LGA, so this is a relation set rather than a single
 * FK on LocalityEntity. The admin levels form a concrete hierarchy, so every
 * row's state/LGA/ward combination is hierarchy-consistent.
 */
@Entity('locality_admins')
@Index('idx_locality_admins_locality', ['localityId'])
@Unique('uq_locality_admins_position', ['localityId', 'stateId', 'lgaId', 'wardId'])
export class LocalityAdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => LocalityEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locality_id' })
  locality!: LocalityEntity;

  @Column({ name: 'locality_id', type: 'uuid' })
  localityId!: string;

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

  @Column('int', { default: 0 })
  pharmacyCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
