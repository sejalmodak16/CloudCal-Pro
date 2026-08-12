
/* =========================================================
   CLOUDCALC PRO
   NAVBAR
========================================================= */

(function () {

    "use strict";


    function initialize() {

        const currentPage =
            window.CloudCalcRouter
                ?.getCurrentPage();


        document
            .querySelectorAll(
                "[data-route]"
            )
            .forEach(link => {

                const route =
                    link.dataset.route;


                if (
                    route === currentPage
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            });

    }


    document.addEventListener(
        "DOMContentLoaded",
        initialize
    );


    window.CloudCalcNavbar = {

        initialize

    };

})();

