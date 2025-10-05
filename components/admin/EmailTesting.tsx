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
  const [testLastName, setTestLastName] = useState('');
  const [testUsername, setTestUsername] = useState('');
  const [testBlogTitle, setTestBlogTitle] = useState('');
  const [testBlogUrl, setTestBlogUrl] = useState('');
  const [testCategory, setTestCategory] = useState('');
  const [testPaymentAmount, setTestPaymentAmount] = useState('');
  const [testLinkedinUrl, setTestLinkedinUrl] = useState('');
  const [testSupportMessage, setTestSupportMessage] = useState('');
  const [testBugDescription, setTestBugDescription] = useState('');

  const sendTestEmail = async (template: any) => {
    if (!testEmail) {
      alert('Please enter a test email address first.');
      return;
    }
    setEmailTestLoading(true);
    try {
      // For test emails, send email, firstName, and mock values for all required fields
      let payload: any = {
        // Universal fields
        email: testEmail,
        firstName: testFirstName,
        lastName: 'TestLast',
        username: 'testuser',
        blogTitle: 'Test Blog',
        blogUrl: 'https://testblog.com',
        category: 'Lifestyle',
        bugDescription: 'Test bug description',
        resetLink: 'https://blogrolly.com/reset-password?token=demo',
        reportId: 'BUG-67890',
        verificationStatus: 'verified',
        approvedBy: 'Test Admin',
        approvedDate: '2025-10-05',
        reviewId: 'REVIEW-12345',
        reviewStatus: 'approved',
        reviewMessage: 'Test review message',
        // Support Request Reply
        ticketId: 'TICKET-12345',
        supportMessage: 'Test support message',
        replyMessage: 'Test reply message',
        replySubject: 'Test reply subject',
        replyType: 'General',
        replyPriority: 'High',
        supportSubject: 'Test support subject',
        supportType: 'General',
        supportPriority: 'High',
        replyEmail: testEmail,
        replyFirstName: testFirstName,
        replyLastName: 'TestLast',
        // LinkedIn Verification Result
        linkedinUrl: 'https://linkedin.com/in/testuser',
        linkedinStatus: 'verified',
        linkedinMessage: 'Test LinkedIn message',
        linkedinProfile: 'https://linkedin.com/in/testuser',
        linkedinVerificationDate: '2025-10-05',
        linkedinVerificationMessage: 'Verified successfully',
        linkedinFirstName: testFirstName,
        linkedinLastName: 'TestLast',
        linkedinEmail: testEmail,
        // Blog Deactivated
        deactivationReason: 'Test deactivation',
        blogDeactivationDate: '2025-10-05',
        blogDeactivationMessage: 'Deactivated for testing',
        deactivateDetails: 'Test deactivate details',
        deactivatedBy: 'Test Admin',
        deactivatedEmail: testEmail,
        deactivatedFirstName: testFirstName,
        deactivatedLastName: 'TestLast',
        // Blog URL Changed
        blogUrlOld: 'https://oldblog.com',
        blogUrlNew: 'https://testblog.com',
        blogUrlChangeDate: '2025-10-05',
        blogUrlChangeMessage: 'Changed for testing',
        urlChangeReason: 'Test change',
        changeDetails: 'Test change details',
        changedBy: 'Test Admin',
        changedEmail: testEmail,
        changedFirstName: testFirstName,
        changedLastName: 'TestLast',
        // Blog Delisted Payment
        paymentAmount: '25.00',
        delistedReason: 'Test delisted reason',
        delistedDate: '2025-10-05',
        delistedMessage: 'Delisted for testing',
        delistedBy: 'Test Admin',
        delistedEmail: testEmail,
        delistedFirstName: testFirstName,
        delistedLastName: 'TestLast',
        // Payment Emails
        paymentType: 'Credit Card',
        paymentDate: '2025-10-05',
        paymentAmountDue: '0.00',
        paymentAmountPaid: '25.00',
        paymentFailureReason: 'Insufficient funds',
        paymentFinalNotice: true,
        paymentStatus: 'success',
        paymentReference: 'PAY-12345',
        failedReason: 'Test payment failed reason',
        finalNotice: true,
        paymentBy: 'Test Admin',
        paymentEmail: testEmail,
        paymentFirstName: testFirstName,
        paymentLastName: 'TestLast',
        // Blog Rejected
        blogSubmissionId: 'SUB-54321',
        rejectionReason: 'Not enough content',
        reviewDetails: 'Test review details',
        reviewDetailsMessage: 'Review details for testing',
        reviewDetailsDate: '2025-10-05',
        reviewDetailsStatus: 'approved',
        reviewDetailsAdmin: 'Test Admin',
        reviewDetailsId: 'REVIEW-54321',
        reviewEmail: testEmail,
        reviewFirstName: testFirstName,
        reviewLastName: 'TestLast'
      };
      const response = await fetch(template.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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