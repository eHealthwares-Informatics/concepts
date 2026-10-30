import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenericDrugEntity, GenericProductEntity } from '../../drugs/entities';
import {
  ClinicalEvidenceEntity,
  ComplaintEntity,
  ComplaintSymptomEntity,
  ContraindicationEntity,
  RedFlagRuleEntity,
  SymptomEntity,
  TreatmentPackEntity,
} from '../entities';
import {
  ClinicalStatus,
  RedFlagSeverity,
  TriageOutcome,
  TreatmentPackStatus,
} from '../types/clinical-triage.types';

export interface ClinicalSeederResult {
  success: boolean;
  message: string;
  stats: {
    complaints: number;
    symptoms: number;
    associations: number;
    redFlagRules: number;
    contraindications: number;
    genericMedicines: number;
    productMappings: number;
    treatmentPacks: number;
    evidence: number;
  };
}

/**
 * Baseline clinical knowledge base for complaint-led clerking.
 *
 * Idempotent: every row is upserted on its business key (`code`, or the
 * complaint/symptom pair, or the evidence reference). This is a starter set so
 * the assessment and recommendation paths are exercisable end-to-end; real
 * content is authored through the admin API or the seed service.
 */
@Injectable()
export class ClinicalSeederService {
  private readonly logger = new Logger(ClinicalSeederService.name);

  constructor(
    @InjectRepository(ComplaintEntity)
    private readonly complaints: Repository<ComplaintEntity>,
    @InjectRepository(SymptomEntity)
    private readonly symptoms: Repository<SymptomEntity>,
    @InjectRepository(ComplaintSymptomEntity)
    private readonly associations: Repository<ComplaintSymptomEntity>,
    @InjectRepository(RedFlagRuleEntity)
    private readonly redFlagRules: Repository<RedFlagRuleEntity>,
    @InjectRepository(ContraindicationEntity)
    private readonly contraindications: Repository<ContraindicationEntity>,
    @InjectRepository(TreatmentPackEntity)
    private readonly treatmentPacks: Repository<TreatmentPackEntity>,
    @InjectRepository(ClinicalEvidenceEntity)
    private readonly evidence: Repository<ClinicalEvidenceEntity>,
    @InjectRepository(GenericDrugEntity)
    private readonly drugs: Repository<GenericDrugEntity>,
    @InjectRepository(GenericProductEntity)
    private readonly products: Repository<GenericProductEntity>,
  ) {}

