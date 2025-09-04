const { RedirectUrl } = require("../models");
const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, { 
  dialect: "postgres",
  timezone: 'UTC',
});

const generateReport =  async (req, res) => {
  const { startDate, endDate, campaignId, urlId } = req.query;

  try {
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const startUtc = new Date(new Date(startDate + 'T00:00:00').getTime() - istOffsetMs).toISOString().replace('T', ' ').replace('Z', '');
    const endUtc = new Date(new Date(endDate + 'T23:59:59').getTime() - istOffsetMs).toISOString().replace('T', ' ').replace('Z', '');

    let finalCampaignId = campaignId;

    // If urlId is provided, resolve its campaignId
    if (urlId) {
      const urlRecord = await RedirectUrl.findOne({
        where: { id: urlId },
        attributes: ["campaign_id"],
      });

      if (!urlRecord) {
        return res.status(404).json({ error: "Invalid urlId" });
      }

      finalCampaignId = urlRecord.campaign_id;
    }

    let condition = "";
    if (finalCampaignId) {
      condition = "AND r.campaign_id = :finalCampaignId";
    }

    const rows = await sequelize.query(
      `
      SELECT 
          r.campaign_id,
          cd.url_id,
          r.redirect_url,
          COUNT(*) as "totalHits",
          SUM(CASE WHEN cd.failure = false THEN 1 ELSE 0 END) as "successHits",
          SUM(CASE WHEN cd.failure = true THEN 1 ELSE 0 END) as "failedHits"
      FROM client_details cd
      JOIN redirect_urls r ON cd.url_id = r.id
      WHERE cd.created_at BETWEEN :startUtc AND :endUtc AND r.campaign_id IS NOT NULL
      ${condition}
      GROUP BY r.campaign_id, cd.url_id, r.redirect_url
      ORDER BY r.campaign_id, cd.url_id;
      `,
      {
        replacements: { startUtc, endUtc, finalCampaignId },
        type: QueryTypes.SELECT,
      }
    );

    // Group rows into campaigns
    const campaignsMap = {};
    rows.forEach(row => {
      if (!campaignsMap[row.campaign_id]) {
        campaignsMap[row.campaign_id] = {
          campaign_id: row.campaign_id,
          totalHits: 0,
          successHits: 0,
          failedHits: 0,
          keywordHits: []
        };
      }

      campaignsMap[row.campaign_id].totalHits += Number(row.totalHits);
      campaignsMap[row.campaign_id].successHits += Number(row.successHits);
      campaignsMap[row.campaign_id].failedHits += Number(row.failedHits);

      campaignsMap[row.campaign_id].keywordHits.push({
        urlId: row.url_id,
        url: row.redirect_url,
        totalHits: row.totalHits,
        successHits: row.successHits,
        failedHits: row.failedHits,
      });
    });

    const result = Object.values(campaignsMap);

    res.json(result);
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
    generateReport,
};