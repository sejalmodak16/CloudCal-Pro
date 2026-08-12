
/* =========================================================
   CLOUDCALC PRO
   TOAST NOTIFICATIONS
========================================================= */

(function () {

    "use strict";

    function getContainer() {

        let container =
            document.getElementById("toastContainer");

        if (!container) {

            container =
                document.createElement("div");

            container.id =
                "toastContainer";

            container.className =
                "toast-container";

            document.body.appendChild(
                container
            );

        }

        return container;

    }


    function show(
        message,
        type = "info",
        duration = 3000
    ) {

        const container =
            getContainer();

        const toast =
            document.createElement("div");

        toast.className =
            `toast toast-${type}`;

        toast.innerHTML = `

            <span class="toast-message">
                ${escapeHTML(message)}
            </span>

            <button
                type="button"
                class="toast-close"
                aria-label="Close"
            >
                ×
            </button>

        `;


        container.appendChild(
            toast
        );


        requestAnimationFrame(() => {

            toast.classList.add(
                "show"
            );

        });


        const close =
            () => {

                toast.classList.remove(
                    "show"
                );

                setTimeout(() => {

                    toast.remove();

                }, 300);

            };


        toast.querySelector(
            ".toast-close"
        ).addEventListener(
            "click",
            close
        );


        setTimeout(
            close,
            duration
        );

    }


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    window.CloudCalcToast = {

        show,

        success(message) {
            show(
                message,
                "success"
            );
        },

        error(message) {
            show(
                message,
                "error"
            );
        },

        warning(message) {
            show(
                message,
                "warning"
            );
        },

        info(message) {
            show(
                message,
                "info"
            );
        }

    };

})();

