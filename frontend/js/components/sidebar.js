
/* =========================================================
   CLOUDCALC PRO
   SIDEBAR
========================================================= */

(function () {

    "use strict";


    function open() {

        document.body.classList.add(
            "sidebar-open"
        );

    }


    function close() {

        document.body.classList.remove(
            "sidebar-open"
        );

    }


    function toggle() {

        document.body.classList.toggle(
            "sidebar-open"
        );

    }


    document.addEventListener(
        "click",
        event => {

            const toggleButton =
                event.target.closest(
                    "[data-sidebar-toggle]"
                );

            if (toggleButton) {

                event.preventDefault();

                toggle();

                return;

            }


            const closeButton =
                event.target.closest(
                    "[data-sidebar-close]"
                );

            if (closeButton) {

                event.preventDefault();

                close();

            }

        }
    );


    window.CloudCalcSidebar = {

        open,

        close,

        toggle

    };

})();

