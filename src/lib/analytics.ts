import ReactGA from 'react-ga4';

// Google Analytics 4 configuration
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

let isInitialized = false;

/**
 * Initialize Google Analytics 4
 * Only initializes if tracking ID is configured
 */
export function initGA(): void {
  if (!GA_TRACKING_ID) {
    console.log('GA4 tracking ID not configured - skipping initialization');
    return;
  }

  if (!isInitialized) {
    try {
      ReactGA.initialize(GA_TRACKING_ID);
      isInitialized = true;
      console.log('GA4 initialized successfully');
    } catch (error) {
      console.error('Error initializing GA4:', error);
    }
  }
}

/**
 * Track a page view in Google Analytics
 */
export function trackPageView(path: string): void {
  if (!isInitialized || !GA_TRACKING_ID) {
    return;
  }

  try {
    ReactGA.send({ hitType: 'pageview', page: path });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  if (!isInitialized || !GA_TRACKING_ID) {
    return;
  }

  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Check if GA4 is initialized
 */
export function isGAInitialized(): boolean {
  return isInitialized;
}
