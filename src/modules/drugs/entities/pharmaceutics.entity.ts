import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { GenericProductEntity } from './generic-product.entity';
import { DrugComponentEntity } from './drug-component.entity';

@Entity('pharmaceutics')
export class PharmaceuticsEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  code!: string;

  @Column({ name: 'common_brand_name', type: 'text', nullable: true })
  commonBrandName!: string | null;

  @Column({ name: 'common_generic_name', type: 'text', nullable: true })
  commonGenericName!: string | null;

  @Column({ name: 'clinical_name', type: 'text', nullable: true })
  clinicalName!: string | null;

  @Column({ name: 'drug_class', type: 'text', nullable: true })
  drugClass!: string | null;

  @Column({ name: 'chemical_constituents', type: 'text', nullable: true })
  chemicalConstituents!: string | null;

  @Column({ type: 'text', name: 'pharmaceutics', nullable: true })
  pharmaceutics!: string | null;

  @Column({ type: 'text', nullable: true })
  indications!: string | null;

  @Column({ type: 'text', nullable: true })
  contraindications!: string | null;

  @Column({ type: 'text', nullable: true })
  mechanism!: string | null;

  @Column({ name: 'missed_dose', type: 'text', nullable: true })
  missedDose!: string | null;

  @Column({ name: 'drug_interactions', type: 'text', nullable: true })
  drugInteractions!: string | null;

  @Column({ name: 'dosage', type: 'text', nullable: true })
  dosage!: string | null;

  @OneToMany(() => GenericProductEntity, (genericProduct) => genericProduct.pharmaceutics)
  genericProducts!: GenericProductEntity[];

  @ManyToMany(() => DrugComponentEntity, (drugComponent) => drugComponent.pharmaceutics)
  @JoinTable({
    name: 'pharmaceutics_drug_components',
    joinColumn: { name: 'pharmaceutics_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'drug_component_id', referencedColumnName: 'id' },
  })
  drugComponents!: DrugComponentEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
