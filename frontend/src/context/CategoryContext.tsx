import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CategoryCtx {
  categoryOpen: boolean;
  openCategoryDrawer: () => void;
  closeCategoryDrawer: () => void;
  activeCategory: string;
  setActiveCategory: (value: string) => void;
}

const CategoryContext = createContext<CategoryCtx | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');

  const openCategoryDrawer = useCallback(() => setCategoryOpen(true), []);
  const closeCategoryDrawer = useCallback(() => setCategoryOpen(false), []);

  return (
    <CategoryContext.Provider value={{ categoryOpen, openCategoryDrawer, closeCategoryDrawer, activeCategory, setActiveCategory }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategory = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategory must be inside CategoryProvider');
  return ctx;
};
