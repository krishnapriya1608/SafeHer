const express = require("express");
const { generateFakeCall } = require("../Controller/fakeCallController");

const router = express.Router();

router.post("/generate", generateFakeCall);

module.exports = router;
