import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClinicalStatus } from '../types/clinical-triage.types';

/**
 * Complaint — canonical code for a common, pharmacy-triageable condition
 * (§4.2 of the clerking spec). Codes are uppercase mnemonics (ACNE, HEADACHE);
 * synonyms/aliases let free-text descriptions and local expressions resolve to
 * the same canonical row.
 */
@Entity('complaints')
@Index('idx_complaints_code', ['code'], { unique: true })
@Index('idx_complaints_slug', ['slug'], { unique: true })
export class ComplaintEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Uppercase mnemonic, e.g. ACNE. */
  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'text' })
  name!: string;

  /** Lowercase slug, e.g. acne. */
  @Column({ type: 'text' })
  slug!: string;

  /** Grouping used by the clerking menu, e.g. Skin, Pain & Fever. */
  @Column({ type: 'text' })
  category!: string;

  @Column({ type: 'simple-array', default: '' })
  synonyms!: string[];

  /** Local-language and colloquial phrasings. */
  @Column({ name: 'local_expressions', type: 'simple-array', default: '' })
  localExpressions!: string[];

  @Column({ type: 'text', default: ClinicalStatus.ACTIVE })
  status!: ClinicalStatus;

  /** Guideline/source references, e.g. 'NSTG 2022 acne-vulgaris'. */
  @Column({ name: 'source_refs', type: 'simple-array', default: '' })
  sourceRefs!: string[];

  @Column({ type: 'simple-json', nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/**
 * Symptom — canonical symptom vocabulary with clinical interpretation metadata
 * the assessment engine can reason over.
 */
@Entity('symptoms')
@Index('idx_symptoms_code', ['code'], { unique: true })
export class SymptomEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Uppercase code, e.g. PAPULES. */
  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'simple-array', default: '' })
  synonyms!: string[];

  @Column({ type: 'text' })
  category!: string;

  /**
   * Interpretation metadata (severity weighting, body system, red-flag-adjacent
   * flags). Opaque to the schema, consumed by the rules engine.
   */
  @Column({ type: 'simple-json', nullable: true })
  interpretation!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/**
 * ComplaintSymptom — which symptoms apply to a complaint, whether they are
 * asked upfront or conditionally, and the question that collects them.
 */
@Entity('complaint_symptoms')
@Index('idx_complaint_symptoms_complaint', ['complaintCode'])
@Index('idx_complaint_symptoms_pair', ['complaintCode', 'symptomCode'])
export class ComplaintSymptomEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'complaint_code', type: 'text' })
  complaintCode!: string;

  @Column({ name: 'symptom_code', type: 'text' })
  symptomCode!: string;

  /** PRIMARY | SECONDARY | CONDITIONAL. */
  @Column({ type: 'text', default: 'PRIMARY' })
  applicability!: string;

  /** Questionnaire question id that collects this symptom. */
  @Column({ name: 'question_ref', type: 'text', nullable: true })
  questionRef!: string | null;

  /**
   * Conditional rules, e.g. [{ ifSymptomCode: 'PAPULES', requireSymptomCode: 'PAIN' }].
   */
  @Column({ name: 'conditional_rules', type: 'simple-json', nullable: true })
  conditionalRules!: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/**
 * ClinicalQuestion — maps questionnaire questions onto canonical clinical
 * attributes so one collected answer serves symptom and contraindication
 * evaluation.
 */
@Entity('clinical_questions')
@Index('idx_clinical_questions_code', ['code'], { unique: true })
@Index('idx_clinical_questions_purpose', ['purpose'])
export class ClinicalQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  code!: string;

  /** Questionnaire question id this mapping points at. */
  @Column({ name: 'question_id', type: 'text' })
  questionId!: string;

  /** Canonical attribute, e.g. 'symptom.PAPULES' or 'allergy.PENICILLIN'. */
  @Column({ name: 'clinical_attribute', type: 'text' })
  clinicalAttribute!: string;

  @Column({ name: 'response_interpretation', type: 'simple-json', nullable: true })
  responseInterpretation!: Record<string, any> | null;

  /** RED_FLAG | SYMPTOM | CONTRAINDICATION | CONTEXT. */
  @Column({ type: 'text', default: 'SYMPTOM' })
  purpose!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
