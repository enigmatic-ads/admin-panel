const { FeedUrl } = require("../models");

const addCampaign = async (req, res) => {
    const { campaignId ,feedUrl, source, country, cap, device } = req.body;

    if (!campaignId || !feedUrl || !source || !country || !cap || !device) {
      return res.status(400).json({ error: "All fields are required" });
    }

    try {
        await FeedUrl.create({
            url: feedUrl,
            campaign_id: campaignId,
            source,
            country,
            cap: parseInt(cap, 10),
            available_cap: parseInt(cap, 10),
            device: parseInt(device, 10),
        });
    } catch (error) {
        res.status(500).json({ error: "Database error: " + error.message });
    }
    res.status(201).json({ message: "Campaign added successfully" });
}

const getCampaignById = async (req, res) => {
  const { campaignId } = req.params;

  try {
    const campaign = await FeedUrl.findOne({
      where: { campaign_id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Database error: " + error.message });
  }
};

const updateCampaign = async (req, res) => {
  const { campaignId } = req.params;
  const { source, country, cap, status, device } = req.body;

  let feedUrlData;
  try{
    feedUrlData = await FeedUrl.findOne({
      where: {
        campaign_id: campaignId,
      }
    });
  } catch(error) {
    console.error("Error fetching feed url data:", error);
    res.status(500).json({ error: "Database error: " + error.message });
  }

  //Alter available_cap if cap is changed
  let availableCap = feedUrlData.available_cap;

  if(cap - feedUrlData.cap) {
    availableCap += cap - feedUrlData.cap;
    if (availableCap < 0) {
      availableCap = 0;
    }
  }

  try {
    const [updatedRows] = await FeedUrl.update(
      {
        source,
        country,
        cap: parseInt(cap, 10),
        status,
        device,
        available_cap: availableCap,
      },
      {
        where: { campaign_id: campaignId },
      }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const updatedCampaign = await FeedUrl.findOne({
      where: { campaign_id: campaignId },
    });

    res.json({
      message: "Campaign updated successfully",
      campaign: updatedCampaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Database error: " + error.message });
  }
};

module.exports = {
    addCampaign,
    getCampaignById,
    updateCampaign,
}