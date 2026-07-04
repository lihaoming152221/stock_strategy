import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, X, GitCompareArrows } from 'lucide-react';
import { useStrategyStore } from '@/store/useStrategyStore';
import { strategies, difficultyLabels, categoryLabels, type Strategy } from '@/data/strategies';

export default function Compare() {
  const compareIds = useStrategyStore((s) => s.compareIds);
  const toggleCompare = useStrategyStore((s) => s.toggleCompare);
  const clearCompare = useStrategyStore((s) => s.clearCompare);
  const compareStrategies = useMemo(
    () => strategies.filter((st) => compareIds.includes(st.id)),
    [compareIds]
  );

  if (compareStrategies.length < 2) {
    return (
      <div className="min-h-screen pt-20 pb-20">
        <div className="container max-w-4xl mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回策略库
          </Link>
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <GitCompareArrows className="w-16 h-16 mb-6 opacity-30" />
            <h2 className="text-xl font-semibold text-warm mb-2">选择策略进行对比</h2>
            <p className="text-sm mb-6">请在策略库中选择2-4个策略加入对比</p>
            <Link
              to="/"
              className="px-5 py-2.5 rounded-lg bg-accent text-base text-sm font-medium hover:bg-accent-dim transition-colors"
            >
              浏览策略库
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const compareRows: { label: string; render: (s: Strategy) => React.ReactNode }[] = [
    {
      label: '分类',
      render: (s) => <span className="text-accent">{categoryLabels[s.category]}</span>,
    },
    {
      label: '难度',
      render: (s) => <span className={difficultyLabels[s.difficulty].color}>{difficultyLabels[s.difficulty].label}</span>,
    },
    {
      label: '参数数量',
      render: (s) => <span className="font-mono text-accent">{s.params.length}</span>,
    },
    {
      label: '核心参数',
      render: (s) => (
        <div className="space-y-1">
          {s.params.map((p, i) => (
            <div key={i} className="text-xs">
              <span className="text-warm">{p.name}</span>
              <span className="text-muted ml-2">默认: {p.defaultValue}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: '优势',
      render: (s) => (
        <ul className="space-y-1">
          {s.pros.map((pro, i) => (
            <li key={i} className="text-xs flex items-start gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
              {pro}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: '局限',
      render: (s) => (
        <ul className="space-y-1">
          {s.cons.map((con, i) => (
            <li key={i} className="text-xs flex items-start gap-1.5">
              <span className="w-1 h-1 rounded-full bg-amber mt-1.5 flex-shrink-0" />
              {con}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: '适用场景',
      render: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.scenarios.map((sc, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-surface text-[11px] text-muted">
              {sc}
            </span>
          ))}
        </div>
      ),
    },
    {
      label: '信号类型',
      render: (s) => <span className="text-xs text-muted">{s.chartConfig.signalType}</span>,
    },
    {
      label: '核心信号',
      render: (s) => (
        <ul className="space-y-1">
          {s.signals.map((sig, i) => (
            <li key={i} className="text-xs text-muted">• {sig}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 animate-fade-in">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回策略库
          </Link>
          <button
            onClick={clearCompare}
            className="text-sm text-muted hover:text-amber transition-colors"
          >
            清空对比
          </button>
        </div>

        <h1 className="font-display text-3xl font-bold text-warm mb-8">策略对比</h1>

        {/* 策略标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {compareStrategies.map((s) => (
            <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border">
              <Link to={`/strategy/${s.id}`} className="text-sm text-warm hover:text-accent transition-colors">
                {s.name}
              </Link>
              <button onClick={() => toggleCompare(s.id)} className="text-muted hover:text-amber transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* 对比表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm compare-table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-muted font-medium w-28">对比项</th>
                {compareStrategies.map((s) => (
                  <th key={s.id} className="text-left px-5 py-3 font-semibold text-warm min-w-[200px]">
                    <Link to={`/strategy/${s.id}`} className="hover:text-accent transition-colors">
                      {s.name}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-surface/30' : ''}>
                  <td className="px-5 py-4 text-muted font-medium border-r border-border">
                    {row.label}
                  </td>
                  {compareStrategies.map((s) => (
                    <td key={s.id} className="px-5 py-4 text-muted">
                      {row.render(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
