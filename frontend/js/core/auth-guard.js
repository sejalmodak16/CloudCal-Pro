
/* =========================================================
   CLOUDCALC PRO
   AUTH GUARD
========================================================= */

(function () {

    "use strict";


    const publicPages = [

        "index.html",

        "login.html",

        "register.html",

        ""

    ];


    function getCurrentPage() {

        const path =
            window.location.pathname;

        const file =
            path.split("/").pop();

        return file || "index.html";

    }


    async function checkAuth() {

        if (!window.supabaseClient) {

            console.warn(
                "Auth guard: Supabase not initialized."
            );

            return;

        }


        const page =
            getCurrentPage();


        const {
            data,
            error
        } =
            await window.supabaseClient.auth
                .getUser();


        const user =
            error ? null : data?.user;


        const isPublic =
            publicPages.includes(page);


        /* =============================================
           PROTECTED PAGE
        ============================================== */

        if (!isPublic && !user) {

            window.location.href =
                "login.html";

            return;

        }


        /* =============================================
           AUTHENTICATED USER ON LOGIN/REGISTER
        ============================================== */

        if (
            user &&
            (
                page === "login.html" ||
                page === "register.html"
            )
        ) {

            window.location.href =
                "dashboard.html";

        }

    }


    document.addEventListener(
        "DOMContentLoaded",
        checkAuth
    );


    window.CloudCalcAuthGuard = {

        check: checkAuth

    };


})();

