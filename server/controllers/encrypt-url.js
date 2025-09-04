const { RedirectUrl } = require("../models");
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

const generateEncryptedURL = async (req, res) => {
  try {
    const { url, keywords, campaignId, source } = req.body;
    console.log(url, keywords);

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    let urls = [];
    let keywordList = [];

    if (keywords && keywords.trim() !== "") {
      keywordList = keywords
        .split(",")
        .map(word => word.trim())
        .filter(word => word.length > 0);

      urls = keywordList.map(
        word => url.replace("{keyword}", word.split(/\s+/).join("+"))
      );
    } else {
      urls = [url];
    }

    const createdUrls = await Promise.all(
      urls.map(async (u) => {
        const newRedirectDetails = await RedirectUrl.create({ 
          redirect_url: u, 
          campaign_id: campaignId || null,
          source
        });
        const encryptedUrl = `${process.env.BASE_URL}/?id=${newRedirectDetails.dataValues.id}&campId=${campaignId}`;
        return encryptedUrl;
      })
    );

    res.status(201).json({ 
      encryptedUrls: createdUrls,
      keywords: keywordList
    });
  } catch (error) {
    console.error("Error generating redirect URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const downloadEncryptedUrls = async (req, res) => {
  try {
      const { campaignId } = req.query;
      let condition = campaignId ? { campaign_id: campaignId } : {};

      const records = await RedirectUrl.findAll(
        { 
          attributes: ["campaign_id", "id", "redirect_url", "created_at"],
          where: condition,
        }
      );

      if (!records.length) {
          return res.status(404).json({ error: "No records found" });
      }

      let data = [["Campaign ID", "URL ID", "Original URL", "Encrypted URL", "Created Date"]];

      records.forEach(record => {
          const date = new Date(record.created_at);
          data.push([record.campaign_id, record.id, record.redirect_url, `${process.env.BASE_URL}/?id=${record.id}&campId=${record.campaign_id}`, date]);
      });

      const worksheet = xlsx.utils.aoa_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "EncryptedURLs");

      const filePath = path.join(__dirname, "../public", "redirect_urls.xlsx");
      xlsx.writeFile(workbook, filePath);

      res.download(filePath, "redirect_urls.xlsx", (err) => {
          if (err) console.error(err);
          fs.unlinkSync(filePath);
      });

  } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Error generating file.");
  }
};

module.exports = { generateEncryptedURL, downloadEncryptedUrls };