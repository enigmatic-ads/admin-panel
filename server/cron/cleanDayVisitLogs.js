const cron = require("node-cron");
const moment = require('moment-timezone');
const { sequelize } = require("../models");


const cleanDayVisitLogs = () => {
    cron.schedule(
      "0 12 * * *",
    // "* * * * *",
      async () => {
        const currentTime = moment().tz("UTC").format();
        console.log(`Truncating day_visits table at UTC: ${currentTime}`);
  
        try {
          await sequelize.query("TRUNCATE TABLE day_visits RESTART IDENTITY CASCADE;");
          console.log("day_visits table truncated successfully.");
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