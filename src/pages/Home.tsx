import { useMemo } from 'react';
import { useStrategyStore } from '@/store/useStrategyStore';
import { strategies } from '@/data/strategies';
import Hero from '@/components/Hero';
import CategoryNav from '@/components/CategoryNav';
import StrategyCard from '@/components/StrategyCard';
import { FileQuestion } from 'lucide-react';

export default function Home() {
  const searchQuery = useStrategyStore((s) => s.searchQuery);
  const selectedCategory = useStrategyStore((s) => s.selectedCategory);
  const selectedDifficulty = useStrategyStore((s) => s.selectedDifficulty);

  const filteredStrategies = useMemo(() => {
    return strategies.filter((st) => {
      const matchesSearch =
        !searchQuery ||
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || st.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || st.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  return (
    <div className="min-h-screen">
      <Hero />
      <CategoryNav />

      <main className="container max-w-6xl mx-auto px-6 pb-20">
        {filteredStrategies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <FileQuestion className="w-12 h-12 mb-4 opacity-40" />
            <p className="text-lg">没有找到匹配的策略</p>
            <p className="text-sm mt-1">尝试调整搜索关键词或分类筛选</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStrategies.map((strategy, index) => (
              <StrategyCard key={strategy.id} strategy={strategy} index={index} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
