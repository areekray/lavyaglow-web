import { useEffect, useState } from "react";

export type Platform = "iOS" | "Android" | "Windows" | "Mac" | "Other";
export type Browser = "Safari" | "Chrome" | "Edge" | "Other";

export async function detectPlatform(): Promise<Platform> {
  const navAny = navigator as any;

  try {
    if (navAny.userAgentData?.getHighEntropyValues) {
      const { platform } = await navAny.userAgentData.getHighEntropyValues(["platform"]);
      const p = (platform || "").toLowerCase();
      if (p.includes("android")) return "Android";
      if (p.includes("mac")) return "Mac";
      if (p.includes("win")) return "Windows";
    }
  } catch {}

  const ua = navigator.userAgent || (navigator as any).vendor || (window as any).opera;

  const isIpadOS =
    /Macintosh/.test(ua) &&
    typeof (navigator as any).maxTouchPoints === "number" &&
    (navigator as any).maxTouchPoints > 1;

  if (/android/i.test(ua)) return "Android";
  if (/iPad|iPhone|iPod/.test(ua) || isIpadOS) return "iOS";
  if (/Win/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "Mac";
  return "Other";
}

export function getBrowser(): Browser {
  const ua = navigator.userAgent;
  if (/Edg/i.test(ua)) return "Edge";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  return "Other";
}

export function isStandaloneDisplay(): boolean {
  // iOS Safari uses navigator.standalone
  const iosStandalone = (navigator as any).standalone === true;
  // PWA display-mode
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const windowed = window.matchMedia("(display-mode: window-controls-overlay)").matches;
  return iosStandalone || standalone || windowed;
}

export function isStandalone(): boolean {
  const iosStandalone = (navigator as any).standalone === true;
  const standalone = window.matchMedia('(display-mode: standalone)').matches;
  const wco = window.matchMedia('(display-mode: window-controls-overlay)').matches;
  return iosStandalone || standalone || wco;
}

export function useInstalledState() {
  const [installed, setInstalled] = useState<boolean>(() => {
    if (isStandalone()) return true;
    return localStorage.getItem('pwa_installed') === '1';
  });

  useEffect(() => {
    const onInstalled = () => {
      localStorage.setItem('pwa_installed', '1');
      setInstalled(true);
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  // Also react if display-mode changes (some browsers can change this dynamically)
  useEffect(() => {
    const mq1 = window.matchMedia('(display-mode: standalone)');
    const mq2 = window.matchMedia('(display-mode: window-controls-overlay)');
    const onChange = () => {
      if (mq1.matches || mq2.matches || (navigator as any).standalone === true) {
        setInstalled(true);
      }
    };
    mq1.addEventListener?.('change', onChange);
    mq2.addEventListener?.('change', onChange);
    return () => {
      mq1.removeEventListener?.('change', onChange);
      mq2.removeEventListener?.('change', onChange);
    };
  }, []);

  return installed;
}
