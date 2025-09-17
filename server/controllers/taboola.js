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
    const { level, timeRange, since, until } = req.query;

    let startDate = since; 
    let endDate = until;
    if (timeRange) {
       ({ startDate, endDate } = getStartAndEndDates(timeRange));
    }

    let insights;
    if (level === 'campaign' || level === 'account') {
        insights = await getCampaignSummary(level, startDate, endDate);
    } else if (level === 'ad') {
        insights = await getTopCampaignContent(startDate, endDate);
    }

    return res.json({ success: true, insights });
}

async function getCampaignSummary(level, startDate, endDate) {
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

    if(level === 'account') {
      const accountInsights = insights.reduce(
        (acc, cur) => {
          acc.clicks += cur.clicks;
          acc.impressions += cur.impressions;
          acc.spend += cur.spend;
          return acc;
        },
        { impressions: 0, clicks: 0, spend: 0 }
      );

      accountInsights.ctr =
        accountInsights.impressions > 0
          ? (accountInsights.clicks / accountInsights.impressions) * 100
          : 0;

      accountInsights.cpc =
        accountInsights.clicks > 0
          ? accountInsights.spend / accountInsights.clicks
          : 0;

      accountInsights.cpm =
        accountInsights.impressions > 0
          ? (accountInsights.spend / accountInsights.impressions) * 1000
          : 0;

      const accountInsightsArray = [accountInsights];

      return accountInsightsArray;
    }
    return(insights);
  } catch (error) {
    console.error("Error fetching campaign summary:", error.response?.data || error.message);
    throw new Error("Failed to fetch campaign summary");
  }
}

async function getTopCampaignContent(startDate, endDate) {
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
    return(insights);
  } catch (error) {
    console.error("Error fetching campaign summary:", error.response?.data || error.message);
    throw new Error("Failed to fetch campaign summary");
  }
}

function getStartAndEndDates(timeRange) {
  const today = new Date();
  let startDate, endDate;

  switch (timeRange) {
    case "today":
      startDate = new Date(today);
      endDate = new Date(today);
      break;

    case "yesterday":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 1);
      endDate = new Date(startDate);
      break;

    case "last_7d":
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      break;

    case "last_30d":
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29);
      break;

    case "last_90d":
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 89);
      break;

    case "this_month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today);
      break;

    case "last_month":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;

    case "this_year":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today);
      break;

    default:
      throw new Error("Invalid timeRange");
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

module.exports = {
    getInsights,
}