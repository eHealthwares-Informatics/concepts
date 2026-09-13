import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { CodingConcept } from '../../../common/enums/concept.enum';
import { ConceptCodingEntity } from './concept-coding.entity';

/**
 * Thin concept-coding wrappers for administrative-area codes.
 *
 * Seed imports these as flat `concepts.codings` rows (state_code, lga_code, ward_code
 * columns land on the `code` field; `concept` is pre-set to the right enum value).
 *
 * Facilities module still owns the concrete FK tables (StateEntity, LgaEntity, WardEntity)
 * used by FacilityEntity. These wrappers exist so seed can safely import administrative
 * boundaries without depending on the facilities module.
 */
@Entity('admin_states')
@Index(['concept', 'code'])
export class StateCodingEntity extends ConceptCodingEntity {
  constructor() {
    super();
    this.concept = CodingConcept.STATE;
  }
}

@Entity('admin_lgas')
@Index(['concept', 'code'])
export class LgaCodingEntity extends ConceptCodingEntity {
  constructor() {
    super();
    this.concept = CodingConcept.LGA;
  }
}

@Entity('admin_wards')
@Index(['concept', 'code'])
export class WardCodingEntity extends ConceptCodingEntity {
  constructor() {
    super();
    this.concept = CodingConcept.WARD;
  }
}
