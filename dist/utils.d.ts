import { SelectQueryBuilder } from "typeorm";
export declare function parseFilters(qb: SelectQueryBuilder<any>, alias: string, query: Record<string, any>): void;
export declare function applyFilter(qb: SelectQueryBuilder<any>, alias: string, field: string, type: string, value?: string, valueTo?: string): void;
