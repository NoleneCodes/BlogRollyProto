import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { initGA, trackPageView } from '../lib/analytics';
import BugReportModal from './BugReportModal';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'BlogRolly' }) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBugReportPopup, setShowBugReportPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Initialize Google Analytics
    initGA();

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth-check');
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setUserInfo({
              id: data.userId,
              name: data.userName,
              roles: data.userRoles ? data.userRoles.split(',') : []
            });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
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

  const DarkModeToggle = () => {
    if (!mounted) return null;

    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={styles.darkModeToggle}
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>
    );
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Discover and organize your favorite blogs with BlogRolly" />
        <link rel="icon" href="/DigitalBR.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/DigitalBR.svg" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.navContent}>
            <div className={styles.logo}>
              <Link href="/" passHref legacyBehavior>
                <a className={styles.logoLink}>
                <div className={styles.logoContainer}>
                  <img src="/DigitalBR.svg" alt="BlogRolly Logo" className={styles.logoIcon} />
                  <img src="/DigitalText.svg" alt="BlogRolly" className={styles.logoText} />
                </div>
              </a>
              </Link>
            </div>
            <div className={styles.navLinks}>
              <Link href="/blogroll" passHref legacyBehavior><a className={styles.navLink}>The Blogroll</a></Link>
              <Link href="/about" passHref legacyBehavior><a className={styles.navLink}>About</a></Link>
              <Link href="/investors" passHref legacyBehavior><a className={styles.navLink}>Investors</a></Link>
              <Link href="/blog" passHref legacyBehavior><a className={styles.navLink}>Our Blog</a></Link>
              <Link href="/submit" passHref legacyBehavior><a className={styles.navLink}>Submit a Blog</a></Link>
              {!isLoading && (
                userInfo ? (
                  <>
                    <Link href="/profile/reader" passHref legacyBehavior><a className={styles.navLink}>Profile</a></Link>
                    {(userInfo.name === 'Nolene-AA' || userInfo.roles.includes('admin')) && (
                      <Link href="/admin/dashboard" passHref legacyBehavior><a className={styles.navLink} style={{color: '#c42142', fontWeight: '600'}}>Admin Dashboard</a></Link>
                    )}
                  </>
                ) : (
                  <Link href="/auth" passHref legacyBehavior><a className={styles.navLink}>Sign Up/In</a></Link>
                )
              )}
              <DarkModeToggle />
            </div>
            <div className={styles.mobileMenuContainer}>
              <div className={styles.mobileVisibleButtons}>
                <Link href="/submit" passHref legacyBehavior><a className={styles.navLink}>Submit a Blog</a></Link>
                {!isLoading && (
                  userInfo ? (
                    <Link href="/profile/reader" passHref legacyBehavior><a className={styles.navLink}>Profile</a></Link>
                  ) : (
                    <Link href="/auth" passHref legacyBehavior><a className={styles.navLink}>Sign Up/In</a></Link>
                  )
                )}
                <DarkModeToggle />
              </div>
              <div className={styles.mobileMenu}>
                <button className={styles.menuButton} onClick={toggleMobileMenu}>
                  {isMobileMenuOpen ? '✕' : '☰'}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu dropdown */}
          {isMobileMenuOpen && (
            <div className={styles.mobileMenuDropdown}>
              <Link href="/blogroll" passHref legacyBehavior><a className={styles.mobileNavLink} onClick={toggleMobileMenu}>The Blogroll</a></Link>
              <Link href="/about" passHref legacyBehavior><a className={styles.mobileNavLink} onClick={toggleMobileMenu}>About</a></Link>
              <Link href="/investors" passHref legacyBehavior><a className={styles.mobileNavLink} onClick={toggleMobileMenu}>Investors</a></Link>
              <Link href="/blog" passHref legacyBehavior><a className={styles.mobileNavLink} onClick={toggleMobileMenu}>Our Blog</a></Link>
              <Link href="/submit" passHref legacyBehavior><a className={styles.mobileNavLink} onClick={toggleMobileMenu}>Submit a Blog</a></Link>
              {!isLoading && (
                userInfo ? (
                  <>
                    <Link href="/profile/reader" passHref legacyBehavior><a className={styles.mobileNavLink} onClick={toggleMobileMenu}>Profile</a></Link>
                    {(userInfo.name === 'Nolene-AA' || userInfo.roles.includes('admin')) && (
                      <Link href="/admin/dashboard" passHref legacyBehavior><a className={styles.mobileNavLink} onClick={toggleMobileMenu} style={{color: '#c42142', fontWeight: '600'}}>Admin Dashboard</a></Link>
                    )}
                  </>
                ) : (
                  <Link href="/auth" passHref legacyBehavior><a className={styles.mobileNavLink} onClick={toggleMobileMenu}>Sign Up/In</a></Link>
                )
              )}
              <div className={styles.mobileMenuToggleContainer}>
                <DarkModeToggle />
              </div>
            </div>
          )}
        </nav>

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
              <Link href="/about" passHref legacyBehavior><a>About Us</a></Link>
              <Link href="/blogroll" passHref legacyBehavior><a>The Blogroll</a></Link>
              <Link href="/blog" passHref legacyBehavior><a>Our Blog</a></Link>
              <Link href="/contact" passHref legacyBehavior><a>Contact Us</a></Link>
              <a href="#" onClick={(e) => { e.preventDefault(); setShowBugReportPopup(true); }}>Report a Bug</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Legal</h4>
              <Link href="/terms" passHref legacyBehavior><a>Terms & Conditions</a></Link>
              <Link href="/privacy" passHref legacyBehavior><a>Privacy Policy</a></Link>
              <Link href="/cookies" passHref legacyBehavior><a>Cookie Policy</a></Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Investors</h4>
              <Link href="/investors" passHref legacyBehavior><a>Investor Information</a></Link>
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