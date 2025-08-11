// Google Analytics configuration
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Check if user has consented to analytics cookies
export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;

  const consent = localStorage.getItem('cookieConsent');
  if (!consent) return false;

  try {
    const parsedConsent = JSON.parse(consent);
    return parsedConsent.analytics === true;
  } catch {
    return false;
  }
}

// Initialize Google Analytics (only call this after user consent)
export const initGA = () => {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
    // Initialize Google Analytics
    (window as any).gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views (only if user consented)
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID && hasAnalyticsConsent()) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
      anonymize_ip: true
    })
  }
}

// Track custom events (only if user consented)
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag && hasAnalyticsConsent()) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      anonymize_ip: true
    })
  }
}

// Specific tracking functions for BlogRolly
export const trackBlogSubmission = (category: string, blogUrl: string) => {
  trackEvent('blog_submission', 'engagement', category)
}

export const trackBlogClick = (blogUrl: string, category: string) => {
  trackEvent('blog_click', 'engagement', blogUrl)
}

export const trackUserSignup = (userType: 'reader' | 'blogger') => {
  trackEvent('signup', 'user_acquisition', userType)
}

export const trackPremiumUpgrade = () => {
  trackEvent('premium_upgrade', 'conversion', 'blogger_premium')
}

export const trackNewsletterSignup = () => {
  trackEvent('newsletter_signup', 'engagement', 'footer_signup')
}