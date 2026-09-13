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

/**
 * Edges between localities:
 *  - kind='nearby'   area -> neighbouring area (tier: ward | lga | coord)
 *  - kind='co_occurs' localities that share pharmacies (area<->settlement, ...)
 */
@Entity('locality_relations')
@Index('idx_locality_relations_locality', ['localityId'])
@Index('idx_locality_relations_kind', ['kind'])
@Unique('uq_locality_relations_edge', ['localityId', 'relatedLocalityId', 'kind', 'tier'])
export class LocalityRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => LocalityEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'locality_id' })
  locality!: LocalityEntity;

  @Column({ name: 'locality_id', type: 'uuid' })
  localityId!: string;

  @ManyToOne(() => LocalityEntity, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'related_locality_id' })
  relatedLocality!: LocalityEntity | null;

  @Column({ name: 'related_locality_id', type: 'uuid', nullable: true })
  relatedLocalityId!: string | null;

  @Column('varchar', { length: 20 })
  kind!: string;

  @Column('varchar', { length: 20, nullable: true })
  tier!: string | null;

  @Column('float', { nullable: true })
  distanceKm!: number | null;

  @Column('int', { default: 0 })
  pharmacyCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
