const { RedirectUrl } = require("../models");

const generateEncryptedURL =  async (req, res) => {
  try {
    const { url, keywords, campaignId } = req.body;
    console.log(url, keywords)

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

     let urls = [];

    if (keywords && keywords.trim() !== "") {
      urls = keywords
        .split(",")
        .map(word => word.trim())
        .filter(word => word.length > 0)
        .map(word => url.replace("{keyword}", word.split(/\s+/).join("+")));
    } else {
      urls = [url];
    }

    const createdUrls = await Promise.all(
      urls.map(async (u) => {
        const newRedirectDetails = await RedirectUrl.create({ 
          redirect_url: u, 
          campaign_id: campaignId || null
        });
        const encryptedUrl = `${process.env.BASE_URL}/?id=${newRedirectDetails.dataValues.id}&campId=${campaignId}`;
        return encryptedUrl;
      })
    );

    res.status(201).json({ encryptedUrls: createdUrls });
  } catch (error) {
    console.error("Error generating redirect URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { generateEncryptedURL };