
/* =========================================================
   CLOUDCALC PRO
   SUPABASE CONNECTION
========================================================= */

(function () {

    "use strict";

    const config =
        window.CloudCalcConfig;

    if (!config) {

        console.error(
            "CloudCalcConfig is not loaded."
        );

        return;
    }

    if (!window.supabase) {

        console.error(
            "Supabase JavaScript library is not loaded."
        );

        return;
    }

    window.supabaseClient =
        window.supabase.createClient(

            config.SUPABASE.URL,

            config.SUPABASE.KEY

        );

    console.log(
        "CloudCalc Pro → Supabase connected."
    );

})();

