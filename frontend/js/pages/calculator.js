
/* =========================================================
   CLOUDCALC PRO
   CALCULATOR PAGE
   Backend API + Supabase Authentication + History
========================================================= */

"use strict";


/* =========================================================
   CALCULATOR STATE
========================================================= */

let currentExpression = "";
let lastResult = "";
let toastTimer = null;


/* =========================================================
   BACKEND CONFIGURATION
========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";


/* =========================================================
   ELEMENTS
========================================================= */

const expressionElement =
    document.getElementById("expression");

const resultElement =
    document.getElementById("result");

const logoutBtn =
    document.getElementById("logoutBtn");

const mobileMenu =
    document.getElementById("mobileMenu");

const sidebar =
    document.getElementById("sidebar");

const toast =
    document.getElementById("toast");


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

    currentExpression += String(value);

    updateDisplay();
}


/* =========================================================
   CLEAR CALCULATOR
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
   SAFE CALCULATOR EVALUATION
========================================================= */

function evaluateExpression(expression) {

    const cleanedExpression =
        expression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .trim();


    /* -----------------------------------------------------
       SECURITY VALIDATION
    ----------------------------------------------------- */

    if (!cleanedExpression) {
        throw new Error("Expression is empty.");
    }


    /*
       Only allow calculator characters.
       No letters, variables, functions, or other code.
    */

    if (!/^[0-9+\-*/%.()\s]+$/.test(cleanedExpression)) {
        throw new Error("Invalid expression.");
    }


    /*
       Prevent dangerous repeated operators.
       This also catches expressions such as:

       5**
       5//2
       5*+
       5+*
    */

    if (
        /[+\-*/%]{2,}/.test(
            cleanedExpression.replace(
                /^\-/,
                ""
            )
        )
    ) {
        throw new Error("Invalid operator sequence.");
    }


    /*
       Prevent expression ending with an operator.
    */

    if (/[+\-*/%.]$/.test(cleanedExpression)) {
        throw new Error("Incomplete expression.");
    }


    /*
       Check brackets.
    */

    let brackets = 0;

    for (const character of cleanedExpression) {

        if (character === "(") {
            brackets++;
        }

        if (character === ")") {
            brackets--;

            if (brackets < 0) {
                throw new Error("Invalid brackets.");
            }
        }
    }

    if (brackets !== 0) {
        throw new Error("Invalid brackets.");
    }


    /* -----------------------------------------------------
       CALCULATE
    ----------------------------------------------------- */

    let result;

    try {

        result =
            Function(
                `"use strict"; return (${cleanedExpression})`
            )();

    }

    catch (error) {

        console.error(
            "Expression evaluation error:",
            error
        );

        throw new Error(
            "Unable to calculate expression."
        );
    }


    /* -----------------------------------------------------
       RESULT VALIDATION
    ----------------------------------------------------- */

    if (
        typeof result !== "number" ||
        !Number.isFinite(result)
    ) {
        throw new Error("Invalid result.");
    }


    return result;
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

        const expression =
            currentExpression
                .replace(/×/g, "*")
                .replace(/÷/g, "/");


        /* -------------------------------------------------
           CALCULATE RESULT
        ------------------------------------------------- */

        const result =
            evaluateExpression(expression);


        /* -------------------------------------------------
           FORMAT RESULT
        ------------------------------------------------- */

        lastResult =
            Number(
                result.toFixed(10)
            ).toString();


        updateDisplay();


        /* -------------------------------------------------
           SAVE CALCULATION
        ------------------------------------------------- */

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
   SUPABASE AUTH + BACKEND API
========================================================= */

async function saveCalculation(
    expression,
    result
) {

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

        /* -------------------------------------------------
           GET CURRENT SESSION
        ------------------------------------------------- */

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


        /* -------------------------------------------------
           CHECK LOGIN
        ------------------------------------------------- */

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

            return;
        }


        /* -------------------------------------------------
           AUTH DATA
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
            "CloudCalc Pro: Saving calculation..."
        );


        /* -------------------------------------------------
           SEND TO FASTAPI BACKEND
        ------------------------------------------------- */

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

                        user_id:
                            userId,

                        expression:
                            expression,

                        result:
                            result,

                        operation:
                            "calculation"
                    })
                }
            );


        /* -------------------------------------------------
           READ BACKEND RESPONSE
        ------------------------------------------------- */

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


        /* -------------------------------------------------
           AUTHENTICATION ERROR
        ------------------------------------------------- */

        if (response.status === 401) {

            console.error(
                "CloudCalc Pro: Authentication failed.",
                responseData
            );

            showToast(
                "Session expired. Please login again."
            );

            return;
        }


        /* -------------------------------------------------
           BACKEND ERROR
        ------------------------------------------------- */

        if (!response.ok) {

            console.error(
                "CloudCalc Pro: History API error:",
                responseData
            );

            throw new Error(
                responseData?.detail ||
                responseData?.message ||
                responseData?.error ||
                `Failed to save calculation. Status: ${response.status}`
            );
        }


        /* -------------------------------------------------
           SUCCESS
        ------------------------------------------------- */

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

        const key =
            event.key;


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


        /* Calculate */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;
        }


        /* Delete */

        if (key === "Backspace") {

            deleteLast();

            return;
        }


        /* Clear */

        if (key === "Escape") {

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


                /* -----------------------------------------
                   VALUE BUTTON
                ----------------------------------------- */

                if (
                    value !== undefined
                ) {

                    addValue(value);

                    return;
                }


                /* -----------------------------------------
                   CLEAR
                ----------------------------------------- */

                if (
                    action === "clear"
                ) {

                    clearCalculator();

                    return;
                }


                /* -----------------------------------------
                   DELETE
                ----------------------------------------- */

                if (
                    action === "delete"
                ) {

                    deleteLast();

                    return;
                }


                /* -----------------------------------------
                   CALCULATE
                ----------------------------------------- */

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

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "CloudCalc Pro: Session loading error:",
                error
            );

            return null;
        }


        const session =
            data?.session;


        /* -------------------------------------------------
           NO ACTIVE SESSION
        ------------------------------------------------- */

        if (
            !session ||
            !session.user
        ) {

            console.warn(
                "CloudCalc Pro: No active login session."
            );


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


            return null;
        }


        /* -------------------------------------------------
           ACTIVE USER
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


        return user;

    }

    catch (error) {

        console.error(
            "CloudCalc Pro: User loading error:",
            error
        );

        return null;
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
            "CloudCalc Pro logout error:",
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
