require('dotenv').config();
const express = require('express');
const { Sequelize, QueryTypes, Op } = require("sequelize");
const cronJobs = require('./cron');
const authRoutes = require('./routes/auth');
const encryptUrlRoutes = require('./routes/encrypt-url');
const reportRoutes = require('./routes/report');
const facebookRoutes = require('./routes/facebook');
const campaignRoutes = require('./routes/campaign');
const taboolaRoutes = require('./routes/taboola');
const cors = require('cors');
const { RedirectUrl, ClientDetail, DayVisit, SelfRedirectingUrl, ErrorLog, FeedUrl, RefererData, SubidBlockedHit } = require('./models');
const path = require('path');
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cookieParser());

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

cronJobs();

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
app.use('/api/taboola', taboolaRoutes);
app.use('/api', campaignRoutes);

app.get("/", async (req, res) => {

  const { id, campId: campaignId, keyword, source, subid } = req.query;

  if (
    !( (campaignId && id) || (keyword && source) || subid )
  ) {
    return res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  }

  if(keyword && source) {
    return handleKeywordSourceRedirect(req, res);
  }

  const fallbackUrl = await getFallbackUrl();

  if (subid) {
    if (process.env.ALLOW_SUBID_URL === 'true') {
      return handleSubIdRedirect(req, res);
    } else {

      const clientIp = req.headers["x-forwarded-for"]?.split(",").pop().trim() || null;
      const referer = req.headers.referer || req.headers.referrer || null;
      const remoteIp = req.socket?.remoteAddress ? req.socket.remoteAddress.replace(/^::ffff:/, "") : null;
      const userAgent = req.headers["user-agent"] || null;

      try {
        await SubidBlockedHit.create({
          subid: subid,
          remote_ip: remoteIp,
          client_ip: clientIp,
          user_agent: userAgent,
          referer: referer,
        });
      } catch (error) {
        console.error('Error inserting into subid_blocked_hits:', error);
        return res.status(500).send('Internal Server Error.');
      }
      
      return res.redirect("https://www.aboutfashions.com/");
    }
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
  const sessionId = req.cookies.sessionId;

  console.log(`Handling keyword-source redirect for keyword: ${keyword}, source: ${source}`);

  //If request is from facebook or taboola bot, redirect it to aboutfashions search results page
  if(
    req.headers['user-agent'] 
    && (req.headers['user-agent'].includes('Taboolabot') || req.headers['user-agent'].includes('facebookexternalhit'))
  ) {
    console.log('Redirecting to aboutfashions search results page')
    return res.redirect(`https://aboutfashions.com/search?q=${encodeURIComponent(keyword)}`)
  }

  const device = detectDevice(req.headers);

  let devices = [2];
  if (device === 'mobile') {
    devices.push(0);
  } 
  if (device === 'desktop') {
    devices.push(1);
  }

  // Fetch a random self-redirecting URL for fallback
  const fallbackUrl = await getFallbackUrl();

  let clientIp = req.headers["x-forwarded-for"]?.split(",").pop().trim() || null;
  const referer = req.headers.referer || req.headers.referrer || null;
  const remoteIp = req.socket?.remoteAddress ? req.socket.remoteAddress.replace(/^::ffff:/, "") : null;
  const userAgent = req.headers["user-agent"] || null;

  //Fetch all visited feed_url_id for the Client IP from day_visits table
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
        device: { [Op.in]: devices }
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

    console.log('Null referer - Redirecting to fallback Url');
    return res.redirect(fallbackUrl);
  }

  // Allow the visit - insert into day_visits and client_details and then redirect to finalUrl
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
      session_id: sessionIds.includes(sessionId) ? 1 : 0,
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

  // If sessionId cookie is found in array sessionIds, then don't store refererData
  if(!sessionIds.includes(sessionId)) {
    try {
      await RefererData.create({
          referer,
          source: source.toLowerCase(),
        });
    } catch (error) {
      console.error("Error inserting data in referer_data table:", error)

      try {
        await ErrorLog.create({
          api: "/",
          message: "Error inserting data in referer_data table",
          error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        });
      } catch (logError) {
        console.error("Failed to insert into referer_data table:", logError);
      }
    }
  }

  // Build query params excluding subid, device
  const queryParams = { ...req.query };
  delete queryParams.keyword;
  delete queryParams.source;
  delete queryParams.subid;
  // If there are extra params, append them
  const queryString = new URLSearchParams(queryParams).toString();

  if (queryString) {
    finalUrl += (finalUrl.includes("?") ? "&" : "?") + queryString;
  }

  console.log("New visit - allowing and redirecting to final URL:", finalUrl);
  return res.redirect(finalUrl);
}

async function getFallbackUrl() {
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
  return fallbackUrl;
}

function detectDevice(headers) {
  const ua = headers['user-agent'] || '';
  const mobileHeader = headers['sec-ch-ua-mobile'];

  // 1. Check sec-ch-ua-mobile if present
  if (mobileHeader !== undefined) {
    return mobileHeader === '?1' ? 'mobile' : 'desktop';
  }

  // 2. Fallback: check user-agent string
  const uaLower = ua.toLowerCase();

  if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(uaLower)) {
    return 'mobile';
  }
  if (/ipad|tablet|android(?!.*mobile)/.test(uaLower)) {
    return 'mobile'; //tablet
  }

  // 3. If user-agent exists but didn’t match, return desktop
  if (ua) return 'desktop';

  // 4. If no user-agent at all, return null
  return null;
}

