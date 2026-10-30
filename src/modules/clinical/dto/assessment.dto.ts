import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import type { RxShopClerkingState } from '../types/clinical-triage.types';

export class AssessClinicalStateDto {
  @ApiProperty({
    description:
      'Canonical clerking state read from WorkflowInstance.state (server-authoritative; never persisted here)',
  })
  @IsObject()
  state!: RxShopClerkingState;
}

export class RecommendClinicalStateDto {
  @ApiProperty({
    description:
      'Canonical clerking state read from WorkflowInstance.state (server-authoritative; never persisted here)',
  })
  @IsObject()
  state!: RxShopClerkingState;
}

export class ClinicalEvidenceQueryDto {
  @ApiProperty({ description: "Referenced entity FQN, e.g. 'TreatmentPack:ACNE_SELF_CARE_001'" })
  @IsString()
  referencedEntity!: string;
}
