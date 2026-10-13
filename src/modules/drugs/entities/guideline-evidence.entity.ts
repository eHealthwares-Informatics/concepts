import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClinicalGuidelineEntity } from './clinical-guideline.entity';

/**
 * Guideline evidence — one citation/audit row per guideline (source name,
 * edition, section, page, reviewer). Seeded alongside the guideline import.
 */
@Entity('clinical_guideline_evidence')
@Index(['guidelineId'])
export class GuidelineEvidenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'guideline_id', type: 'uuid' })
  guidelineId!: string;

  @ManyToOne(() => ClinicalGuidelineEntity, (g) => g.evidence, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guideline_id' })
  guideline!: ClinicalGuidelineEntity;

  /** e.g. 'NSTG' (Nigeria Standard Treatment Guidelines). */
  @Column({ type: 'text' })
  source!: string;

  /** e.g. '2022'. */
  @Column({ type: 'text' })
  edition!: string;

  /** Section within the guideline, e.g. 'treatment.drug'. */
  @Column({ type: 'text', nullable: true })
  section!: string | null;

  /** Free-text reviewer/editor name. */
  @Column({ name: 'reviewed_by', type: 'text', nullable: true })
  reviewedBy!: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  /** Optional protocol version pin, e.g. 'NSTG-2022-v1'. */
  @Column({ name: 'protocol_version', type: 'text', nullable: true })
  protocolVersion!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
