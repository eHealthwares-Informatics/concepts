import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StateEntity } from './state.entity';
import { LgaEntity } from './lga.entity';
import { WardEntity } from './ward.entity';
import { FacilityTypeEntity } from './facility-type.entity';
import { FacilityLevelEntity } from './facility-level.entity';

@Entity('facilities')
@Index(['ownershipTypeCode'])
@Index(['operationalStatusCode'])
export class FacilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50 })
  facilityId!: string;

  @Column('varchar', { length: 50, nullable: true })
  uniqueId?: string;

  @Column('varchar', { length: 100, nullable: true })
  registrationNo?: string;

  @Column('varchar', { length: 500 })
  facilityName!: string;

  @Column('varchar', { length: 500, nullable: true })
  alternativeName?: string;

  @Index()
  @ManyToOne(() => StateEntity, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state?: StateEntity;

  @Index()
  @ManyToOne(() => LgaEntity, { nullable: true })
  @JoinColumn({ name: 'lga_id' })
  lga?: LgaEntity;

  @Index()
  @ManyToOne(() => WardEntity, { nullable: true })
  @JoinColumn({ name: 'ward_id' })
  ward?: WardEntity;

  @Index()
  @ManyToOne(() => FacilityTypeEntity, { nullable: true })
  @JoinColumn({ name: 'facility_type_id' })
  facilityType?: FacilityTypeEntity;

  @Index()
  @ManyToOne(() => FacilityLevelEntity, { nullable: true })
  @JoinColumn({ name: 'facility_level_id' })
  facilityLevel?: FacilityLevelEntity;

  @Column('varchar', { length: 50, nullable: true })
  ownershipCode?: string;

  @Column('varchar', { length: 50, nullable: true })
  ownershipTypeCode?: string;

  @Column('varchar', { length: 50, nullable: true })
  operationalStatusCode?: string;

  @Column('varchar', { length: 50, nullable: true })
  registrationStatusCode?: string;

  @Column('varchar', { length: 50, nullable: true })
  licenseStatusCode?: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column('varchar', { length: 50, nullable: true })
  phoneNumber?: string;

  @Column('varchar', { length: 50, nullable: true })
  alternateNumber?: string;

  @Column('varchar', { length: 200, nullable: true })
  emailAddress?: string;

  @Column('varchar', { length: 500, nullable: true })
  website?: string;

  @Column('boolean', { default: false })
  outpatient!: boolean;

  @Column('boolean', { default: false })
  inpatient!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