let sessionIds = [];

async function handleSubIdRedirect(req, res) {
  let refererData;
  try {
    refererData = await RefererData.findAll({
      where: {
        is_used: false,
      },
      attributes: ["id", "referer"],
    });
  } catch (error) {
    console.error('Error fetching referer data:', error);
    return res.status(500).send("Internal Server Error");
  }
  
  if (refererData && refererData.length > 0) {
    const randomReferer = refererData[Math.floor(Math.random() * refererData.length)];

    try {
      await RefererData.update(
        { is_used: true },
        { where: { id: randomReferer.id } },        
      );
    } catch(error) {
      console.error('Error updating referer data', error);
      return res.status(500).send('Internal Server Error');
    }

    return res.redirect(randomReferer.referer);
  } else {
    console.log('NO REFERER AVAILABLE')
    let refererData;
    try {
      refererData = await RefererData.findAll({
        attributes: ["id", "referer"],
      });
    } catch (error) {
      console.error('Error fetching referer data:', error);
      return res.status(500).send("Internal Server Error");
    }
    const randomReferer = refererData[Math.floor(Math.random() * refererData.length)];

    const updatedTblciReferer = updateTblciInUrl(randomReferer.referer);

    //set cookie
    const sessionId = randomAlphaNumeric(20);

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
      maxAge: 10 * 60 * 1000, // 10 min
      sameSite: "None"
    });

    sessionIds.push(sessionId);

    return res.redirect(updatedTblciReferer);
  }
}

function updateTblciInUrl(url) {
  const urlObj = new URL(url);

  //Changes for https://api.taboola.com
  if (urlObj.origin.startsWith("https://api")) {
    const itemId = urlObj.searchParams.get("item.id");
    const cpb = urlObj.searchParams.get("cpb");
    const newTail = randomAlphaNumeric(5);
    const newitemId = itemId.slice(0, -5) + newTail;
    const newCpb = cpb.slice(0, -5) + newTail;
    urlObj.searchParams.set("item.id", newitemId);
    urlObj.searchParams.set("cpb", newCpb);
  }

  //Changes for https://trc.taboola.com
  if (urlObj.origin.startsWith("https://trc")) {
    const ii = urlObj.searchParams.get("ii");
    const vi = urlObj.searchParams.get("vi");
    const cpb = urlObj.searchParams.get("cpb");
    const newTail = randomAlphaNumeric(5);
    const newIi = ii.slice(0, -5) + newTail;
    const newCpb = cpb.slice(0, -5) + newTail;
    const newVi = Date.now();
    urlObj.searchParams.set("ii", newIi);
    urlObj.searchParams.set("cpb", newCpb);
    urlObj.searchParams.set("vi", newVi);
  }

  // 1. Get redir param
  const redirParam = urlObj.searchParams.get("redir");
  if (!redirParam) return url;

  // 2. Decode the redir URL
  const decodedRedirUrl = decodeURIComponent(redirParam);
  const innerUrlObj = new URL(decodedRedirUrl);

  // 3. Get tblci param
  let tblciValue = innerUrlObj.searchParams.get("tblci");
  if (!tblciValue) return url;

  // 4. Replace last 20 chars with random
  const newTail = randomAlphaNumeric(20);
  const newTblciValue = tblciValue.slice(0, -20) + newTail;

  // 5. Update query param
  innerUrlObj.searchParams.set("tblci", newTblciValue);

  // 6. Update hash only for tblci part
  if (innerUrlObj.hash && innerUrlObj.hash.includes("tblci")) {
    innerUrlObj.hash = innerUrlObj.hash.replace(
      /(tblci)[^&]*/,
      `$1${newTblciValue}`
    );
  }

  // 7. Put back redir in outer URL
  urlObj.searchParams.set("redir", innerUrlObj.toString());

  return urlObj.toString();
}

function randomAlphaNumeric(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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