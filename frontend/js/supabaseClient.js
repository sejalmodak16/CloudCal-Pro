/* =========================================================
   CLOUDCALC PRO
   SUPABASE CLIENT
========================================================= */

(function () {
    "use strict";

    // Prevent duplicate initialization
    if (window.supabaseClient) {
        console.log("CloudCalc Pro: Supabase client already initialized.");
        return;
    }

    // Supabase project URL
    const SUPABASE_URL =
        "https://xtjhwyuwlcpdsglwrhen.supabase.co";

    // Supabase Publishable Key
    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_dd0muU0RnFRGFy0J9x8P4g_WaQ5xxLS";

    // Check Supabase CDN
    if (!window.supabase) {
        console.error(
            "CloudCalc Pro: Supabase CDN was not loaded."
        );
        return;
    }

    // Create Supabase client
    const { createClient } = window.supabase;

    window.supabaseClient = createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    console.log(
        "CloudCalc Pro: Supabase connected successfully."
    );

})();