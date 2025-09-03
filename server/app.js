require('dotenv').config();
const express = require('express');
const { Sequelize, QueryTypes, Op } = require("sequelize");
const cronJobs = require('./cron');
const authRoutes = require('./routes/auth');
const encryptUrlRoutes = require('./routes/encrypt-url');
const cors = require('cors');
const { RedirectUrl, ClientDetail, DayVisit, SelfRedirectingUrl, ErrorLog } = require('./models');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { fail } = require('assert');

const PORT = process.env.PORT || 4000;

const app = express();
const sequelize = new Sequelize(process.env.DATABASE_URL, { 
  dialect: "postgres",
  timezone: 'UTC',
 });

 sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.use(cors({ origin: process.env.REACT_APP_URL, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/headers", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(
    JSON.stringify(
      {
        message: "Request Headers",
        headers: req.headers,
        xForwardedFor: req.headers["x-forwarded-for"] || null,
        remoteAddress: req.socket.remoteAddress.replace(/^::ffff:/, "") || null,
        referer: req.headers.referer || req.headers.referrer || null,
      },
      null,
      2
    )
  );
});

app.use('/api/auth', authRoutes);
app.use('/api', encryptUrlRoutes);

cronJobs();

app.get("/", async (req, res) => {

  const id = req.query.id;
  const campaignId = req.query.campId;

  if (!id) {
    return res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  }

  let selfRedirectingUrls;
  let fallbackUrl;
  try {
    selfRedirectingUrls = await SelfRedirectingUrl.findAll({
      attributes: ["url"],
    });
  } catch (error) {
    console.error("Error fetching self_redirecting_urls:", error);
    try {
      await ErrorLog.create({
        api: "/",
        message: "Error fetching from self_redirecting_urls table",
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
    } catch (logError) {
      console.error("Failed to insert into error_logs table:", logError);
    }
    return res.status(500).send("Internal Server Error");
  }

  if (selfRedirectingUrls.length !== 0) {
    fallbackUrl = selfRedirectingUrls[Math.floor(Math.random() * selfRedirectingUrls.length)].url;
  }

  const userAgent = req.headers["user-agent"] || null;

  if (userAgent && userAgent == 'Mozilla/5.0 (Java) outbrain') {
    return res.redirect(fallbackUrl);
  }

  let url;

  try {
    url = await RedirectUrl.findOne({
      where: { 
        id,
        campaign_id: campaignId,
      }
    });
  } catch (error) {
    console.error("Error fetching from redirect_urls:", error);
    try {
      await ErrorLog.create({
        api: "/",
        message: "Error fetching from redirect_urls table",
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
    } catch (logError) {
      console.error("Failed to insert into error_logs table:", logError);
    }
    return res.redirect(fallbackUrl);
  }
    
    if (!url) {
      return res.redirect(fallbackUrl);
    }

    let urlVisitedRecord;
    let clientIp = req.headers["x-forwarded-for"]?.split(",").pop().trim() || null;
    const referer = req.headers.referer || req.headers.referrer || null;
    const remoteIp = req.socket?.remoteAddress ? req.socket.remoteAddress.replace(/^::ffff:/, "") : null;

    // Build query params excluding "id"
    const queryParams = { ...req.query };
    delete queryParams.id;
    delete queryParams.campId;
    // If there are extra params, append them
    const queryString = new URLSearchParams(queryParams).toString();

    // If referer is null, redirect to a random self-redirecting URL
    if(referer === null && process.env.BLOCK_NULL_REFERER === 'true') {
      clientIp = req.headers["x-forwarded-for"]?.split(",").pop().trim() || null;
      try {
        await ClientDetail.create({
          url_id: id,
          remote_ip: remoteIp,
          client_ip: clientIp,
          user_agent: userAgent,
          referer: referer,
          failure: true,
          failure_reason: "null referer",
          campaign_id: campaignId,
        });
      } catch (error) {

        console.error("Error inserting into client details table:", error);
        try {
          await ErrorLog.create({
            api: "/",
            message: "Error inserting into client details table",
            error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
          });
        } catch (logError) {
          console.error("Failed to insert into error_logs table:", logError);
        }
        return res.redirect(fallbackUrl);

      }

      return res.redirect(fallbackUrl);
    }


    try {
      // Check if the same IP and URL ID already exist in today's records
      urlVisitedRecord = await DayVisit.findOne({
        where: {
          campaign_id: campaignId,
          client_ip: clientIp || remoteIp || null,
        }
      });
    } catch (error) {
      try {
        await ErrorLog.create({
          api: "/",
          message: "Error finding from day_visits table",
          error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
      } catch (logError) {
        console.error("Failed to insert into error_logs table:", logError);
      }

      return res.redirect(fallbackUrl);
    }

      if (urlVisitedRecord) {
        console.log("already visited");
        clientIp = req.headers["x-forwarded-for"]?.split(",").pop().trim() || null;

        try {
          await ClientDetail.create({
            url_id: id,
            remote_ip: remoteIp,
            client_ip: clientIp,
            user_agent: userAgent,
            referer: referer,
            failure: true,
            failure_reason: "already visited today",
            campaign_id: campaignId,
          });
        } catch (error) {
          console.error("Failed to insert into client_details:", error);
          try {
            await ErrorLog.create({
              api: "/",
              message: "Error inserting into client_details table",
              error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
            });
          } catch (logError) {
            console.error("Failed to insert into error_logs table:", logError);
          }

          return res.redirect(fallbackUrl);
        }
      
        return res.redirect(fallbackUrl);
      }

    try {
      await DayVisit.create({
        campaign_id: campaignId,
        client_ip: clientIp || remoteIp,
      });
    } catch (error) {
      try {
        await ErrorLog.create({
          api: "/",
          message: "Error inserting into day_visits table",
          error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
      } catch (logError) {
        console.error("Failed to insert into error_logs table:", logError);
      }

      return res.redirect(fallbackUrl);
    }
    
    clientIp = req.headers["x-forwarded-for"]?.split(",").pop().trim() || null;
    
    let redirectUrl = url.dataValues.redirect_url;

    try {
      await ClientDetail.create({
        url_id: id,
        remote_ip: remoteIp,
        client_ip: clientIp,
        user_agent: userAgent,
        referer: referer,
        campaign_id: campaignId,
        failure: false,
      });
    } catch (error) {
      console.error("Error inserting into client details table:", error);

      try {
        await ErrorLog.create({
          api: "/",
          message: "Error inserting into client details table",
          error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
      } catch (logError) {
        console.error("Failed to insert into error_logs table:", logError);
      }

      return res.redirect(fallbackUrl);
    }

    if (queryString) {
      redirectUrl += (redirectUrl.includes("?") ? "&" : "?") + queryString;
    }

    console.log(`Redirecting to: ${redirectUrl}`);
    return res.redirect(redirectUrl);
});

app.get("/api/download-all-encrypted-urls", async (req, res) => {
  try {
      const records = await RedirectUrl.findAll({ attributes: ["campaign_id", "id", "redirect_url", "created_at"] });

      if (!records.length) {
          return res.status(404).send("No records found.");
      }

      let data = [["Campaign ID", "URL ID", "Original URL", "Encrypted URL", "Created Date"]];

      records.forEach(record => {
          const date = new Date(record.created_at);
          data.push([record.campaign_id, record.id, record.redirect_url, `${process.env.BASE_URL}/?id=${record.id}&campId=${record.campaign_id}`, date]);
      });

      const worksheet = xlsx.utils.aoa_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "EncryptedURLs");

      const filePath = path.join(__dirname, "public", "redirect_urls.xlsx");
      xlsx.writeFile(workbook, filePath);

      res.download(filePath, "redirect_urls.xlsx", (err) => {
          if (err) console.error(err);
          fs.unlinkSync(filePath);
      });

  } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send("Error generating file.");
  }
});

app.get("/api/report", async (req, res) => {
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
      WHERE cd.created_at BETWEEN :startDate AND :endDate AND r.campaign_id IS NOT NULL
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
});

app.get("/headers", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "headers.html"));
});

// Serve react build folder
app.use(express.static(path.join(__dirname, "../client/build")));

app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});