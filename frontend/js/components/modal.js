
/* =========================================================
   CLOUDCALC PRO
   MODAL SYSTEM
========================================================= */

(function () {

    "use strict";


    function open(id) {

        const modal =
            document.getElementById(id);

        if (!modal) {
            return;
        }


        modal.classList.add(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    function close(id) {

        const modal =
            document.getElementById(id);

        if (!modal) {
            return;
        }


        modal.classList.remove(
            "active"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    function closeAll() {

        document
            .querySelectorAll(
                ".modal.active"
            )
            .forEach(modal => {

                modal.classList.remove(
                    "active"
                );

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            });


        document.body.classList.remove(
            "modal-open"
        );

    }


    document.addEventListener(
        "click",
        event => {

            const openButton =
                event.target.closest(
                    "[data-modal-open]"
                );


            if (openButton) {

                open(
                    openButton.dataset.modalOpen
                );

                return;

            }


            const closeButton =
                event.target.closest(
                    "[data-modal-close]"
                );


            if (closeButton) {

                close(
                    closeButton.dataset.modalClose
                );

                return;

            }


            if (
                event.target.classList.contains(
                    "modal"
                )
            ) {

                close(
                    event.target.id
                );

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeAll();

            }

        }
    );


    window.CloudCalcModal = {

        open,

        close,

        closeAll

    };

})();

