import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TriageOutcome } from '../types/clinical-triage.types';

/**
 * RedFlagRule — deterministic, server-authoritative safety rule. Evaluated by
 * the assessment engine after every clinically relevant answer; outcomes are
 * never decided by an LLM and cannot be bypassed by client actions.
 */
@Entity('red_flag_rules')
@Index('idx_red_flag_rules_code', ['code'], { unique: true })
@Index('idx_red_flag_rules_enabled', ['isEnabled'])
export class RedFlagRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Uppercase, e.g. ACNE_RF_SEVERE_PAIN. */
  @Column({ type: 'text' })
  code!: string;

  /**
   * Rule predicate shape:
   *   { complaintCodes?: string[],
   *     presentSymptoms?: string[],       // ANY-of
   *     absentSymptoms?: string[],        // ALL-of must be ABSENT
   *     contraindications?: { code: string; matchValue?: unknown }[],
   *     requiredFields?: string[] }
   */
  @Column({ type: 'simple-json', nullable: true })
  conditions!: Record<string, any> | null;

  /** CRITICAL | MAJOR | MINOR. */
  @Column({ type: 'text' })
  severity!: string;

  @Column({ name: 'triage_outcome', type: 'text' })
  triageOutcome!: TriageOutcome;

  @Column({ name: 'required_action', type: 'text' })
  requiredAction!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'protocol_version', type: 'text' })
  protocolVersion!: string;

  @Column({ type: 'simple-json', nullable: true })
  evidence!: Record<string, any> | null;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/**
 * Contraindication — canonical screening question with medicine exclusions.
 * Evaluated at recommendation time: any matching significant contraindication
 * removes the excluded medicines from consideration.
 */
@Entity('contraindications')
@Index('idx_contraindications_code', ['code'], { unique: true })
export class ContraindicationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Uppercase, e.g. PREGNANCY, ALLERGY_RETINOID. */
  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'simple-json', nullable: true })
  applicability!: Record<string, any> | null;

  /** ABSOLUTE | RELATIVE. */
  @Column({ type: 'text' })
  significance!: string;

  @Column({ name: 'medicine_exclusions', type: 'simple-array', default: '' })
  medicineExclusions!: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
