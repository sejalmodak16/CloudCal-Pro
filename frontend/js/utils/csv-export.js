
/* =========================================================
   CLOUDCALC PRO
   CSV EXPORT UTILITY
========================================================= */

(function () {

    "use strict";

    window.CloudCalcCSV = {

        export(data, filename = "cloudcalc-history.csv") {

            if (!Array.isArray(data) || data.length === 0) {
                console.warn("No data available for CSV export.");
                return false;
            }

            const headers = Object.keys(data[0]);

            const escapeCSV = (value) => {

                if (value === null || value === undefined) {
                    return "";
                }

                const text = String(value);

                return `"${text.replace(/"/g, '""')}"`;
            };

            const rows = data.map(row =>
                headers
                    .map(header => escapeCSV(row[header]))
                    .join(",")
            );

            const csv = [
                headers.map(escapeCSV).join(","),
                ...rows
            ].join("\n");

            const blob = new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

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

