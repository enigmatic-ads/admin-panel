require('dotenv').config();
const express = require('express');
const { Sequelize, QueryTypes, Op } = require("sequelize");
const cronJobs = require('./cron');
const authRoutes = require('./routes/auth');
const encryptUrlRoutes = require('./routes/encrypt-url');
const reportRoutes = require('./routes/report');
const facebookRoutes = require('./routes/facebook');
const campaignRoutes = require('./routes/campaign');
const cors = require('cors');
const { RedirectUrl, ClientDetail, DayVisit, SelfRedirectingUrl, ErrorLog, FeedUrl } = require('./models');
const path = require('path');

const PORT = process.env.PORT || 4000;

const app = express();

const sequelize = new Sequelize(process.env.DATABASE_URL, { 
  dialect: "postgres",
  timezone: 'UTC',
});

sequelize.authenticate()
  .then(() => {
    console.log(`✅ Database connection established successfully`);
  })
  .catch(err => {
    console.error(`❌ Unable to connect to the database`, err);
  });

app.use(cors());
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
app.use('/api/report', reportRoutes);
app.use('/api/encrypt-url', encryptUrlRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api', campaignRoutes);

cronJobs();

app.get("/", async (req, res) => {

  const { id, campId: campaignId, keyword, source } = req.query;

  if (!id && !campaignId && !keyword && !source) {
    return res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  }

  if(keyword && source) {
    return handleKeywordSourceRedirect(req, res);
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
      // Check if the same IP and Campaign ID already exist in today's records
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

async function handleKeywordSourceRedirect(req, res) {
  const { keyword, source } = req.query;
  console.log(`Handling keyword-source redirect for keyword: ${keyword}, source: ${source}`);

  // Fetch a random self-redirecting URL for fallback
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

  let clientIp = req.headers["x-forwarded-for"]?.split(",").pop().trim() || null;
  const referer = req.headers.referer || req.headers.referrer || null;
  const remoteIp = req.socket?.remoteAddress ? req.socket.remoteAddress.replace(/^::ffff:/, "") : null;
  const userAgent = req.headers["user-agent"] || null;

  //If IP and feed_url_id exist in day_visits table, redirect to fallback URL
  let visitedUrlIds = [];
  try {
    const visits = await DayVisit.findAll({
      where: {
        client_ip: clientIp || remoteIp || null,
      },
      attributes: ["feed_url_id"],
    });

    visitedUrlIds = visits.map(v => v.feed_url_id);
  } catch (error) {
    try {
      await ErrorLog.create({
        api: "/",
        message: "Error fetching from day_visits table",
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
    } catch (logError) {
      console.error("Failed to insert into error_logs table:", logError);
    }
    return res.redirect(fallbackUrl);
  }

  // Fetch a random active URL from feed_urls excluding visited ones
  let urlData;
  let finalUrl;
  try {
    const urls = await FeedUrl.findAll({
      where: {
        source: { [Op.iLike]: source },
        status: "active",
        available_cap: { [Op.gt]: 0 },
        id: { [Op.notIn]: visitedUrlIds }, // exclude visited
      },
    });

    if (!urls || urls.length === 0) {
      console.log("No available URL found, redirecting to fallback");
      return res.redirect(fallbackUrl);
    }

    urlData = urls[Math.floor(Math.random() * urls.length)];
    console.log("Selected URL:", urlData.dataValues.url);

    finalUrl = urlData.url.replace("{keyword}", encodeURIComponent(keyword));
  } catch (err) {
    console.error("Error in fetching feed url", err);
    return res.status(500).send("Server error");
  }

  // If referer is null, redirect to a random fallback URL
  if(referer === null && process.env.BLOCK_NULL_REFERER === 'true') {
    console.log("Null referer - redirecting to fallback URL");
    try {
      await ClientDetail.create({
        feed_url_id: urlData.id,
        remote_ip: remoteIp,
        client_ip: clientIp,
        user_agent: userAgent,
        referer: referer,
        failure: true,
        failure_reason: "null referer",
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

  // Allow the visit - insert into day_visits and client_details and then redirect to finalUrl
  console.log("New visit - allowing and redirecting to final URL:", finalUrl);
  try {
    await DayVisit.create({
      feed_url_id: urlData.id,
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
    
  try {
    await ClientDetail.create({
      feed_url_id: urlData.id,
      remote_ip: remoteIp,
      client_ip: clientIp,
      user_agent: userAgent,
      referer: referer,
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

  try {
    await FeedUrl.update(
      { available_cap: sequelize.literal("available_cap - 1") },
      { where: { id: urlData.id, available_cap: { [Op.gt]: 0 } } }
    );
  } catch (error) {
    console.error("Error decrementing feed_urls.available_cap:", error);

    try {
      await ErrorLog.create({
        api: "/",
        message: "Error decrementing feed_urls.available_cap",
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      });
    } catch (logError) {
      console.error("Failed to insert into error_logs table:", logError);
    }
  }

  return res.redirect(finalUrl);
}

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