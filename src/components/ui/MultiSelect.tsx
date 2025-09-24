import { useState, useRef, useEffect } from 'react';

// interface Option {
//   value: string;
//   label: string;
//   color?: string;
// }

interface OptionGroup {
  label: string;
  options: string[];
}

interface MultiSelectProps {
  options: string[] | OptionGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  colorMap?: Record<string, string>;
  showVisualIndicators?: boolean;
  maxHeight?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  label,
  error,
  colorMap,
  showVisualIndicators = false,
  maxHeight = "200px"
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (option: string) => {
    const isSelected = selected.includes(option);
    if (isSelected) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleRemoveItem = (item: string) => {
    onChange(selected.filter(selectedItem => selectedItem !== item));
  };

  const getFilteredOptions = () => {
    const isGrouped = Array.isArray(options) && options.length > 0 && 
                     typeof options[0] === 'object' && 'label' in options[0];

    if (isGrouped) {
      const groupedOptions = options as OptionGroup[];
      return groupedOptions.map(group => ({
        ...group,
        options: group.options.filter(option =>
          option.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(group => group.options.length > 0);
    } else {
      const flatOptions = options as string[];
      return flatOptions.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  const renderSelectedItems = () => {
    if (selected.length === 0) return null;

    return (
      <div className="multi-select__selected-items">
        {selected.map(item => (
          <div key={item} className="multi-select__selected-item">
            {showVisualIndicators && colorMap?.[item] && (
              <div 
                className="multi-select__color-indicator"
                style={{ backgroundColor: colorMap[item] }}
              />
            )}
            <span className="multi-select__selected-text">{item}</span>
            <button
              type="button"
              className="multi-select__remove-button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveItem(item);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderOptions = () => {
    const filteredOptions = getFilteredOptions();
    const isGrouped = Array.isArray(filteredOptions) && filteredOptions.length > 0 && 
                     typeof filteredOptions[0] === 'object' && 'label' in filteredOptions[0];

    if (isGrouped) {
      const groupedOptions = filteredOptions as OptionGroup[];
      return groupedOptions.map(group => (
        <div key={group.label} className="multi-select__group">
          <div className="multi-select__group-label">{group.label}</div>
          {group.options.map(option => (
            <div
              key={option}
              className={`multi-select__option ${selected.includes(option) ? 'multi-select__option--selected' : ''}`}
              onClick={() => handleToggleOption(option)}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => {}} // Handled by onClick
                className="multi-select__checkbox"
              />
              {showVisualIndicators && colorMap?.[option] && (
                <div 
                  className="multi-select__color-indicator"
                  style={{ backgroundColor: colorMap[option] }}
                />
              )}
              <span className="multi-select__option-text">{option}</span>
            </div>
          ))}
        </div>
      ));
    } else {
      const flatOptions = filteredOptions as string[];
      return flatOptions.map(option => (
        <div
          key={option}
          className={`multi-select__option ${selected.includes(option) ? 'multi-select__option--selected' : ''}`}
          onClick={() => handleToggleOption(option)}
        >
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => {}} // Handled by onClick
            className="multi-select__checkbox"
          />
          {showVisualIndicators && colorMap?.[option] && (
            <div 
              className="multi-select__color-indicator"
              style={{ backgroundColor: colorMap[option] }}
            />
          )}
          <span className="multi-select__option-text">{option}</span>
        </div>
      ));
    }
  };

  return (
    <div className="multi-select" ref={dropdownRef}>
      {label && (
        <label className="multi-select__label">
          {label}
        </label>
      )}
      
      <div 
        className={`multi-select__container ${isOpen ? 'multi-select__container--open' : ''} ${error ? 'multi-select__container--error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="multi-select__input-area">
          {selected.length === 0 ? (
            <span className="multi-select__placeholder">{placeholder}</span>
          ) : (
            renderSelectedItems()
          )}
        </div>
        <div className="multi-select__arrow">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path 
              d={isOpen ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"} 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="multi-select__dropdown" style={{ maxHeight }}>
          <div className="multi-select__search">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="multi-select__search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="multi-select__options">
            {renderOptions()}
          </div>
        </div>
      )}

      {error && (
        <div className="multi-select__error">{error}</div>
      )}
    </div>
  );
}
