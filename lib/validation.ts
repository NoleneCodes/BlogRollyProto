
import DOMPurify from 'isomorphic-dompurify';

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

// Text sanitization
export const sanitizeText = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// HTML sanitization for rich content
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href']
  });
};

// SQL injection prevention for search queries
export const sanitizeSearchQuery = (query: string): string => {
  return query.replace(/['"\\;]/g, '').trim().slice(0, 100);
};

// File upload validation
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }

  return { isValid: true };
};

// Blog URL validation
export const validateBlogUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!isValidUrl(url)) {
    return { isValid: false, error: 'Please enter a valid URL' };
  }

  const parsedUrl = new URL(url);
  
  // Block local/private networks
  const hostname = parsedUrl.hostname;
  if (hostname === 'localhost' || 
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')) {
    return { isValid: false, error: 'Local and private network URLs are not allowed' };
  }

  return { isValid: true };
};
