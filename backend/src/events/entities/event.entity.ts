import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  ManyToMany, 
  JoinTable 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  date: Date;

  @Column()
  location: string;

  @Column({ type: 'int', nullable: true })
  capacity: number | null; // Тепер TypeScript дозволить зберігати сюди null // Якщо null — місця необмежені

  @Column({ default: true })
  isPublic: boolean; // true = Публічна, false = Приватна

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Зв'язок: Один користувач (організатор) -> Багато подій
  @ManyToOne(() => User, (user) => user.organizedEvents)
  organizer: User;

  // Зв'язок: Багато користувачів (учасників) <-> Багато подій
  @ManyToMany(() => User, (user) => user.participatingEvents)
  @JoinTable({
    name: 'event_participants', // TypeORM автоматично створить цю таблицю
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  participants: User[];
}