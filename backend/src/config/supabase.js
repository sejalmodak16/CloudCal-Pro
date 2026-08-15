"use strict";

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        "SUPABASE_URL or SUPABASE_KEY is missing."
    );
}

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);

console.log("CloudCalc Pro: Supabase connected");

module.exports = supabase;