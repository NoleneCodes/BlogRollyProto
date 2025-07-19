
// Google Analytics configuration
// TODO: Install gtag when ready to integrate
// TODO: Add NEXT_PUBLIC_GA_MEASUREMENT_ID to environment variables

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // TODO: Implement GA initialization
    console.log('TODO: Initialize Google Analytics', GA_MEASUREMENT_ID)
    /*
    // Add Google Analytics script to head
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_MEASUREMENT_ID}');
    `
    document.head.appendChild(script2)
    */
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    console.log('TODO: Track page view', url)
    /*
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
    })
    */
  }
}

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('TODO: Track event', { action, category, label, value })
    /*
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
    */
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
