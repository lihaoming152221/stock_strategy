import { Search } from 'lucide-react';
import { useStrategyStore } from '@/store/useStrategyStore';

export default function Hero() {
  const searchQuery = useStrategyStore((s) => s.searchQuery);
  const setSearchQuery = useStrategyStore((s) => s.setSearchQuery);

  return (
    <section className="hero-grid relative pt-32 pb-16 px-6">
      {/* 装饰光晕 */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-4xl mx-auto text-center relative">
        <h1 className="font-display text-5xl md:text-6xl font-bold text-warm mb-4 animate-fade-in">
          股票技术分析
          <span className="gradient-text">策略库</span>
        </h1>
        <p className="text-muted text-lg mb-10 animate-fade-in max-w-xl mx-auto" style={{ animationDelay: '0.2s' }}>
          系统化的技术分析方法论，从趋势跟踪到形态识别，助你构建完整的交易体系
        </p>

        {/* 搜索栏 */}
        <div className="relative max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索策略名称或关键词..."
            className="w-full h-12 pl-11 pr-4 bg-surface border border-border rounded-xl text-warm text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all"
          />
        </div>
      </div>
    </section>
  );
}
