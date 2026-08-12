
/* =========================================================
   CLOUDCALC PRO
   EXPORT SERVICE
   PDF + CSV EXPORT
========================================================= */

(function () {

    "use strict";


    window.CloudCalcExport = {


        /* =====================================================
           GET HISTORY DATA
        ====================================================== */

        async getHistory(options = {}) {

            if (
                window.CloudCalcHistory &&
                typeof window.CloudCalcHistory.getAll === "function"
            ) {

                return await window.CloudCalcHistory.getAll(
                    options
                );

            }

            throw new Error(
                "History service is not available."
            );

        },


        /* =====================================================
           PREPARE DATA
        ====================================================== */

        prepareData(records = []) {

            if (!Array.isArray(records)) {
                return [];
            }

            return records.map(item => ({

                Date:
                    item.created_at ||
                    item.date ||
                    "",

                Expression:
                    item.expression ||
                    item.calculation ||
                    "",

                Result:
                    item.result !== undefined &&
                    item.result !== null
                        ? item.result
                        : "",

                Operation:
                    item.operation ||
                    "basic"

            }));

        },


        /* =====================================================
           EXPORT CSV
        ====================================================== */

        async csv(
            options = {},
            filename = "cloudcalc-history.csv"
        ) {

            const records =
                await this.getHistory(options);

            if (!records.length) {

                this.showMessage(
                    "No calculations available to export."
                );

                return false;

            }

            const data =
                this.prepareData(records);


            if (
                !window.CloudCalcCSV ||
                typeof window.CloudCalcCSV.export !== "function"
            ) {

                throw new Error(
                    "CSV export utility is not loaded."
                );

            }


            const success =
                window.CloudCalcCSV.export(
                    data,
                    filename
                );


            if (success) {

                this.showMessage(
                    "CSV exported successfully.",
                    "success"
                );

            }


            return success;

        },


        /* =====================================================
           EXPORT PDF
        ====================================================== */

        async pdf(
            options = {},
            filename = "cloudcalc-history.pdf"
        ) {

            const records =
                await this.getHistory(options);

            if (!records.length) {

                this.showMessage(
                    "No calculations available to export."
                );

                return false;

            }


            if (
                !window.CloudCalcPDF ||
                typeof window.CloudCalcPDF.export !== "function"
            ) {

                throw new Error(
                    "PDF export utility is not loaded."
                );

            }


            const success =
                await window.CloudCalcPDF.export(
                    records,
                    filename
                );


            if (success) {

                this.showMessage(
                    "PDF exported successfully.",
                    "success"
                );

            }


            return success;

        },


        /* =====================================================
           EXPORT BOTH
        ====================================================== */

        async all(options = {}) {

            const records =
                await this.getHistory(options);

            if (!records.length) {

                this.showMessage(
                    "No calculations available to export."
                );

                return false;

            }


            const timestamp =
                new Date()
                    .toISOString()
                    .replace(/[:.]/g, "-");


            const csvData =
                this.prepareData(records);


            if (
                window.CloudCalcCSV &&
                typeof window.CloudCalcCSV.export === "function"
            ) {

                window.CloudCalcCSV.export(
                    csvData,
                    `cloudcalc-history-${timestamp}.csv`
                );

            }


            if (
                window.CloudCalcPDF &&
                typeof window.CloudCalcPDF.export === "function"
            ) {

                await window.CloudCalcPDF.export(
                    records,
                    `cloudcalc-history-${timestamp}.pdf`
                );

            }


            this.showMessage(
                "History exported successfully.",
                "success"
            );


            return true;

        },


        /* =====================================================
           EXPORT SELECTED RECORDS
        ====================================================== */

        async selected(
            records,
            format = "pdf",
            filename
        ) {

            if (
                !Array.isArray(records) ||
                records.length === 0
            ) {

                this.showMessage(
                    "No calculations selected."
                );

                return false;

            }


            const timestamp =
                new Date()
                    .toISOString()
                    .replace(/[:.]/g, "-");


            if (format === "csv") {

                const data =
                    this.prepareData(records);

                return window.CloudCalcCSV.export(
                    data,
                    filename ||
                    `cloudcalc-selected-${timestamp}.csv`
                );

            }


            if (format === "pdf") {

                return await window.CloudCalcPDF.export(
                    records,
                    filename ||
                    `cloudcalc-selected-${timestamp}.pdf`
                );

            }


            throw new Error(
                "Unsupported export format."
            );

        },


        /* =====================================================
           DATE RANGE EXPORT
        ====================================================== */

        async dateRange(
            from,
            to,
            format = "pdf"
        ) {

            const options = {};

            if (from) {
                options.from = from;
            }

            if (to) {
                options.to = to;
            }


            const records =
                await this.getHistory(options);


            if (!records.length) {

                this.showMessage(
                    "No calculations found for this period."
                );

                return false;

            }


            if (format === "csv") {

                const data =
                    this.prepareData(records);

                return window.CloudCalcCSV.export(
                    data,
                    "cloudcalc-history-range.csv"
                );

            }


            return await window.CloudCalcPDF.export(
                records,
                "cloudcalc-history-range.pdf"
            );

        },


        /* =====================================================
           UI MESSAGE
        ====================================================== */

        showMessage(
            message,
            type = "error"
        ) {

            if (
                window.CloudCalcToast &&
                typeof window.CloudCalcToast[type] === "function"
            ) {

                window.CloudCalcToast[type](
                    message
                );

                return;

            }


            if (
                window.CloudCalcToast &&
                typeof window.CloudCalcToast.show === "function"
            ) {

                window.CloudCalcToast.show(
                    message,
                    type
                );

                return;

            }


            console.log(
                `[CloudCalc ${type}] ${message}`
            );

        }

    };

})();

