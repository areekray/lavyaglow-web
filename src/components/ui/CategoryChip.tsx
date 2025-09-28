interface CategoryChipProps {
  category: string;
  onRemove: () => void;
}

export function CategoryChip({ category, onRemove }: CategoryChipProps) {
  const getCategoryIcon = (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'luxury': '✨',
      'premium': '👑',
      'classic': '🕯️',
      'seasonal': '🌿',
      'gift': '🎁',
      'aromatherapy': '🧘',
      'decor': '🏺',
      'wedding': '💒',
      'birthday': '🎂',
      'default': '🕯️'
    };
    
    const lowerCategory = category.toLowerCase();
    return iconMap[lowerCategory] || iconMap['default'];
  };

  return (
    <div className="category-chip">
      <div className="category-chip__content">
        <span className="category-chip__icon">
          {getCategoryIcon(category)}
        </span>
        <span className="category-chip__text">{category}</span>
      </div>
      <button
        className="category-chip__close"
        onClick={onRemove}
        aria-label={`Remove ${category} filter`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
