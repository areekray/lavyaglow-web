import { stringToArray, colorHexMap } from '@/constants/productOptions';

interface ColorSelectorProps {
  availableColors: string;
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ColorSelector({ 
  availableColors, 
  selectedColor, 
  onColorSelect,
  size = 'md' 
}: ColorSelectorProps) {
  const colors = stringToArray(availableColors);
  
  if (colors.length === 0) return null;

  const getColorStyle = (color: string) => {
    const hexColor = colorHexMap[color];
    if (!hexColor) return { backgroundColor: '#CCCCCC' };
    
    if (hexColor.includes('gradient') || hexColor.includes('linear-gradient')) {
      return { background: hexColor };
    }
    
    return { backgroundColor: hexColor };
  };

  const isSpecialColor = (color: string) => {
    return ['Multicolor Glitter', 'Ombre', 'Gradient', 'Marble Effect', 'Transparent Gel']
      .some(special => color.toLowerCase().includes(special.toLowerCase()));
  };

  return (
    <div className={`color-selector color-selector--${size}`}>
      <div className="color-selector__label">
        <span>Choose Color</span>
        {selectedColor && (
          <span className="color-selector__selected-name">
            {selectedColor}
          </span>
        )}
      </div>
      
      <div className="color-selector__options">
        {colors.map((color) => (
          <button
            key={color}
            className={`color-option ${selectedColor === color ? 'color-option--selected' : ''} ${isSpecialColor(color) ? 'color-option--special' : ''}`}
            onClick={() => onColorSelect(color)}
            title={color}
            aria-label={`Select ${color} color`}
          >
            <div 
              className="color-option__swatch"
              style={getColorStyle(color)}
            >
              {/* Special effects for certain colors */}
              {color.toLowerCase().includes('glitter') && (
                <div className="color-option__glitter-effect" />
              )}
              {color.toLowerCase().includes('marble') && (
                <div className="color-option__marble-effect" />
              )}
            </div>
            
            {/* Selection indicator */}
            {selectedColor === color && (
              <div className="color-option__check">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path 
                    d="M10 3L4.5 8.5L2 6" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            
            {/* Color name for mobile/accessibility */}
            <span className="color-option__name">{color}</span>
          </button>
        ))}
      </div>
      
      {/* {colors.length > 8 && (
        <button className="color-selector__show-more">
          View All Colors ({colors.length})
        </button>
      )} */}
    </div>
  );
}
