
// Umami Analytics configuration
// TODO: Add NEXT_PUBLIC_UMAMI_WEBSITE_ID and NEXT_PUBLIC_UMAMI_URL to environment variables

export const UMAMI_CONFIG = {
  websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  scriptUrl: process.env.NEXT_PUBLIC_UMAMI_URL || 'https://analytics.umami.is/script.js'
};

// Initialize Umami tracking
export const initUmami = () => {
  if (typeof window !== 'undefined' && UMAMI_CONFIG.websiteId) {
    console.log('TODO: Initialize Umami analytics', UMAMI_CONFIG);
    /*
    const script = document.createElement('script');
    script.async = true;
    script.src = UMAMI_CONFIG.scriptUrl;
    script.setAttribute('data-website-id', UMAMI_CONFIG.websiteId);
    document.head.appendChild(script);
    */
  }
};

// Track custom events with Umami
export const umamiTrack = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).umami) {
    console.log('TODO: Track Umami event', { eventName, eventData });
    /*
    (window as any).umami.track(eventName, eventData);
    */
  }
};

// Specific Umami tracking functions for BlogRolly
export const trackUmamiBlogSubmission = (category: string) => {
  umamiTrack('blog_submission', { category });
};

export const trackUmamiBlogClick = (blogUrl: string, category: string) => {
  umamiTrack('blog_click', { blog_url: blogUrl, category });
};

export const trackUmamiUserSignup = (userType: 'reader' | 'blogger') => {
  umamiTrack('user_signup', { user_type: userType });
};

export const trackUmamiPremiumUpgrade = () => {
  umamiTrack('premium_upgrade');
};

declare global {
  interface Window {
    umami: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}
