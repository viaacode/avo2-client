import { isServerSideRendering } from "./routing/is-server-side-rendering.ts";

/**
 * @deprecated Since this doesn't switch dynamically when the window width changes. Better to use css styles or the renderMobileDesktop({ mobile: ReactNode, desktop: ReactNode }) helper
 */
export function isMobileWidth() {
  if (isServerSideRendering()) {
    return false;
  }
  return window.innerWidth < 700;
}
