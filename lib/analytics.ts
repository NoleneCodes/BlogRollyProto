
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
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID && hasAnalyticsConsent()) {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Add Google Analytics script to head (only if not already added)
    if (!document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      const script1 = document.createElement('script')
      script1.async = true
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(script1)

      const script2 = document.createElement('script')
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false
        });
      `
      document.head.appendChild(script2)
    }
  }
}

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
