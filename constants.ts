import { GeckoLevel, SemesterOption } from './types';

export const SEMESTERS: SemesterOption[] = [
  { id: '1.1', label: 'Semester 1.1' },
  { id: '1.2', label: 'Semester 1.2' },
  { id: '2.1', label: 'Semester 2.1' },
  { id: '2.2', label: 'Semester 2.2' },
];

export const WEEKS = Array.from({ length: 10 }, (_, i) => i + 1);

export const BADGES = {
  ON_FIRE: { id: 'on_fire', label: '🔥 On Fire', desc: '3 activities in one day' },
  SPEED_GECKO: { id: 'speed_gecko', label: '⚡ Speed Gecko', desc: 'Submission before deadline' },
  TECH_BRAIN: { id: 'tech_brain', label: '🧠 Tech Brain', desc: 'Highest quiz score' },
  GECKO_LEGEND: { id: 'gecko_legend', label: '🏆 Gecko Legend', desc: 'Grade A Achieved' },
};

export const POINT_SYSTEM = {
  HOMEWORK: 5,
  CLASSWORK: 3,
  QUIZ: 2,
  TOP_PERFORMER: 10,
  LATE_PENALTY: -2,
};

export const getLevel = (points: number): GeckoLevel => {
  if (points >= 46) return GeckoLevel.ALPHA;
  if (points >= 31) return GeckoLevel.STALKER;
  if (points >= 16) return GeckoLevel.CLIMBER;
  return GeckoLevel.HATCHLING;
};

export const getGrade = (points: number): string => {
  if (points >= 53) return 'A+'; // Max+
  if (points >= 46) return 'A';
  if (points >= 36) return 'B';
  if (points >= 26) return 'C';
  if (points >= 16) return 'D';
  return 'E';
};

// Progress to next level logic
export const getLevelProgress = (points: number) => {
  if (points >= 46) return { current: points, max: 53, percent: 100, next: 'MAX' };
  if (points >= 31) return { current: points, max: 46, percent: ((points - 31) / 15) * 100, next: GeckoLevel.ALPHA };
  if (points >= 16) return { current: points, max: 31, percent: ((points - 16) / 15) * 100, next: GeckoLevel.STALKER };
  return { current: points, max: 16, percent: (points / 16) * 100, next: GeckoLevel.CLIMBER };
};
