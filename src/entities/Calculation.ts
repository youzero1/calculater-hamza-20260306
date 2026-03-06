import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('calculations')
export class Calculation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  type!: string;

  @Column({ type: 'text' })
  input!: string;

  @Column({ type: 'float' })
  result!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
