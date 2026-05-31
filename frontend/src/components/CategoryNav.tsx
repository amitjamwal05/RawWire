import Link from 'next/link';

export default function CategoryNav({ currentCategory }: { currentCategory: string }) {
  const categories = ['All', 'Politics', 'Tech', 'Sports', 'Local', 'World', 'Entertainment'];

  return (
    <div className="w-full border-b border-border overflow-x-auto no-scrollbar">
      <div className="flex px-4 py-3 gap-2 min-w-max">
        {categories.map((category) => {
          const isActive = category === currentCategory || (category === 'All' && !currentCategory);
          return (
            <Link 
              key={category} 
              href={category === 'All' ? '/' : `/?category=${category}`}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors border ${
                isActive 
                  ? 'bg-foreground text-background border-foreground' 
                  : 'bg-transparent text-foreground border-border hover:bg-hover-bg'
              }`}
            >
              {category}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
