import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface ActivitySession {
  userId?: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  entryPage: string;
  pageViews?: number;
  sessionDuration?: number;
}

class UserActivityTracker {
  private sessionId: string;
  private sessionStartTime: number;
  private pageViewCount: number = 0;
  private currentUserId?: string;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeTracking();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return uuidv4();
    let sessionId = sessionStorage.getItem('blogrolly_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('blogrolly_session_id', sessionId);
    }
    return sessionId;
  }

  private initializeTracking() {
    if (typeof window === 'undefined') return;
    this.trackPageView();
    window.addEventListener('beforeunload', () => {
      this.updateSessionDuration();
    });
    setInterval(() => {
      this.updateSessionDuration();
    }, 30000);
  }

  async trackPageView(userId?: string) {
    if (typeof window === 'undefined') return;
    this.pageViewCount++;
    this.currentUserId = userId;
    const activityData: ActivitySession = {
      userId: userId,
      sessionId: this.sessionId,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
      entryPage: window.location.pathname,
      pageViews: this.pageViewCount,
      sessionDuration: Math.floor((Date.now() - this.sessionStartTime) / 1000)
    };
    try {
      const { error } = await supabase
        .from('user_activity_sessions')
        .upsert({
          user_id: activityData.userId,
          session_id: activityData.sessionId,
          ip_address: activityData.ipAddress,
          user_agent: activityData.userAgent,
          page_views: activityData.pageViews,
          session_duration_seconds: activityData.sessionDuration,
          referrer: activityData.referrer,
          entry_page: activityData.entryPage,
          exit_page: window.location.pathname,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'session_id'
        });
      if (error) {
        console.error('Failed to track user activity:', error);
      }
    } catch (error) {
      console.error('Activity tracking error:', error);
    }
  }

  private async updateSessionDuration() {
    if (!this.currentUserId && !this.sessionId) return;
    const duration = Math.floor((Date.now() - this.sessionStartTime) / 1000);
    try {
      const { error } = await supabase
        .from('user_activity_sessions')
        .update({
          session_duration_seconds: duration,
          exit_page: window.location.pathname,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', this.sessionId);
      if (error) {
        console.error('Failed to update session duration:', error);
      }
    } catch (error) {
      console.error('Session duration update error:', error);
    }
  }

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('/api/get-client-ip');
      const data = await response.json();
      return data.ip || null;
    } catch {
      return null;
    }
  }

  async getRepeatVisitorAnalytics(userId?: string) {
    try {
      const query = supabase
        .from('user_activity_summary')
        .select('*');
      if (userId) {
        query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return {
        totalUsers: data?.length || 0,
        repeatVisitors: data?.filter(u => u.total_sessions > 1).length || 0,
        averageSessionsPerUser: data?.reduce((acc, u) => acc + u.total_sessions, 0) / (data?.length || 1) || 0,
        averageVisitFrequency: data?.reduce((acc, u) => acc + u.visit_frequency_score, 0) / (data?.length || 1) || 0,
        userRetentionData: data || []
      };
    } catch (error) {
      console.error('Failed to get repeat visitor analytics:', error);
      return null;
    }
  }
}

export const activityTracker = new UserActivityTracker();

export async function getReturnUserMetrics() {
  try {
    const { data, error } = await supabase
      .rpc('get_return_user_metrics');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get return user metrics:', error);
    return null;
  }
}
