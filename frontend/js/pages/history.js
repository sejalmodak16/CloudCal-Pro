
/* =========================================================
   CLOUDCALC PRO
   HISTORY PAGE
   FastAPI Backend + Supabase Authentication
   View + Delete + PDF + CSV
========================================================= */

"use strict";


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "CloudCalc Pro: History initialized."
        );


        /* =====================================================
           ELEMENTS
        ===================================================== */

        const historyList =
            document.getElementById("historyList");

        const toast =
            document.getElementById("toast");

        const mobileMenu =
            document.getElementById("mobileMenu");

        const sidebar =
            document.getElementById("sidebar");

        const logoutBtn =
            document.getElementById("logoutBtn");

        const downloadPdfBtn =
            document.getElementById("downloadPdfBtn");

        const downloadCsvBtn =
            document.getElementById("downloadCsvBtn");


        /* =====================================================
           BACKEND CONFIGURATION
        ===================================================== */

        const API_BASE_URL =
            "http://127.0.0.1:8000";


        /* =====================================================
           HISTORY STATE
        ===================================================== */

        let currentHistory = [];


        /* =====================================================
           TOAST
        ===================================================== */

        function showToast(message) {

            if (!toast) {

                console.log(
                    "Toast:",
                    message
                );

                return;
            }


            toast.textContent =
                message;

            toast.classList.add(
                "show"
            );


            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                2500
            );
        }


        /* =====================================================
           HTML ESCAPE
        ===================================================== */

        function escapeHTML(value) {

            return String(
                value ?? ""
            )
                .replace(
                    /&/g,
                    "&amp;"
                )
                .replace(
                    /</g,
                    "&lt;"
                )
                .replace(
                    />/g,
                    "&gt;"
                )
                .replace(
                    /"/g,
                    "&quot;"
                )
                .replace(
                    /'/g,
                    "&#039;"
                );
        }


        /* =====================================================
           GET SUPABASE SESSION
        ===================================================== */

        async function getSession() {

            if (!window.supabaseClient) {

                throw new Error(
                    "Supabase client is not available."
                );
            }


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .auth
                    .getSession();


            if (error) {
                throw error;
            }


            const session =
                data?.session;


            if (
                !session ||
                !session.user
            ) {

                console.warn(
                    "CloudCalc Pro: No active login session."
                );

                return null;
            }


            return session;
        }


        /* =====================================================
           LOAD HISTORY
        ===================================================== */

        async function loadHistory() {

            if (!historyList) {

                console.warn(
                    "CloudCalc Pro: historyList element not found."
                );

                return;
            }


            try {

                historyList.innerHTML = `
                    <div class="loading-state">
                        Loading calculation history...
                    </div>
                `;


                /* -------------------------------------------------
                   GET SESSION
                ------------------------------------------------- */

                const session =
                    await getSession();


                /* -------------------------------------------------
                   NO LOGIN
                ------------------------------------------------- */

                if (!session) {

                    currentHistory = [];


                    historyList.innerHTML = `
                        <div class="empty-state">
                            <div>
                                Please login to view your calculation history.
                            </div>
                        </div>
                    `;

                    return;
                }


                /* -------------------------------------------------
                   USER DATA
                ------------------------------------------------- */

                const userId =
                    session.user.id;

                const accessToken =
                    session.access_token;


                if (!userId) {

                    throw new Error(
                        "User ID not found."
                    );
                }


                if (!accessToken) {

                    throw new Error(
                        "Authentication token not found."
                    );
                }


                console.log(
                    "CloudCalc Pro: Loading history for:",
                    session.user.email
                );


                /* -------------------------------------------------
                   GET HISTORY FROM FASTAPI
                ------------------------------------------------- */

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/history?user_id=${encodeURIComponent(userId)}`,
                        {
                            method: "GET",

                            headers: {

                                "Authorization":
                                    `Bearer ${accessToken}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                /* -------------------------------------------------
                   READ RESPONSE
                ------------------------------------------------- */

                let responseData = {};


                try {

                    responseData =
                        await response.json();

                }
                catch (error) {

                    throw new Error(
                        "Invalid response from backend."
                    );
                }


                /* -------------------------------------------------
                   API ERROR
                ------------------------------------------------- */

                if (!response.ok) {

                    console.error(
                        "CloudCalc Pro: History API error:",
                        responseData
                    );


                    if (
                        response.status === 401
                    ) {

                        throw new Error(
                            "Your session has expired. Please login again."
                        );
                    }


                    throw new Error(
                        responseData?.detail ||
                        responseData?.message ||
                        "Unable to load history."
                    );
                }


                /* -------------------------------------------------
                   GET HISTORY ARRAY
                ------------------------------------------------- */

                const history =
                    Array.isArray(responseData)
                        ? responseData
                        : responseData?.history ||
                          responseData?.data ||
                          [];


                currentHistory =
                    Array.isArray(history)
                        ? history
                        : [];


                console.log(
                    "CloudCalc Pro: History received:",
                    currentHistory
                );


                /* -------------------------------------------------
                   EMPTY HISTORY
                ------------------------------------------------- */

                if (
                    currentHistory.length === 0
                ) {

                    historyList.innerHTML = `
                        <div class="empty-state">
                            <div>
                                No calculations found.<br>
                                Your saved calculations will appear here.
                            </div>
                        </div>
                    `;

                    return;
                }


                /* -------------------------------------------------
                   RENDER
                ------------------------------------------------- */

                renderHistory(
                    currentHistory
                );

            }

            catch (error) {

                console.error(
                    "CloudCalc Pro: History loading error:",
                    error
                );


                if (historyList) {

                    historyList.innerHTML = `
                        <div class="empty-state">
                            ${escapeHTML(
                                error.message ||
                                "Unable to load calculation history."
                            )}
                        </div>
                    `;
                }
            }
        }


        /* =====================================================
           RENDER HISTORY
        ===================================================== */

        function renderHistory(history) {

            if (!historyList) {
                return;
            }


            historyList.innerHTML =
                "";


            history.forEach(
                item => {

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "history-row";


                    const expression =
                        item.expression ||
                        "Unknown";


                    const result =
                        item.result ??
                        "0";


                    const operation =
                        item.operation ||
                        "calculation";


                    const date =
                        item.created_at
                            ? new Date(
                                item.created_at
                            ).toLocaleString()
                            : "";


                    row.innerHTML = `

                        <div class="history-expression">

                            <strong>
                                ${escapeHTML(
                                    expression
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    date
                                )}
                            </small>

                        </div>


                        <div class="history-result">

                            = ${escapeHTML(
                                result
                            )}

                        </div>


                        <div class="history-operation">

                            ${escapeHTML(
                                operation
                            )}

                        </div>


                        <div>

                            <button
                                type="button"
                                class="delete-history"
                                data-id="${escapeHTML(
                                    item.id
                                )}"
                            >
                                Delete
                            </button>

                        </div>

                    `;


                    historyList.appendChild(
                        row
                    );
                }
            );


            /* -------------------------------------------------
               DELETE BUTTON EVENTS
            ------------------------------------------------- */

            document
                .querySelectorAll(
                    ".delete-history"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            function () {

                                deleteHistory(
                                    this.dataset.id
                                );

                            }
                        );

                    }
                );
        }


        /* =====================================================
           DELETE HISTORY
        ===================================================== */

        async function deleteHistory(id) {

            if (!id) {

                showToast(
                    "History ID not found."
                );

                return;
            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete this calculation?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const session =
                    await getSession();


                /* -------------------------------------------------
                   NO LOGIN
                ------------------------------------------------- */

                if (!session) {

                    showToast(
                        "Please login to delete calculations."
                    );

                    return;
                }


                /* -------------------------------------------------
                   DELETE REQUEST
                ------------------------------------------------- */

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/history/${encodeURIComponent(id)}`,
                        {
                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    `Bearer ${session.access_token}`,

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                /* -------------------------------------------------
                   RESPONSE
                ------------------------------------------------- */

                let responseData = {};


                try {

                    responseData =
                        await response.json();

                }
                catch (error) {

                    responseData = {};
                }


                /* -------------------------------------------------
                   ERROR
                ------------------------------------------------- */

                if (!response.ok) {

                    throw new Error(
                        responseData?.detail ||
                        responseData?.message ||
                        "Unable to delete calculation."
                    );
                }


                /* -------------------------------------------------
                   SUCCESS
                ------------------------------------------------- */

                showToast(
                    "Calculation deleted successfully."
                );


                await loadHistory();

            }

            catch (error) {

                console.error(
                    "CloudCalc Pro: Delete error:",
                    error
                );


                showToast(
                    error.message ||
                    "Unable to delete calculation."
                );
            }
        }


        /* =====================================================
           PDF DOWNLOAD
        ===================================================== */

        function downloadPDF() {

            if (
                currentHistory.length === 0
            ) {

                showToast(
                    "No history available for PDF."
                );

                return;
            }


            if (!window.jspdf) {

                console.error(
                    "CloudCalc Pro: jsPDF library missing."
                );

                showToast(
                    "PDF library could not be loaded."
                );

                return;
            }


            try {

                const {
                    jsPDF
                } =
                    window.jspdf;


                const doc =
                    new jsPDF();


                /* -------------------------------------------------
                   TITLE
                ------------------------------------------------- */

                doc.setFontSize(
                    20
                );

                doc.text(
                    "CloudCalc Pro",
                    20,
                    20
                );


                doc.setFontSize(
                    12
                );

                doc.text(
                    "Calculation History",
                    20,
                    30
                );


                doc.setFontSize(
                    9
                );

                doc.text(
                    `Generated: ${new Date().toLocaleString()}`,
                    20,
                    38
                );


                /* -------------------------------------------------
                   TABLE HEADER
                ------------------------------------------------- */

                let y = 52;


                doc.setFontSize(
                    10
                );


                doc.text(
                    "Expression",
                    20,
                    y
                );


                doc.text(
                    "Result",
                    85,
                    y
                );


                doc.text(
                    "Operation",
                    125,
                    y
                );


                doc.text(
                    "Date",
                    160,
                    y
                );


                y += 8;


                /* -------------------------------------------------
                   HISTORY ROWS
                ------------------------------------------------- */

                currentHistory.forEach(
                    item => {

                        if (y > 275) {

                            doc.addPage();

                            y = 20;
                        }


                        const expression =
                            String(
                                item.expression ||
                                ""
                            ).substring(
                                0,
                                30
                            );


                        const result =
                            String(
                                item.result ??
                                ""
                            ).substring(
                                0,
                                18
                            );


                        const operation =
                            String(
                                item.operation ||
                                "calculation"
                            ).substring(
                                0,
                                15
                            );


                        const date =
                            item.created_at
                                ? new Date(
                                    item.created_at
                                ).toLocaleDateString()
                                : "";


                        doc.text(
                            expression,
                            20,
                            y
                        );


                        doc.text(
                            result,
                            85,
                            y
                        );


                        doc.text(
                            operation,
                            125,
                            y
                        );


                        doc.text(
                            date,
                            160,
                            y
                        );


                        y += 8;

                    }
                );


                /* -------------------------------------------------
                   SAVE PDF
                ------------------------------------------------- */

                doc.save(
                    "CloudCalc-Pro-History.pdf"
                );


                showToast(
                    "PDF downloaded successfully."
                );

            }

            catch (error) {

                console.error(
                    "CloudCalc Pro: PDF download error:",
                    error
                );


                showToast(
                    "Unable to create PDF."
                );
            }
        }


        /* =====================================================
           CSV DOWNLOAD
        ===================================================== */

        function downloadCSV() {

            if (
                currentHistory.length === 0
            ) {

                showToast(
                    "No history available for CSV."
                );

                return;
            }


            try {

                /* -------------------------------------------------
                   CSV HEADER
                ------------------------------------------------- */

                const rows = [

                    [
                        "ID",
                        "Expression",
                        "Result",
                        "Operation",
                        "Date"
                    ]

                ];


                /* -------------------------------------------------
                   CSV DATA
                ------------------------------------------------- */

                currentHistory.forEach(
                    item => {

                        rows.push([

                            item.id ?? "",

                            item.expression ?? "",

                            item.result ?? "",

                            item.operation ||
                                "calculation",

                            item.created_at
                                ? new Date(
                                    item.created_at
                                ).toLocaleString()
                                : ""

                        ]);

                    }
                );


                /* -------------------------------------------------
                   ESCAPE CSV VALUES
                ------------------------------------------------- */

                const csv =
                    rows
                        .map(
                            row =>
                                row
                                    .map(
                                        value =>
                                            `"${String(
                                                value
                                            ).replace(
                                                /"/g,
                                                '""'
                                            )}"`
                                    )
                                    .join(",")
                        )
                        .join("\n");


                /* -------------------------------------------------
                   CREATE FILE
                ------------------------------------------------- */

                const blob =
                    new Blob(
                        [csv],
                        {
                            type:
                                "text/csv;charset=utf-8;"
                        }
                    );


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    "CloudCalc-Pro-History.csv";


                document.body.appendChild(
                    link
                );


                link.click();


                document.body.removeChild(
                    link
                );


                URL.revokeObjectURL(
                    url
                );


                showToast(
                    "CSV downloaded successfully."
                );

            }

            catch (error) {

                console.error(
                    "CloudCalc Pro: CSV download error:",
                    error
                );


                showToast(
                    "Unable to create CSV."
                );
            }
        }


        /* =====================================================
           PDF BUTTON
        ===================================================== */

        if (downloadPdfBtn) {

            downloadPdfBtn.addEventListener(
                "click",
                downloadPDF
            );
        }


        /* =====================================================
           CSV BUTTON
        ===================================================== */

        if (downloadCsvBtn) {

            downloadCsvBtn.addEventListener(
                "click",
                downloadCSV
            );
        }


        /* =====================================================
           LOAD USER
        ===================================================== */

        async function loadUser() {

            try {

                const session =
                    await getSession();


                /* -------------------------------------------------
                   NO LOGIN
                ------------------------------------------------- */

                if (!session) {

                    const userName =
                        document.getElementById(
                            "userName"
                        );

                    const userEmail =
                        document.getElementById(
                            "userEmail"
                        );

                    const userAvatar =
                        document.getElementById(
                            "userAvatar"
                        );


                    if (userName) {

                        userName.textContent =
                            "Guest";
                    }


                    if (userEmail) {

                        userEmail.textContent =
                            "Please login";
                    }


                    if (userAvatar) {

                        userAvatar.textContent =
                            "G";
                    }


                    return;
                }


                /* -------------------------------------------------
                   USER
                ------------------------------------------------- */

                const user =
                    session.user;


                const metadata =
                    user.user_metadata || {};


                const name =
                    metadata.full_name ||
                    metadata.name ||
                    user.email?.split("@")[0] ||
                    "User";


                const userName =
                    document.getElementById(
                        "userName"
                    );


                if (userName) {

                    userName.textContent =
                        name;
                }


                const userEmail =
                    document.getElementById(
                        "userEmail"
                    );


                if (userEmail) {

                    userEmail.textContent =
                        user.email || "";
                }


                const userAvatar =
                    document.getElementById(
                        "userAvatar"
                    );


                if (userAvatar) {

                    userAvatar.textContent =
                        name
                            .charAt(0)
                            .toUpperCase();
                }


                console.log(
                    "CloudCalc Pro: User loaded successfully:",
                    user.email
                );

            }

            catch (error) {

                console.error(
                    "CloudCalc Pro: User loading error:",
                    error
                );
            }
        }


        /* =====================================================
           LOGOUT
        ===================================================== */

        async function logout() {

            try {

                if (!window.supabaseClient) {

                    window.location.href =
                        "login.html";

                    return;
                }


                const {
                    error
                } =
                    await window.supabaseClient
                        .auth
                        .signOut();


                if (error) {
                    throw error;
                }


                console.log(
                    "CloudCalc Pro: User logged out."
                );


                window.location.href =
                    "login.html";

            }

            catch (error) {

                console.error(
                    "CloudCalc Pro: Logout error:",
                    error
                );


                showToast(
                    "Unable to logout."
                );
            }
        }


        /* =====================================================
           LOGOUT BUTTON
        ===================================================== */

        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logout
            );
        }


        /* =====================================================
           MOBILE MENU
        ===================================================== */

        if (
            mobileMenu &&
            sidebar
        ) {

            mobileMenu.addEventListener(
                "click",
                function () {

                    sidebar.classList.toggle(
                        "open"
                    );

                }
            );
        }


        /* =====================================================
           START PAGE
        ===================================================== */

        await loadUser();

        await loadHistory();

    }
);