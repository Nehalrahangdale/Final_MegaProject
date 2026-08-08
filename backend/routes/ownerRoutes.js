const express = require("express");
const router = express.Router();

const {
    getDashboard
} = require("../controllers/ownerController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

router.get(
    "/dashboard",
    protect,
    authorize("owner"),
    getDashboard
);

module.exports = router;