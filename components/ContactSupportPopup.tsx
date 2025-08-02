
import React, { useState } from 'react';
import styles from '../styles/ReaderProfile.module.css';
import { createSupportRequest } from '../lib/supabase';

interface ContactSupportPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactSupportPopup: React.FC<ContactSupportPopupProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    subject: '',
    priority: '',
    message: '',
    email: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.subject.trim()) {
      alert('Please provide a subject for your inquiry');
      return;
    }
    
    if (!formData.message.trim()) {
      alert('Please describe your issue or question');
      return;
    }

    try {
      // Save support request to database
      const result = await createSupportRequest({
        subject: formData.subject.trim(),
        priority: (formData.priority as 'low' | 'medium' | 'high' | 'critical') || 'low',
        message: formData.message.trim(),
        email: formData.email.trim() || undefined,
        userEmail: 'user@example.com' // This should come from authenticated user
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('Support request submitted:', result.data);
      alert('Your support request has been submitted! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setFormData({
        subject: '',
        priority: '',
        message: '',
        email: ''
      });
      onClose();
    } catch (error) {
      console.error('Error submitting support request:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <div className={styles.popupHeader}>
          <h3>Contact Support</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.popupBody}>
          <p className={styles.popupDescription}>
            Need help? Our support team is here to assist you. Please provide as much detail as possible about your issue or question.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Brief description of your issue"
                required
                maxLength={100}
              />
              <small className={styles.hint}>{formData.subject.length}/100 characters</small>
            </div>

            <div className={styles.formGroup}>
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={styles.input}
              >
                <option value="">Select priority level</option>
                <option value="low">Low - General question</option>
                <option value="medium">Medium - Issue affecting usage</option>
                <option value="high">High - Urgent issue</option>
                <option value="critical">Critical - Cannot access account</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Describe Your Issue *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className={styles.textarea}
                rows={6}
                placeholder="Please provide detailed information about your issue, including any error messages you've encountered and steps you've already tried..."
                required
                maxLength={1500}
              />
              <small className={styles.hint}>{formData.message.length}/1500 characters</small>
            </div>

            <div className={styles.formGroup}>
              <label>Contact Email (Optional)</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="your@email.com"
              />
              <small className={styles.hint}>
                Provide an email if different from your account email or for follow-up contact
              </small>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.9rem' }}>Before submitting:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#64748b', fontSize: '0.85rem' }}>
                <li>Check our FAQ section for common solutions</li>
                <li>Try refreshing your browser or clearing cache</li>
                <li>Include specific error messages if any</li>
              </ul>
            </div>

            <div className={styles.popupActions}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className={styles.saveButton}>
                Submit Support Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportPopup;
