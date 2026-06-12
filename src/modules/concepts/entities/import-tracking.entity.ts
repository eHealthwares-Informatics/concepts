import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('import_tracking')
@Index(['concept', 'revision'])
export class ImportTrackingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 50 })
  concept!: string; // e.g., 'LOINC'

  @Column('varchar', { length: 100 })
  revision!: string; // Hash or revision ID from Google Sheets

  @Column('integer')
  totalRowsProcessed!: number;

  @Column('integer')
  rowsAdded!: number;

  @Column('integer')
  rowsModified!: number;

  @Column('integer')
  rowsDeleted!: number;

  @Column('text', { nullable: true })
  status!: string; // 'success', 'partial', 'failed'

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  timestamp!: Date;

  @Column('varchar', { length: 255, nullable: true })
  triggeredBy?: string; // User email or 'system'
}
