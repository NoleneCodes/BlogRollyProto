
export interface BugReport {
  id: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  browser: string;
  operatingSystem: string;
  additionalInfo: string;
  images: string[]; // Base64 encoded images
  priority: 'high' | 'medium' | 'low';
  reporter: string;
  status: 'open' | 'in-progress' | 'resolved';
  date: string;
  dateSort: Date;
  submittedAt: string;
}

// In-memory storage (in a real app, this would be a database)
let bugReports: BugReport[] = [
  {
    id: '#BUG-001',
    title: 'Login button not responding on mobile',
    description: 'The login button becomes unresponsive on mobile devices, preventing users from accessing their accounts.',
    stepsToReproduce: '1. Open app on mobile\n2. Navigate to login page\n3. Tap login button\n4. Nothing happens',
    expectedBehavior: 'Login form should appear or user should be logged in',
    actualBehavior: 'Button does not respond to touch',
    browser: 'chrome',
    operatingSystem: 'android',
    additionalInfo: 'Happens consistently on Android devices',
    images: [],
    priority: 'high',
    reporter: 'user@example.com',
    status: 'open',
    date: '2025-01-24',
    dateSort: new Date('2025-01-24'),
    submittedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '#BUG-002',
    title: 'Search results not displaying correctly',
    description: 'Search results appear truncated and some blog posts are missing from the results.',
    stepsToReproduce: '1. Go to search page\n2. Enter search term\n3. View results',
    expectedBehavior: 'All matching results should be displayed properly',
    actualBehavior: 'Results are cut off and some posts are missing',
    browser: 'firefox',
    operatingSystem: 'windows',
    additionalInfo: 'Issue seems to occur with longer search terms',
    images: [],
    priority: 'medium',
    reporter: 'blogger@test.com',
    status: 'in-progress',
    date: '2025-01-23',
    dateSort: new Date('2025-01-23'),
    submittedAt: '2025-01-23T14:30:00Z'
  },
  {
    id: '#BUG-003',
    title: 'Profile image upload fails on Chrome',
    description: 'Users cannot upload profile images when using Chrome browser.',
    stepsToReproduce: '1. Go to profile settings\n2. Click upload image\n3. Select image file\n4. Click save',
    expectedBehavior: 'Image should upload successfully',
    actualBehavior: 'Upload fails with no error message',
    browser: 'chrome',
    operatingSystem: 'macos',
    additionalInfo: 'Works fine on other browsers',
    images: [],
    priority: 'medium',
    reporter: 'tester@blogrolly.com',
    status: 'open',
    date: '2025-01-22',
    dateSort: new Date('2025-01-22'),
    submittedAt: '2025-01-22T09:15:00Z'
  }
];

export const getAllBugReports = (): BugReport[] => {
  return [...bugReports];
};

export const getBugReportById = (id: string): BugReport | undefined => {
  return bugReports.find(report => report.id === id);
};

export const addBugReport = (reportData: Omit<BugReport, 'id' | 'priority' | 'status' | 'date' | 'dateSort' | 'submittedAt'>): BugReport => {
  const now = new Date();
  const id = `#BUG-${String(bugReports.length + 1).padStart(3, '0')}`;
  
  // Determine priority based on title/description keywords
  const priorityKeywords = {
    high: ['crash', 'error', 'broken', 'not working', 'fails', 'login', 'payment'],
    medium: ['display', 'layout', 'search', 'upload', 'slow'],
    low: ['typo', 'suggestion', 'improvement', 'minor']
  };
  
  let priority: 'high' | 'medium' | 'low' = 'medium';
  const text = (reportData.title + ' ' + reportData.description).toLowerCase();
  
  if (priorityKeywords.high.some(keyword => text.includes(keyword))) {
    priority = 'high';
  } else if (priorityKeywords.low.some(keyword => text.includes(keyword))) {
    priority = 'low';
  }
  
  const newReport: BugReport = {
    ...reportData,
    id,
    priority,
    status: 'open',
    date: now.toISOString().split('T')[0],
    dateSort: now,
    submittedAt: now.toISOString()
  };
  
  bugReports.unshift(newReport); // Add to beginning of array
  return newReport;
};

export const updateBugReportStatus = (id: string, status: 'open' | 'in-progress' | 'resolved'): boolean => {
  const reportIndex = bugReports.findIndex(report => report.id === id);
  if (reportIndex !== -1) {
    bugReports[reportIndex].status = status;
    return true;
  }
  return false;
};
