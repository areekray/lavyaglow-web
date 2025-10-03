import { useState, useEffect } from 'react';

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  placeholder?: 'blur' | 'shimmer' | 'skeleton' | 'candle';
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

export function ImageWithPlaceholder({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'shimmer',
  fallback,
  onLoad,
  onError,
  onClick
}: ImageWithPlaceholderProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setLoading(false);
      setError(false);
      onLoad?.();
    };

    img.onerror = () => {
      setLoading(false);
      setError(true);
      onError?.();
      
      if (fallback) {
        setImageSrc(fallback);
        setError(false);
      }
    };

    // Add priority loading for important images
    if (priority) {
      img.loading = 'eager';
    }

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback, priority, onLoad, onError]);

  const containerStyle = {
    width: width || '100%',
    height: height || '100%',
    ...(width && height && { aspectRatio: `${width} / ${height}` })
  };

  const renderPlaceholder = () => {
    switch (placeholder) {
      case 'blur':
        return <div className="image-placeholder image-placeholder--blur" />;
      
      case 'skeleton':
        return (
          <div className="image-placeholder image-placeholder--skeleton">
            <div className="skeleton-shimmer" />
          </div>
        );
      
      case 'candle':
        return (
          <div className="image-placeholder image-placeholder--candle">
            <div className="candle-icon">🕯️</div>
            <div className="loading-text">Loading image...</div>
          </div>
        );
      
      case 'shimmer':
      default:
        return (
          <div className="image-placeholder image-placeholder--shimmer">
            <div className="shimmer-animation" />
            <div className="placeholder-icon">📸</div>
          </div>
        );
    }
  };

  const renderError = () => (
    <div className="image-placeholder image-placeholder--error">
      <div className="error-icon">⚠️</div>
      <div className="error-text">Failed to load image</div>
    </div>
  );

  return (
    <div 
      className={`image-with-placeholder ${className}`}
      style={containerStyle}
      onClick={() => onClick ? onClick() : null}
    >
      {loading && renderPlaceholder()}
      
      {error && !fallback && renderError()}
      
      {!loading && !error && (
        <img
          src={imageSrc}
          alt={alt}
          className={`image-with-placeholder__img ${loading ? 'loading' : 'loaded'}`}
          style={{ opacity: loading ? 0 : 1 }}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
}
