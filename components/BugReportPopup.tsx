
import React, { useState } from 'react';
import styles from '../styles/AuthForm.module.css';

interface BugReportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BugReportData {
  title: string;
  description: string;
  userEmail: string;
  page: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'functionality' | 'performance' | 'security' | 'other';
}

const BugReportPopup: React.FC<BugReportPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<BugReportData>({
    title: '',
    description: '',
    userEmail: '',
    page: typeof window !== 'undefined' ? window.location.pathname : '',
    severity: 'medium',
    category: 'functionality'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/submit-bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitMessage('Bug report submitted successfully! Thank you for helping us improve BlogRolly.');
        setFormData({
          title: '',
          description: '',
          userEmail: '',
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          severity: 'medium',
          category: 'functionality'
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitMessage('Failed to submit bug report. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent} style={{ maxWidth: '600px', maxHeight: '90vh' }}>
        <div className={styles.popupHeader}>
          <h3>Report a Bug</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} style={{ padding: '2rem' }}>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Help us improve BlogRolly by reporting bugs you encounter. We appreciate your feedback!
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>Bug Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Your Email (optional)</label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="So we can follow up if needed"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Page/Location</label>
            <input
              type="text"
              name="page"
              value={formData.page}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Where did this happen?"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                className={styles.input}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={styles.input}
              >
                <option value="ui">UI/Design</option>
                <option value="functionality">Functionality</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Please describe what happened, what you expected to happen, and steps to reproduce the issue..."
              rows={5}
              required
            />
          </div>

          {submitMessage && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              backgroundColor: submitMessage.includes('successfully') ? '#d1fae5' : '#fee2e2',
              color: submitMessage.includes('successfully') ? '#065f46' : '#991b1b',
              fontSize: '0.875rem'
            }}>
              {submitMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className={styles.linkButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Bug Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugReportPopup;
