
import React from 'react';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';

const Cookies: NextPage = () => {
  return (
    <Layout title="Cookie Policy - BlogRolly">
      <div className={styles.missionSection}>
        <h1>COOKIE POLICY</h1>
        <p><strong>Last updated January 24, 2025</strong></p>

        <p>
          This Cookie Policy explains how BlogRolly Ltd (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar technologies when you visit our website https://blogrolly.com (the &quot;Site&quot;) and our related services (collectively, the &quot;Services&quot;).
        </p>

        <h2>TABLE OF CONTENTS</h2>
        <ol>
          <li><a href="#what-are-cookies">WHAT ARE COOKIES</a></li>
          <li><a href="#types-of-cookies">TYPES OF COOKIES WE USE</a></li>
          <li><a href="#essential-cookies">ESSENTIAL COOKIES</a></li>
          <li><a href="#analytics-cookies">ANALYTICS COOKIES</a></li>
          <li><a href="#functional-cookies">FUNCTIONAL COOKIES</a></li>
          <li><a href="#advertising-cookies">ADVERTISING COOKIES</a></li>
          <li><a href="#third-party-cookies">THIRD-PARTY COOKIES</a></li>
          <li><a href="#managing-cookies">MANAGING YOUR COOKIE PREFERENCES</a></li>
          <li><a href="#cookie-retention">COOKIE RETENTION</a></li>
          <li><a href="#updates-to-policy">UPDATES TO THIS POLICY</a></li>
          <li><a href="#contact-us">CONTACT US</a></li>
        </ol>

        <h2 id="what-are-cookies">1. WHAT ARE COOKIES</h2>
        <p>
          Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember information about your visit, such as your preferred language and other settings, which can make your next visit easier and the site more useful to you.
        </p>
        <p>
          Similar technologies we use include:
        </p>
        <ul>
          <li><strong>Web beacons/pixels:</strong> Small graphics that help us understand how you use our website</li>
          <li><strong>Local storage:</strong> Technology that allows websites to store data locally within your browser</li>
          <li><strong>Session storage:</strong> Temporary storage that exists only for the duration of your browsing session</li>
        </ul>

        <h2 id="types-of-cookies">2. TYPES OF COOKIES WE USE</h2>
        <p>We use the following types of cookies on our Services:</p>

        <h3>By Duration:</h3>
        <ul>
          <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser</li>
          <li><strong>Persistent Cookies:</strong> Cookies that remain on your device until they expire or you delete them</li>
        </ul>

        <h3>By Purpose:</h3>
        <ul>
          <li><strong>Essential Cookies:</strong> Necessary for the website to function properly</li>
          <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
          <li><strong>Functional Cookies:</strong> Enable enhanced functionality and personalization</li>
          <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements</li>
        </ul>

        <h2 id="essential-cookies">3. ESSENTIAL COOKIES</h2>
        <p>These cookies are necessary for our website to function properly and cannot be switched off. They include:</p>
        <ul>
          <li><strong>Authentication cookies:</strong> Keep you logged in during your session</li>
          <li><strong>Security cookies:</strong> Protect against cross-site request forgery and other security threats</li>
          <li><strong>Load balancing cookies:</strong> Ensure the website works properly by distributing traffic</li>
          <li><strong>Session management:</strong> Remember your preferences during your visit</li>
        </ul>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Cookie Name</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Purpose</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>supabase-auth-token</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Authentication and session management</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>1 hour</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>csrf-token</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Security protection</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Session</td>
            </tr>
          </tbody>
        </table>

        <h2 id="analytics-cookies">4. ANALYTICS COOKIES</h2>
        <p>We use analytics cookies to understand how visitors interact with our website. This helps us improve our Services.</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Cookie Name</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Provider</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Purpose</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>_ga</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Google Analytics</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Distinguishes unique users</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>2 years</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>_ga_*</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Google Analytics</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Collects data on user behavior</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>2 years</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>umami-*</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Umami Analytics</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>Privacy-focused analytics</td>
              <td style={{ border: '1px solid #ddd', padding: '12px' }}>1 year</td>
            </tr>
          </tbody>
        </table>

        <h2 id="functional-cookies">5. FUNCTIONAL COOKIES</h2>
        <p>These cookies enable enhanced functionality and personalization, such as:</p>
        <ul>
          <li>Remembering your login status</li>
          <li>Storing your preferences and settings</li>
          <li>Personalizing content based on your interests</li>
          <li>Remembering items in your blog submission drafts</li>
        </ul>

        <h2 id="advertising-cookies">6. ADVERTISING COOKIES</h2>
        <p>Currently, we do not use advertising cookies. If we implement advertising in the future, we will update this policy and seek your consent where required by law.</p>

        <h2 id="third-party-cookies">7. THIRD-PARTY COOKIES</h2>
        <p>Some cookies are placed by third-party services we use:</p>
        
        <h3>Google Analytics</h3>
        <p>We use Google Analytics to analyze website traffic and user behavior. Google may use this data for their own purposes. You can opt-out of Google Analytics by installing the Google Analytics opt-out browser add-on.</p>
        <p>Learn more: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></p>

        <h3>Stripe</h3>
        <p>For payment processing, Stripe may set cookies to prevent fraud and ensure secure transactions.</p>
        <p>Learn more: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></p>

        <h3>Supabase</h3>
        <p>Our backend infrastructure provider may set cookies for authentication and database management.</p>
        <p>Learn more: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a></p>

        <h2 id="managing-cookies">8. MANAGING YOUR COOKIE PREFERENCES</h2>
        <p>You have several options for managing cookies:</p>

        <h3>Browser Settings</h3>
        <p>Most browsers allow you to:</p>
        <ul>
          <li>View what cookies have been set and delete them individually</li>
          <li>Block third-party cookies</li>
          <li>Block cookies from particular sites</li>
          <li>Block all cookies from being set</li>
          <li>Delete all cookies when you close your browser</li>
        </ul>

        <h3>Browser-Specific Instructions:</h3>
        <ul>
          <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</li>
          <li><strong>Firefox:</strong> Settings &gt; Privacy & Security &gt; Cookies and Site Data</li>
          <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
          <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions &gt; Cookies and site data</li>

        </ul>

        <h3>Opt-Out Tools</h3>
        <ul>
          <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
          <li><strong>Digital Advertising Alliance:</strong> <a href="http://optout.aboutads.info/" target="_blank" rel="noopener noreferrer">DAA Opt-out</a></li>
          <li><strong>European Interactive Digital Advertising Alliance:</strong> <a href="http://youronlinechoices.eu/" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
        </ul>

        <h3>Impact of Disabling Cookies</h3>
        <p>Please note that if you disable cookies:</p>
        <ul>
          <li>Some features of our website may not function properly</li>
          <li>You may need to re-enter information more frequently</li>
          <li>Your experience may be less personalized</li>
          <li>Some pages may load more slowly</li>
        </ul>

        <h2 id="cookie-retention">9. COOKIE RETENTION</h2>
        <p>Different cookies have different retention periods:</p>
        <ul>
          <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
          <li><strong>Authentication cookies:</strong> Typically expire after 1 hour of inactivity</li>
          <li><strong>Analytics cookies:</strong> Usually retained for up to 2 years</li>
          <li><strong>Functional cookies:</strong> Retained until you delete them or they expire (usually 1 year)</li>
        </ul>

        <h2 id="updates-to-policy">10. UPDATES TO THIS POLICY</h2>
        <p>We may update this Cookie Policy from time to time to reflect changes in our practices or legal requirements. When we make changes, we will:</p>
        <ul>
          <li>Update the &quot;Last updated&quot; date at the top of this policy</li>
          <li>Notify you of material changes via email or website notification</li>
          <li>Seek your consent again for any new types of cookies where required by law</li>
        </ul>

        <h2 id="contact-us">11. CONTACT US</h2>
        <p>If you have any questions about this Cookie Policy or our use of cookies, please contact us:</p>
        <p>
          <strong>BlogRolly Ltd</strong><br />
          20 Wenlock Road<br />
          London, N1 7GU<br />
          United Kingdom<br />
          Phone: +44 (0) 7796439429<br />
          Email: hello@blogrolly.com
        </p>

        <h3>Data Protection Inquiries</h3>
        <p>For cookie-related data protection inquiries, please email us at hello@blogrolly.com with &quot;Cookie Policy&quot; in the subject line.</p>
      </div>
    </Layout>
  );
};

export default Cookies;
