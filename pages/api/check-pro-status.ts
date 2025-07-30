// Check user's pro status with Stripe verification
    const { isPremium, error: premiumError, tier, subscriptionStatus, subscriptionEndDate } = await supabaseDB.isUserPremium(user.id);

    if (premiumError) {
      return res.status(500).json({
        isPremium: false,
        error: 'Failed to check pro status'
      });
    }

    // Also sync the user's tier with their actual Stripe status
    await supabaseDB.verifyAndSyncUserTier(user.id);

    return res.status(200).json({
      isPremium,
      tier,
      subscriptionStatus,
      subscriptionEndDate
    });