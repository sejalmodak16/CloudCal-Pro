"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const supabase = require("./config/supabase");
const historyRoutes = require("./routes/historyRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
    res.send("CloudCalc Pro Backend is Running 🚀");
});

/* =========================
   TEST API
========================= */

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "CloudCalc Pro backend is working!"
    });
});

/* =========================
   SUPABASE TEST
========================= */

app.get("/api/supabase-test", async (req, res) => {
    try {
        const { error } = await supabase
            .from("history")
            .select("id")
            .limit(1);

        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                success: false,
                message: "Supabase connection failed",
                error: error.message
            });
        }

        res.json({
            success: true,
            message: "Supabase connected successfully!"
        });

    } catch (error) {
        console.error("Supabase test error:", error);

        res.status(500).json({
            success: false,
            message: "Supabase connection failed"
        });
    }
});

/* =========================
   HISTORY ROUTES
========================= */

app.use("/api/history", historyRoutes);

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
    console.log(
        `CloudCalc Pro backend running on http://localhost:${PORT}`
    );
});