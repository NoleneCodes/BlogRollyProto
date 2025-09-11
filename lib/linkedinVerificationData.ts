// LinkedIn Verification Data Module
// Provides mock data and functions for LinkedIn verifications

import { emailTemplates } from './email-templates/index';
import { resend, RESEND_CONFIG } from './resend-client';

export type LinkedInVerification = {
  id: string;
  bloggerName: string;
  linkedinUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  dateSort: number;
};

// Mock data
let verifications: LinkedInVerification[] = [
  {
    id: 'LNK-001',
    bloggerName: 'Jane Doe',
    linkedinUrl: 'https://linkedin.com/in/janedoe',
    status: 'pending',
    date: '2025-09-01',
    dateSort: 20250901
  },
  {
    id: 'LNK-002',
    bloggerName: 'John Smith',
    linkedinUrl: 'https://linkedin.com/in/johnsmith',
    status: 'pending', // changed from 'approved'
    date: '2025-08-28',
    dateSort: 20250828
  },
  {
    id: 'LNK-003',
    bloggerName: 'Emily Chen',
    linkedinUrl: 'https://linkedin.com/in/emilychen',
    status: 'pending', // changed from 'rejected'
    date: '2025-08-15',
    dateSort: 20250815
  }
];

export function getAllLinkedInVerifications(): LinkedInVerification[] {
  return [...verifications];
}

export function updateLinkedInVerificationStatus(
  verificationId: string,
  newStatus: 'pending' | 'approved' | 'rejected'
): boolean {
  const idx = verifications.findIndex(v => v.id === verificationId);
  if (idx === -1) return false;
  verifications[idx].status = newStatus;
  return true;
}

// Mock email sending functions
export function sendLinkedInApprovalEmail(verificationId: string) {
  const verification = verifications.find(v => v.id === verificationId);
  if (!verification) return false;
  // Simulate sending approval email
  console.log(`Email sent to ${verification.bloggerName} for LinkedIn approval: ${verification.linkedinUrl}`);
  return true;
}

export function sendLinkedInRejectionEmail(verificationId: string, reason: string) {
  const verification = verifications.find(v => v.id === verificationId);
  if (!verification) return false;
  // Simulate sending rejection email with reason
  console.log(`Email sent to ${verification.bloggerName} for LinkedIn rejection: ${verification.linkedinUrl}. Reason: ${reason}`);
  return true;
}

export function sendLinkedInVerificationResultEmail(
  email: string,
  investorName: string,
  approved: boolean,
  rejectionReason?: string
) {
  const template = emailTemplates.linkedinVerificationResult(investorName, approved, rejectionReason);
  return resend.emails.send({
    from: RESEND_CONFIG.fromEmail,
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}
