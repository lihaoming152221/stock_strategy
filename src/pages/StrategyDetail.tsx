import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Check, GitCompareArrows, BookOpen, Settings, ThumbsUp, AlertTriangle, Target, Zap } from 'lucide-react';
import { useStrategyStore } from '@/store/useStrategyStore';
import { strategies, difficultyLabels, categoryLabels } from '@/data/strategies';
import StrategyChart from '@/components/StrategyChart';

export default function StrategyDetail() {
  const { id } = useParams<{ id: string }>();
  const strategy = strategies.find((s) => s.id === id);
  const compareIds = useStrategyStore((s) => s.compareIds);
  const toggleCompare = useStrategyStore((s) => s.toggleCompare);

  if (!strategy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted">
        <p className="text-lg mb-4">策略未找到</p>
        <Link to="/" className="text-accent hover:underline text-sm">返回首页</Link>
      </div>
    );
  }

  const isComparing = compareIds.includes(strategy.id);
  const diff = difficultyLabels[strategy.difficulty];

  return (
    <div className="min-h-screen pt-20 pb-20 animate-fade-in">
      <div className="container max-w-4xl mx-auto px-6">
        {/* 返回导航 */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          返回策略库
        </Link>

        {/* 标题区域 */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-2.5 py-1 rounded-md bg-accent/10 text-accent text-xs font-medium">
                {categoryLabels[strategy.category]}
              </span>
              <span className={`text-xs font-medium ${diff.color}`}>
                {diff.label}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-warm mb-1">
              {strategy.name}
            </h1>
            <p className="text-sm text-muted font-mono">{strategy.nameEn}</p>
          </div>
          <button
            onClick={() => toggleCompare(strategy.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isComparing
                ? 'bg-accent text-base'
                : 'bg-surface border border-border text-muted hover:text-accent hover:border-accent/30'
            }`}
          >
            {isComparing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isComparing ? '已加入对比' : '加入对比'}
          </button>
        </div>

        {/* 简述 */}
        <p className="text-muted text-lg leading-relaxed mb-10">
          {strategy.fullDesc}
        </p>

        {/* 信号示意图表 */}
        <StrategyChart strategy={strategy} />

        {/* 原理 */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-warm mb-4">
            <BookOpen className="w-5 h-5 text-accent" />
            核心原理
          </h2>
          <div className="strategy-quote text-muted leading-relaxed">
            {strategy.principle}
          </div>
        </section>

        {/* 参数 */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-warm mb-4">
            <Settings className="w-5 h-5 text-accent" />
            参数说明
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-accent font-medium">参数</th>
                  <th className="text-left px-5 py-3 text-accent font-medium">说明</th>
                  <th className="text-left px-5 py-3 text-accent font-medium">默认值</th>
                </tr>
              </thead>
              <tbody>
                {strategy.params.map((param, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'bg-surface/50' : ''}>
                    <td className="px-5 py-3 text-warm font-medium">{param.name}</td>
                    <td className="px-5 py-3 text-muted">{param.description}</td>
                    <td className="px-5 py-3 font-mono text-accent">{param.defaultValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 信号 */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-warm mb-4">
            <Zap className="w-5 h-5 text-accent" />
            交易信号
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strategy.signals.map((signal, i) => (
              <div key={i} className="flex items-start gap-3 bg-card border border-border rounded-lg p-4">
                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-muted leading-relaxed">{signal}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 优缺点 */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-warm mb-4">
                <ThumbsUp className="w-5 h-5 text-accent" />
                优势
              </h2>
              <div className="space-y-2">
                {strategy.pros.map((pro, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-muted">{pro}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold text-warm mb-4">
                <AlertTriangle className="w-5 h-5 text-amber" />
                局限
              </h2>
              <div className="space-y-2">
                {strategy.cons.map((con, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber mt-2 flex-shrink-0" />
                    <span className="text-muted">{con}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 适用场景 */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-warm mb-4">
            <Target className="w-5 h-5 text-accent" />
            适用场景
          </h2>
          <div className="flex flex-wrap gap-2">
            {strategy.scenarios.map((scenario, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-surface border border-border text-sm text-muted">
                {scenario}
              </span>
            ))}
          </div>
        </section>

        {/* 前往对比 */}
        {compareIds.length >= 2 && (
          <div className="mt-12 text-center">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-base font-medium hover:bg-accent-dim transition-colors glow-accent"
            >
              <GitCompareArrows className="w-5 h-5" />
              对比已选策略 ({compareIds.length})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
