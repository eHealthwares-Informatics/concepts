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
import { FacilityEntity } from './facility.entity';

@Entity('facility_attributes')
@Index(['facility', 'attributeCode'])
export class FacilityAttributeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => FacilityEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'facility_id' })
  facility!: FacilityEntity;

  @Column('varchar', { length: 100 })
  attributeCode!: string;

  @Column('text')
  value!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
