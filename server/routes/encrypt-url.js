const express = require("express");
const authenticateToken = require("../middlewares/authenticate-token.js");
const { generateEncryptedURL, downloadEncryptedUrls } = require("../controllers/encrypt-url.js");

const router = express.Router();

router.post("/generate" , generateEncryptedURL);
router.get("/download-all", downloadEncryptedUrls);

module.exports = router;