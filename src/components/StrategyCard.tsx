import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Check } from 'lucide-react';
import { useStrategyStore } from '@/store/useStrategyStore';
import { difficultyLabels, categoryLabels } from '@/data/strategies';
import type { Strategy } from '@/data/strategies';

interface StrategyCardProps {
  strategy: Strategy;
  index: number;
}

export default function StrategyCard({ strategy, index }: StrategyCardProps) {
  const compareIds = useStrategyStore((s) => s.compareIds);
  const toggleCompare = useStrategyStore((s) => s.toggleCompare);
  const isComparing = compareIds.includes(strategy.id);
  const diff = difficultyLabels[strategy.difficulty];

  return (
    <div
      className="animate-slide-up opacity-0"
      style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'forwards' }}
    >
      <div className="card-accent-line group bg-card border border-border rounded-xl p-5 hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
              {categoryLabels[strategy.category]}
            </span>
            <span className={`text-xs font-medium ${diff.color}`}>
              {diff.label}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(strategy.id);
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              isComparing
                ? 'bg-accent text-base'
                : 'bg-surface text-muted hover:text-accent hover:bg-accent/10'
            }`}
            title={isComparing ? '移除对比' : '加入对比'}
          >
            {isComparing ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        <Link to={`/strategy/${strategy.id}`} className="block">
          <div className="flex items-baseline gap-2 mb-2">
            <h3 className="text-lg font-semibold text-warm group-hover:text-accent transition-colors">
              {strategy.name}
            </h3>
            <span className="text-xs text-muted font-mono">{strategy.nameEn}</span>
          </div>

          <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-2">
            {strategy.shortDesc}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {strategy.signals.slice(0, 2).map((signal, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-surface text-[11px] text-muted">
                  {signal.length > 10 ? signal.slice(0, 10) + '…' : signal}
                </span>
              ))}
            </div>
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}
