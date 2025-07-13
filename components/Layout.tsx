
import React from 'react';
import Head from 'next/head';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Blogrolly' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Blogrolly - Your personal blog directory" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0070f3" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.navContent}>
            <div className={styles.logo}>
              <h2>Blogrolly</h2>
            </div>
            <div className={styles.navLinks}>
              <a href="/" className={styles.navLink}>Home</a>
              <a href="/blogs" className={styles.navLink}>Blogs</a>
              <a href="/add" className={styles.navLink}>Add Blog</a>
              <a href="/about" className={styles.navLink}>About</a>
            </div>
            <div className={styles.mobileMenu}>
              <button className={styles.menuButton}>☰</button>
            </div>
          </div>
        </nav>

        <main className={styles.main}>
          {children}
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <h4>Blogrolly</h4>
              <p>Your personal blog directory</p>
            </div>
            <div className={styles.footerSection}>
              <h4>Links</h4>
              <a href="/blogs">Browse Blogs</a>
              <a href="/add">Add Blog</a>
              <a href="/about">About</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Connect</h4>
              <a href="#">Twitter</a>
              <a href="#">GitHub</a>
              <a href="#">RSS</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2024 Blogrolly. Made with ❤️</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
