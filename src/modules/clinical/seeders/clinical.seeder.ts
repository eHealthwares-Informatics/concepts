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

      // ══ Complaint: headache (tension-type / simple analgesia) ══════════
      await this.upsertComplaint(
        {
          code: 'HEADACHE',
          name: 'Headache',
          slug: 'headache',
          category: 'Pain & Fever',
          synonyms: ['head pain', 'cephalgia'],
          localExpressions: ['head is paining me'],
          status: ClinicalStatus.ACTIVE,
          sourceRefs: ['NSTG 2022 headache'],
          metadata: { protocol: 'NSTG-2022-v1', bodySystem: 'neurological' },
        },
        stats,
      );

      for (const symptom of [
        {
          code: 'SUDDEN_ONSET',
          name: 'Sudden, worst-ever headache',
          synonyms: ['thunderclap headache'],
          category: 'Neurological',
          interpretation: { bodySystem: 'neurological', redFlagAdjacent: true },
        },
        {
          code: 'NECK_STIFFNESS',
          name: 'Stiff neck',
          synonyms: ['neck stiffness', 'cannot bend neck'],
          category: 'Neurological',
          interpretation: { bodySystem: 'neurological', redFlagAdjacent: true },
        },
      ]) {
        await this.upsertSymptom(symptom, stats);
      }

      await this.upsertAssociation('HEADACHE', 'SUDDEN_ONSET', 'CONDITIONAL', stats);
      await this.upsertAssociation('HEADACHE', 'NECK_STIFFNESS', 'CONDITIONAL', stats);

      // ── Red flags: thunderclap headache and meningism escalate ─────────
      const headacheRedFlags = [
        {
          code: 'HEADACHE_RF_THUNDERCLAP',
          conditions: { complaintCodes: ['HEADACHE'], presentSymptoms: ['SUDDEN_ONSET'] },
          message:
            'A headache that peaks within a minute may be a bleed around the brain — refer for emergency assessment.',
        },
        {
          code: 'HEADACHE_RF_NECK_STIFFNESS',
          conditions: { complaintCodes: ['HEADACHE'], presentSymptoms: ['NECK_STIFFNESS'] },
          message:
            'Headache with a stiff neck may indicate meningitis — refer for emergency assessment.',
        },
      ];

      for (const rule of headacheRedFlags) {
        const existing = await this.redFlagRules.findOne({ where: { code: rule.code } });
        if (existing) continue;
        await this.redFlagRules.save(
          this.redFlagRules.create({
            code: rule.code,
            conditions: rule.conditions,
            severity: RedFlagSeverity.CRITICAL,
            triageOutcome: TriageOutcome.EMERGENCY_ASSESSMENT,
            requiredAction: 'REFER_IMMEDIATELY',
            message: rule.message,
            protocolVersion: 'NSTG-2022-v1',
            evidence: { source: 'NSTG', edition: '2022' },
            isEnabled: true,
          }),
        );
        stats.redFlagRules++;
      }

      // ── Contraindication: liver disease excludes paracetamol ───────────
      const liverDisease = await this.contraindications.findOne({
        where: { code: 'LIVER_DISEASE' },
      });
      if (!liverDisease) {
        await this.contraindications.save(
          this.contraindications.create({
            code: 'LIVER_DISEASE',
            applicability: { complaints: ['HEADACHE'] },
            significance: 'ABSOLUTE',
            medicineExclusions: ['PARACETAMOL_500_TABLET'],
          }),
        );
        stats.contraindications++;
      }

      // ── Generic regimen + catalogue product mapping ────────────────────
      const paracetamolCode = 'PARACETAMOL_500_TABLET';
      let paracetamol = await this.drugs.findOne({ where: { code: paracetamolCode } });
      if (!paracetamol) {
        paracetamol = await this.drugs.save(
          this.drugs.create({
            code: paracetamolCode,
            name: 'Paracetamol 500mg tablet',
            source: 'clinical/seeder',
            isOtc: true,
            ingredients: [{ ingredient: 'Paracetamol', strength: '500mg' }],
            strengths: ['500mg'],
            routes: ['oral'],
            dosageForms: ['tablet'],
            restrictions: {
              maxDailyDose: '4000mg',
              contraindicationCode: 'LIVER_DISEASE',
            },
          }),
        );
        stats.genericMedicines++;
      }

      const paracetamolProductCode = 'GP-DEMO-PARACETAMOL-500';
      const paracetamolProduct = await this.products.findOne({
        where: { code: paracetamolProductCode },
      });
      if (!paracetamolProduct) {
        await this.products.save(
          this.products.create({
            code: paracetamolProductCode,
            name: 'Paracetamol 500mg tablet (100 pack)',
            dosageForm: 'tablet',
            strength: '500mg',
            genericDrug: paracetamol,
            clinicalMappingStatus: 'matched_by_name',
            commercialItemCode: 'DEMO-PARA-500',
            requiredAttributes: { form: 'tablet', strength: '500mg' },
          }),
        );
        stats.productMappings++;
      }

      // ── Approved treatment pack ────────────────────────────────────────
      const headachePack = await this.treatmentPacks.findOne({
        where: { code: 'HEADACHE_SELF_CARE_001' },
      });
      if (!headachePack) {
        await this.treatmentPacks.save(
          this.treatmentPacks.create({
            code: 'HEADACHE_SELF_CARE_001',
            name: 'Headache — simple analgesia',
            description:
              'Paracetamol with rest and hydration advice for headache without red flags.',
            complaintCodes: ['HEADACHE'],
            eligibilityRules: { ageMin: 12 },
            exclusionRules: { contraindications: ['LIVER_DISEASE'] },
            evidence: { source: 'NSTG', edition: '2022', section: 'headache' },
            status: TreatmentPackStatus.APPROVED,
            version: 1,
            items: [
              {
                itemType: 'GENERIC_MEDICINE',
                genericDrugId: paracetamol.id,
                genericDrugCode: paracetamol.code,
                protocolRegimenCode: 'NSTG-2022:headache:first-line',
                instructions: {
                  dose: '1–2 tablets (500mg–1g)',
                  frequency: 'Every 6 hours as needed',
                  duration: 'Up to 3 days',
                  maxDailyDose: '4000mg',
                },
                sequence: 0,
                required: true,
              },
              {
                itemType: 'COUNSELLING',
                instructions: {
                  topic: 'Hydration and rest',
                  message:
                    'Drink water, rest in a quiet room, and return if the headache worsens or new symptoms appear.',
                },
                sequence: 1,
                required: false,
              },
            ],
          }),
        );
        stats.treatmentPacks++;
      }

      // ── Citations ──────────────────────────────────────────────────────
      for (const citation of [
        { reference: 'TreatmentPack:ACNE_SELF_CARE_001', section: 'acne-vulgaris' },
        { reference: 'TreatmentPack:HEADACHE_SELF_CARE_001', section: 'headache' },
      ]) {
        const existingEvidence = await this.evidence.findOne({
          where: { referencedEntity: citation.reference, source: 'NSTG' },
        });
        if (existingEvidence) continue;
        await this.evidence.save(
          this.evidence.create({
            referencedEntity: citation.reference,
            source: 'NSTG',
            edition: '2022',
            section: citation.section,
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
