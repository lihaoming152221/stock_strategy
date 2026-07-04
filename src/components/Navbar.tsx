import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, GitCompareArrows } from 'lucide-react';
import { useStrategyStore } from '@/store/useStrategyStore';

export default function Navbar() {
  const location = useLocation();
  const compareIds = useStrategyStore((s) => s.compareIds);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-base/80 backdrop-blur-xl border-b border-border">
      <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <span className="font-display text-xl font-semibold text-warm">
            技析
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-accent' : 'text-muted hover:text-warm'
            }`}
          >
            策略库
          </Link>
          <Link
            to="/compare"
            className={`text-sm font-medium flex items-center gap-2 transition-colors ${
              location.pathname === '/compare' ? 'text-accent' : 'text-muted hover:text-warm'
            }`}
          >
            <GitCompareArrows className="w-4 h-4" />
            对比
            {compareIds.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent text-base text-xs flex items-center justify-center font-bold">
                {compareIds.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
