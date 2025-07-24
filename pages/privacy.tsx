
import type { NextPage } from "next";
import Layout from "../components/Layout";
import styles from "../styles/Home.module.css";

const Privacy: NextPage = () => {
  return (
    <Layout title="Privacy Policy - BlogRolly">
      <div className={styles.missionSection}>
        <h1>PRIVACY POLICY</h1>
        <p><strong>Last updated January 24, 2025</strong></p>

        <p>
          This Privacy Policy describes how BlogRolly Ltd ("Company", "we", "us", or "our") collects, uses, and discloses your personal information when you visit or use our website https://blogrolly.com (the "Site") and our related services (collectively, the "Services").
        </p>

        <h2>TABLE OF CONTENTS</h2>
        <ol>
          <li><a href="#information-collect">INFORMATION WE COLLECT</a></li>
          <li><a href="#how-use-information">HOW WE USE YOUR INFORMATION</a></li>
          <li><a href="#how-share-information">HOW WE SHARE YOUR INFORMATION</a></li>
          <li><a href="#cookies-tracking">COOKIES AND TRACKING TECHNOLOGIES</a></li>
          <li><a href="#data-retention">DATA RETENTION</a></li>
          <li><a href="#data-security">DATA SECURITY</a></li>
          <li><a href="#privacy-rights">YOUR PRIVACY RIGHTS</a></li>
          <li><a href="#childrens-privacy">CHILDREN'S PRIVACY</a></li>
          <li><a href="#international-transfers">INTERNATIONAL DATA TRANSFERS</a></li>
          <li><a href="#policy-updates">UPDATES TO THIS POLICY</a></li>
          <li><a href="#contact-information">CONTACT INFORMATION</a></li>
        </ol>

        <h2 id="information-collect">1. INFORMATION WE COLLECT</h2>
        <h3>Information You Provide to Us</h3>
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li><strong>Account Information:</strong> When you create an account, we collect your email address and any display name you choose to provide.</li>
          <li><strong>Blog Submissions:</strong> When you submit a blog for inclusion in our directory, we collect the blog URL, title, description, category, and any additional information you provide.</li>
          <li><strong>Communication:</strong> When you contact us via email or our contact forms, we collect the information you provide in those communications.</li>
          <li><strong>Payment Information:</strong> When you purchase premium services, our payment processor (Stripe) collects your payment information. We do not store full payment card details on our servers.</li>
        </ul>

        <h3>Information We Collect Automatically</h3>
        <p>When you use our Services, we automatically collect certain information, including:</p>
        <ul>
          <li><strong>Usage Information:</strong> Information about how you interact with our Services, including pages viewed, links clicked, and features used.</li>
          <li><strong>Device Information:</strong> Information about your device, including IP address, browser type, operating system, and device identifiers.</li>
          <li><strong>Analytics Data:</strong> We use analytics services (Google Analytics, Umami) to understand how our Services are used.</li>
        </ul>

        <h2 id="how-use-information">2. HOW WE USE YOUR INFORMATION</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our Services</li>
          <li>Process blog submissions and maintain our directory</li>
          <li>Create and manage your account</li>
          <li>Process payments for premium services</li>
          <li>Send you service-related communications</li>
          <li>Respond to your comments, questions, and customer service requests</li>
          <li>Analyze usage patterns and improve user experience</li>
          <li>Prevent fraud and enhance security</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2 id="how-share-information">3. HOW WE SHARE YOUR INFORMATION</h2>
        <p>We may share your information in the following circumstances:</p>
        <ul>
          <li><strong>Public Directory:</strong> Blog information you submit (title, description, URL, category) is displayed publicly in our blog directory.</li>
          <li><strong>Service Providers:</strong> We share information with trusted third-party service providers who assist us in operating our Services, including:
            <ul>
              <li>Supabase (database and authentication services)</li>
              <li>Stripe (payment processing)</li>
              <li>Resend (email services)</li>
              <li>Google Analytics and Umami (analytics)</li>
              <li>Mailchimp (email marketing, with your consent)</li>
            </ul>
          </li>
          <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests.</li>
          <li><strong>Business Transfers:</strong> In connection with any merger, sale, or transfer of assets, your information may be transferred as part of that transaction.</li>
          <li><strong>Consent:</strong> We may share information with your explicit consent.</li>
        </ul>

        <h2 id="cookies-tracking">4. COOKIES AND TRACKING TECHNOLOGIES</h2>
        <p>We use cookies and similar tracking technologies to:</p>
        <ul>
          <li>Remember your preferences and settings</li>
          <li>Authenticate users and prevent fraud</li>
          <li>Analyze site usage and performance</li>
          <li>Provide personalized content and features</li>
        </ul>
        <p>You can control cookies through your browser settings, but some features of our Services may not function properly if you disable cookies.</p>

        <h2 id="data-retention">5. DATA RETENTION</h2>
        <p>We retain your personal information for as long as necessary to:</p>
        <ul>
          <li>Provide our Services to you</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes and enforce agreements</li>
        </ul>
        <p>Specifically:</p>
        <ul>
          <li>Account information is retained while your account is active and for 2 years after account deletion</li>
          <li>Blog submissions remain in our directory unless you request removal</li>
          <li>Analytics data is retained according to our analytics providers' retention policies</li>
          <li>Communication records are retained for 3 years for customer service purposes</li>
        </ul>

        <h2 id="data-security">6. DATA SECURITY</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

        <h2 id="privacy-rights">7. YOUR PRIVACY RIGHTS</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information:</p>

        <h3>For EU/UK Residents (GDPR/UK GDPR)</h3>
        <ul>
          <li><strong>Access:</strong> Right to request access to your personal information</li>
          <li><strong>Rectification:</strong> Right to correct inaccurate personal information</li>
          <li><strong>Erasure:</strong> Right to request deletion of your personal information</li>
          <li><strong>Portability:</strong> Right to receive your personal information in a portable format</li>
          <li><strong>Restriction:</strong> Right to restrict processing of your personal information</li>
          <li><strong>Objection:</strong> Right to object to processing of your personal information</li>
          <li><strong>Withdrawal of Consent:</strong> Right to withdraw consent where processing is based on consent</li>
        </ul>

        <h3>For California Residents (CCPA/CPRA)</h3>
        <ul>
          <li>Right to know what personal information we collect and how it's used</li>
          <li>Right to delete personal information</li>
          <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
          <li>Right to non-discrimination for exercising privacy rights</li>
        </ul>

        <h3>Exercising Your Rights</h3>
        <p>To exercise these rights, please contact us at hello@blogrolly.com. We will respond to your request within the timeframes required by applicable law.</p>

        <h2 id="childrens-privacy">8. CHILDREN'S PRIVACY</h2>
        <p>Our Services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.</p>

        <h2 id="international-transfers">9. INTERNATIONAL DATA TRANSFERS</h2>
        <p>BlogRolly Ltd is based in the United Kingdom. If you are accessing our Services from outside the UK, please be aware that your information may be transferred to, stored, and processed in the UK and other countries where our service providers operate.</p>
        <p>For EU residents, we ensure that any international transfers comply with GDPR requirements through appropriate safeguards such as Standard Contractual Clauses or adequacy decisions.</p>

        <h2 id="policy-updates">10. UPDATES TO THIS POLICY</h2>
        <p>We may update this Privacy Policy from time to time. When we make changes, we will:</p>
        <ul>
          <li>Update the "Last updated" date at the top of this policy</li>
          <li>Notify you by email (to the email address associated with your account) of any material changes</li>
          <li>Post the updated policy on our website</li>
        </ul>
        <p>Your continued use of our Services after any changes indicates your acceptance of the updated Privacy Policy.</p>

        <h2 id="contact-information">11. CONTACT INFORMATION</h2>
        <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us:</p>
        <p>
          <strong>BlogRolly Ltd</strong><br />
          20 Wenlock Road<br />
          London, N1 7GU<br />
          United Kingdom<br />
          Phone: +44 (0) 7796439429<br />
          Email: hello@blogrolly.com
        </p>

        <h3>Data Protection Officer</h3>
        <p>For data protection inquiries, you can reach us at hello@blogrolly.com with "Data Protection" in the subject line.</p>

        <h3>Supervisory Authorities</h3>
        <p>If you are in the EU or UK and have concerns about our data processing that we cannot resolve, you have the right to lodge a complaint with your local supervisory authority:</p>
        <ul>
          <li><strong>UK:</strong> Information Commissioner's Office (ICO) - https://ico.org.uk/</li>
          <li><strong>EU:</strong> Contact your local Data Protection Authority</li>
        </ul>

        <h2 id="legal-basis">LEGAL BASIS FOR PROCESSING (EU/UK RESIDENTS)</h2>
        <p>We process your personal information based on the following legal bases:</p>
        <ul>
          <li><strong>Contract:</strong> To provide our Services and fulfill our contractual obligations</li>
          <li><strong>Legitimate Interest:</strong> To improve our Services, prevent fraud, and communicate with you</li>
          <li><strong>Consent:</strong> For marketing communications and non-essential cookies (where required)</li>
          <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
        </ul>

        <h2 id="third-party-services">THIRD-PARTY SERVICES</h2>
        <p>Our Services integrate with third-party services that have their own privacy policies:</p>
        <ul>
          <li><strong>Supabase:</strong> https://supabase.com/privacy</li>
          <li><strong>Stripe:</strong> https://stripe.com/privacy</li>
          <li><strong>Google Analytics:</strong> https://policies.google.com/privacy</li>
          <li><strong>Resend:</strong> https://resend.com/legal/privacy-policy</li>
          <li><strong>Mailchimp:</strong> https://mailchimp.com/legal/privacy/</li>
        </ul>
        <p>We encourage you to review these privacy policies to understand how these services handle your information.</p>
      </div>
    </Layout>
  );
};

export default Privacy;
