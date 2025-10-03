import { useEffect } from 'react';

type ImagePreviewerProps = {
  src: string | null;
  alt?: string;
  onClose: () => void;
};

export function ImagePreviewer({ src, alt = 'Preview', onClose }: ImagePreviewerProps) {
  // Close on ESC
  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="img-preview__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div className="img-preview__content" onClick={(e) => e.stopPropagation()}>
        <button className="img-preview__close" onClick={onClose} aria-label="Close preview">
          ✕
        </button>
        <img className="img-preview__image" src={src} alt={alt} />
      </div>
    </div>
  );
}
