"use strict";

const express = require("express");

const authenticateUser = require("../middleware/authMiddleware");

const {
    saveHistory,
    getHistory,
    deleteHistory
} = require("../controllers/historyController");

const router = express.Router();

/* =========================================================
   SAVE HISTORY
========================================================= */

router.post(
    "/",
    authenticateUser,
    saveHistory
);


/* =========================================================
   GET HISTORY
========================================================= */

router.get(
    "/",
    authenticateUser,
    getHistory
);


/* =========================================================
   DELETE HISTORY
========================================================= */

router.delete(
    "/:id",
    authenticateUser,
    deleteHistory
);


/* =========================================================
   EXPORT ROUTER
========================================================= */

module.exports = router;