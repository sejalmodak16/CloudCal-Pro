/* =========================================================
   CLOUDCALC PRO
   REGISTER PAGE
   SUPABASE AUTHENTICATION
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    console.log("CloudCalc Pro: Register page ready.");

    const form = document.getElementById("registerForm");

    if (!form) {
        console.error("CloudCalc Pro: registerForm not found.");
        return;
    }

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const termsInput = document.getElementById("terms");

    const registerButton =
        document.getElementById("registerButton");

    const formMessage =
        document.getElementById("formMessage");

    const strengthText =
        document.getElementById("strengthText");

    const strengthBars = [
        document.getElementById("strength1"),
        document.getElementById("strength2"),
        document.getElementById("strength3"),
        document.getElementById("strength4")
    ];


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(message, type = "error") {

        if (!formMessage) {
            console.error(message);
            return;
        }

        formMessage.textContent = message;

        formMessage.className =
            `form-message show ${type}`;
    }


    function clearMessage() {

        if (!formMessage) {
            return;
        }

        formMessage.textContent = "";

        formMessage.className =
            "form-message";
    }


    /* =====================================================
       PASSWORD TOGGLE
    ===================================================== */

    function setupPasswordToggle(inputId, buttonId) {

        const input =
            document.getElementById(inputId);

        const button =
            document.getElementById(buttonId);

        if (!input || !button) {
            return;
        }

        button.addEventListener("click", () => {

            const isPassword =
                input.type === "password";

            input.type =
                isPassword ? "text" : "password";

            button.textContent =
                isPassword ? "◉" : "◉";

            button.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );
        });
    }


    setupPasswordToggle(
        "password",
        "togglePassword"
    );

    setupPasswordToggle(
        "confirmPassword",
        "toggleConfirmPassword"
    );


    /* =====================================================
       PASSWORD STRENGTH
    ===================================================== */

    if (passwordInput) {

        passwordInput.addEventListener(
            "input",
            () => {

                const password =
                    passwordInput.value;

                let score = 0;

                if (password.length >= 6) {
                    score++;
                }

                if (password.length >= 10) {
                    score++;
                }

                if (
                    /[A-Z]/.test(password) &&
                    /[a-z]/.test(password)
                ) {
                    score++;
                }

                if (
                    /\d/.test(password) ||
                    /[^A-Za-z0-9]/.test(password)
                ) {
                    score++;
                }


                strengthBars.forEach(
                    (bar, index) => {

                        if (!bar) {
                            return;
                        }

                        bar.style.background =
                            index < score
                                ? "var(--blue)"
                                : "rgba(100,130,180,.15)";
                    }
                );


                if (!password) {

                    strengthText.textContent =
                        "Use at least 6 characters.";

                }
                else if (score === 1) {

                    strengthText.textContent =
                        "Weak password.";

                }
                else if (score === 2) {

                    strengthText.textContent =
                        "Fair password.";

                }
                else if (score === 3) {

                    strengthText.textContent =
                        "Good password.";

                }
                else {

                    strengthText.textContent =
                        "Strong password.";
                }
            }
        );
    }


    /* =====================================================
       REGISTER
    ===================================================== */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearMessage();


            /* ---------------------------------------------
               GET VALUES
            --------------------------------------------- */

            const fullName =
                fullNameInput?.value.trim() || "";

            const email =
                emailInput?.value.trim() || "";

            const password =
                passwordInput?.value || "";

            const confirmPassword =
                confirmPasswordInput?.value || "";

            const termsAccepted =
                termsInput?.checked || false;


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (fullName.length < 2) {

                showMessage(
                    "Please enter your full name."
                );

                fullNameInput?.focus();

                return;
            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                showMessage(
                    "Please enter a valid email address."
                );

                emailInput?.focus();

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "Password must contain at least 6 characters."
                );

                passwordInput?.focus();

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match."
                );

                confirmPasswordInput?.focus();

                return;
            }


            if (!termsAccepted) {

                showMessage(
                    "Please accept the Terms of Service and Privacy Policy."
                );

                return;
            }


            /* ---------------------------------------------
               SUPABASE CHECK
            --------------------------------------------- */

            if (!window.supabaseClient) {

                console.error(
                    "CloudCalc Pro: Supabase client missing."
                );

                showMessage(
                    "Supabase connection is not available."
                );

                return;
            }


            /* ---------------------------------------------
               BUTTON LOADING
            --------------------------------------------- */

            if (registerButton) {

                registerButton.disabled = true;

                registerButton.classList.add(
                    "loading"
                );

                registerButton.dataset.originalText =
                    registerButton.textContent;

                registerButton.textContent =
                    "CREATING ACCOUNT...";
            }


            try {

                console.log(
                    "CloudCalc Pro: Creating account..."
                );


                /* -----------------------------------------
                   SUPABASE SIGN UP
                ----------------------------------------- */

                const {
                    data,
                    error
                } =
                    await window.supabaseClient
                        .auth
                        .signUp({

                            email: email,

                            password: password,

                            options: {

                                data: {

                                    full_name:
                                        fullName

                                }

                            }

                        });


                if (error) {
                    throw error;
                }


                console.log(
                    "CloudCalc Pro: Registration successful.",
                    data
                );


                /* -----------------------------------------
                   SESSION EXISTS
                ----------------------------------------- */

                if (data?.session) {

                    showMessage(
                        "Account created successfully. Redirecting...",
                        "success"
                    );

                    if (registerButton) {

                        registerButton.textContent =
                            "ACCOUNT CREATED ✓";
                    }


                    setTimeout(() => {

                        window.location.href =
                            "dashboard.html";

                    }, 1000);

                    return;
                }


                /* -----------------------------------------
                   EMAIL CONFIRMATION REQUIRED
                ----------------------------------------- */

                showMessage(
                    "Account created! Please check your email to confirm your account.",
                    "success"
                );


                if (registerButton) {

                    registerButton.textContent =
                        "ACCOUNT CREATED ✓";
                }


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1800);

            }
            catch (error) {

                console.error(
                    "CloudCalc Pro Registration Error:",
                    error
                );


                let message =
                    error?.message ||
                    "Unable to create account.";


                const lowerMessage =
                    message.toLowerCase();


                if (
                    lowerMessage.includes(
                        "user already registered"
                    ) ||
                    lowerMessage.includes(
                        "already registered"
                    )
                ) {

                    message =
                        "This email is already registered. Please login.";
                }


                if (
                    lowerMessage.includes(
                        "password should be at least"
                    )
                ) {

                    message =
                        "Password must contain at least 6 characters.";
                }


                showMessage(
                    message,
                    "error"
                );


                if (registerButton) {

                    registerButton.disabled =
                        false;

                    registerButton.classList.remove(
                        "loading"
                    );

                    registerButton.textContent =
                        registerButton.dataset.originalText ||
                        "CREATE CLOUDCALC ACCOUNT";
                }
            }

        }
    );

});