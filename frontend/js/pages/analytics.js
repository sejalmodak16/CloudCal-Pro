/* =========================================================
   CLOUDCALC PRO
   ANALYTICS PAGE
   Backend History API + Supabase Session
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", async function () {

    console.log("CloudCalc Pro: Analytics initialized.");

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const API_BASE_URL = "http://localhost:5000";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const totalCalculations =
        document.getElementById("totalCalculations");

    const averageResult =
        document.getElementById("averageResult");

    const highestResult =
        document.getElementById("highestResult");

    const latestResult =
        document.getElementById("latestResult");

    const activityChart =
        document.getElementById("activityChart");

    const operationList =
        document.getElementById("operationList");

    const mostUsedOperation =
        document.getElementById("mostUsedOperation");

    const activeDays =
        document.getElementById("activeDays");

    const userName =
        document.getElementById("userName");

    const userEmail =
        document.getElementById("userEmail");

    const userAvatar =
        document.getElementById("userAvatar");

    const logoutBtn =
        document.getElementById("logoutBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const sidebar =
        document.getElementById("sidebar");


    let historyData = [];


    /* =====================================================
       GET SESSION
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
            await window.supabaseClient.auth.getSession();


        if (error) {
            throw error;
        }


        const session =
            data?.session;


        if (!session || !session.user) {

            window.location.href =
                "login.html";

            return null;
        }


        return session;
    }


    /* =====================================================
       LOAD USER
    ===================================================== */

    function loadUser(session) {

        const user =
            session.user;


        const metadata =
            user.user_metadata || {};


        const name =
            metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "User";


        if (userName) {
            userName.textContent = name;
        }


        if (userEmail) {
            userEmail.textContent =
                user.email || "";
        }


        if (userAvatar) {

            userAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();
        }


        console.log(
            "CloudCalc Pro: Analytics user:",
            user.email
        );
    }


    /* =====================================================
       LOAD HISTORY FROM BACKEND
    ===================================================== */

    async function loadHistory() {

        const session =
            await getSession();


        if (!session) {
            return;
        }


        loadUser(session);


        const user =
            session.user;


        const userId =
            user.id;


        const accessToken =
            session.access_token;


        if (!userId) {

            throw new Error(
                "User ID not found."
            );
        }


        if (!accessToken) {

            throw new Error(
                "Authentication session expired."
            );
        }


        console.log(
            "CloudCalc Pro: Loading analytics history..."
        );


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


        let responseData;


        try {

            responseData =
                await response.json();

        }
        catch {

            throw new Error(
                "Invalid response from backend."
            );
        }


        if (!response.ok) {

            console.error(
                "Analytics API error:",
                responseData
            );

            throw new Error(
                responseData?.message ||
                `Analytics API failed: ${response.status}`
            );
        }


        historyData =
            Array.isArray(responseData)
                ? responseData
                : responseData?.data ||
                  responseData?.history ||
                  [];


        if (!Array.isArray(historyData)) {
            historyData = [];
        }


        console.log(
            "CloudCalc Pro: Analytics data:",
            historyData
        );


        updateAnalytics();
    }


    /* =====================================================
       UPDATE ALL ANALYTICS
    ===================================================== */

    function updateAnalytics() {

        updateKPIs();

        updateOperations();

        updateActivityChart();

        updateInsights();
    }


    /* =====================================================
       KPI STATISTICS
    ===================================================== */

    function updateKPIs() {

        const total =
            historyData.length;


        /* ---------------------------------------------
           TOTAL
        --------------------------------------------- */

        if (totalCalculations) {

            totalCalculations.textContent =
                total;
        }


        /* ---------------------------------------------
           NUMERIC RESULTS
        --------------------------------------------- */

        const numericResults =
            historyData
                .map(item =>
                    Number(item.result)
                )
                .filter(value =>
                    Number.isFinite(value)
                );


        /* ---------------------------------------------
           AVERAGE
        --------------------------------------------- */

        if (averageResult) {

            if (numericResults.length === 0) {

                averageResult.textContent =
                    "0";

            }
            else {

                const sum =
                    numericResults.reduce(
                        (a, b) => a + b,
                        0
                    );


                const average =
                    sum /
                    numericResults.length;


                averageResult.textContent =
                    formatNumber(average);
            }
        }


        /* ---------------------------------------------
           HIGHEST
        --------------------------------------------- */

        if (highestResult) {

            if (numericResults.length === 0) {

                highestResult.textContent =
                    "0";

            }
            else {

                highestResult.textContent =
                    formatNumber(
                        Math.max(
                            ...numericResults
                        )
                    );
            }
        }


        /* ---------------------------------------------
           LATEST
        --------------------------------------------- */

        if (latestResult) {

            if (historyData.length === 0) {

                latestResult.textContent =
                    "0";

            }
            else {

                latestResult.textContent =
                    String(
                        historyData[0].result ??
                        "0"
                    );
            }
        }
    }


    /* =====================================================
       FORMAT NUMBER
    ===================================================== */

    function formatNumber(value) {

        if (!Number.isFinite(value)) {
            return "0";
        }


        return Number(
            value.toFixed(2)
        ).toString();
    }


    /* =====================================================
       OPERATIONS
    ===================================================== */

    function updateOperations() {

        if (!operationList) {
            return;
        }


        operationList.innerHTML = "";


        if (historyData.length === 0) {

            operationList.innerHTML = `
                <div
                    style="
                        color:#637696;
                        font-size:10px;
                    "
                >
                    No calculations yet.
                </div>
            `;

            return;
        }


        const operationCounts = {};


        historyData.forEach(item => {

            const operation =
                item.operation ||
                detectOperation(
                    item.expression
                );


            const normalized =
                String(operation)
                    .toLowerCase();


            operationCounts[normalized] =
                (operationCounts[normalized] || 0) + 1;

        });


        const operations =
            Object.entries(
                operationCounts
            )
            .sort(
                (a, b) => b[1] - a[1]
            );


        operations.forEach(
            ([operation, count]) => {

                const row =
                    document.createElement("div");


                row.className =
                    "operation-row";


                row.innerHTML = `

                    <div class="operation-icon">
                        ${getOperationIcon(operation)}
                    </div>

                    <div class="operation-name">
                        ${escapeHTML(
                            capitalize(operation)
                        )}
                    </div>

                    <div class="operation-count">
                        ${count}
                    </div>

                `;


                operationList.appendChild(row);
            }
        );
    }


    /* =====================================================
       DETECT OPERATION
    ===================================================== */

    function detectOperation(expression) {

        const value =
            String(expression || "");


        if (value.includes("+")) {
            return "addition";
        }


        if (value.includes("-")) {
            return "subtraction";
        }


        if (
            value.includes("*") ||
            value.includes("×")
        ) {
            return "multiplication";
        }


        if (
            value.includes("/") ||
            value.includes("÷")
        ) {
            return "division";
        }


        if (value.includes("%")) {
            return "percentage";
        }


        return "calculation";
    }


    /* =====================================================
       OPERATION ICON
    ===================================================== */

    function getOperationIcon(operation) {

        switch (operation) {

            case "addition":
            case "add":
                return "+";

            case "subtraction":
            case "subtract":
                return "−";

            case "multiplication":
            case "multiply":
                return "×";

            case "division":
            case "divide":
                return "÷";

            case "percentage":
            case "percent":
                return "%";

            default:
                return "∑";
        }
    }


    /* =====================================================
       ACTIVITY CHART
    ===================================================== */

    function updateActivityChart() {

        if (!activityChart) {
            return;
        }


        activityChart.innerHTML = "";


        if (historyData.length === 0) {

            activityChart.innerHTML = `
                <div
                    style="
                        width:100%;
                        text-align:center;
                        color:#637696;
                        font-size:11px;
                    "
                >
                    No calculation activity yet.
                </div>
            `;

            return;
        }


        /* ---------------------------------------------
           LAST 7 DAYS
        --------------------------------------------- */

        const days = [];


        for (let i = 6; i >= 0; i--) {

            const date =
                new Date();


            date.setHours(
                0,
                0,
                0,
                0
            );


            date.setDate(
                date.getDate() - i
            );


            days.push(date);
        }


        const counts =
            days.map(day => {

                return historyData.filter(
                    item => {

                        if (!item.created_at) {
                            return false;
                        }


                        const itemDate =
                            new Date(
                                item.created_at
                            );


                        return (
                            itemDate.getFullYear() ===
                                day.getFullYear() &&

                            itemDate.getMonth() ===
                                day.getMonth() &&

                            itemDate.getDate() ===
                                day.getDate()
                        );

                    }
                ).length;

            });


        const max =
            Math.max(
                ...counts,
                1
            );


        days.forEach(
            (day, index) => {

                const bar =
                    document.createElement("div");


                bar.className =
                    "chart-bar";


                const percentage =
                    counts[index] === 0
                        ? 8
                        : Math.max(
                            8,
                            (
                                counts[index] /
                                max
                            ) * 100
                        );


                bar.style.setProperty(
                    "--height",
                    `${percentage}%`
                );


                const label =
                    document.createElement("div");


                label.className =
                    "chart-label";


                label.textContent =
                    day.toLocaleDateString(
                        undefined,
                        {
                            weekday: "short"
                        }
                    );


                bar.appendChild(label);


                activityChart.appendChild(bar);

            }
        );
    }


    /* =====================================================
       INSIGHTS
    ===================================================== */

    function updateInsights() {

        /* ---------------------------------------------
           MOST USED OPERATION
        --------------------------------------------- */

        if (mostUsedOperation) {

            const counts = {};


            historyData.forEach(item => {

                const operation =
                    String(
                        item.operation ||
                        detectOperation(
                            item.expression
                        )
                    ).toLowerCase();


                counts[operation] =
                    (counts[operation] || 0) + 1;

            });


            const sorted =
                Object.entries(counts)
                    .sort(
                        (a, b) =>
                            b[1] - a[1]
                    );


            mostUsedOperation.textContent =
                sorted.length
                    ? capitalize(
                        sorted[0][0]
                    )
                    : "—";
        }


        /* ---------------------------------------------
           ACTIVE DAYS
        --------------------------------------------- */

        if (activeDays) {

            const uniqueDays =
                new Set();


            historyData.forEach(item => {

                if (!item.created_at) {
                    return;
                }


                const date =
                    new Date(
                        item.created_at
                    );


                const day =
                    date.toISOString()
                        .split("T")[0];


                uniqueDays.add(day);

            });


            activeDays.textContent =
                uniqueDays.size;
        }
    }


    /* =====================================================
       CAPITALIZE
    ===================================================== */

    function capitalize(value) {

        return String(value)
            .charAt(0)
            .toUpperCase() +
            String(value)
                .slice(1);
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
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
                await window.supabaseClient.auth.signOut();


            if (error) {
                throw error;
            }


            window.location.href =
                "login.html";

        }
        catch (error) {

            console.error(
                "CloudCalc Pro: Logout error:",
                error
            );
        }
    }


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            logout
        );
    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (mobileMenu && sidebar) {

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
       START ANALYTICS
    ===================================================== */

    try {

        await loadHistory();

        console.log(
            "CloudCalc Pro: Analytics loaded successfully."
        );

    }
    catch (error) {

        console.error(
            "CloudCalc Pro: Analytics loading error:",
            error
        );


        if (activityChart) {

            activityChart.innerHTML = `
                <div
                    style="
                        width:100%;
                        text-align:center;
                        color:#ff7b8b;
                        font-size:11px;
                    "
                >
                    Unable to load analytics.
                </div>
            `;
        }


        if (operationList) {

            operationList.innerHTML = `
                <div
                    style="
                        color:#ff7b8b;
                        font-size:10px;
                    "
                >
                    ${escapeHTML(
                        error.message ||
                        "Analytics loading failed."
                    )}
                </div>
            `;
        }

    }

});