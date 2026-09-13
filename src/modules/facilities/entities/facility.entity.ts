import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, OneToMany,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { FacilityTypeEntity } from './facility-type.entity';
import { FacilityLevelEntity } from './facility-level.entity';
import { StateEntity } from './state.entity';
import { LgaEntity } from './lga.entity';
import { WardEntity } from './ward.entity';
import { ConceptAttributeValueEntity } from '../../concepts/entities/concept-attribute-value.entity';

@Entity('facilities')
export class FacilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Business key from the reconciler (the facility's stable code, e.g. '29/03/1/1/1/0037').
  @Column('varchar', { length: 50, unique: true })
  facilityId!: string;

  @Column('varchar', { length: 50, nullable: true })
  uniqueId?: string;

  @Column('varchar', { length: 100, nullable: true })
  facilityName?: string;

  @Column('varchar', { length: 500, nullable: true })
  alternativeName?: string;

  @Column('varchar', { length: 50, nullable: true })
  registrationNo?: string;

  @Column('varchar', { length: 50, nullable: true })
  registrationStatus?: string;

  @Column('varchar', { length: 50, nullable: true })
  emailAddress?: string;

  @Column('varchar', { length: 50, nullable: true })
  phoneNumber?: string;

  @Column('varchar', { length: 50, nullable: true })
  ownershipCode?: string;

  @Column('varchar', { length: 50, nullable: true })
  ownershipTypeCode?: string;

  @Column('varchar', { length: 50, nullable: true })
  operationalStatusCode?: string;

  @Column('varchar', { length: 50, nullable: true })
  licenseStatus?: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column('varchar', { length: 200, nullable: true })
  website?: string;

  @Column('varchar', { length: 50, nullable: true })
  alternateNumber?: string;

  @Column('boolean', { default: false })
  outpatient!: boolean;

  @Column('boolean', { default: false })
  inpatient!: boolean;

  // Administrative-area FKs (resolve reconciler's state_code/lga_code/ward_code to UUIDs).
  @ManyToOne(() => StateEntity, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state?: StateEntity;

  @ManyToOne(() => LgaEntity, { nullable: true })
  @JoinColumn({ name: 'lga_id' })
  lga?: LgaEntity;

  @ManyToOne(() => WardEntity, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward?: WardEntity;

  @ManyToOne(() => FacilityTypeEntity, { nullable: true })
  @JoinColumn({ name: 'facility_type_id' })
  facilityType?: FacilityTypeEntity;

  @ManyToOne(() => FacilityLevelEntity, { nullable: true })
  @JoinColumn({ name: 'facility_level_id' })
  facilityLevel?: FacilityLevelEntity;

  // EAV attributes live on ConceptAttributeValueEntity (concepts module).
  // FacilityEntity keeps a unidirectional read-side here; writes go through the
  // seeder/import which creates the ConceptCodingEntity(FACILITY) + values.
  @OneToMany(() => ConceptAttributeValueEntity, (v) => v.facility)
  attributes!: ConceptAttributeValueEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
