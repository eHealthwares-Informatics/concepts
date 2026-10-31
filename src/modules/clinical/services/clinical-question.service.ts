import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClinicalQuestionDto } from '../dto/complaints.dto';
import { ClinicalQuestionEntity } from '../entities';
import type { ClinicalQuestionType } from '../types/clinical.types';

export const toClinicalQuestionType = (
  entity: ClinicalQuestionEntity,
): ClinicalQuestionType => ({
  id: entity.id,
  code: entity.code,
  questionId: entity.questionId,
  clinicalAttribute: entity.clinicalAttribute,
  responseInterpretation: entity.responseInterpretation ?? {},
  purpose: entity.purpose,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

/**
 * Clinical question mappings: questionnaire questions → canonical clinical
 * attributes, so one collected answer serves symptom and contraindication
 * evaluation. `purpose=CONTRAINDICATION` rows drive the screening questions a
 * complaint must ask.
 */
@Injectable()
export class ClinicalQuestionService {
  constructor(
    @InjectRepository(ClinicalQuestionEntity)
    private readonly repository: Repository<ClinicalQuestionEntity>,
  ) {}

  async list(purpose?: string): Promise<ClinicalQuestionType[]> {
    const qb = this.repository.createQueryBuilder('question').orderBy('question.code', 'ASC');
    if (purpose) qb.where('question.purpose = :purpose', { purpose });
    const rows = await qb.getMany();
    return rows.map(toClinicalQuestionType);
  }

  async create(payload: CreateClinicalQuestionDto): Promise<ClinicalQuestionType> {
    const entity = this.repository.create({
      code: payload.code.trim().toUpperCase(),
      questionId: payload.questionId.trim(),
      clinicalAttribute: payload.clinicalAttribute.trim(),
      responseInterpretation: payload.responseInterpretation ?? {},
      purpose: payload.purpose ?? 'SYMPTOM',
    });
    return toClinicalQuestionType(await this.repository.save(entity));
  }

  /** Screening questions a complaint must ask (purpose=CONTRAINDICATION). */
  async screeningQuestions(complaintCode: string): Promise<ClinicalQuestionType[]> {
    const code = (complaintCode ?? '').toUpperCase();
    const rows = await this.repository
      .createQueryBuilder('question')
      .where('question.purpose = :purpose', { purpose: 'CONTRAINDICATION' })
      .getMany();
    return rows
      .filter((row) => {
        const complaints = (row.responseInterpretation ?? {}).complaints;
        return Array.isArray(complaints)
          ? complaints.map((c: string) => String(c).toUpperCase()).includes(code)
          : false;
      })
      .map(toClinicalQuestionType);
  }
}
