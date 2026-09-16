export type CookieConsent = { version: string; necessary: true; preferences: boolean; analytics: boolean; marketing: boolean };
const KEY = "ipdav_cookie_consent";
let listeners = new Set<(consent: CookieConsent | null) => void>();
export function getCookieConsent(): CookieConsent | null { if (typeof document === "undefined") return null; try { const value = document.cookie.split("; ").find((item) => item.startsWith(`${KEY}=`))?.split("=")[1]; return value ? JSON.parse(decodeURIComponent(value)) : null; } catch { return null; } }
export function setCookieConsent(consent: CookieConsent) { document.cookie = `${KEY}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=31536000; Path=/; SameSite=Lax`; listeners.forEach((listener) => listener(consent)); }
export function hasCookieConsent(category: keyof Omit<CookieConsent, "version">, version?: string) { const consent = getCookieConsent(); return Boolean(consent && (!version || consent.version === version) && consent[category]); }
export function clearCookieConsent() { document.cookie = `${KEY}=; Max-Age=0; Path=/; SameSite=Lax`; listeners.forEach((listener) => listener(null)); }
export function onConsentChange(listener: (consent: CookieConsent | null) => void) { listeners.add(listener); return () => listeners.delete(listener); }
