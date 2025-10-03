// components/pwa/InstallCopy.ts
export type Platform = "iOS" | "Android" | "Windows" | "Mac" | "Other";
export type Browser = "Safari" | "Chrome" | "Edge" | "Other";

export function getBrowser(): Browser {
  const ua = navigator.userAgent;
  if (/Edg/i.test(ua)) return "Edge";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
  return "Other";
}

export function getInstallContent(platform: Platform, browser: Browser) {
  // Customer-facing headline and benefits
  const benefits = [
    "Faster access: launch from home screen like a native app",
    "Full‑screen shopping with no browser clutter",
    "Works offline for browsing previously opened pages",
    "Automatic updates with the latest features",
  ];

  // Platform + browser specific steps
  const steps: string[] = [];

  if (platform === "iOS") {
    if (browser === "Safari") {
      steps.push(
        "Tap the Share icon at the bottom toolbar",
        'Choose "Add to Home Screen"',
        'Tap "Add" in the top‑right corner'
      );
    } else {
      // Chrome on iOS can’t install PWAs to Home Screen reliably — recommend Safari
      steps.push(
        "Open this site in Safari on iPhone/iPad",
        "Tap the Share icon",
        'Choose "Add to Home Screen"',
        'Tap "Add" to finish'
      );
    }
  } else if (platform === "Android") {
    // Chrome/Edge on Android show native “Install app” prompts or menu
    steps.push(
      "Tap the menu (⋮) in the top‑right corner of your browser",
      'Choose "Install app" or "Add to Home screen"',
      "Confirm install to add the app icon"
    );
  } else if (platform === "Mac") {
    if (browser === "Safari") {
      steps.push(
        "From the Safari menu bar, go to File",
        'Click "Add to Dock…" (on newer Safari: "Add to Dock")',
        "Confirm to add the app to your Dock"
      );
    } else {
      // Chrome/Edge on macOS
      steps.push(
        "Click the install icon in the address bar (computer with down arrow), or open the ⋮ menu",
        'Choose "Install app…" (Chrome) or "Apps → Install this site as an app" (Edge)',
        "Confirm install to add it to Applications and Dock"
      );
    }
  } else if (platform === "Windows") {
    // Chrome/Edge on Windows
    steps.push(
      "Click the install icon in the address bar (computer with down arrow), or open the ⋮ menu",
      'Choose "Install app…" (Chrome) or "Apps → Install this site as an app" (Edge)',
      "Confirm install; you’ll get a Start menu and desktop entry"
    );
  } else {
    steps.push(
      "Open the browser menu",
      'Look for "Install app" or "Add to Home screen"',
      "Confirm install to create a quick launcher"
    );
  }

  return { title: "Install LavyaGlow App", benefits, steps };
}
