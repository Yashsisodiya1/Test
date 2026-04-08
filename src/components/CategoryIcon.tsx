import { Bolt, Box, Clock, Database, Globe } from 'lucide-react';
import { type Category } from '../data/problems';

const iconMap: Record<Category, { icon: React.ElementType; color: string }> = {
  Trigger: { icon: Bolt, color: 'text-yellow-400' },
  Class: { icon: Box, color: 'text-blue-400' },
  'Async Apex': { icon: Clock, color: 'text-purple-400' },
  SOQL: { icon: Database, color: 'text-green-400' },
  Integration: { icon: Globe, color: 'text-orange-400' },
};

export default function CategoryIcon({
  category,
  size = 16,
}: {
  category: Category;
  size?: number;
}) {
  const { icon: Icon, color } = iconMap[category] || { icon: Box, color: 'text-gray-400' };
  return <Icon className={`${color}`} size={size} />;
}
