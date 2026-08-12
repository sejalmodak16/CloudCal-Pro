
/* =========================================================
   CLOUDCALC PRO
   FORMATTER UTILITY
========================================================= */

(function () {

    "use strict";

    window.CloudCalcFormatter = {

        number(value) {

            const number = Number(value);

            if (!Number.isFinite(number)) {
                return "0";
            }

            return new Intl.NumberFormat(
                "en-IN",
                {
                    maximumFractionDigits: 10
                }
            ).format(number);
        },


        currency(value, currency = "INR") {

            const number = Number(value);

            if (!Number.isFinite(number)) {
                return "₹0";
            }

            return new Intl.NumberFormat(
                "en-IN",
                {
                    style: "currency",
                    currency,
                    maximumFractionDigits: 2
                }
            ).format(number);
        },


        date(value) {

            if (!value) {
                return "—";
            }

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return "—";
            }

            return new Intl.DateTimeFormat(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            ).format(date);
        },


        time(value) {

            if (!value) {
                return "—";
            }

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return "—";
            }

            return new Intl.DateTimeFormat(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ).format(date);
        },


        dateTime(value) {

            if (!value) {
                return "—";
            }

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return "—";
            }

            return new Intl.DateTimeFormat(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            ).format(date);
        },


        truncate(text, length = 40) {

            if (!text) {
                return "";
            }

            const value = String(text);

            if (value.length <= length) {
                return value;
            }

            return `${value.substring(0, length)}...`;
        },


        relativeDate(value) {

            if (!value) {
                return "—";
            }

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return "—";
            }

            const now = new Date();

            const difference =
                now.getTime() - date.getTime();

            const minutes =
                Math.floor(difference / 60000);

            if (minutes < 1) {
                return "Just now";
            }

            if (minutes < 60) {
                return `${minutes} min ago`;
            }

            const hours =
                Math.floor(minutes / 60);

            if (hours < 24) {
                return `${hours} hr ago`;
            }

            const days =
                Math.floor(hours / 24);

            if (days < 7) {
                return `${days} day${days > 1 ? "s" : ""} ago`;
            }

            return this.date(value);
        }

    };

})();

