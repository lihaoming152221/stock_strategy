import { TrendingUp } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20 py-10 px-6">
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted">技析 - 股票技术分析策略</span>
        </div>
        <p className="text-xs text-muted/60">
          仅供学习参考，不构成投资建议。投资有风险，入市需谨慎。
        </p>
      </div>
    </footer>
  );
}
