
/* =========================================================
   CLOUDCALC PRO
   SIMPLE PAGE ROUTER
========================================================= */

(function () {

    "use strict";


    const routes = {

        home:
            "index.html",

        login:
            "login.html",

        register:
            "register.html",

        dashboard:
            "dashboard.html",

        calculator:
            "calculator.html",

        history:
            "history.html",

        profile:
            "profile.html",

        settings:
            "settings.html"

    };


    function navigate(page) {

        if (!routes[page]) {

            console.warn(
                `CloudCalc Router: Unknown route "${page}".`
            );

            return;

        }


        window.location.href =
            routes[page];

    }


    function getCurrentPage() {

        const file =
            window.location.pathname
                .split("/")
                .pop();


        if (!file) {
            return "home";
        }


        for (const [name, path] of
            Object.entries(routes)) {

            if (path === file) {
                return name;
            }

        }


        return "home";

    }


    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "[data-route]"
                );


            if (!link) {
                return;
            }


            const route =
                link.dataset.route;


            if (!routes[route]) {
                return;
            }


            event.preventDefault();

            navigate(route);

        }
    );


    window.CloudCalcRouter = {

        routes,

        navigate,

        getCurrentPage

    };


})();

