import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { initGA, trackPageView } from '../lib/analytics';
import BugReportModal from './BugReportModal';
import styles from '../styles/Layout.module.css';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'BlogRolly',
  description = 'Discover and organize your favorite blogs with BlogRolly',
  image = '/DigitalBR.svg',
  canonical
}) => {
  const router = useRouter();
  const [showBugReportPopup, setShowBugReportPopup] = useState(false);

  useEffect(() => {
    // Initialize Google Analytics
    initGA();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={canonical || (typeof window !== 'undefined' ? window.location.href : '')} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        {canonical && <link rel="canonical" href={canonical} />}
        <link rel="icon" href="/DigitalBR.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/DigitalBR.svg" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Organization Structured Data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          'name': 'BlogRolly',
          'url': 'https://blogrolly.com',
          'logo': 'https://blogrolly.com/DigitalBR.svg',
          'sameAs': [
            'https://x.com/BlogRolly',
            'https://www.facebook.com/blogrolly',
            'https://www.tiktok.com/@blogrolly',
            'https://www.instagram.com/blogrolly/'
          ],
          'description': 'Where independent blogs grow stronger together.'
        }) }} />
      </Head>

      <div className={styles.container}>
        {/* Single combined Header with all navigation */}
        <Header />

        <main className={styles.main}>
          {children}
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h4>BlogRolly</h4>
              <p className={styles.footerTagline}>Where independent blogs grow stronger together.</p>
            </div>
            <div className={styles.footerSection}>
              <h4>Web Nav</h4>
              <Link href="/about">About Us</Link>
              <Link href="/blogroll">The Blogroll</Link>
              <Link href="/blog">Our Blog</Link>
              <Link href="/contact">Contact Us</Link>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowBugReportPopup(true); }}>Report a Bug</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Legal</h4>
              <Link href="/terms">Terms & Conditions</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/cookies">Cookie Policy</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Investors</h4>
              <Link href="/investors">Investor Information</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Connect</h4>
              <a href="https://x.com/BlogRolly" target="_blank" rel="noopener noreferrer">Twitter/X</a>
              <a href="https://www.facebook.com/blogrolly" target="_blank" rel="noopener noreferrer">Facebook</a>
              <a href="https://www.tiktok.com/@blogrolly" target="_blank" rel="noopener noreferrer">TikTok</a>
              <a href="https://www.instagram.com/blogrolly/" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>™ 2025 BlogRolly. Made with ❤️</p>
          </div>
        </footer>

        {/* Bug Report Modal */}
        <BugReportModal
          isOpen={showBugReportPopup}
          onClose={() => setShowBugReportPopup(false)}
        />
      </div>
    </>
  );
};

export default Layout;