
/* =========================================================
   CLOUDCALC PRO
   PDF EXPORT UTILITY
========================================================= */

(function () {

    "use strict";

    window.CloudCalcPDF = {

        async export(
            data,
            filename = "cloudcalc-history.pdf"
        ) {

            if (!Array.isArray(data) || data.length === 0) {
                console.warn("No data available for PDF export.");
                return false;
            }

            if (!window.jspdf) {

                console.error(
                    "jsPDF is not loaded."
                );

                if (window.CloudCalcToast) {

                    window.CloudCalcToast.error(
                        "PDF export library is not available."
                    );

                }

                return false;
            }

            const {
                jsPDF
            } = window.jspdf;

            const pdf = new jsPDF();

            const pageWidth =
                pdf.internal.pageSize.getWidth();

            let y = 20;


            /* =============================================
               HEADER
            ============================================== */

            pdf.setFontSize(20);

            pdf.setFont("helvetica", "bold");

            pdf.text(
                "CloudCalc Pro",
                20,
                y
            );

            y += 9;

            pdf.setFontSize(11);

            pdf.setFont("helvetica", "normal");

            pdf.text(
                "Calculation History",
                20,
                y
            );

            y += 12;


            /* =============================================
               DATE
            ============================================== */

            pdf.setFontSize(9);

            pdf.text(
                `Generated: ${new Date().toLocaleString("en-IN")}`,
                20,
                y
            );

            y += 12;


            /* =============================================
               TABLE
            ============================================== */

            const columns = [
                "Date",
                "Expression",
                "Result"
            ];

            const rows = data.map(item => [

                item.date ||
                item.created_at ||
                "—",

                item.expression ||
                item.calculation ||
                "—",

                item.result !== undefined
                    ? item.result
                    : "—"

            ]);


            if (typeof pdf.autoTable === "function") {

                pdf.autoTable({

                    startY: y,

                    head: [columns],

                    body: rows,

                    margin: {
                        left: 20,
                        right: 20
                    },

                    styles: {
                        fontSize: 9,
                        cellPadding: 3
                    },

                    headStyles: {
                        fontStyle: "bold"
                    }

                });

            } else {

                /* =========================================
                   SIMPLE FALLBACK
                ========================================== */

                pdf.setFontSize(9);

                rows.forEach(row => {

                    if (y > 275) {

                        pdf.addPage();

                        y = 20;

                    }

                    const line =
                        `${row[0]} | ${row[1]} | ${row[2]}`;

                    pdf.text(
                        String(line).substring(0, 100),
                        20,
                        y
                    );

                    y += 7;

                });

            }


            /* =============================================
               FOOTER
            ============================================== */

            const pageCount =
                pdf.internal.getNumberOfPages();

            for (
                let page = 1;
                page <= pageCount;
                page++
            ) {

                pdf.setPage(page);

                pdf.setFontSize(8);

                pdf.text(
                    `CloudCalc Pro • Page ${page} of ${pageCount}`,
                    pageWidth - 20,
                    290,
                    {
                        align: "right"
                    }
                );

            }


            pdf.save(filename);

            return true;

        }

    };

})();

