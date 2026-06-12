import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('lgas')
@Index(['stateCode'])
export class LgaEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @Column('varchar', { length: 50, unique: true })
  @ApiProperty({ description: 'LGA code' })
  code!: string;

  @Column('varchar', { length: 255, default: '' })
  @ApiProperty({ description: 'LGA name', default: '' })
  name!: string;

  @Column('varchar', { length: 50, nullable: true })
  @ApiProperty({ description: 'State code this LGA belongs to', nullable: true })
  stateCode?: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}
