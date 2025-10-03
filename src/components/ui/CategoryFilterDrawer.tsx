import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
interface CategoryFilterDrawerProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryFilterDrawer({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  isOpen, 
  onClose 
}: CategoryFilterDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCategoryClick = (category: string) => {
    const newCategory = category === selectedCategory ? '' : category;
    onCategorySelect(newCategory);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300); // Match animation duration
  };

  if (!isOpen && !isAnimating) return null;

  return createPortal(
    <div className={`category-drawer-overlay ${isOpen ? 'open' : 'closing'}`}>
      {/* Backdrop */}
      <div 
        className="category-drawer-backdrop" 
        onClick={handleBackdropClick}
      />
      
      {/* Drawer */}
      <div className={`category-drawer ${isOpen ? 'open' : 'closing'}`}>
        {/* Handle Bar */}
        <div className="category-drawer__handle">
          <div className="handle-bar" />
        </div>
        
        {/* Header */}
        <div className="category-drawer__header">
          <h3>Filter by Category</h3>
          <button 
            className="category-drawer__close"
            onClick={handleClose}
            aria-label="Close category filter"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Categories List */}
        <div className="category-drawer__content">
          {/* All Categories Option */}
          <button
            className={`category-option ${selectedCategory === '' ? 'selected' : ''}`}
            onClick={() => handleCategoryClick('')}
          >
            <div className="category-option__content">
              {/* <span className="category-option__icon">🏠</span> */}
              <span className="category-option__text">All Categories</span>
            </div>
            {selectedCategory === '' && (
              <div className="category-option__check">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.67 6L8.33 14.33L4.17 10.17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
          
          {/* Individual Categories */}
          {categories.map((category) => (
            <button
              key={category}
              className={`category-option ${selectedCategory === category ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              <div className="category-option__content">
                {/* <span className="category-option__icon">
                  {getCategoryIcon(category)}
                </span> */}
                <span className="category-option__text">{category}</span>
              </div>
              {selectedCategory === category && (
                <div className="category-option__check">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M16.67 6L8.33 14.33L4.17 10.17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        
        {/* Footer Actions */}
        <div className="category-drawer__footer">
          <button
            className="category-drawer__clear"
            onClick={() => {
              onCategorySelect('');
              onClose();
            }}
            disabled={selectedCategory === ''}
          >
            Clear Filter
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
