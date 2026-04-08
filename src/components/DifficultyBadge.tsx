import { type Difficulty } from '../data/problems';

const colorMap: Record<Difficulty, string> = {
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Hard: 'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorMap[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}
