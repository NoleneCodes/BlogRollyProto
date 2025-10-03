import React, { useState } from 'react';
import styles from '../../styles/AdminDashboard.module.css';

const testEmailTemplates = [
  { name: 'Welcome Blogger', endpoint: '/api/test-email/welcome-blogger' },
  { name: 'Welcome Reader', endpoint: '/api/test-email/welcome-reader' },
  { name: 'Blog Submission Received', endpoint: '/api/test-email/blog-submission-received' },
  { name: 'Blog Approved', endpoint: '/api/test-email/blog-approved' },
  { name: 'Blog Rejected', endpoint: '/api/test-email/blog-rejected' },
  { name: 'Payment Successful', endpoint: '/api/test-email/payment-successful' },
  { name: 'Payment Failed First Notice', endpoint: '/api/test-email/payment-failed-first' },
  { name: 'Payment Failed Final Notice', endpoint: '/api/test-email/payment-failed-final' },
  { name: 'Blog Delisted Payment', endpoint: '/api/test-email/blog-delisted-payment' },
  { name: 'Blog URL Changed', endpoint: '/api/test-email/blog-url-changed' },
  { name: 'Blog Deactivated', endpoint: '/api/test-email/blog-deactivated' },
  { name: 'Premium Welcome', endpoint: '/api/test-email/premium-welcome' },
  { name: 'LinkedIn Verification Result', endpoint: '/api/test-email/linkedin-verification-result' },
  { name: 'Bug Report Received', endpoint: '/api/test-email/bug-report-received' },
  { name: 'Support Request Received', endpoint: '/api/test-email/support-request-received' },
  { name: 'Support Request Reply', endpoint: '/api/test-email/support-request-reply' },
  { name: 'Password Reset', endpoint: '/api/test-email/password-reset' }
];

const EmailTesting = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testFirstName, setTestFirstName] = useState('');
  const [emailTestLoading, setEmailTestLoading] = useState(false);
  const [emailTestResults, setEmailTestResults] = useState<any[]>([]);

  const sendTestEmail = async (template: any) => {
    if (!testEmail) {
      alert('Please enter a test email address first.');
      return;
    }
    setEmailTestLoading(true);
    try {
      const response = await fetch(template.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, firstName: testFirstName || 'Test User' })
      });
      const result = await response.json();
      const testResult = {
        template: template.name,
        success: response.ok,
        result: result,
        timestamp: new Date().toLocaleString()
      };
      setEmailTestResults(prev => [testResult, ...prev]);
    } catch (error) {
      setEmailTestResults(prev => [{ template: template.name, success: false, result: { error: 'Network error' }, timestamp: new Date().toLocaleString() }, ...prev]);
    }
    setEmailTestLoading(false);
  };

  const sendAllTestEmails = async () => {
    setEmailTestLoading(true);
    setEmailTestResults([]);
    for (const template of testEmailTemplates) {
      await sendTestEmail(template);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setEmailTestLoading(false);
    alert('All test emails completed! Check results below.');
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionHeader}>
        <h2>Email Template Testing</h2>
        <p>Test all email templates to ensure they work correctly</p>
      </div>
      <div className={styles.emailTestingForm}>
        <div className={styles.formGroup}>
          <label htmlFor="test-email">Test Email Address:</label>
          <input id="test-email" type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your-email@example.com" className={styles.emailInput} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="test-first-name">First Name (for personalization):</label>
          <input id="test-first-name" type="text" value={testFirstName} onChange={e => setTestFirstName(e.target.value)} placeholder="John" className={styles.emailInput} />
        </div>
        <button onClick={sendAllTestEmails} disabled={emailTestLoading || !testEmail} className={styles.primaryButton} style={{ marginBottom: '20px' }}>
          {emailTestLoading ? 'Sending All Tests...' : 'Send All Test Emails'}
        </button>
        <h3>Individual Email Tests</h3>
        <div className={styles.emailTestGrid}>
          {testEmailTemplates.map((template, index) => (
            <div key={index} className={styles.emailTestItem}>
              <span className={styles.emailTestName}>{template.name}</span>
              <button onClick={() => sendTestEmail(template)} disabled={emailTestLoading || !testEmail} className={styles.actionButton}>Send Test</button>
            </div>
          ))}
        </div>
        {emailTestResults.length > 0 && (
          <div className={styles.emailTestResults}>
            <h3>Test Results</h3>
            <div className={styles.resultsContainer}>
              {emailTestResults.map((result, index) => (
                <div key={index} className={`${styles.testResult} ${result.success ? styles.testSuccess : styles.testError}`}>
                  <div className={styles.testResultHeader}>
                    <strong>{result.template}</strong> - {result.timestamp}
                    <span className={styles.testStatus}>{result.success ? '✅ Success' : '❌ Failed'}</span>
                  </div>
                  <div className={styles.testResultDetails}>
                    <small>{JSON.stringify(result.result, null, 2)}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTesting;
