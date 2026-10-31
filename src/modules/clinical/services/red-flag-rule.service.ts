import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRedFlagRuleDto,
  ListRedFlagRulesDto,
  UpdateRedFlagRuleDto,
} from '../dto/red-flag-rules.dto';
import { RedFlagRuleEntity } from '../entities';
import type { RedFlagRuleType } from '../types/clinical.types';
import { RedFlagSeverity } from '../types/clinical-triage.types';

/** Ordered escalation priority; lower index = more severe. */
export const SEVERITY_ORDER: string[] = [
  RedFlagSeverity.CRITICAL,
  RedFlagSeverity.MAJOR,
  RedFlagSeverity.MINOR,
];

export const toRedFlagRuleType = (entity: RedFlagRuleEntity): RedFlagRuleType => ({
  id: entity.id,
  code: entity.code,
  conditions: entity.conditions ?? {},
  severity: entity.severity,
  triageOutcome: entity.triageOutcome,
  requiredAction: entity.requiredAction,
  message: entity.message,
  protocolVersion: entity.protocolVersion,
  evidence: entity.evidence ?? {},
  isEnabled: entity.isEnabled,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

/**
 * Red-flag rules (§7). Only enabled rules are ever evaluated, and severity
 * ordering (CRITICAL > MAJOR > MINOR) is applied here so the assessment engine
 * always sees the most severe match first.
 */
@Injectable()
export class RedFlagRuleService {
  constructor(
    @InjectRepository(RedFlagRuleEntity)
    private readonly repository: Repository<RedFlagRuleEntity>,
  ) {}

  async list(query: ListRedFlagRulesDto = {}): Promise<RedFlagRuleType[]> {
    const qb = this.repository.createQueryBuilder('rule').orderBy('rule.code', 'ASC');
    if (query.protocolVersion) {
      qb.andWhere('rule.protocol_version = :protocolVersion', {
        protocolVersion: query.protocolVersion,
      });
    }
    if (query.severity) {
      qb.andWhere('rule.severity = :severity', { severity: query.severity });
    }
    if (query.isEnabled !== undefined) {
      qb.andWhere('rule.is_enabled = :isEnabled', {
        isEnabled: Boolean(query.isEnabled),
      });
    }
    const rows = await qb.getMany();
    return rows.map(toRedFlagRuleType);
  }

  /** Enabled rules, ordered CRITICAL → MINOR for deterministic evaluation. */
  async activeRules(protocolVersion?: string): Promise<RedFlagRuleEntity[]> {
    const qb = this.repository
      .createQueryBuilder('rule')
      .where('rule.is_enabled = :isEnabled', { isEnabled: true });
    if (protocolVersion) {
      qb.andWhere('rule.protocol_version = :protocolVersion', { protocolVersion });
    }
    const rows = await qb.getMany();
    return this.sortBySeverity(rows);
  }

  async create(payload: CreateRedFlagRuleDto): Promise<RedFlagRuleType> {
    const code = payload.code.trim().toUpperCase();
    const duplicate = await this.repository.findOne({ where: { code } });
    if (duplicate) throw new BadRequestException(`Red-flag rule code ${code} already exists`);

    const entity = this.repository.create({
      code,
      conditions: payload.conditions ?? {},
      severity: payload.severity,
      triageOutcome: payload.triageOutcome,
      requiredAction: payload.requiredAction,
      message: payload.message,
      protocolVersion: payload.protocolVersion,
      evidence: payload.evidence ?? {},
      isEnabled: payload.isEnabled ?? true,
    });
    return toRedFlagRuleType(await this.repository.save(entity));
  }

  async update(id: string, payload: UpdateRedFlagRuleDto): Promise<RedFlagRuleType> {
    const item = await this.findOne(id);
    if (payload.code !== undefined) item.code = payload.code.trim().toUpperCase();
    if (payload.conditions !== undefined) item.conditions = payload.conditions;
    if (payload.severity !== undefined) item.severity = payload.severity;
    if (payload.triageOutcome !== undefined) item.triageOutcome = payload.triageOutcome;
    if (payload.requiredAction !== undefined) item.requiredAction = payload.requiredAction;
    if (payload.message !== undefined) item.message = payload.message;
    if (payload.protocolVersion !== undefined) item.protocolVersion = payload.protocolVersion;
    if (payload.evidence !== undefined) item.evidence = payload.evidence;
    if (payload.isEnabled !== undefined) item.isEnabled = payload.isEnabled;
    return toRedFlagRuleType(await this.repository.save(item));
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete({ id });
    if (!result.affected) throw new NotFoundException(`Red-flag rule ${id} not found`);
  }

  private async findOne(id: string): Promise<RedFlagRuleEntity> {
    const item = await this.repository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Red-flag rule ${id} not found`);
    return item;
  }

  private sortBySeverity(rows: RedFlagRuleEntity[]): RedFlagRuleEntity[] {
    return [...rows].sort((a, b) => {
      const left = SEVERITY_ORDER.indexOf(String(a.severity).toUpperCase());
      const right = SEVERITY_ORDER.indexOf(String(b.severity).toUpperCase());
      return (left < 0 ? SEVERITY_ORDER.length : left) - (right < 0 ? SEVERITY_ORDER.length : right);
    });
  }
}
