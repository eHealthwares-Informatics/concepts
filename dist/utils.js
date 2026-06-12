"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFilter = exports.parseFilters = void 0;
function parseFilters(qb, alias, query) {
    Object.entries(query || {}).forEach(([key, raw]) => {
        if (['page', 'limit', 'search'].includes(key))
            return;
        if (!raw)
            return;
        const { type, value, valueTo } = parseFilter(raw);
        applyFilter(qb, alias, key, type, value, valueTo);
    });
}
exports.parseFilters = parseFilters;
function parseFilter(value) {
    const [type, rawValue, rawValueTo] = value.split('|');
    return {
        type,
        value: rawValue || undefined,
        valueTo: rawValueTo || undefined,
    };
}
function applyFilter(qb, alias, field, type, value, valueTo) {
    const paramKey = `${field}_${type}`;
    console.log({ field, type, value, valueTo });
    switch (type) {
        case 'EQUALS':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} = :${paramKey}`, {
                [paramKey]: value,
            });
            break;
        case 'NOT_EQUALS':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} != :${paramKey}`, {
                [paramKey]: value,
            });
            break;
        case 'FUZZY_MATCH':
        case 'CONTAINS':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} LIKE :${paramKey}`, {
                [paramKey]: `%${value}%`,
            });
            break;
        case 'GREATER_THAN':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} > :${paramKey}`, {
                [paramKey]: value,
            });
            break;
        case 'GREATER_THAN_OR_EQUAL':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} >= :${paramKey}`, {
                [paramKey]: value,
            });
            break;
        case 'LESS_THAN':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} < :${paramKey}`, {
                [paramKey]: value,
            });
            break;
        case 'LESS_THAN_OR_EQUAL':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} <= :${paramKey}`, {
                [paramKey]: value,
            });
            break;
        case 'BETWEEN':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} BETWEEN :${paramKey}_from AND :${paramKey}_to`, {
                [`${paramKey}_from`]: value,
                [`${paramKey}_to`]: valueTo,
            });
            break;
        case 'MISSING':
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} IS NULL`);
            break;
        case 'TODAY':
        case 'YESTERDAY':
        case 'TOMMORROW':
        case 'THIS_MONTH':
        case 'LAST_MONTH':
        case 'NEXT_MONTH':
        case 'THIS_YEAR':
        case 'NEXT_24_HOURS': {
            if (!value || !valueTo)
                return;
            qb.andWhere(`${field.includes('.') ? '' : alias + '.'}${field} BETWEEN :${field}_from AND :${field}_to`, {
                [`${field}_from`]: value,
                [`${field}_to`]: valueTo,
            });
            break;
        }
    }
}
exports.applyFilter = applyFilter;
//# sourceMappingURL=utils.js.map