import { Repository } from 'typeorm';
type CodeSeed = {
    code: string;
    createdAt: Date;
};
type GenerateCodeOptions<T> = {
    conceptName: keyof T & string;
    pattern?: string;
    prefix?: string;
    padLength?: number;
};
export declare class AutoCodeGeneratorService<T extends Record<string, any>> {
    private readonly repository;
    constructor(repository: Repository<T>);
    generateCode(options: GenerateCodeOptions<T>): Promise<{
        code: string;
        samples: {
            firstFive: CodeSeed[];
            lastFive: CodeSeed[];
        };
    }>;
    private extractPrefix;
    private extractSequence;
}
export {};
