import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenericDrugEntity, GenericProductEntity } from '../drugs/entities';
import {
  ClinicalQuestionEntity,
  ComplaintEntity,
  ComplaintSymptomEntity,
  SymptomEntity,
} from './entities/complaint.entity';
import { ContraindicationEntity, RedFlagRuleEntity } from './entities/red-flag-rule.entity';
import {
  ClinicalEvidenceEntity,
  TreatmentPackEntity,
  TreatmentPackItemEntity,
} from './entities/treatment-pack.entity';
import { ClinicalAssessmentService } from './services/clinical-assessment.service';
import { ClinicalEvidenceService } from './services/clinical-evidence.service';
import { ClinicalMedicationService } from './services/clinical-medication.service';
import { ClinicalQuestionService } from './services/clinical-question.service';
import { ComplaintService } from './services/complaint.service';
import { ContraindicationService } from './services/contraindication.service';
import { RecommendationService } from './services/recommendation.service';
import { RedFlagRuleService } from './services/red-flag-rule.service';
import { SymptomService } from './services/symptom.service';
import { TreatmentPackService } from './services/treatment-pack.service';
import { ClinicalSeederService } from './seeders/clinical.seeder';
import { SeedClinicalCommand } from './commands/seed-clinical.command';
import { ClinicalAdminController } from './controllers/clinical-admin.controller';
import { RecommendationController } from './controllers/recommendation.controller';

/**
 * Clinical module — complaint-led clerking knowledge base plus the
 * deterministic red-flag assessment and treatment-pack recommendation
 * endpoints.
 *
 * Moved here from the conversation service: clinical reference data and the
 * rules that consume it are concepts, not conversation state. The conversation
 * engine still owns `WorkflowInstance.state`; this module only evaluates the
 * state it is given. Admin CRUD is x-api-key guarded; assessment and
 * recommendation endpoints are open (as before).
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ComplaintEntity,
      SymptomEntity,
      ComplaintSymptomEntity,
      ClinicalQuestionEntity,
      RedFlagRuleEntity,
      ContraindicationEntity,
      TreatmentPackEntity,
      TreatmentPackItemEntity,
      ClinicalEvidenceEntity,
      GenericDrugEntity,
      GenericProductEntity,
    ]),
  ],
  controllers: [ClinicalAdminController, RecommendationController],
  providers: [
    ComplaintService,
    SymptomService,
    ClinicalQuestionService,
    RedFlagRuleService,
    ContraindicationService,
    ClinicalEvidenceService,
    ClinicalMedicationService,
    TreatmentPackService,
    ClinicalAssessmentService,
    RecommendationService,
    ClinicalSeederService,
    SeedClinicalCommand,
  ],
  exports: [
    ComplaintService,
    SymptomService,
    ClinicalQuestionService,
    RedFlagRuleService,
    ContraindicationService,
    ClinicalEvidenceService,
    ClinicalMedicationService,
    TreatmentPackService,
    ClinicalAssessmentService,
    RecommendationService,
    ClinicalSeederService,
  ],
})
export class ClinicalModule {}
