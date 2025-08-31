
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
  emailThread: EmailMessage[];
}

export interface EmailMessage {
  id: string;
  from: 'user' | 'admin';
  sender: string;
  content: string;
  timestamp: Date;
  emailId?: string; // For tracking actual email IDs from the email service
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
    dateSort: new Date('2025-01-24').getTime(),
    emailThread: [
      {
        id: 'msg-001',
        from: 'user',
        sender: 'premium@user.com',
        content: 'I upgraded to premium but still cannot access premium features. The payment went through successfully.',
        timestamp: new Date('2025-01-24T10:00:00Z')
      }
    ]
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
    dateSort: new Date('2025-01-23').getTime(),
    emailThread: [
      {
        id: 'msg-002',
        from: 'user',
        sender: 'newuser@blog.com',
        content: 'I would like to know more about the blog submission process and approval times.',
        timestamp: new Date('2025-01-23T14:30:00Z')
      },
      {
        id: 'msg-003',
        from: 'admin',
        sender: 'support@blogrolly.com',
        content: 'Thank you for your question! Blog submissions typically take 24-48 hours to review. Once approved, your blog will be live immediately. Feel free to ask if you have more questions!',
        timestamp: new Date('2025-01-23T16:45:00Z')
      },
      {
        id: 'msg-004',
        from: 'user',
        sender: 'newuser@blog.com',
        content: 'Perfect, thank you for the quick response! This answers my question completely.',
        timestamp: new Date('2025-01-23T17:15:00Z')
      }
    ]
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
    dateSort: Date.now(),
    emailThread: [
      {
        id: `msg-${Date.now()}`,
        from: 'user',
        sender: requestData.email || 'Anonymous User',
        content: requestData.message,
        timestamp: new Date()
      }
    ]
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

export const addEmailToThread = (id: string, emailData: {
  from: 'user' | 'admin';
  sender: string;
  content: string;
  emailId?: string;
}): boolean => {
  const requestIndex = supportRequests.findIndex(request => request.id === id);
  if (requestIndex !== -1) {
    const newMessage: EmailMessage = {
      id: `msg-${Date.now()}`,
      from: emailData.from,
      sender: emailData.sender,
      content: emailData.content,
      timestamp: new Date(),
      emailId: emailData.emailId
    };
    
    supportRequests[requestIndex].emailThread.push(newMessage);
    
    // Update status if admin responded
    if (emailData.from === 'admin') {
      supportRequests[requestIndex].status = 'responded';
    }
    
    return true;
  }
  return false;
};
