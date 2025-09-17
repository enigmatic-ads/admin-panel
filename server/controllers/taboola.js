const axios = require("axios");
const qs = require("qs");

let taboolaToken;
let taboolaTokenExpiry;

async function getTaboolaToken() {
  if (taboolaToken && Date.now() < taboolaTokenExpiry) {
    return taboolaToken;
  }

  const response = await axios.post(
    "https://backstage.taboola.com/backstage/oauth/token",
    qs.stringify({
      client_id: process.env.TABOOLA_CLIENT_ID,
      client_secret: process.env.TABOOLA_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  taboolaToken = response.data.access_token;
  taboolaTokenExpiry = Date.now() + response.data.expires_in * 1000;

  return taboolaToken;
}

async function getInsights(req, res) {
    const { level } = req.query;
    console.log('query',req.query)
    console.log(level);

    if (level === 'campaign') {
        return getCampaignSummary(req, res);
    } else if (level === 'ad' || level === 'adset') {
        return getTopCampaignContent(req, res);
    }
}

async function getCampaignSummary(req, res) {
  const { since: startDate, until: endDate } = req.query;

  const token = await getTaboolaToken();

  const url = `https://backstage.taboola.com/backstage/api/1.0/taboolaaccount-shivanienigmaticadscom/reports/campaign-summary/dimensions/campaign_breakdown`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });

    const rows = response.data.results || [];

    const insights = rows.map(row => ({
      campaign_name: row.campaign_name,
      clicks: row.clicks,
      impressions: row.impressions,
      spend: row.spent,
      ctr: row.ctr,
      cpm: row.cpm,
      cpc: row.cpc,
    }));
    res.json({ success: true, insights });
  } catch (error) {
    console.error("Error fetching campaign summary:", error.response?.data || error.message);
    throw new Error("Failed to fetch campaign summary");
  }
}

async function getTopCampaignContent(req, res) {
  const { since: startDate, until: endDate } = req.query;

  const token = await getTaboolaToken();

  const url = `https://backstage.taboola.com/backstage/api/1.0/taboolaaccount-shivanienigmaticadscom/reports/top-campaign-content/dimensions/item_breakdown`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });

    const rows = response.data.results || [];

    const insights = rows.map(row => ({
      ad_name: row.item_name,
      campaign_name: row.campaign_name,
      clicks: row.clicks,
      impressions: row.impressions,
      spend: row.spent,
      ctr: row.ctr,
      cpm: row.cpm,
      cpc: row.cpc,
    }));
    res.json({ success: true, insights });
  } catch (error) {
    console.error("Error fetching campaign summary:", error.response?.data || error.message);
    throw new Error("Failed to fetch campaign summary");
  }
}

module.exports = {
    getInsights,
}