/* =========================================================
   CLOUDCALC PRO
   SUPABASE CLIENT
========================================================= */
 
(function () {
 
    "use strict";
 
    if (window.supabaseClient) {
        console.log("CloudCalc Pro: Supabase client already initialized.");
        return;
    }
 
    const SUPABASE_URL =
        "https://xtjhwyuwlcpdsglwrhen.supabase.co";
 
    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_dd0muU0RnFRGFy0J9x8P4g_WaQ5xxLS";
 
    if (!window.supabase) {
 
        console.error(
            "CloudCalc Pro: Supabase CDN was not loaded."
        );
 
        return;
    }
 
    const {
        createClient
    } = window.supabase;
 
    window.supabaseClient =
        createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );
 
    console.log(
        "CloudCalc Pro: Supabase connected"
    );
 
})();
 