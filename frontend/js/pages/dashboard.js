
/* =========================================================
   CLOUDCALC PRO
   DASHBOARD
   Supabase History Data + CloudCalc AI
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
    } = await window.supabaseClient.auth.getUser();

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

        const user = await getCurrentUser();


        /* -----------------------------------------
           LOGIN CHECK
        ----------------------------------------- */

        if (!user) {

            window.location.href = "login.html";

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
            document.getElementById("userName");

        const userEmail =
            document.getElementById("userEmail");

        const userAvatar =
            document.getElementById("userAvatar");


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


        /* -----------------------------------------
           LOAD HISTORY
        ----------------------------------------- */

        console.log(
            "CloudCalc Pro: Loading history..."
        );


        const {
            data,
            error
        } = await window.supabaseClient
            .from("history")
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
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "CloudCalc Pro: History loaded:",
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


    /* -----------------------------------------
       TOTAL CALCULATIONS
    ----------------------------------------- */

    setText(
        "totalCalculations",
        total
    );


    /* -----------------------------------------
       NO CALCULATIONS
    ----------------------------------------- */

    if (total === 0) {

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

    const latestResult =
        Number(
            dashboardData[0]?.result
        );


    setText(
        "latestResult",
        formatNumber(latestResult)
    );


    setText(
        "coreNumber",
        formatNumber(latestResult)
    );


    /* -----------------------------------------
       NUMERIC RESULTS
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


    /* -----------------------------------------
       AVERAGE RESULT
    ----------------------------------------- */

    const average =
        numbers.length > 0
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


    /* -----------------------------------------
       ACTIVITY
    ----------------------------------------- */

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
       EMPTY HISTORY
    ----------------------------------------- */

    if (dashboardData.length === 0) {

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


    /* -----------------------------------------
       SHOW LATEST 6
    ----------------------------------------- */

    dashboardData
        .slice(0, 6)
        .forEach(item => {

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
                        detectOperation(
                            item.expression
                        )
                    )}
                </div>

                <div class="history-result">
                    ${formatNumber(
                        item.result
                    )}
                </div>

            `;


            container.appendChild(row);

        });
}


/* =========================================================
   DETECT OPERATION
========================================================= */

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

    if (dashboardData.length === 0) {

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


    /* -----------------------------------------
       GROUP BY DAY
    ----------------------------------------- */

    const days = {};


    dashboardData.forEach(item => {

        if (!item.created_at) {
            return;
        }


        const date =
            new Date(
                item.created_at
            ).toLocaleDateString(
                "en-CA"
            );


        days[date] =
            (days[date] || 0) + 1;

    });


    const values =
        Object.values(days)
            .slice(-10);


    const max =
        Math.max(
            ...values,
            1
        );


    chart.innerHTML = "";


    values.forEach(value => {

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


        chart.appendChild(bar);

    });
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
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.addEventListener(
                "click",
                function () {

                    sidebar.classList.remove(
                        "open"
                    );

                }
            );

        });
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


/* =========================================================
   FORMAT NUMBER
========================================================= */

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


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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


/* =========================================================
   ESCAPE HTML
========================================================= */

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
   CLOUDCALC AI
========================================================= */

function initializeCloudCalcAI() {

    const questionInput =
        document.getElementById(
            "aiQuestion"
        );

    const askButton =
        document.getElementById(
            "askAiButton"
        );

    const responseBox =
        document.getElementById(
            "aiResponse"
        );

    const responseText =
        document.getElementById(
            "aiResponseText"
        );


    /* -----------------------------------------
       CHECK AI ELEMENTS
    ----------------------------------------- */

    if (
        !questionInput ||
        !askButton ||
        !responseBox ||
        !responseText
    ) {

        console.warn(
            "CloudCalc AI elements not found."
        );

        return;
    }


    /* -----------------------------------------
       ASK AI
    ----------------------------------------- */

    async function askAI() {

        const question =
            questionInput.value.trim();


        /* -------------------------------------
           EMPTY QUESTION
        ------------------------------------- */

        if (!question) {

            responseBox.classList.add(
                "visible",
                "ai-error"
            );

            responseText.textContent =
                "Please enter a question first.";

            return;
        }


        /* -------------------------------------
           LOADING STATE
        ------------------------------------- */

        askButton.disabled = true;

        askButton.textContent =
            "Thinking...";


        responseBox.classList.add(
            "visible"
        );

        responseBox.classList.remove(
            "ai-error"
        );


        responseText.textContent =
            "CloudCalc AI is analyzing your question...";


        /* -------------------------------------
           CALL GROQ THROUGH BACKEND
        ------------------------------------- */

        try {

            const data =
                await askCloudCalcAI(
                    question
                );


            responseText.textContent =
                data.answer ||
                "No response received.";

        }
        catch (error) {

            console.error(
                "CloudCalc AI Error:",
                error
            );


            responseBox.classList.add(
                "ai-error"
            );


            responseText.textContent =
                error?.message ||
                "Unable to connect to CloudCalc AI.";

        }
        finally {

            askButton.disabled = false;

            askButton.textContent =
                "Ask CloudCalc AI";

        }
    }


    /* -----------------------------------------
       BUTTON CLICK
    ----------------------------------------- */

    askButton.addEventListener(
        "click",
        askAI
    );


    /* -----------------------------------------
       ENTER KEY
       Shift + Enter = New Line
    ----------------------------------------- */

    questionInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                askAI();

            }

        }
    );

}


/* =========================================================
   START DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

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


        /* -----------------------------------------
           INITIALIZE AI
        ----------------------------------------- */

        initializeCloudCalcAI();

    }
);
