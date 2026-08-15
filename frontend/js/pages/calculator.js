/* =========================================================
   CLOUDCALC PRO
   CALCULATOR PAGE
   Backend API + Supabase Authentication + History
========================================================= */

"use strict";

let currentExpression = "";
let lastResult = "";
let toastTimer = null;


/* =========================================================
   BACKEND CONFIGURATION
========================================================= */

const API_BASE_URL = "http://localhost:5000";


/* =========================================================
   ELEMENTS
========================================================= */

const expressionElement = document.getElementById("expression");
const resultElement = document.getElementById("result");
const loginButton = document.getElementById("loginButton");
const logoutBtn = document.getElementById("logoutBtn");
const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.getElementById("sidebar");
const toast = document.getElementById("toast");


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    if (!toast) {
        console.log("Toast:", message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

    if (expressionElement) {
        expressionElement.textContent =
            currentExpression || "0";
    }

    if (resultElement) {
        resultElement.textContent =
            lastResult || "0";
    }
}


/* =========================================================
   ADD VALUE
========================================================= */

function addValue(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return;
    }

    currentExpression += value;

    updateDisplay();
}


/* =========================================================
   CLEAR
========================================================= */

function clearCalculator() {

    currentExpression = "";
    lastResult = "";

    updateDisplay();
}


/* =========================================================
   DELETE LAST CHARACTER
========================================================= */

function deleteLast() {

    currentExpression =
        currentExpression.slice(0, -1);

    updateDisplay();
}


/* =========================================================
   CALCULATE
========================================================= */

async function calculate() {

    if (!currentExpression.trim()) {

        showToast(
            "Enter a calculation first."
        );

        return;
    }

    try {

        /* ---------------------------------------------
           NORMALIZE EXPRESSION
        --------------------------------------------- */

        const expression =
            currentExpression
                .replace(/×/g, "*")
                .replace(/÷/g, "/");


        /* ---------------------------------------------
           SECURITY VALIDATION
        --------------------------------------------- */

        if (
            !/^[0-9+\-*/%.()\s]+$/.test(
                expression
            )
        ) {

            throw new Error(
                "Invalid expression."
            );
        }


        /* ---------------------------------------------
           CALCULATE RESULT
        --------------------------------------------- */

        const result =
            Function(
                `"use strict"; return (${expression})`
            )();


        /* ---------------------------------------------
           RESULT VALIDATION
        --------------------------------------------- */

        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {

            throw new Error(
                "Invalid result."
            );
        }


        /* ---------------------------------------------
           FORMAT RESULT
        --------------------------------------------- */

        lastResult =
            Number(
                result.toFixed(10)
            ).toString();

        updateDisplay();


        /* ---------------------------------------------
           SAVE TO BACKEND
        --------------------------------------------- */

        await saveCalculation(
            currentExpression,
            lastResult
        );

    }

    catch (error) {

        console.error(
            "CloudCalc Pro calculation error:",
            error
        );

        lastResult = "Error";

        updateDisplay();

        showToast(
            "Invalid calculation."
        );
    }
}


/* =========================================================
   SAVE CALCULATION
   BACKEND API
========================================================= */

