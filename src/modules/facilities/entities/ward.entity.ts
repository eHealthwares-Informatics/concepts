import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('wards')
@Index(['lgaCode'])
export class WardEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @Column('varchar', { length: 50, unique: true })
  @ApiProperty({ description: 'Ward code' })
  code!: string;

  @Column('varchar', { length: 255, default: '' })
  @ApiProperty({ description: 'Ward name', default: '' })
  name!: string;

  @Column('varchar', { length: 50, nullable: true })
  @ApiProperty({ description: 'LGA code this ward belongs to', nullable: true })
  lgaCode?: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}
