/* =========================================================
   CLOUDCALC PRO
   SETTINGS PAGE
   Supabase + Theme + Logout
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       INITIALIZE
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            console.log(
                "CloudCalc Pro: Settings initialized."
            );


            initializeTheme();

            initializeLogout();

        }
    );


    /* =====================================================
       THEME
    ===================================================== */

    function initializeTheme() {

        const themeSelect =
            document.getElementById(
                "themeSelect"
            );


        if (!themeSelect) {

            console.log(
                "Theme selector not found."
            );

            return;
        }


        const savedTheme =
            localStorage.getItem(
                "cloudcalc-theme"
            ) || "dark";


        themeSelect.value =
            savedTheme;


        document.documentElement
            .setAttribute(
                "data-theme",
                savedTheme
            );


        themeSelect.addEventListener(
            "change",
            function () {

                const theme =
                    themeSelect.value;


                localStorage.setItem(
                    "cloudcalc-theme",
                    theme
                );


                document.documentElement
                    .setAttribute(
                        "data-theme",
                        theme
                    );


                console.log(
                    "CloudCalc Pro: Theme changed to",
                    theme
                );

            }
        );

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    function initializeLogout() {

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (!logoutButton) {

            console.log(
                "Logout button not found."
            );

            return;
        }


        logoutButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                if (!window.supabaseClient) {

                    console.error(
                        "Supabase client unavailable."
                    );

                    alert(
                        "Supabase connection is unavailable."
                    );

                    return;
                }


                try {

                    logoutButton.disabled =
                        true;


                    logoutButton.textContent =
                        "Logging out...";


                    console.log(
                        "CloudCalc Pro: Logging out..."
                    );


                    const {
                        error
                    } =
                        await window.supabaseClient
                            .auth
                            .signOut();


                    if (error) {
                        throw error;
                    }


                    console.log(
                        "CloudCalc Pro: Logout successful."
                    );


                    window.location.href =
                        "login.html";

                }
                catch (error) {

                    console.error(
                        "Logout failed:",
                        error
                    );


                    alert(
                        error?.message ||
                        "Unable to logout."
                    );


                    logoutButton.disabled =
                        false;


                    logoutButton.textContent =
                        "Logout";
                }

            }
        );

    }

})();