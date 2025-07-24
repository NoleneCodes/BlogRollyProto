import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { initGA, trackPageView } from '../lib/analytics';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="BlogRolly - Your personal blog directory" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0070f3" />
        <link rel="icon" href="/BRDigital.svg" />
        <link rel="apple-touch-icon" href="/BRDigital.svg" />
      </Head>

      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.navContent}>
            <div className={styles.logo}>
              <a href="/" className={styles.logoLink}>
                <div className={styles.logoContainer}>
                  <img src="/BRDigital.svg" alt="BlogRolly Logo" className={styles.logoIcon} />
                  <img src="/DigitalText.svg" alt="BlogRolly" className={styles.logoText} />
                </div>
              </a>
            </div>
            <div className={styles.navLinks}>
              <a href="/blogroll" className={styles.navLink}>The Blogroll</a>
              <a href="/about" className={styles.navLink}>About</a>
              <a href="/investors" className={styles.navLink}>Investors</a>
              <a href="/blog" className={styles.navLink}>Our Blog</a>
              <a href="/submit" className={styles.navLink}>Submit a Blog</a>
              {!isLoading && (
                userInfo ? (
                  <a href="/profile/reader" className={styles.navLink}>Profile</a>
                ) : (
                  <a href="/auth" className={styles.navLink}>Sign Up/In</a>
                )
              )}
            </div>
            <div className={styles.mobileMenuContainer}>
              <div className={styles.mobileVisibleButtons}>
                <a href="/submit" className={styles.navLink}>Submit a Blog</a>
                {!isLoading && (
                  userInfo ? (
                    <a href="/profile/reader" className={styles.navLink}>Profile</a>
                  ) : (
                    <a href="/auth" className={styles.navLink}>Sign Up/In</a>
                  )
                )}
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
              <a href="/blogroll" className={styles.mobileNavLink} onClick={toggleMobileMenu}>The Blogroll</a>
              <a href="/about" className={styles.mobileNavLink} onClick={toggleMobileMenu}>About</a>
              <a href="/investors" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Investors</a>
              <a href="/blog" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Our Blog</a>
              <a href="/submit" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Submit a Blog</a>
              {!isLoading && (
                userInfo ? (
                  <a href="/profile/reader" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Profile</a>
                ) : (
                  <a href="/auth" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Sign Up/In</a>
                )
              )}
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
              <p>Your personal blog directory</p>
            </div>
            <div className={styles.footerSection}>
              <h4>Links</h4>
              <a href="/about">About Us</a>
              <a href="/blogroll">The Blogroll</a>
              <a href="/blog">Our Blog</a>
              <a href="#">Contact Us</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Legal</h4>
              <a href="/terms">Terms & Conditions</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Investors</h4>
              <a href="/investors">Investor Information</a>
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
      </div>
    </>
  );
};

export default Layout;