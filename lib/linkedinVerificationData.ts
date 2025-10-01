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

// All mock LinkedIn verification data and functions removed. Use real database and email logic only.
