export interface ScheduleEntry {
  day: 'Sábado' | 'Domingo';
  time: string;
  category: string;
}

export const SCHEDULE: ScheduleEntry[] = [
  { day: 'Sábado', time: '08:00', category: 'Feminino Escolinha' },
  { day: 'Sábado', time: '09:30', category: 'Feminino Intermediário' },
  { day: 'Sábado', time: '12:30', category: 'Misto Iniciante' },
  { day: 'Sábado', time: '15:00', category: 'Masculino Escolinha' },
  { day: 'Domingo', time: '09:00', category: 'Misto Escolinha' },
  { day: 'Domingo', time: '13:30', category: 'Masculino Iniciante' },
];

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

export const getCategorySchedule = (categoryName: string): ScheduleEntry | null => {
  const target = normalize(categoryName);
  return SCHEDULE.find(entry => normalize(entry.category) === target) ?? null;
};
