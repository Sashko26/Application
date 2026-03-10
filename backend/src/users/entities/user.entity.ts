import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { Event } from '../../events/entities/event.entity'; // <-- Додано імпорт

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // --- НОВІ ПОЛЯ ЗВ'ЯЗКІВ ---
  
  // Події, які користувач організував
  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents: Event[];

  // Події, в яких користувач бере участь
  @ManyToMany(() => Event, (event) => event.participants)
  participatingEvents: Event[];
}