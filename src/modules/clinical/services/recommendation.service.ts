import { Injectable, Logger } from '@nestjs/common';
import { ClinicalAssessmentService } from './clinical-assessment.service';
import { ClinicalMedicationService } from './clinical-medication.service';
import { TreatmentPackService } from './treatment-pack.service';
import type { AvailableItemType, RecommendationResult } from '../types/clinical.types';
import {
  RecommendationResponseStatus,
  RxShopClerkingState,
  TriageOutcome,
} from '../types/clinical-triage.types';

/**
 * Recommendation service (§8): composes the deterministic assessment with
 * treatment-pack resolution and available-product lookup.
 *
 * Notification-only + escalation contract:
 *  - The TypeScript boundary enforces the documented terminal outcomes; every
 *    other branch is MORE_INFORMATION_REQUIRED.
 *  - Clinical answers can never mutate pack or APPROVED state here.
 */
@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly assessment: ClinicalAssessmentService,
    private readonly medications: ClinicalMedicationService,
    private readonly packs: TreatmentPackService,
  ) {}

  async recommend(state: RxShopClerkingState): Promise<RecommendationResult> {
    const result = await this.assessment.assess(state);

    if (
      result.status === RecommendationResponseStatus.REFERRAL_REQUIRED ||
      result.status === RecommendationResponseStatus.PHARMACIST_REVIEW_REQUIRED
    ) {
      // ESCALATION: interrupt flow, stop pharmacological fulfilment.
      return {
        status: result.status,
        triageOutcome: result.triageOutcome,
        reasonCodes: result.reasonCodes,
        protocolVersion: result.protocolVersion,
        notifications: result.firedRules.map((rule) => ({
          type: `RED_FLAG_${rule.severity}`,
          message: rule.message,
        })),
      };
    }

    if (result.status === RecommendationResponseStatus.MORE_INFORMATION_REQUIRED) {
      return {
        status: result.status,
        triageOutcome: result.triageOutcome,
        reasonCodes: result.reasonCodes,
        missingFields: result.missingFields,
        protocolVersion: result.protocolVersion,
      };
    }

    if (result.status === RecommendationResponseStatus.NO_SUITABLE_OTC_OPTION) {
      return {
        status: result.status,
        triageOutcome: result.triageOutcome,
        reasonCodes: result.reasonCodes,
        protocolVersion: result.protocolVersion,
      };
    }

    // RECOMMENDATIONS_AVAILABLE: resolve packs + product availability.
    const resolvedPacks = await this.packs.resolve(state.complaintCodes, {
      contraindications: (state.contraindications ?? [])
        .filter((entry) => entry.value === true)
        .map((entry) => entry.code),
      additionalInfo: state.additionalInfo ?? {},
    });

    if (!resolvedPacks.length) {
      return {
        status: RecommendationResponseStatus.NO_SUITABLE_OTC_OPTION,
        triageOutcome: TriageOutcome.NO_SUITABLE_OTC_OPTION,
        reasonCodes: ['NO_APPROVED_PACK_FOR_COMPLAINT'],
        protocolVersion: result.protocolVersion,
      };
    }

    // Pack items may reference generics by id and/or GN code — normalise both,
    // then resolve sellable products through the mapped catalogue rows.
    const itemIds = resolvedPacks
      .flatMap((pack) => pack.items)
      .map((item) => item.genericDrugId)
      .filter((id): id is string => Boolean(id));
    const itemCodes = resolvedPacks
      .flatMap((pack) => pack.items)
      .map((item) => item.genericDrugCode)
      .filter((code): code is string => Boolean(code));

    const drugs = await this.medications.findForItems(itemIds, itemCodes);
    const codeById = new Map(drugs.map((drug) => [drug.id, drug.code]));
    const idByCode = new Map(drugs.map((drug) => [drug.code.toUpperCase(), drug.id]));

    for (const pack of resolvedPacks) {
      for (const item of pack.items) {
        if (!item.genericDrugCode && item.genericDrugId) {
          item.genericDrugCode = codeById.get(item.genericDrugId) ?? null;
        }
        if (!item.genericDrugId && item.genericDrugCode) {
          item.genericDrugId = idByCode.get(item.genericDrugCode.toUpperCase()) ?? null;
        }
      }
    }

    const drugIds = [...new Set(drugs.map((drug) => drug.id))];
    const available = await this.medications.availableProductsForDrugIds(drugIds);
    const byGenericCode = new Map<string, AvailableItemType[]>();
    for (const item of available) {
      const bucket = byGenericCode.get(item.genericMedicineCode) ?? [];
      bucket.push(item);
      byGenericCode.set(item.genericMedicineCode, bucket);
    }

    const recommendations: RecommendationResult['recommendations'] = resolvedPacks.map((pack) => {
      // One availability entry per generic medicine the pack actually uses.
      const packCodes = [
        ...new Set(
          pack.items
            .map((item) => item.genericDrugCode)
            .filter((code): code is string => Boolean(code)),
        ),
      ];
      const itemsAvailability = packCodes
        .map((code) => (byGenericCode.get(code) ?? [])[0])
        .filter((item): item is AvailableItemType => Boolean(item));

      return {
        packId: pack.packId,
        packCode: pack.packCode,
        name: pack.name,
        version: pack.version,
        items: pack.items,
        counselling: pack.counselling,
        warnings: pack.warnings,
        itemsAvailability,
      };
    });

    const requiresPharmacistReview = resolvedPacks.some((pack) => pack.requiresPharmacistReview);

    this.logger.log(
      `Recommendation for ${state.sessionId}: ${resolvedPacks.length} packs, review=${requiresPharmacistReview}`,
    );

    return {
      status: RecommendationResponseStatus.RECOMMENDATIONS_AVAILABLE,
      triageOutcome: TriageOutcome.SELF_CARE_ELIGIBLE,
      reasonCodes: ['NO_RED_FLAGS_PACKS_MATCHED'],
      protocolVersion: result.protocolVersion,
      recommendations,
      pharmacistReviewRequired: requiresPharmacistReview || undefined,
    };
  }
}
