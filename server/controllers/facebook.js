const bizSdk = require('facebook-nodejs-business-sdk');
const AdAccount = bizSdk.AdAccount;

const access_token = 'EAAYE68HAov8BPTDgiU5Eif3sWPc1OKX2AC8BQdyKDANTddNrIeEZBEwZCvsrVgUpfZCYV3Q5pS3bBEM7BhQ9oAYLVZBFSz5cXFjJQSD8nlGiRU97tmoZBc5QwiZB7PoJlZBRWj7irvGZAvZBfcZB86t8ZBbFZBhYudhZB3ZCkVbmE8dFr9nzAAd0cYxFCZAd9bK8lQJro3S1Mj9XooK';
const ad_account_id = 'act_195455750129212';

const api = bizSdk.FacebookAdsApi.init(access_token);
api.setDebug(false);

const getInsights = async (req, res) => {
    try {
    const { timeRange, level, since, until } = req.query;
    // levels: ad, adset, campaign, 
    
    console.log('Fetching insights with timeRange:', timeRange, 'level:', level, 'since:', since, 'until:', until);

    const fields = [
      'campaign_name',
      'adset_name',
      'ad_name',
      'impressions',
      'clicks',
      'spend',
      'ctr',
      'cpc',
      'cpm',
      'reach',
      'actions',
    ];

    let params = {
      level,
    };

    if (since && until) {
      params.time_range = { since, until };
    } else if (timeRange) {
      params.date_preset = timeRange;
    }

    const insights = await (new AdAccount(ad_account_id)).getInsights(fields, params);

    const finalInsights = insights.map(insight => insight._data);

    res.json({ success:true, insights: finalInsights });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || error });
  }
}

module.exports = {
    getInsights,
}

