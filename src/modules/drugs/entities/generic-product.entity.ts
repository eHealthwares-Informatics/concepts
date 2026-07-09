import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PharmaceuticsEntity } from './pharmaceutics.entity';

@Entity('generic_products')
export class GenericProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'therapeutic_class', type: 'text', nullable: true })
  therapeuticClass!: string | null;

  @Column({ name: 'dosage_form', type: 'text', nullable: true })
  dosageForm!: string | null;

  @Column({ type: 'text', nullable: true })
  strength!: string | null;

  @Column({ name: 'general_use', type: 'text' })
  generalUse!: string;

  @Column({ name: 'adult_dosage', type: 'text' })
  adultDosage!: string;

  @Column({ name: 'pediatric_dosage', type: 'text' })
  pediatricDosage!: string;

  @Column({ name: 'is_prescription_required', type: 'boolean', default: false })
  isPrescriptionRequired!: boolean;

  @Column({ name: 'is_controlled_substance', type: 'boolean', default: false })
  isControlledSubstance!: boolean;

  @ManyToOne(() => PharmaceuticsEntity, (pharmaceutics) => pharmaceutics.genericProducts, {
    nullable: false,
  })
  @JoinColumn({ name: 'pharmaceutics_id' })
  pharmaceutics!: PharmaceuticsEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt!: Date | null;
}
