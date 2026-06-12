import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('states')
export class StateEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @Column('varchar', { length: 50, unique: true })
  @ApiProperty({ description: 'State code' })
  code!: string;

  @Column('varchar', { length: 255, default: '' })
  @ApiProperty({ description: 'State name', default: '' })
  name!: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}
