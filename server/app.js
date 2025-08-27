require('dotenv').config();
const express = require('express');
const { Sequelize, QueryTypes, Op } = require("sequelize");
const cronJobs = require('./cron');
const authRoutes = require('./routes/auth');
const encryptUrlRoutes = require('./routes/encrypt-url');
const cors = require('cors');
const { RedirectUrl, ClientDetail, DayVisit, SelfRedirectingUrl } = require('./models');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

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


app.use('/api/auth', authRoutes);
app.use('/api', encryptUrlRoutes);

app.get("/", async (req, res) => {
  const userAgent = req.headers["user-agent"] || null;

  if (userAgent && userAgent == 'Mozilla/5.0 (Java) outbrain') {
    let urls;
    let randomUrl;
        try {
          urls = await SelfRedirectingUrl.findAll({
            attributes: ["url"],
          });
        } catch (error) {
          console.error("Error fetching self_redirecting_urls:", error);
          return res.status(500).send("Error fetching self_redirecting_urls");
        }
      
          if (urls.length !== 0) {
            randomUrl = urls[Math.floor(Math.random() * urls.length)].url;
          }
    return res.redirect(randomUrl);
  }
  
  const id = req.query.id;

  if (!id) {
    return res.sendFile(path.join(__dirname, "public", "login.html"));
  }

  let url;

  try {
    url = await RedirectUrl.findOne({
      where: { id }
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).send("Internal Server Error");
  }
    
    if (!url) {
      alert("Please enter a URL.");
      return;
    }

    let urlVisitedRecord;
    let clientIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress;


    try {
      // Check if the same IP and URL ID already exist in today's records
      urlVisitedRecord = await DayVisit.findOne({
        where: {
          url_id: id,
          client_ip: clientIp,
        }
      });
    } catch (error) {
      return res.status(500).send("Database error: Error checking existing records");
    }

      if (urlVisitedRecord) {
        console.log("User already visited this URL today.");
        let urls;
        try {
          urls = await SelfRedirectingUrl.findAll({
            attributes: ["url"],
          });
        } catch (error) {
          console.error("Error fetching self_redirecting_urls:", error);
          return res.status(500).send("Error fetching self_redirecting_urls");
        }
      
          if (urls.length !== 0) {
            const randomUrl = urls[Math.floor(Math.random() * urls.length)].url;
            console.log(`User already used this redirect URL today. Redirecting to: ${randomUrl}`);
            return res.redirect(randomUrl);
          }
    }

    console.log(`Client IP: ${clientIp}`);

    try {
      await DayVisit.create({
        url_id: id,
        client_ip: clientIp
      });
    } catch (error) {
      console.error("Error inserting into day visits table:", error);
      return res.status(500).send("Error inserting into day visits table");
    }
    
    clientIp = req.headers["x-forwarded-for"] || null;
    
    const referer = req.headers.referer || req.headers.referrer || null;
    const remoteIp = req.socket?.remoteAddress ? req.socket.remoteAddress.replace(/^::ffff:/, "") : null;
    const redirectUrl = url.dataValues.redirect_url;

    try {
      await ClientDetail.create({
        url_id: id,
        remote_ip: remoteIp,
        client_ip: clientIp,
        user_agent: userAgent,
        referer: referer
      });
    } catch (error) {
      console.error("Error inserting into client details table:", error);
      return res.status(500).send("Error inserting into client details table");
    }

    console.log(`Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
});

app.get("/api/download-all-encrypted-urls", async (req, res) => {
  try {
      const records = await RedirectUrl.findAll({ attributes: ["id", "redirect_url", "created_at"] });

      if (!records.length) {
          return res.status(404).send("No records found.");
      }

      let data = [["ID", "Original URL", "Generated Redirect URL", "Created Date"]];

      records.forEach(record => {
          const date = new Date(record.created_at);
          data.push([record.id, record.redirect_url, `${process.env.BASE_URL}/?id=${record.id}`, date]);
      });

      const worksheet = xlsx.utils.aoa_to_sheet(data);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "RedirectURLs");

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


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});