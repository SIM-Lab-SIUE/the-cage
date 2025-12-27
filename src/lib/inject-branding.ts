import config from '../config/branding.config';

/**
 * Injects branding configuration values as CSS variables into the :root of the document.
 */
export function injectBrandingConfig() {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', config.theme.primary);
    root.style.setProperty('--secondary-color', config.theme.secondary);
    root.style.setProperty('--accent-color', config.theme.accent);
  }
}