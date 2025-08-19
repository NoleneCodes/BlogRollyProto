
// Discord webhook notification service
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
}

// Color constants for different alert types
export const DISCORD_COLORS = {
  SUCCESS: 0x00ff00,    // Green
  ERROR: 0xff0000,      // Red
  WARNING: 0xffa500,    // Orange
  INFO: 0x0099ff,       // Blue
  BLOG_SUBMISSION: 0x9b59b6, // Purple
  SECURITY: 0xff6b6b,   // Red-ish
  SYSTEM: 0x6c757d      // Gray
};

// Send a Discord notification
export const sendDiscordNotification = async (message: DiscordMessage): Promise<boolean> => {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('Discord webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook error:', response.status, errorText);
      return false;
    }

    console.log('✅ Discord notification sent successfully');
    return true;
  } catch (error) {
    console.error('Discord notification failed:', error);
    return false;
  }
};

// Predefined notification templates
export const DiscordAlerts = {
  // New blog submission alert
  newBlogSubmission: async (blogTitle: string, authorName: string, blogUrl: string) => {
    const embed: DiscordEmbed = {
      title: "📝 New Blog Submission",
      description: `A new blog has been submitted for review`,
      color: DISCORD_COLORS.BLOG_SUBMISSION,
      fields: [
        { name: "Blog Title", value: blogTitle, inline: false },
        { name: "Author", value: authorName, inline: true },
        { name: "Blog URL", value: blogUrl, inline: true },
        { name: "Status", value: "⏳ Pending Review", inline: true }
      ],
      footer: { text: "BlogRolly Admin System" },
      timestamp: new Date().toISOString()
    };

    return await sendDiscordNotification({ embeds: [embed] });
  },

  // System error alert
  systemError: async (error: string, context: string) => {
    const embed: DiscordEmbed = {
      title: "🚨 System Error Alert",
      description: `An error occurred in the BlogRolly system`,
      color: DISCORD_COLORS.ERROR,
      fields: [
        { name: "Error", value: error, inline: false },
        { name: "Context", value: context, inline: true },
        { name: "Timestamp", value: new Date().toLocaleString(), inline: true }
      ],
      footer: { text: "BlogRolly Error Monitor" },
      timestamp: new Date().toISOString()
    };

    return await sendDiscordNotification({ embeds: [embed] });
  },

  // Security alert
  securityAlert: async (alertType: string, details: string, ipAddress?: string) => {
    const embed: DiscordEmbed = {
      title: "🔒 Security Alert",
      description: `Security event detected`,
      color: DISCORD_COLORS.SECURITY,
      fields: [
        { name: "Alert Type", value: alertType, inline: true },
        { name: "Details", value: details, inline: false },
        ...(ipAddress ? [{ name: "IP Address", value: ipAddress, inline: true }] : []),
        { name: "Time", value: new Date().toLocaleString(), inline: true }
      ],
      footer: { text: "BlogRolly Security Monitor" },
      timestamp: new Date().toISOString()
    };

    return await sendDiscordNotification({ embeds: [embed] });
  },

  // Payment notification
  paymentAlert: async (type: 'success' | 'failed', userEmail: string, amount: string, plan: string) => {
    const embed: DiscordEmbed = {
      title: type === 'success' ? "💳 Payment Successful" : "❌ Payment Failed",
      description: `Payment ${type} notification`,
      color: type === 'success' ? DISCORD_COLORS.SUCCESS : DISCORD_COLORS.ERROR,
      fields: [
        { name: "User", value: userEmail, inline: true },
        { name: "Plan", value: plan, inline: true },
        { name: "Amount", value: amount, inline: true },
        { name: "Status", value: type === 'success' ? "✅ Completed" : "❌ Failed", inline: true }
      ],
      footer: { text: "BlogRolly Payment System" },
      timestamp: new Date().toISOString()
    };

    return await sendDiscordNotification({ embeds: [embed] });
  },

  // Bug report alert
  bugReport: async (reportId: string, userEmail: string, description: string) => {
    const embed: DiscordEmbed = {
      title: "🐛 New Bug Report",
      description: `Bug report submitted by user`,
      color: DISCORD_COLORS.WARNING,
      fields: [
        { name: "Report ID", value: reportId, inline: true },
        { name: "Reporter", value: userEmail, inline: true },
        { name: "Description", value: description.length > 100 ? description.substring(0, 100) + "..." : description, inline: false }
      ],
      footer: { text: "BlogRolly Bug Tracker" },
      timestamp: new Date().toISOString()
    };

    return await sendDiscordNotification({ embeds: [embed] });
  },

  // Daily summary
  dailySummary: async (stats: {
    newSubmissions: number;
    approvedBlogs: number;
    newSignups: number;
    totalRevenue: string;
  }) => {
    const embed: DiscordEmbed = {
      title: "📊 Daily Summary",
      description: `BlogRolly daily statistics for ${new Date().toLocaleDateString()}`,
      color: DISCORD_COLORS.INFO,
      fields: [
        { name: "New Submissions", value: stats.newSubmissions.toString(), inline: true },
        { name: "Blogs Approved", value: stats.approvedBlogs.toString(), inline: true },
        { name: "New Signups", value: stats.newSignups.toString(), inline: true },
        { name: "Revenue", value: stats.totalRevenue, inline: true }
      ],
      footer: { text: "BlogRolly Analytics" },
      timestamp: new Date().toISOString()
    };

    return await sendDiscordNotification({ embeds: [embed] });
  }
};

// Test function
export const testDiscordWebhook = async () => {
  const embed: DiscordEmbed = {
    title: "🔔 Discord Integration Test",
    description: "This is a test message to verify Discord webhook integration",
    color: DISCORD_COLORS.SUCCESS,
    fields: [
      { name: "Status", value: "✅ Connected", inline: true },
      { name: "Test Time", value: new Date().toLocaleString(), inline: true }
    ],
    footer: { text: "BlogRolly Admin System" },
    timestamp: new Date().toISOString()
  };

  return await sendDiscordNotification({ embeds: [embed] });
};
