
export interface SupportRequest {
  id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  email?: string;
  user: string;
  status: 'open' | 'responded' | 'closed';
  created: string;
  submittedAt: Date;
  dateSort: number;
}

// In-memory storage for development (replace with database in production)
let supportRequests: SupportRequest[] = [
  {
    id: 'SUP-001',
    subject: 'Cannot access premium features',
    priority: 'high',
    message: 'I upgraded to premium but still cannot access premium features. The payment went through successfully.',
    email: 'premium@user.com',
    user: 'premium@user.com',
    status: 'open',
    created: '2025-01-24',
    submittedAt: new Date('2025-01-24'),
    dateSort: new Date('2025-01-24').getTime()
  },
  {
    id: 'SUP-002',
    subject: 'Question about blog submission',
    priority: 'low',
    message: 'I would like to know more about the blog submission process and approval times.',
    email: 'newuser@blog.com',
    user: 'newuser@blog.com',
    status: 'responded',
    created: '2025-01-23',
    submittedAt: new Date('2025-01-23'),
    dateSort: new Date('2025-01-23').getTime()
  }
];

export const getAllSupportRequests = (): SupportRequest[] => {
  return [...supportRequests];
};

export const getSupportRequestById = (id: string): SupportRequest | null => {
  return supportRequests.find(request => request.id === id) || null;
};

export const createSupportRequest = (requestData: {
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  email?: string;
}): SupportRequest => {
  const newRequest: SupportRequest = {
    id: `SUP-${String(supportRequests.length + 1).padStart(3, '0')}`,
    subject: requestData.subject,
    priority: requestData.priority,
    message: requestData.message,
    email: requestData.email,
    user: requestData.email || 'Anonymous User',
    status: 'open',
    created: new Date().toISOString().split('T')[0],
    submittedAt: new Date(),
    dateSort: Date.now()
  };

  supportRequests.push(newRequest);
  return newRequest;
};

export const updateSupportRequestStatus = (id: string, status: 'open' | 'responded' | 'closed'): boolean => {
  const requestIndex = supportRequests.findIndex(request => request.id === id);
  if (requestIndex !== -1) {
    supportRequests[requestIndex].status = status;
    return true;
  }
  return false;
};
