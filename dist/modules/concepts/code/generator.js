"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoCodeGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let AutoCodeGeneratorService = class AutoCodeGeneratorService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async generateCode(options) {
        const { conceptName, pattern, prefix, padLength = 5, } = options;
        if (!conceptName) {
            throw new common_1.BadRequestException('conceptName is required');
        }
        const where = {};
        if (pattern) {
            where[conceptName] = (0, typeorm_2.ILike)(`%${pattern}%`);
        }
        const firstFive = await this.repository.find({
            select: ['code', 'createdAt'],
            where,
            order: {
                createdAt: 'ASC',
            },
            take: 5,
        });
        const lastFive = await this.repository.find({
            select: ['code', 'createdAt'],
            where,
            order: {
                createdAt: 'DESC',
            },
            take: 5,
        });
        if (!lastFive.length && !prefix) {
            throw new common_1.NotFoundException('No existing records found. Provide a prefix to bootstrap generation.');
        }
        const resolvedPrefix = prefix ??
            this.extractPrefix(lastFive[0]?.code) ??
            conceptName.toUpperCase();
        const allCodes = [...firstFive, ...lastFive]
            .map((x) => x.code)
            .filter(Boolean);
        const maxSequence = allCodes.reduce((max, current) => {
            const sequence = this.extractSequence(current);
            return sequence > max ? sequence : max;
        }, 0);
        const nextSequence = maxSequence + 1;
        const generatedCode = `${resolvedPrefix}-${String(nextSequence).padStart(padLength, '0')}`;
        return {
            code: generatedCode,
            samples: {
                firstFive,
                lastFive,
            },
        };
    }
    extractPrefix(code) {
        if (!code)
            return null;
        const match = code.match(/^([A-Z-_]+)/i);
        return match?.[1] ?? null;
    }
    extractSequence(code) {
        const match = code.match(/(\d+)(?!.*\d)/);
        if (!match)
            return 0;
        return Number(match[1]);
    }
};
exports.AutoCodeGeneratorService = AutoCodeGeneratorService;
exports.AutoCodeGeneratorService = AutoCodeGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Object)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AutoCodeGeneratorService);
//# sourceMappingURL=generator.js.map