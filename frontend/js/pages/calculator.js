/* =========================================================
   CLOUDCALC PRO
   CALCULATOR PAGE
   Supabase + Authentication + History
========================================================= */

let currentExpression = "";
let lastResult = "";
let toastTimer = null;


/* =========================================================
   ELEMENTS
========================================================= */

const expressionElement =
    document.getElementById("expression");

const resultElement =
    document.getElementById("result");

const loginButton =
    document.getElementById("loginButton");

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

    if (value === undefined || value === null) {
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
        showToast("Enter a calculation first.");
        return;
    }

    try {

        let expression =
            currentExpression
                .replace(/×/g, "*")
                .replace(/÷/g, "/");

        /* ---------------------------------------------
           SECURITY VALIDATION
        --------------------------------------------- */

        if (!/^[0-9+\-*/%.()\s]+$/.test(expression)) {

            throw new Error(
                "Invalid expression."
            );
        }


        /* ---------------------------------------------
           CALCULATE
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
           SAVE TO SUPABASE
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
   SAVE CALCULATION TO SUPABASE
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

        /* -----------------------------------------
           GET CURRENT USER
        ----------------------------------------- */

        const {
            data,
            error
        } =
            await window.supabaseClient.auth.getUser();


        if (error) {
            throw error;
        }


        const user = data?.user;


        /* -----------------------------------------
           USER NOT LOGGED IN
        ----------------------------------------- */

        if (!user) {

            showToast(
                "Please login to save calculations."
            );

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1000);

            return;
        }


        /* -----------------------------------------
           INSERT CALCULATION
        ----------------------------------------- */

        const {
            error: insertError
        } =
            await window.supabaseClient
                .from("calculations")
                .insert({

                    user_id: user.id,

                    expression: expression,

                    result: result,

                    operation: "calculation"

                });


        if (insertError) {

            console.error(
                "Supabase insert error:",
                insertError
            );

            throw insertError;
        }


        console.log(
            "CloudCalc Pro: Calculation saved."
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
            ["+", "-", "*", "/", "%", ".", "(", ")"]
                .includes(key)
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

        if (key === "Backspace") {

            deleteLast();

            return;
        }


        /* Escape */

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


                /* -----------------------------
                   VALUE BUTTON
                ----------------------------- */

                if (value !== undefined) {

                    addValue(value);

                    return;
                }


                /* -----------------------------
                   CLEAR
                ----------------------------- */

                if (action === "clear") {

                    clearCalculator();

                    return;
                }


                /* -----------------------------
                   DELETE
                ----------------------------- */

                if (action === "delete") {

                    deleteLast();

                    return;
                }


                /* -----------------------------
                   CALCULATE
                ----------------------------- */

                if (action === "calculate") {

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
            "Supabase client not available."
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


        const user = data?.user;


        /* -----------------------------------------
           NOT LOGGED IN
        ----------------------------------------- */

        if (!user) {

            console.log(
                "CloudCalc Pro: No active user."
            );

            window.location.href =
                "login.html";

            return;
        }


        /* -----------------------------------------
           USER DATA
        ----------------------------------------- */

        const metadata =
            user.user_metadata || {};


        const name =
            metadata.full_name ||
            metadata.name ||
            user.email?.split("@")[0] ||
            "User";


        /* -----------------------------------------
           UPDATE USER NAME
        ----------------------------------------- */

        const userName =
            document.getElementById("userName");

        if (userName) {

            userName.textContent =
                name;
        }


        /* -----------------------------------------
           UPDATE EMAIL
        ----------------------------------------- */

        const userEmail =
            document.getElementById("userEmail");

        if (userEmail) {

            userEmail.textContent =
                user.email || "";
        }


        /* -----------------------------------------
           UPDATE AVATAR
        ----------------------------------------- */

        const userAvatar =
            document.getElementById("userAvatar");

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