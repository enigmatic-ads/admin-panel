const express = require("express");
const authenticateToken = require("../middlewares/authenticate-token.js");
const { generateEncryptedURL } = require("../controllers/encrypt-url.js");

const router = express.Router();

router.post("/generate-encrypted-url" , generateEncryptedURL);

module.exports = router;