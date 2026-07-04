import { LayoutGrid, TrendingUp, Activity, BarChart3, Hexagon, Flame } from 'lucide-react';
import { useStrategyStore } from '@/store/useStrategyStore';
import { categories } from '@/data/strategies';

const iconMap: Record<string, React.ElementType> = {
  LayoutGrid,
  TrendingUp,
  Activity,
  BarChart3,
  Hexagon,
  Flame,
};

export default function CategoryNav() {
  const selectedCategory = useStrategyStore((s) => s.selectedCategory);
  const setSelectedCategory = useStrategyStore((s) => s.setSelectedCategory);

  return (
    <div className="container max-w-6xl mx-auto px-6 mb-8">
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon];
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`category-tab flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'active text-accent bg-accent/10'
                  : 'text-muted hover:text-warm hover:bg-surface'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
