const cron = require("node-cron");
const moment = require('moment-timezone');
const { sequelize } = require("../models");


const cleanDayVisitLogs = () => {
    cron.schedule(
      "0 0 * * *",
    // "* * * * *",
      async () => {
        const currentTime = moment().tz("UTC").format();
        console.log(`Truncating day_visits table at UTC: ${currentTime}`);
  
        try {
          // Truncate day_visits table
          await sequelize.query("TRUNCATE TABLE day_visits RESTART IDENTITY CASCADE;");
          console.log("day_visits table truncated successfully.");

          // Reset available_cap back to cap
          await sequelize.query("UPDATE feed_urls SET available_cap = cap;");
          console.log("feed_urls available_cap reset to cap successfully.");
      
        } catch (error) {
          console.error("Error truncating day_visits table:", error);
        }
      },
      {
        timezone: "UTC",
      }
    );
  };
  
  module.exports = cleanDayVisitLogs; 