async function saveCalculation(
    expression,
    result
) {

    /* ---------------------------------------------
       SUPABASE CHECK
    --------------------------------------------- */

    if (!window.supabaseClient) {

        console.error(
            "CloudCalc Pro: Supabase client unavailable."
        );

        showToast(
            "Supabase connection unavailable."
        );

        return;
    }


    try {

        /* ---------------------------------------------
           GET CURRENT SESSION
        --------------------------------------------- */

        const {
            data: sessionData,
            error: sessionError
        } =
            await window.supabaseClient.auth.getSession();


        if (sessionError) {
            throw sessionError;
        }


        const session =
            sessionData?.session;


        /* ---------------------------------------------
           CHECK LOGIN
        --------------------------------------------- */

        if (
            !session ||
            !session.user
        ) {

            console.warn(
                "CloudCalc Pro: No active session."
            );

            showToast(
                "Please login to save calculations."
            );

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1000);

            return;
        }


        /* ---------------------------------------------
           GET AUTH DATA
        --------------------------------------------- */

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


        /* ---------------------------------------------
           DEBUG
        --------------------------------------------- */

        console.log(
            "CloudCalc Pro: Saving calculation..."
        );

        console.log(
            "CloudCalc Pro: Authenticated user:",
            userId
        );


        /* ---------------------------------------------
           SEND TO BACKEND
        --------------------------------------------- */

        const response =
            await fetch(
                `${API_BASE_URL}/api/history`,
                {
                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        expression:
                            expression,

                        result:
                            result,

                        operation:
                            "calculation"

                    })
                }
            );


        /* ---------------------------------------------
           READ RESPONSE
        --------------------------------------------- */

        let responseData = null;

        try {

            responseData =
                await response.json();

        }

        catch (jsonError) {

            console.error(
                "CloudCalc Pro: Invalid backend response.",
                jsonError
            );

            throw new Error(
                "Invalid response received from backend."
            );
        }


        /* ---------------------------------------------
           HANDLE AUTH ERROR
        --------------------------------------------- */

        if (response.status === 401) {

            console.error(
                "CloudCalc Pro: Authentication failed.",
                responseData
            );

            showToast(
                "Session expired. Please login again."
            );

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1200);

            return;
        }


        /* ---------------------------------------------
           HANDLE OTHER BACKEND ERRORS
        --------------------------------------------- */

        if (!response.ok) {

            console.error(
                "CloudCalc Pro: History API error:",
                responseData
            );

            throw new Error(
                responseData?.message ||
                responseData?.error ||
                `Failed to save calculation. Status: ${response.status}`
            );
        }


        /* ---------------------------------------------
           SUCCESS
        --------------------------------------------- */

        console.log(
            "CloudCalc Pro: Calculation saved successfully.",
            responseData
        );

        showToast(
            "Calculation saved."
        );

    }

    catch (error) {

        console.error(
            "CloudCalc Pro: Save calculation error:",
            error
        );

        showToast(
            "Calculation completed, but could not be saved."
        );
    }
}


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        const key = event.key;


        /* Numbers */

        if (/^[0-9]$/.test(key)) {

            addValue(key);

            return;
        }


        /* Operators */

        if (
            [
                "+",
                "-",
                "*",
                "/",
                "%",
                ".",
                "(",
                ")"
            ].includes(key)
        ) {

            addValue(key);

            return;
        }


        /* Enter / Equal */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;
        }


        /* Backspace */

        if (
            key === "Backspace"
        ) {

            deleteLast();

            return;
        }


        /* Escape */

        if (
            key === "Escape"
        ) {

            clearCalculator();
        }

    }
);


/* =========================================================
   CALCULATOR BUTTONS
========================================================= */

document
    .querySelectorAll(".calc-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const value =
                    this.dataset.value;

                const action =
                    this.dataset.action;


                /* VALUE */

                if (
                    value !== undefined
                ) {

                    addValue(value);

                    return;
                }


                /* CLEAR */

                if (
                    action === "clear"
                ) {

                    clearCalculator();

                    return;
                }


                /* DELETE */

                if (
                    action === "delete"
                ) {

                    deleteLast();

                    return;
                }


                /* CALCULATE */

                if (
                    action === "calculate"
                ) {

                    calculate();

                    return;
                }

            }
        );

    });


/* =========================================================
   LOAD CURRENT USER
========================================================= */

async function loadCalculatorUser() {

    if (!window.supabaseClient) {

        console.error(
            "CloudCalc Pro: Supabase client not available."
        );

        return;
    }


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient.auth.getUser();


        if (error) {
            throw error;
        }


        const user =
            data?.user;


        /* ---------------------------------------------
           NOT LOGGED IN
        --------------------------------------------- */

        if (!user) {

            console.log(
                "CloudCalc Pro: No active user."
            );

            window.location.href =
                "login.html";

            return;
        }


        /* ---------------------------------------------
           USER METADATA
        --------------------------------------------- */

        const metadata =
            user.user_metadata || {};


        const name =
            metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "User";


        /* ---------------------------------------------
           USER NAME
        --------------------------------------------- */

        const userName =
            document.getElementById(
                "userName"
            );

        if (userName) {

            userName.textContent =
                name;
        }


        /* ---------------------------------------------
           EMAIL
        --------------------------------------------- */

        const userEmail =
            document.getElementById(
                "userEmail"
            );

        if (userEmail) {

            userEmail.textContent =
                user.email || "";
        }


        /* ---------------------------------------------
           AVATAR
        --------------------------------------------- */

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
            "CloudCalc Pro: User loaded:",
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


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    if (!window.supabaseClient) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const {
            error
        } =
            await window.supabaseClient.auth.signOut();


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
            "Logout error:",
            error
        );

        showToast(
            "Unable to logout."
        );
    }
}


/* =========================================================
   LOGOUT BUTTON
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );
}


/* =========================================================
   MOBILE MENU
========================================================= */

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


/* =========================================================
   START CALCULATOR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "CloudCalc Pro: Calculator initialized."
        );

        updateDisplay();

        loadCalculatorUser();

    }
);