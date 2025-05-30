import { useEffect, useRef, useState } from 'react';
import IngredientCard from './IngredientCard';
import { Ingredient } from '@/types/ingredient';

type Props = {
  category: string;
  ingredients: Ingredient[];
};

export default function FoodCategoryColumn({ category, ingredients }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;

    const checkScrollability = () => {
      if (el) {
        const scrollable = el.scrollHeight > el.clientHeight;
        setIsScrollable(scrollable);
        setShowScrollArrow(scrollable && el.scrollTop === 0);
      }
    };

    checkScrollability();

    const handleScroll = () => {
      if (el) {
        setShowScrollArrow(el.scrollTop === 0);
      }
    };

    el?.addEventListener('scroll', handleScroll);

    return () => {
      el?.removeEventListener('scroll', handleScroll);
    };
  }, [ingredients]);

  return (
    <div className="w-full h-134 border border-amber-500 rounded-lg shadow-md p-4 bg-[#faa424ff] flex flex-col">
      <h2 className="text-2xl font-bold mb-3 text-center capitalize text-white">
        {category}
      </h2>

      {showScrollArrow && (
        <div className="text-center text-sm text-white animate-pulse mb-1">
          ↑ scroll ↑
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3">
        {ingredients
          .filter((ingredient) => parseFloat(String(ingredient.quantity)) > 0)
          .map((ingredient, idx) => (
            <IngredientCard
              key={idx}
              name={ingredient.name}
              quantity={ingredient.quantity}
              unit={ingredient.unit}
              expirationDate={ingredient.expirationDate}
            />
          ))}
      </div>
    </div>
  );
}