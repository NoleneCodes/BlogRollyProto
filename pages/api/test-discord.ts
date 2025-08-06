
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!discordWebhookUrl) {
    return res.status(500).json({ 
      success: false, 
      error: 'Discord webhook URL not configured' 
    });
  }

  try {
    const testMessage = {
      embeds: [
        {
          title: "🔔 BlogRolly Test Alert",
          description: "This is a test notification to verify Discord integration is working correctly.",
          color: 0x00ff00, // Green color
          fields: [
            {
              name: "Test Type",
              value: "Discord Webhook Integration",
              inline: true
            },
            {
              name: "Timestamp",
              value: new Date().toLocaleString(),
              inline: true
            },
            {
              name: "Status",
              value: "✅ Successfully connected",
              inline: true
            }
          ],
          footer: {
            text: "BlogRolly Admin System",
            icon_url: "https://blogrolly.com/favicon.ico"
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook error:', errorText);
      return res.status(500).json({ 
        success: false, 
        error: `Discord API error: ${response.status} - ${errorText}` 
      });
    }

    console.log('✅ Test Discord alert sent successfully');
    return res.status(200).json({ 
      success: true, 
      message: 'Test Discord alert sent successfully' 
    });

  } catch (error) {
    console.error('Discord webhook test error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
