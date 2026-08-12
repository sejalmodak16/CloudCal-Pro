
/* =========================================================
   CLOUDCALC PRO
   GENERAL HELPERS
========================================================= */

(function () {

    "use strict";

    window.CloudCalcHelpers = {

        $(selector, parent = document) {
            return parent.querySelector(selector);
        },


        $$(selector, parent = document) {
            return Array.from(
                parent.querySelectorAll(selector)
            );
        },


        get(id) {
            return document.getElementById(id);
        },


        show(element) {

            if (!element) {
                return;
            }

            element.hidden = false;

            element.style.display = "";

        },


        hide(element) {

            if (!element) {
                return;
            }

            element.hidden = true;

        },


        toggle(element, force) {

            if (!element) {
                return;
            }

            element.hidden =
                typeof force === "boolean"
                    ? !force
                    : !element.hidden;

        },


        addClass(element, className) {

            if (element && className) {
                element.classList.add(className);
            }

        },


        removeClass(element, className) {

            if (element && className) {
                element.classList.remove(className);
            }

        },


        toggleClass(element, className, force) {

            if (!element || !className) {
                return;
            }

            element.classList.toggle(
                className,
                force
            );

        },


        escapeHTML(value) {

            if (value === null || value === undefined) {
                return "";
            }

            const div = document.createElement("div");

            div.textContent = String(value);

            return div.innerHTML;

        },


        debounce(callback, delay = 300) {

            let timer;

            return (...args) => {

                clearTimeout(timer);

                timer = setTimeout(
                    () => callback(...args),
                    delay
                );

            };

        },


        throttle(callback, limit = 100) {

            let waiting = false;

            return (...args) => {

                if (waiting) {
                    return;
                }

                callback(...args);

                waiting = true;

                setTimeout(() => {
                    waiting = false;
                }, limit);

            };

        },


        isMobile() {

            return window.matchMedia(
                "(max-width: 768px)"
            ).matches;

        },


        isTouchDevice() {

            return (
                "ontouchstart" in window ||
                navigator.maxTouchPoints > 0
            );

        },


        isWebGLAvailable() {

            try {

                const canvas =
                    document.createElement("canvas");

                return Boolean(
                    window.WebGLRenderingContext &&
                    (
                        canvas.getContext("webgl") ||
                        canvas.getContext("experimental-webgl")
                    )
                );

            } catch (error) {

                return false;

            }

        },


        generateId(prefix = "id") {

            return `${prefix}-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`;

        },


        sleep(milliseconds) {

            return new Promise(resolve =>
                setTimeout(resolve, milliseconds)
            );

        },


        downloadBlob(blob, filename) {

            if (!(blob instanceof Blob)) {
                return false;
            }

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;
            link.download = filename;

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

            return true;

        }

    };

})();

