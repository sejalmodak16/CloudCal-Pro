/* =========================================================
   CLOUDCALC PRO
   DASHBOARD
   Supabase Data
========================================================= */

"use strict";

let dashboardData = [];


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
   GET CURRENT USER
========================================================= */

async function getCurrentUser() {

    if (!checkSupabase()) {
        return null;
    }

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


    return data?.user || null;
}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const user =
            await getCurrentUser();


        /* -----------------------------------------
           LOGIN CHECK
        ----------------------------------------- */

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
                name;
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


        /* -----------------------------------------
           LOAD CALCULATIONS
        ----------------------------------------- */

        console.log(
            "CloudCalc Pro: Loading calculations..."
        );


        const {
            data,
            error
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
                .limit(40);


        if (error) {
            throw error;
        }


        dashboardData =
            data || [];


        console.log(
            "CloudCalc Pro: Calculations loaded:",
            dashboardData.length
        );


        updateDashboard();

    }
    catch (error) {

        console.error(
            "CloudCalc Pro Dashboard error:",
            error
        );


        const list =
            document.getElementById(
                "recentHistory"
            );


        if (list) {

            list.innerHTML = `
                <div class="empty">
                    Unable to load dashboard data.
                    <br>
                    <small>
                        ${escapeHTML(
                            error?.message ||
                            "Unknown error"
                        )}
                    </small>
                </div>
            `;
        }

    }
}


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

    const total =
        dashboardData.length;


    const totalElement =
        document.getElementById(
            "totalCalculations"
        );


    if (totalElement) {

        totalElement.textContent =
            total;
    }


    /* -----------------------------------------
       NO CALCULATIONS
    ----------------------------------------- */

    if (!total) {

        setText(
            "latestResult",
            "0"
        );

        setText(
            "averageResult",
            "0"
        );

        setText(
            "coreNumber",
            "0"
        );

        setText(
            "activityCount",
            "0 records"
        );


        renderRecent();

        renderActivity();

        return;
    }


    /* -----------------------------------------
       LATEST RESULT
    ----------------------------------------- */

    const latest =
        Number(
            dashboardData[0]?.result
        );


    setText(
        "latestResult",
        formatNumber(latest)
    );


    setText(
        "coreNumber",
        formatNumber(latest)
    );


    /* -----------------------------------------
       AVERAGE RESULT
    ----------------------------------------- */

    const numbers =
        dashboardData
            .map(
                item =>
                    Number(item.result)
            )
            .filter(
                value =>
                    Number.isFinite(value)
            );


    const average =
        numbers.length
            ? numbers.reduce(
                (sum, value) =>
                    sum + value,
                0
            ) / numbers.length
            : 0;


    setText(
        "averageResult",
        formatNumber(average)
    );


    setText(
        "activityCount",
        `${total} records`
    );


    renderRecent();

    renderActivity();
}


/* =========================================================
   RECENT HISTORY
========================================================= */

function renderRecent() {

    const container =
        document.getElementById(
            "recentHistory"
        );


    if (!container) {
        return;
    }


    /* -----------------------------------------
       EMPTY
    ----------------------------------------- */

    if (!dashboardData.length) {

        container.innerHTML = `
            <div class="empty">
                No calculations saved yet.
                <br>
                <a
                    href="calculator.html"
                    style="color:#5797ff;"
                >
                    Start calculating →
                </a>
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    dashboardData
        .slice(0, 6)
        .forEach(
            item => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "history-item";


                row.innerHTML = `

                    <div>

                        <div
                            class="history-expression"
                            title="${escapeHTML(
                                item.expression
                            )}"
                        >
                            ${escapeHTML(
                                item.expression
                            )}
                        </div>

                        <div class="history-date">
                            ${formatDate(
                                item.created_at
                            )}
                        </div>

                    </div>

                    <div class="history-operation">
                        ${escapeHTML(
                            item.operation ||
                            "calculation"
                        )}
                    </div>

                    <div class="history-result">
                        ${formatNumber(
                            item.result
                        )}
                    </div>

                `;


                container.appendChild(
                    row
                );

            }
        );
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


    /* -----------------------------------------
       EMPTY
    ----------------------------------------- */

    if (!dashboardData.length) {

        chart.innerHTML = `
            <div
                class="empty"
                style="width:100%;"
            >
                No activity yet.
            </div>
        `;

        return;
    }


    const days = {};


    dashboardData.forEach(
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


            days[date] =
                (days[date] || 0) + 1;

        }
    );


    const values =
        Object.values(days)
            .slice(-10);


    const max =
        Math.max(
            ...values,
            1
        );


    chart.innerHTML = "";


    values.forEach(
        value => {

            const bar =
                document.createElement(
                    "div"
                );


            bar.className =
                "bar";


            const height =
                Math.max(
                    12,
                    (value / max) * 100
                );


            bar.style.setProperty(
                "--height",
                `${height}%`
            );


            bar.title =
                `${value} calculation${
                    value === 1
                        ? ""
                        : "s"
                }`;


            chart.appendChild(
                bar
            );

        }
    );
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
            "CloudCalc Pro logout error:",
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

function setupMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!button || !sidebar) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        sidebar.classList.remove(
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


function formatDate(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "";
    }


    return date.toLocaleString(
        [],
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
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
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "CloudCalc Pro: Dashboard initialized."
        );


        setupMobileMenu();


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


        loadDashboard();

    }
);