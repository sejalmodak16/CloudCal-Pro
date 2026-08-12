
/* =========================================================
   CLOUDCALC PRO
   THEME MANAGER
========================================================= */

(function () {

    "use strict";


    const STORAGE_KEY =
        "cloudcalc-theme";


    function getTheme() {

        return localStorage.getItem(
            STORAGE_KEY
        ) || "dark";

    }


    function apply(theme) {

        document.documentElement
            .setAttribute(
                "data-theme",
                theme
            );

        localStorage.setItem(
            STORAGE_KEY,
            theme
        );

    }


    function toggle() {

        const current =
            getTheme();

        const next =
            current === "dark"
                ? "light"
                : "dark";

        apply(next);

        return next;

    }


    function initialize() {

        apply(
            getTheme()
        );

    }


    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-theme-toggle]"
                );

            if (!button) {
                return;
            }

            toggle();

        }
    );


    window.CloudCalcTheme = {

        get: getTheme,

        set: apply,

        toggle,

        initialize

    };

})();

