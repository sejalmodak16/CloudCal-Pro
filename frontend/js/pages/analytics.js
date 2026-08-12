/* =========================================================
   CLOUDCALC PRO
   ANALYTICS
   REAL SUPABASE DATA
========================================================= */

"use strict";

let analyticsData = [];


/* =========================================================
   SUPABASE CHECK
========================================================= */

function checkSupabase() {

    if (!window.supabaseClient) {

        console.error(
            "CloudCalc Pro: Supabase client missing."
        );

        return false;
    }

    return true;
}


/* =========================================================
   LOAD ANALYTICS
========================================================= */

async function loadAnalytics() {

    if (!checkSupabase()) {
        return;
    }

    try {

        console.log(
            "CloudCalc Pro: Loading analytics..."
        );


        /* -----------------------------------------
           GET USER
        ----------------------------------------- */

        const {
            data,
            error
        } =
            await window.supabaseClient
                .auth
                .getUser();


        if (error) {
            throw error;
        }


        const user =
            data?.user;


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        /* -----------------------------------------
           USER INFORMATION
        ----------------------------------------- */

        const metadata =
            user.user_metadata || {};


        const name =
            metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "User";


        setText(
            "userName",
            name
        );


        setText(
            "userEmail",
            user.email || ""
        );


        setText(
            "userAvatar",
            name
                .charAt(0)
                .toUpperCase()
        );


        /* -----------------------------------------
           LOAD CALCULATIONS
        ----------------------------------------- */

        const {
            data: calculations,
            error: calculationError
        } =
            await window.supabaseClient
                .from("calculations")
                .select(
                    "id,user_id,expression,result,operation,created_at"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(100);


        if (calculationError) {
            throw calculationError;
        }


        analyticsData =
            calculations || [];


        console.log(
            "CloudCalc Pro: Analytics records:",
            analyticsData.length
        );


        renderAnalytics();

    }
    catch (error) {

        console.error(
            "CloudCalc Pro Analytics error:",
            error
        );


        showAnalyticsError(
            error?.message ||
            "Unable to load analytics."
        );
    }
}


/* =========================================================
   RENDER ANALYTICS
========================================================= */

function renderAnalytics() {

    const numbers =
        analyticsData
            .map(
                item =>
                    Number(item.result)
            )
            .filter(
                value =>
                    Number.isFinite(value)
            );


    const total =
        analyticsData.length;


    const average =
        numbers.length
            ? numbers.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / numbers.length
            : 0;


    const highest =
        numbers.length
            ? Math.max(...numbers)
            : 0;


    const latest =
        numbers.length
            ? Number(
                analyticsData[0].result
            )
            : 0;


    setText(
        "totalCalculations",
        total
    );


    setText(
        "averageResult",
        formatNumber(average)
    );


    setText(
        "highestResult",
        formatNumber(highest)
    );


    setText(
        "latestResult",
        formatNumber(latest)
    );


    renderActivity();

    renderOperations();

    renderInsights();
}


/* =========================================================
   ACTIVITY CHART
========================================================= */

function renderActivity() {

    const chart =
        document.getElementById(
            "activityChart"
        );


    if (!chart) {
        return;
    }


    if (!analyticsData.length) {

        chart.innerHTML = `
            <div class="empty">
                No calculation activity yet.
            </div>
        `;

        return;
    }


    const daily = {};


    analyticsData.forEach(
        item => {

            if (!item.created_at) {
                return;
            }


            const date =
                new Date(
                    item.created_at
                )
                    .toLocaleDateString(
                        "en-CA"
                    );


            daily[date] =
                (daily[date] || 0) + 1;

        }
    );


    const entries =
        Object.entries(daily)
            .sort(
                (a, b) =>
                    new Date(a[0]) -
                    new Date(b[0])
            )
            .slice(-12);


    if (!entries.length) {

        chart.innerHTML = `
            <div class="empty">
                No calculation activity yet.
            </div>
        `;

        return;
    }


    const max =
        Math.max(
            ...entries.map(
                item => item[1]
            ),
            1
        );


    chart.innerHTML = "";


    entries.forEach(
        ([date, count]) => {

            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "chart-bar";


            const height =
                Math.max(
                    8,
                    (count / max) * 100
                );


            bar.style.setProperty(
                "--height",
                `${height}%`
            );


            bar.title =
                `${date}: ${count} calculation${
                    count === 1
                        ? ""
                        : "s"
                }`;


            bar.innerHTML = `
                <span class="chart-label">
                    ${escapeHTML(
                        formatShortDate(date)
                    )}
                </span>
            `;


            chart.appendChild(
                bar
            );

        }
    );
}


/* =========================================================
   OPERATIONS
========================================================= */

function renderOperations() {

    const container =
        document.getElementById(
            "operationList"
        );


    if (!container) {
        return;
    }


    const operations = {};


    analyticsData.forEach(
        item => {

            const operation =
                item.operation ||
                detectOperation(
                    item.expression
                );


            operations[operation] =
                (operations[operation] || 0) + 1;

        }
    );


    const sorted =
        Object.entries(
            operations
        )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    if (!sorted.length) {

        container.innerHTML = `
            <div class="empty">
                No operation data yet.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    sorted.forEach(
        ([operation, count]) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "operation-row";


            row.innerHTML = `

                <div class="operation-icon">
                    ${escapeHTML(
                        operationSymbol(
                            operation
                        )
                    )}
                </div>

                <div class="operation-name">
                    ${escapeHTML(
                        operation
                    )}
                </div>

                <div class="operation-count">
                    ${count}
                </div>

            `;


            container.appendChild(
                row
            );

        }
    );
}


/* =========================================================
   INSIGHTS
========================================================= */

function renderInsights() {

    const operations = {};


    analyticsData.forEach(
        item => {

            const operation =
                item.operation ||
                detectOperation(
                    item.expression
                );


            operations[operation] =
                (operations[operation] || 0) + 1;

        }
    );


    const sorted =
        Object.entries(
            operations
        )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    setText(
        "mostUsedOperation",
        sorted.length
            ? sorted[0][0]
            : "—"
    );


    const days =
        new Set();


    analyticsData.forEach(
        item => {

            if (!item.created_at) {
                return;
            }


            days.add(
                new Date(
                    item.created_at
                )
                    .toLocaleDateString(
                        "en-CA"
                    )
            );

        }
    );


    setText(
        "activeDays",
        days.size
    );
}


/* =========================================================
   OPERATION DETECTION
========================================================= */

function detectOperation(
    expression
) {

    const value =
        String(
            expression || ""
        );


    if (value.includes("+")) {
        return "addition";
    }


    if (
        value.includes("−") ||
        value.includes("-")
    ) {
        return "subtraction";
    }


    if (
        value.includes("×") ||
        value.includes("*")
    ) {
        return "multiplication";
    }


    if (
        value.includes("÷") ||
        value.includes("/")
    ) {
        return "division";
    }


    if (value.includes("%")) {
        return "percentage";
    }


    return "basic";
}


/* =========================================================
   OPERATION SYMBOL
========================================================= */

function operationSymbol(
    operation
) {

    const value =
        String(
            operation || ""
        )
            .toLowerCase();


    if (
        value.includes("add") ||
        value === "+"
    ) {
        return "+";
    }


    if (
        value.includes("subtract") ||
        value === "-"
    ) {
        return "−";
    }


    if (
        value.includes("multip") ||
        value === "*"
    ) {
        return "×";
    }


    if (
        value.includes("div") ||
        value === "/"
    ) {
        return "÷";
    }


    if (
        value.includes("percent") ||
        value === "%"
    ) {
        return "%";
    }


    return "∑";
}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    if (!checkSupabase()) {
        return;
    }


    try {

        console.log(
            "CloudCalc Pro: Logging out..."
        );


        const {
            error
        } =
            await window.supabaseClient
                .auth
                .signOut();


        if (error) {
            throw error;
        }


        window.location.href =
            "login.html";

    }
    catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            error?.message ||
            "Unable to logout."
        );
    }
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobile() {

    const button =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (button && sidebar) {

        button.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );
    }


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        sidebar?.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );
}


/* =========================================================
   HELPERS
========================================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value;
    }
}


function formatNumber(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {
        return "0";
    }


    return number.toLocaleString(
        undefined,
        {
            maximumFractionDigits: 6
        }
    );
}


function formatShortDate(
    value
) {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return value;
    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short"
        }
    );
}


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


/* =========================================================
   ERROR DISPLAY
========================================================= */

function showAnalyticsError(
    message
) {

    const containers = [
        "activityChart",
        "operationList"
    ];


    containers.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.innerHTML = `
                    <div class="empty">
                        Unable to load analytics.
                        <br>
                        <small>
                            ${escapeHTML(
                                message
                            )}
                        </small>
                    </div>
                `;

            }

        }
    );
}


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "CloudCalc Pro: Analytics initialized."
        );


        setupMobile();


        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                logout
            );
        }


        loadAnalytics();

    }
);