  async seedClinical(): Promise<ClinicalSeederResult> {
    const stats: ClinicalSeederResult['stats'] = {
      complaints: 0,
      symptoms: 0,
      associations: 0,
      redFlagRules: 0,
      contraindications: 0,
      genericMedicines: 0,
      productMappings: 0,
      treatmentPacks: 0,
      evidence: 0,
    };

    try {
      // ── Complaint + symptoms ───────────────────────────────────────────
      await this.upsertComplaint(
        {
          code: 'ACNE',
          name: 'Acne',
          slug: 'acne',
          category: 'Skin',
          synonyms: ['pimples', 'acne vulgaris'],
          localExpressions: ['pimples'],
          status: ClinicalStatus.ACTIVE,
          sourceRefs: ['NSTG 2022 acne-vulgaris'],
          metadata: { protocol: 'NSTG-2022-v1', bodySystem: 'skin' },
        },
        stats,
      );

      await this.upsertSymptom(
        {
          code: 'PAPULES',
          name: 'Red bumps / pimples',
          synonyms: ['papules', 'pimples'],
          category: 'Skin',
          interpretation: { bodySystem: 'skin' },
        },
        stats,
      );
      await this.upsertSymptom(
        {
          code: 'SEVERE_PAIN',
          name: 'Severe pain',
          synonyms: ['severe pain'],
          category: 'Pain',
          interpretation: { bodySystem: 'general', redFlagAdjacent: true },
        },
        stats,
      );

      await this.upsertAssociation('ACNE', 'PAPULES', 'PRIMARY', stats);
      await this.upsertAssociation('ACNE', 'SEVERE_PAIN', 'CONDITIONAL', stats);

      // ── Red-flag rule: severe pain escalates immediately ───────────────
      const redFlag = await this.redFlagRules.findOne({
        where: { code: 'ACNE_RF_SEVERE_PAIN' },
      });
      if (!redFlag) {
        await this.redFlagRules.save(
          this.redFlagRules.create({
            code: 'ACNE_RF_SEVERE_PAIN',
            conditions: { complaintCodes: ['ACNE'], presentSymptoms: ['SEVERE_PAIN'] },
            severity: RedFlagSeverity.CRITICAL,
            triageOutcome: TriageOutcome.EMERGENCY_ASSESSMENT,
            requiredAction: 'REFER_IMMEDIATELY',
            message:
              'Severe pain with an acne presentation may indicate a deeper skin infection — refer for urgent assessment.',
            protocolVersion: 'NSTG-2022-v1',
            evidence: { source: 'NSTG', edition: '2022' },
            isEnabled: true,
          }),
        );
        stats.redFlagRules++;
      }

      // ── Contraindication: pregnancy excludes topical retinoids ─────────
      const pregnancy = await this.contraindications.findOne({ where: { code: 'PREGNANCY' } });
      if (!pregnancy) {
        await this.contraindications.save(
          this.contraindications.create({
            code: 'PREGNANCY',
            applicability: { complaints: ['ACNE'] },
            significance: 'ABSOLUTE',
            medicineExclusions: ['TRETINOIN_TOPICAL_0025'],
          }),
        );
        stats.contraindications++;
      }

      // ── Generic regimen + catalogue product mapping ────────────────────
      const genericCode = 'TRETINOIN_TOPICAL_0025';
      let generic = await this.drugs.findOne({ where: { code: genericCode } });
      if (!generic) {
        generic = await this.drugs.save(
          this.drugs.create({
            code: genericCode,
            name: 'Tretinoin 0.025% topical',
            source: 'clinical/seeder',
            isOtc: true,
            ingredients: [{ ingredient: 'Tretinoin', strength: '0.025%' }],
            strengths: ['0.025%'],
            routes: ['topical'],
            dosageForms: ['cream', 'gel'],
            restrictions: { pregnancyContraindicationCode: 'PREGNANCY' },
          }),
        );
        stats.genericMedicines++;
      }

      const productCode = 'GP-DEMO-TRETINOIN-0025';
      const product = await this.products.findOne({ where: { code: productCode } });
      if (!product) {
        await this.products.save(
          this.products.create({
            code: productCode,
            name: 'Tretinoin 0.025% cream',
            dosageForm: 'cream',
            strength: '0.025%',
            genericDrug: generic,
            clinicalMappingStatus: 'matched_by_name',
            commercialItemCode: 'DEMO-TRET-0025',
            requiredAttributes: { form: 'cream', strength: '0.025%' },
          }),
        );
        stats.productMappings++;
      }

      // ── Approved treatment pack ────────────────────────────────────────
      const existingPack = await this.treatmentPacks.findOne({
        where: { code: 'ACNE_SELF_CARE_001' },
      });
      if (!existingPack) {
        await this.treatmentPacks.save(
          this.treatmentPacks.create({
            code: 'ACNE_SELF_CARE_001',
            name: 'Acne — first-line self care',
            description: 'Topical retinoid with counselling for mild comedonal acne.',
            complaintCodes: ['ACNE'],
            eligibilityRules: { ageMin: 12 },
            exclusionRules: { contraindications: ['PREGNANCY'] },
            evidence: { source: 'NSTG', edition: '2022', section: 'acne-vulgaris' },
            status: TreatmentPackStatus.APPROVED,
            version: 1,
            items: [
              {
                itemType: 'GENERIC_MEDICINE',
                genericDrugId: generic.id,
                genericDrugCode: generic.code,
                protocolRegimenCode: 'NSTG-2022:acne:first-line',
                instructions: {
                  dose: 'Apply a thin layer',
                  frequency: 'At night',
                  duration: '12 weeks',
                },
                sequence: 0,
                required: true,
              },
              {
                itemType: 'COUNSELLING',
                instructions: {
                  topic: 'Sun protection',
                  message: 'Use daily sunscreen; retinoids increase photosensitivity.',
                },
                sequence: 1,
                required: false,
              },
            ],
          }),
        );
        stats.treatmentPacks++;
      }

      // ── Citation ───────────────────────────────────────────────────────
      const evidenceRef = 'TreatmentPack:ACNE_SELF_CARE_001';
      const existingEvidence = await this.evidence.findOne({
        where: { referencedEntity: evidenceRef, source: 'NSTG' },
      });
      if (!existingEvidence) {
        await this.evidence.save(
          this.evidence.create({
            referencedEntity: evidenceRef,
            source: 'NSTG',
            edition: '2022',
            section: 'acne-vulgaris',
            publicationDate: '2022-01-01',
            reviewedBy: 'seed:clinical',
            protocolVersion: 'NSTG-2022-v1',
          }),
        );
        stats.evidence++;
      }

      const message = `Seeded ${stats.complaints} complaints, ${stats.symptoms} symptoms, ${stats.redFlagRules} red-flag rules, ${stats.treatmentPacks} packs`;
      this.logger.log(message);
      return { success: true, message, stats };
    } catch (err: any) {
      this.logger.error(`Clinical seed failed: ${err.message}`);
      return { success: false, message: err.message, stats };
    }
  }

  private async upsertComplaint(
    payload: Partial<ComplaintEntity> & { code: string },
    stats: ClinicalSeederResult['stats'],
  ): Promise<void> {
    const code = payload.code.toUpperCase();
    const existing = await this.complaints.findOne({ where: { code } });
    if (existing) return;
    await this.complaints.save(this.complaints.create({ ...payload, code }));
    stats.complaints++;
  }

  private async upsertSymptom(
    payload: Partial<SymptomEntity> & { code: string },
    stats: ClinicalSeederResult['stats'],
  ): Promise<void> {
    const code = payload.code.toUpperCase();
    const existing = await this.symptoms.findOne({ where: { code } });
    if (existing) return;
    await this.symptoms.save(this.symptoms.create({ ...payload, code }));
    stats.symptoms++;
  }

  private async upsertAssociation(
    complaintCode: string,
    symptomCode: string,
    applicability: string,
    stats: ClinicalSeederResult['stats'],
  ): Promise<void> {
    const existing = await this.associations.findOne({
      where: { complaintCode: complaintCode.toUpperCase(), symptomCode: symptomCode.toUpperCase() },
    });
    if (existing) return;
    await this.associations.save(
      this.associations.create({
        complaintCode: complaintCode.toUpperCase(),
        symptomCode: symptomCode.toUpperCase(),
        applicability,
        conditionalRules: {},
      }),
    );
    stats.associations++;
  }
}
