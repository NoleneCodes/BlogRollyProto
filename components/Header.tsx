import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { createClient } from '@supabase/supabase-js';
import styles from '../styles/Header.module.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role: string;
  tier: string;
}

const Header: React.FC = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug: Log the current theme
  useEffect(() => {
    console.log('🎨 Current theme:', theme);
    console.log('🔍 Document attributes:', document.documentElement.getAttribute('data-theme'));
    console.log('🔍 Document classList:', document.documentElement.className);
  }, [theme]);

  useEffect(() => {
    checkUserSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadUserProfile(session?.user?.id);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('username, first_name, surname, profile_image_url, role, tier')
        .eq('user_id', userId)
        .single();

      if (userProfile && !error) {
        setUserProfile({
          id: userId,
          name: `${userProfile.first_name || ''} ${userProfile.surname || ''}`.trim(),
          username: userProfile.username,
          avatar: userProfile.profile_image_url,
          role: userProfile.role,
          tier: userProfile.tier
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserProfile(null);
      setShowProfileDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getProfileRoute = () => {
    if (!userProfile) return '/profile/reader';
    
    if (userProfile.role === 'blogger') {
      return userProfile.tier === 'pro' ? '/profile/blogger-premium' : '/profile/blogger';
    }
    return '/profile/reader';
  };

  const DarkModeToggle = () => {
    if (!mounted) return null;

    return (
      <button
        onClick={() => {
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          console.log('🔄 Switching theme from', theme, 'to', newTheme);
          setTheme(newTheme);
        }}
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

  const renderAuthSection = () => {
    if (isLoading) {
      return (
        <div className={styles.authLoading}>
          <div className={styles.loadingSpinner}></div>
        </div>
      );
    }

    if (userProfile) {
      return (
        <div className={styles.userSection}>
          <div 
            className={styles.userProfile}
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className={styles.userAvatar}>
              {userProfile.avatar ? (
                <Image
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  width={32}
                  height={32}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarInitials}>
                  {getInitials(userProfile.name || userProfile.username)}
                </div>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userProfile.name || userProfile.username}</span>
              <span className={styles.userRole}>{userProfile.role} • {userProfile.tier}</span>
            </div>
            <svg className={styles.dropdownIcon} width="12" height="8" viewBox="0 0 12 8">
              <path d="M6 8L0 2h12L6 8z" fill="currentColor" />
            </svg>
          </div>

          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownUserInfo}>
                  <strong>{userProfile.name || userProfile.username}</strong>
                  <span>{userProfile.role} • {userProfile.tier}</span>
                </div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <Link href={getProfileRoute()} className={styles.dropdownItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                My Profile
              </Link>
              <div className={styles.dropdownDivider}></div>
              <button onClick={handleSignOut} className={styles.dropdownItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z"/>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      );
    }

    // Not logged in - show auth buttons
    return (
      <div className={styles.authButtons}>
        <Link href="/auth" className={styles.signInButton}>
          Sign In
        </Link>
        <Link href="/auth" className={styles.signUpButton}>
          Sign Up
        </Link>
      </div>
    );
  };

  // Create dynamic className based on theme
  const headerClassName = `${styles.header} ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`;

  return (
    <header className={headerClassName} data-theme={theme}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoContainer}>
            <Image src="/DigitalBR.svg" alt="BlogRolly Logo" width={40} height={40} className={styles.logoIcon} />
            <Image src="/DigitalText.svg" alt="BlogRolly" width={120} height={40} className={styles.logoText} />
          </div>
        </Link>
        
        {/* Center Navigation */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/blogroll" className={styles.navLink}>Explore</Link>
          <Link href="/submit" className={styles.navLink}>Submit</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
          <Link href="/investors" className={styles.navLink}>Investors</Link>
          <Link href="/blog" className={styles.navLink}>Our Blog</Link>
        </nav>

        {/* Right Side: Auth + Dark Mode */}
        <div className={styles.rightSection}>
          {renderAuthSection()}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;