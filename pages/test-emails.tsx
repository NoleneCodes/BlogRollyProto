
import { useState } from 'react';
import Layout from '../components/Layout';

export default function TestEmails() {
  const [testEmail, setTestEmail] = useState('');
  const [firstName, setFirstName] = useState('John');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testEmailTemplates = [
    {
      name: 'Welcome Reader',
      endpoint: '/api/test-email/welcome-reader',
      params: { firstName }
    },
    {
      name: 'Welcome Blogger',
      endpoint: '/api/test-email/welcome-blogger',
      params: { firstName }
    },
    {
      name: 'Blog Submission Received',
      endpoint: '/api/test-email/blog-submission-received',
      params: { firstName, blogTitle: 'My Awesome Blog Post' }
    },
    {
      name: 'Blog Approved',
      endpoint: '/api/test-email/blog-approved',
      params: { firstName, blogTitle: 'My Awesome Blog Post', blogUrl: 'https://example.com/blog' }
    },
    {
      name: 'Blog Rejected',
      endpoint: '/api/test-email/blog-rejected',
      params: { firstName, blogTitle: 'My Blog Post', rejectionReason: 'Content quality', rejectionNote: 'Please improve readability' }
    },
    {
      name: 'Password Reset',
      endpoint: '/api/test-email/password-reset',
      params: { firstName, resetLink: 'https://blogrolly.com/reset?token=test123' }
    },
    {
      name: 'Bug Report Received',
      endpoint: '/api/test-email/bug-report-received',
      params: { firstName, reportId: 'BUG-001' }
    },
    {
      name: 'Support Request Received',
      endpoint: '/api/test-email/support-request-received',
      params: { firstName, ticketId: 'SUPPORT-001', supportMessage: 'I need help with my account' }
    },
    {
      name: 'Support Request Reply',
      endpoint: '/api/test-email/support-request-reply',
      params: { firstName, ticketId: 'SUPPORT-001', originalMessage: 'I need help', supportReply: 'We are here to help you!' }
    },
    {
      name: 'Payment Successful',
      endpoint: '/api/test-email/payment-successful',
      params: { firstName, amount: '$9.99', planName: 'Pro Monthly', invoiceUrl: 'https://example.com/invoice', nextBillingDate: '2025-02-28' }
    },
    {
      name: 'Payment Failed (First Notice)',
      endpoint: '/api/test-email/payment-failed-first',
      params: { firstName, planName: 'Pro Monthly', amount: '$9.99', retryDate: '2025-02-03' }
    },
    {
      name: 'Blog Delisted Payment',
      endpoint: '/api/test-email/blog-delisted-payment',
      params: { firstName, blogCount: 3, amount: '$9.99' }
    }
  ];

  const sendTestEmail = async (template: any) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(template.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          ...template.params
        }),
      });

      const result = await response.json();
      setResults(prev => [...prev, {
        template: template.name,
        success: response.ok,
        result,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        template: template.name,
        success: false,
        result: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
    setLoading(false);
  };

  const sendAllTests = async () => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setLoading(true);
    setResults([]);
    
    for (const template of testEmailTemplates) {
      await sendTestEmail(template);
      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setLoading(false);
  };

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1>Email Template Testing</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Test Email Address:
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your-email@example.com"
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          
          <label style={{ display: 'block', marginBottom: '5px' }}>
            First Name (for personalization):
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '20px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          />
          
          <button
            onClick={sendAllTests}
            disabled={loading || !testEmail}
            style={{
              padding: '12px 24px',
              backgroundColor: '#c42142',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {loading ? 'Sending...' : 'Send All Test Emails'}
          </button>
        </div>

        <h2>Individual Email Tests</h2>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '30px' }}>
          {testEmailTemplates.map((template, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px',
              border: '1px solid #eee',
              borderRadius: '4px'
            }}>
              <span>{template.name}</span>
              <button
                onClick={() => sendTestEmail(template)}
                disabled={loading || !testEmail}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Send Test
              </button>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div>
            <h2>Test Results</h2>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {results.map((result, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    border: `1px solid ${result.success ? '#28a745' : '#dc3545'}`,
                    borderRadius: '4px',
                    backgroundColor: result.success ? '#d4edda' : '#f8d7da'
                  }}
                >
                  <strong>{result.template}</strong> - {result.timestamp}
                  <br />
                  Status: {result.success ? '✅ Success' : '❌ Failed'}
                  <br />
                  <small>
                    {JSON.stringify(result.result, null, 2)}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
