import { useState, useEffect } from 'react';

interface PWAUpdateModalProps {
  isOpen: boolean;
  onUpdate: () => void;
  onClose: () => void;
  isUpdating?: boolean;
}

export function PWAUpdateModal({ 
  isOpen, 
  onUpdate, 
  onClose, 
  isUpdating = false 
}: PWAUpdateModalProps) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="pwa-update-backdrop" onClick={onClose} />
      
      {/* Modal */}
      <div className="pwa-update-modal">
        <div className="pwa-update-modal__content">
          {/* Header */}
          <div className="pwa-update-modal__header">
            <div className="pwa-update-modal__icon">
              {isUpdating ? (
                <div className="loading__spinner" style={{ width: 20, height: 20, marginBottom: 0 }}></div>
              ) : (
                <div className="update-icon">✨</div>
              )}
            </div>
            <h2 className="pwa-update-modal__title">
              {isUpdating ? 'Updating LavyaGlow...' : 'New Update Available!'}
            </h2>
          </div>

          {/* Body */}
          <div className="pwa-update-modal__body">
            {isUpdating ? (
              <div className="update-progress">
                <p>We're updating your LavyaGlow experience with the latest features and improvements.</p>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <small>This will only take a moment...</small>
              </div>
            ) : (
              <div className="update-info">
                <p className="update-main-text">
                  We've made LavyaGlow even better! Update now to enjoy:
                </p>
                
                <ul className="update-features">
                  <li>Faster loading times</li>
                  <li>Enhanced shopping experience</li>
                  <li>New candle collections</li>
                  <li>Bug fixes and improvements</li>
                </ul>

                <div className="update-note">
                  <p>Your cart and preferences will be preserved.</p>
                  {countdown > 0 && (
                    <p className="auto-close-text">
                      Auto-closing in {countdown}s
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isUpdating && (
            <div className="pwa-update-modal__footer">
              <button 
                className="pwa-update-btn pwa-update-btn--secondary"
                onClick={onClose}
                disabled={isUpdating}
              >
                Later
              </button>
              <button 
                className="pwa-update-btn pwa-update-btn--primary"
                onClick={onUpdate}
                disabled={isUpdating}
              >
                <span>Update Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
