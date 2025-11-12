/**
 * @deprecated Since this doesn't switch dynamically when the window width changes. Better to use css styles or the renderMobileDesktop({ mobile: ReactNode, desktop: ReactNode }) helper
 */
export function isMobileWidth() {
  return window.innerWidth < 700
}
