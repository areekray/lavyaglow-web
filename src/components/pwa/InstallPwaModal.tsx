// components/pwa/InstallPwaModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownTrayIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  ShieldCheckIcon,
  WifiIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { detectPlatform, useInstalledState } from '@/utils/detectPlatform';
import { getBrowser, getInstallContent } from './InstallCopy';

type Props = {
  open: boolean;
  onClose: () => void;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallPwaModal({ open, onClose }: Props) {
  const [platform, setPlatform] = useState<"iOS" | "Android" | "Windows" | "Mac" | "Other">("Other");
  const [browser, setBrowser] = useState<"Safari" | "Chrome" | "Edge" | "Other">("Other");
  const [mounted, setMounted] = useState(false);
  const hostRef = useRef<HTMLElement | null>(null);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const installed = useInstalledState();
  // Portal host
  useEffect(() => {
    const host = document.createElement('div');
    host.setAttribute('data-modal-host', 'install-pwa');
    document.body.appendChild(host);
    hostRef.current = host;
    setMounted(true);
    return () => {
      document.body.removeChild(host);
      hostRef.current = null;
    };
  }, []);

  // Capture native prompt (Android/desktop Chromium)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Detect platform/browser
  useEffect(() => {
    if (!open) return;
    (async () => {
      const pf = await detectPlatform();
      setPlatform(pf);
      setBrowser(getBrowser());
    })();
  }, [open]);

  const { title, steps } = useMemo(
    () => getInstallContent(platform, browser),
    [platform, browser]
  );

  const canShowNativePrompt = !!deferredPromptRef.current && (platform === 'Android' || platform === 'Windows' || platform === 'Mac');

  const handleNativeInstall = async () => {
    const evt = deferredPromptRef.current;
    if (!evt) return;
    await evt.prompt();
    try { await evt.userChoice; } finally { 
        debugger;
        deferredPromptRef.current = null; 
    }
  };

  if (!mounted || !hostRef.current || !open) return null;

  const content = (
    <div className="pwa-modal__backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Install app">
      <div className="pwa-modal__content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="pwa-modal__header">
          <div className="pwa-modal__title-wrap">
            <div className="pwa-modal__title-icon">
              {platform === 'Android' || platform === 'iOS'
                ? <DevicePhoneMobileIcon />
                : <ComputerDesktopIcon />
              }
            </div>
            <div className="pwa-modal__titles">
              <h2 className="pwa-modal__title">{title}</h2>
              <p className="pwa-modal__sub">Add LavyaGlow to your home screen for a smooth, app‑like shopping experience.</p>
            </div>
          </div>
          <button className="pwa-modal__close" onClick={onClose} aria-label="Close">
            <XMarkIcon />
          </button>
        </div>

        {/* Body */}
        <div className="pwa-modal__body">
          {/* Benefits */}
          <div className="pwa-modal__benefits">
            <div className="benefit">
              <SparklesIcon className="benefit__icon" />
              <div className="benefit__text">
                <div className="benefit__title">One‑tap access</div>
                <div className="benefit__desc">Open LavyaGlow from your home screen like a native app.</div>
              </div>
            </div>
            <div className="benefit">
              <WifiIcon className="benefit__icon" />
              <div className="benefit__text">
                <div className="benefit__title">Fast & reliable</div>
                <div className="benefit__desc">Enjoy full‑screen browsing and offline grace for viewed pages.</div>
              </div>
            </div>
            <div className="benefit">
              <ShieldCheckIcon className="benefit__icon" />
              <div className="benefit__text">
                <div className="benefit__title">Always up‑to‑date</div>
                <div className="benefit__desc">Automatic updates keep features and security fresh.</div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="install-card">
            <div className="install-card__head">
              <ArrowDownTrayIcon />
              <span>How to install on {platform}</span>
              {/* <small className="install-card__badge">{browser}</small> */}
            </div>
            <ol className="install-card__steps">
              {steps.map((s, i) => (
                <li key={i}>
                  <span className="step__num">{i + 1}</span>
                  <span className="step__text">{s}</span>
                </li>
              ))}
            </ol>

            {canShowNativePrompt && !installed && (
              <button className="install-card__cta" onClick={handleNativeInstall}>
                Install now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, hostRef.current);
}
