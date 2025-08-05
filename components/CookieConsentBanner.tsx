
import React, { useState, useEffect } from 'react';
import { initGA } from '../lib/analytics';
import styles from '../styles/CookieConsentBanner.module.css';

interface CookieConsent {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

const CookieConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    analytics: false,
    functional: true, // Essential cookies - always required
    marketing: false
  });

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = localStorage.getItem('cookieConsent');
    if (!existingConsent) {
      setShowBanner(true);
    } else {
      const parsedConsent = JSON.parse(existingConsent);
      setConsent(parsedConsent);
      
      // Initialize GA only if user consented to analytics
      if (parsedConsent.analytics) {
        initGA();
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const newConsent = {
      analytics: true,
      functional: true,
      marketing: true
    };
    
    saveConsent(newConsent);
    initGA(); // Initialize GA since analytics was accepted
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const newConsent = {
      analytics: false,
      functional: true, // Essential cookies always required
      marketing: false
    };
    
    saveConsent(newConsent);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
    
    if (consent.analytics) {
      initGA();
    }
    
    setShowBanner(false);
    setShowPreferences(false);
  };

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setConsent(consentData);
  };

  const handleConsentChange = (type: keyof CookieConsent, value: boolean) => {
    if (type === 'functional') return; // Can't disable essential cookies
    
    setConsent(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!showBanner) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        {!showPreferences ? (
          <>
            <div className={styles.content}>
              <h3>We Value Your Privacy</h3>
              <p>
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept All", you consent to our use of cookies as described in our{' '}
                <a href="/cookies" target="_blank" rel="noopener noreferrer">Cookie Policy</a> and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </p>
            </div>
            
            <div className={styles.actions}>
              <button 
                onClick={handleRejectAll}
                className={styles.rejectButton}
              >
                Reject All
              </button>
              <button 
                onClick={() => setShowPreferences(true)}
                className={styles.preferencesButton}
              >
                Manage Preferences
              </button>
              <button 
                onClick={handleAcceptAll}
                className={styles.acceptButton}
              >
                Accept All
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.content}>
              <h3>Cookie Preferences</h3>
              <p>Choose which cookies you want to allow:</p>
              
              <div className={styles.cookieTypes}>
                <div className={styles.cookieType}>
                  <div className={styles.cookieHeader}>
                    <input
                      type="checkbox"
                      id="functional"
                      checked={consent.functional}
                      onChange={(e) => handleConsentChange('functional', e.target.checked)}
                      disabled
                    />
                    <label htmlFor="functional">
                      <strong>Essential Cookies</strong> (Required)
                    </label>
                  </div>
                  <p>These cookies are necessary for the website to function and cannot be switched off.</p>
                </div>
                
                <div className={styles.cookieType}>
                  <div className={styles.cookieHeader}>
                    <input
                      type="checkbox"
                      id="analytics"
                      checked={consent.analytics}
                      onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                    />
                    <label htmlFor="analytics">
                      <strong>Analytics Cookies</strong>
                    </label>
                  </div>
                  <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                </div>
                
                <div className={styles.cookieType}>
                  <div className={styles.cookieHeader}>
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={consent.marketing}
                      onChange={(e) => handleConsentChange('marketing', e.target.checked)}
                    />
                    <label htmlFor="marketing">
                      <strong>Marketing Cookies</strong>
                    </label>
                  </div>
                  <p>These cookies may be set through our site by our advertising partners to build a profile of your interests.</p>
                </div>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button 
                onClick={() => setShowPreferences(false)}
                className={styles.backButton}
              >
                Back
              </button>
              <button 
                onClick={handleSavePreferences}
                className={styles.saveButton}
              >
                Save Preferences
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CookieConsentBanner;
