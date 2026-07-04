import { create } from 'zustand';
import { strategies, type Strategy } from '@/data/strategies';

interface StrategyStore {
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  compareIds: string[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  getFilteredStrategies: () => Strategy[];
  getStrategyById: (id: string) => Strategy | undefined;
  getCompareStrategies: () => Strategy[];
}

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  searchQuery: '',
  selectedCategory: 'all',
  selectedDifficulty: 'all',
  compareIds: [],

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

  toggleCompare: (id) =>
    set((state) => {
      const exists = state.compareIds.includes(id);
      if (exists) {
        return { compareIds: state.compareIds.filter((cid) => cid !== id) };
      }
      if (state.compareIds.length >= 4) return state;
      return { compareIds: [...state.compareIds, id] };
    }),

  clearCompare: () => set({ compareIds: [] }),

  getFilteredStrategies: () => {
    const { searchQuery, selectedCategory, selectedDifficulty } = get();
    return strategies.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || s.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  },

  getStrategyById: (id) => strategies.find((s) => s.id === id),

  getCompareStrategies: () => {
    const { compareIds } = get();
    return strategies.filter((s) => compareIds.includes(s.id));
  },
}));
