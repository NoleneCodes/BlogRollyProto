
import React, { useState, useEffect } from 'react';
import { DomainVerificationService } from '../lib/domainVerification';
import styles from '../styles/DomainVerificationModal.module.css';

interface DomainVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogUrl: string;
  verificationToken: string;
  onVerificationComplete: () => void;
}

type VerificationMethod = 'txt_record' | 'html_file' | 'meta_tag';

const DomainVerificationModal: React.FC<DomainVerificationModalProps> = ({
  isOpen,
  onClose,
  blogUrl,
  verificationToken,
  onVerificationComplete
}) => {
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>('txt_record');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    success?: boolean;
    error?: string;
  }>({});

  const domain = DomainVerificationService.extractDomain(blogUrl);
  const instructions = DomainVerificationService.generateVerificationInstructions(domain, verificationToken);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationStatus({});

    try {
      const result = await DomainVerificationService.verifyDomain(domain, verificationToken, selectedMethod);
      
      if (result.success) {
        // Update verification status in database
        const response = await fetch('/api/verify-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: selectedMethod,
            verified: true
          })
        });

        if (response.ok) {
          setVerificationStatus({ success: true });
          setTimeout(() => {
            onVerificationComplete();
            onClose();
          }, 2000);
        } else {
          setVerificationStatus({ error: 'Failed to update verification status' });
        }
      } else {
        setVerificationStatus({ error: result.error || 'Verification failed' });
      }
    } catch (error) {
      setVerificationStatus({ error: 'Verification process failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Verify Your Blog Domain</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.domainInfo}>
            <p><strong>Domain to verify:</strong> {domain}</p>
            <p>You must verify ownership of your blog domain before any of your content can go live on BlogRolly.</p>
          </div>

          <div className={styles.methodSelector}>
            <h3>Choose Verification Method:</h3>
            <div className={styles.methods}>
              <label className={styles.methodOption}>
                <input
                  type="radio"
                  value="txt_record"
                  checked={selectedMethod === 'txt_record'}
                  onChange={(e) => setSelectedMethod(e.target.value as VerificationMethod)}
                />
                <div>
                  <strong>DNS TXT Record</strong>
                  <p>Add a TXT record to your domain's DNS (Recommended)</p>
                </div>
              </label>

              <label className={styles.methodOption}>
                <input
                  type="radio"
                  value="html_file"
                  checked={selectedMethod === 'html_file'}
                  onChange={(e) => setSelectedMethod(e.target.value as VerificationMethod)}
                />
                <div>
                  <strong>HTML File Upload</strong>
                  <p>Upload a verification file to your website</p>
                </div>
              </label>

              <label className={styles.methodOption}>
                <input
                  type="radio"
                  value="meta_tag"
                  checked={selectedMethod === 'meta_tag'}
                  onChange={(e) => setSelectedMethod(e.target.value as VerificationMethod)}
                />
                <div>
                  <strong>HTML Meta Tag</strong>
                  <p>Add a meta tag to your homepage</p>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.instructions}>
            <h3>Verification Instructions:</h3>
            
            {selectedMethod === 'txt_record' && (
              <div className={styles.instructionBlock}>
                <p>{instructions.txtRecord.instructions}</p>
                <div className={styles.codeBlock}>
                  <p><strong>Record Type:</strong> TXT</p>
                  <p><strong>Name:</strong> _blogrolly-verification</p>
                  <p><strong>Value:</strong> {instructions.txtRecord.value}</p>
                </div>
                <p><small>Note: DNS changes can take up to 24 hours to propagate.</small></p>
              </div>
            )}

            {selectedMethod === 'html_file' && (
              <div className={styles.instructionBlock}>
                <p>{instructions.htmlFile.instructions}</p>
                <div className={styles.codeBlock}>
                  <p><strong>Filename:</strong> {instructions.htmlFile.filename}</p>
                  <p><strong>Upload to:</strong> Your website's root directory</p>
                  <p><strong>Accessible at:</strong> {instructions.htmlFile.path}</p>
                </div>
                <details>
                  <summary>File Content</summary>
                  <pre className={styles.fileContent}>{instructions.htmlFile.content}</pre>
                </details>
              </div>
            )}

            {selectedMethod === 'meta_tag' && (
              <div className={styles.instructionBlock}>
                <p>{instructions.metaTag.instructions}</p>
                <div className={styles.codeBlock}>
                  <pre>{instructions.metaTag.tag}</pre>
                </div>
                <p><small>Add this tag within the &lt;head&gt; section of your homepage.</small></p>
              </div>
            )}
          </div>

          {verificationStatus.error && (
            <div className={styles.error}>
              <p>Verification failed: {verificationStatus.error}</p>
              <p><small>Please double-check your setup and try again.</small></p>
            </div>
          )}

          {verificationStatus.success && (
            <div className={styles.success}>
              <p>✅ Domain verification successful!</p>
              <p>Your blog domain has been verified. You can now submit content for approval.</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.cancelButton}>
            Close
          </button>
          <button 
            onClick={handleVerify} 
            disabled={isVerifying || verificationStatus.success}
            className={styles.verifyButton}
          >
            {isVerifying ? 'Verifying...' : 'Verify Domain'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DomainVerificationModal;
