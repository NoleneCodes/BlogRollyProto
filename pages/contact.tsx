import Layout from '../components/Layout';
import Link from 'next/link';
import SocialIcons from '../components/SocialIcons';
import styles from '../styles/Home.module.css';

const brandColor = '#c42142'; // Updated brand color
const cardBg = '#fff';
const cardShadow = '0 2px 16px rgba(0,0,0,0.07)';
const pageBg = '#f8fafc';

const Contact = () => (
  <Layout title="Contact BlogRolly">
  <div style={{ minHeight: '100vh', padding: '0 0 4rem 0' }}>
      <div className={styles.hero}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: 0 }}>Contact BlogRolly</h2>
      </div>
      <div style={{ maxWidth: 600, margin: '2rem auto 0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Questions? Feedback? Just want to say hello?<br />We’d love to hear from you.</p>
        <p style={{ fontSize: '1.05rem', color: '#334155', marginBottom: '2rem' }}>
          Whether you’re a blogger looking to join, a reader discovering your next favourite voice, or someone curious about our mission, we’re here and listening.
        </p>
      </div>
  <div className={styles.contactSection} style={{ maxWidth: 600, margin: '2rem auto', background: cardBg, boxShadow: cardShadow, borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', marginTop: 0, textAlign: 'center' }}>General Inquiries</h3>
        <p style={{ textAlign: 'center' }}>Email: <a href="mailto:hello@blogrolly.com" style={{ color: brandColor, fontWeight: 500 }}>hello@blogrolly.com</a></p>

  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', textAlign: 'center' }}>Submit Your Blog</h3>
        <p style={{ textAlign: 'center' }}>Are you a self-hosted blogger ready to grow your audience and get discovered?</p>
          <Link
            href="/submit"
            className={styles.secondaryButton}
            style={{
              display: 'inline-block',
              margin: '0.5rem auto',
              background: brandColor,
              color: '#fff',
              fontWeight: 700,
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              fontSize: '1.1rem',
              boxShadow: '0 2px 8px rgba(225,29,72,0.10)',
              border: '2px solid transparent',
              transition: 'background 0.2s, color 0.2s, border 0.2s',
              cursor: 'pointer',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#fff';
              e.currentTarget.style.color = brandColor;
              e.currentTarget.style.border = `2px solid ${brandColor}`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = brandColor;
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.border = '2px solid transparent';
            }}
          >
            Submit Your Blog Here
          </Link>


  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', textAlign: 'center' }}>FAQs & Support</h3>
        <p style={{ textAlign: 'center' }}>
          Need help using BlogRolly?<br />
           Email: <a href="mailto:hello@blogrolly.com?subject=Help" style={{ color: brandColor, fontWeight: 500 }}>hello@blogrolly.com</a> (Subject: Help)
        </p>

  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', textAlign: 'center' }}>Press & Media</h3>
        <p style={{ textAlign: 'center' }}>
          For interviews, media requests, or press opportunities:<br />
          Email: <a href="mailto:hello@blogrolly.com?subject=Press" style={{ color: brandColor, fontWeight: 500 }}>hello@blogrolly.com</a> (Subject: Press)
        </p>

  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', textAlign: 'center' }}>Reporting Content</h3>
        <p style={{ textAlign: 'center' }}>
          To report harmful content or violations:<br />
          Email: <a href="mailto:hello@blogrolly.com?subject=Content Report" style={{ color: brandColor, fontWeight: 500 }}>hello@blogrolly.com</a> (Subject: Content Report)
        </p>
<h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', textAlign: 'center' }}>Join the Team</h3>
        <p style={{ textAlign: 'center' }}>
          We&apos;re building something big and you might be the missing piece.<br />
          If you&apos;re passionate about indie media, digital sovereignty, or internet culture, we&apos;d love to connect.<br />
          Email: <a href="mailto:hello@blogrolly.com?subject=Careers" style={{ color: brandColor, fontWeight: 500 }}>hello@blogrolly.com</a> (Subject: Careers)
        </p>

  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', textAlign: 'center' }}>Let’s Connect</h3>
        <div style={{ display: 'flex', justifyContent: 'center', color: '#c42142' }}><SocialIcons /></div>
      </div>
    </div>
  </Layout>
);

export default Contact;
