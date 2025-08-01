
import { supabaseDB } from './supabase';

export interface SurveyAnalyticsData {
  totalResponses: number;
  experienceBreakdown: Record<string, number>;
  audienceSizeBreakdown: Record<string, number>;
  contentFrequencyBreakdown: Record<string, number>;
  communityInterestBreakdown: Record<string, number>;
  topChallenges: Array<{ challenge: string; count: number }>;
  popularPlatforms: Array<{ platform: string; count: number }>;
  monetizationMethods: Array<{ method: string; count: number }>;
  discoveryMethods: Array<{ method: string; count: number }>;
}

export const generateSurveyAnalytics = async (): Promise<SurveyAnalyticsData | null> => {
  try {
    const { data: surveyResponses, error } = await supabaseDB.getSurveyAnalytics();
    
    if (error || !surveyResponses) {
      console.error('Error fetching survey data:', error);
      return null;
    }

    const analytics: SurveyAnalyticsData = {
      totalResponses: surveyResponses.length,
      experienceBreakdown: {},
      audienceSizeBreakdown: {},
      contentFrequencyBreakdown: {},
      communityInterestBreakdown: {},
      topChallenges: [],
      popularPlatforms: [],
      monetizationMethods: [],
      discoveryMethods: []
    };

    // Count breakdowns
    surveyResponses.forEach(response => {
      // Experience breakdown
      analytics.experienceBreakdown[response.blogger_experience] = 
        (analytics.experienceBreakdown[response.blogger_experience] || 0) + 1;

      // Audience size breakdown
      analytics.audienceSizeBreakdown[response.audience_size] = 
        (analytics.audienceSizeBreakdown[response.audience_size] || 0) + 1;

      // Content frequency breakdown
      analytics.contentFrequencyBreakdown[response.content_frequency] = 
        (analytics.contentFrequencyBreakdown[response.content_frequency] || 0) + 1;

      // Community interest breakdown
      analytics.communityInterestBreakdown[response.community_interest] = 
        (analytics.communityInterestBreakdown[response.community_interest] || 0) + 1;
    });

    // Count array fields (platforms, monetization, discovery methods)
    const platformCounts: Record<string, number> = {};
    const monetizationCounts: Record<string, number> = {};
    const discoveryCounts: Record<string, number> = {};

    surveyResponses.forEach(response => {
      // Count platforms
      response.platforms_used?.forEach((platform: string) => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });

      // Count monetization methods
      response.current_monetization_methods?.forEach((method: string) => {
        monetizationCounts[method] = (monetizationCounts[method] || 0) + 1;
      });

      // Count discovery methods
      response.discovery_methods?.forEach((method: string) => {
        discoveryCounts[method] = (discoveryCounts[method] || 0) + 1;
      });
    });

    // Convert to sorted arrays
    analytics.popularPlatforms = Object.entries(platformCounts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);

    analytics.monetizationMethods = Object.entries(monetizationCounts)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    analytics.discoveryMethods = Object.entries(discoveryCounts)
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    return analytics;
  } catch (error) {
    console.error('Error generating survey analytics:', error);
    return null;
  }
};

export const exportSurveyDataCSV = async (): Promise<string | null> => {
  try {
    const { data: surveyResponses, error } = await supabaseDB.getAllSurveyFeedback();
    
    if (error || !surveyResponses) {
      console.error('Error fetching survey data:', error);
      return null;
    }

    // Create CSV header
    const headers = [
      'Submitted At',
      'Blogger Name',
      'Experience Level',
      'Primary Goal',
      'Audience Size',
      'Content Frequency',
      'Discovery Methods',
      'Challenges',
      'Platforms Used',
      'Monetization Methods',
      'Community Interest',
      'Additional Features',
      'Feedback'
    ];

    // Create CSV rows
    const rows = surveyResponses.map(response => [
      response.submitted_at,
      `${response.user_profiles?.first_name || ''} ${response.user_profiles?.surname || ''}`.trim(),
      response.blogger_experience,
      response.primary_goal,
      response.audience_size,
      response.content_frequency,
      response.discovery_methods?.join('; ') || '',
      response.challenges_faced,
      response.platforms_used?.join('; ') || '',
      response.current_monetization_methods?.join('; ') || '',
      response.community_interest,
      response.additional_features || '',
      response.feedback || ''
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field?.toString().replace(/"/g, '""') || ''}"`).join(','))
      .join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error exporting survey data:', error);
    return null;
  }
};
