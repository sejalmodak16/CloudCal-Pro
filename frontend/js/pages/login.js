/* =========================================================
   CLOUDCALC PRO
   LOGIN PAGE
   Supabase Authentication
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const loginForm = document.getElementById("loginForm");

    const emailInput = document.getElementById("email");

    const passwordInput = document.getElementById("password");

    const togglePassword =
        document.getElementById("togglePassword");

    const loginButton =
        document.getElementById("loginButton");

    const forgotPassword =
        document.getElementById("forgotPassword");

    const formMessage =
        document.getElementById("formMessage");

    const remember =
        document.getElementById("remember");


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(message, type = "error") {

        if (!formMessage) {
            console.log(message);
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

        formMessage.className = "form-message";
    }


    /* =====================================================
       SUPABASE CHECK
    ===================================================== */

    if (!window.supabaseClient) {

        console.error(
            "CloudCalc Pro: Supabase client missing."
        );

        showMessage(
            "Supabase connection failed. Please check supabaseClient.js."
        );

        return;
    }


    console.log(
        "CloudCalc Pro: Login service ready."
    );


    /* =====================================================
       PASSWORD VISIBILITY
    ===================================================== */

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener(
            "click",
            function () {

                const isPassword =
                    passwordInput.type === "password";

                passwordInput.type =
                    isPassword ? "text" : "password";

                togglePassword.setAttribute(
                    "aria-label",
                    isPassword
                        ? "Hide password"
                        : "Show password"
                );
            }
        );
    }


    /* =====================================================
       REMEMBER EMAIL
    ===================================================== */

    if (remember && emailInput) {

        const savedEmail =
            localStorage.getItem(
                "cloudcalc_remember_email"
            );

        if (savedEmail) {

            emailInput.value = savedEmail;

            remember.checked = true;
        }
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                clearMessage();

                const email =
                    emailInput?.value.trim();

                const password =
                    passwordInput?.value || "";


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (!email) {

                    showMessage(
                        "Please enter your email address."
                    );

                    emailInput?.focus();

                    return;
                }


                if (!password) {

                    showMessage(
                        "Please enter your password."
                    );

                    passwordInput?.focus();

                    return;
                }


                /* -----------------------------------------
                   BUTTON LOADING
                ----------------------------------------- */

                if (loginButton) {

                    loginButton.disabled = true;

                    loginButton.classList.add(
                        "loading"
                    );

                    loginButton.textContent =
                        "SIGNING IN...";
                }


                try {

                    console.log(
                        "CloudCalc Pro: Signing in..."
                    );


                    /* -------------------------------------
                       SUPABASE LOGIN
                    ------------------------------------- */

                    const {
                        data,
                        error
                    } =
                        await window.supabaseClient.auth
                            .signInWithPassword({
                                email: email,
                                password: password
                            });


                    /* -------------------------------------
                       ERROR
                    ------------------------------------- */

                    if (error) {

                        console.error(
                            "CloudCalc Pro login error:",
                            error
                        );

                        throw error;
                    }


                    /* -------------------------------------
                       USER CHECK
                    ------------------------------------- */

                    if (!data || !data.user) {

                        throw new Error(
                            "Login failed. User information was not returned."
                        );
                    }


                    console.log(
                        "CloudCalc Pro: Login successful.",
                        data.user
                    );


                    /* -------------------------------------
                       REMEMBER EMAIL
                    ------------------------------------- */

                    if (remember?.checked) {

                        localStorage.setItem(
                            "cloudcalc_remember_email",
                            email
                        );

                    } else {

                        localStorage.removeItem(
                            "cloudcalc_remember_email"
                        );
                    }


                    /* -------------------------------------
                       SUCCESS MESSAGE
                    ------------------------------------- */

                    showMessage(
                        "Login successful. Redirecting...",
                        "success"
                    );


                    /* -------------------------------------
                       DASHBOARD REDIRECT
                    ------------------------------------- */

                    setTimeout(function () {

                        window.location.href =
                            "dashboard.html";

                    }, 700);

                }
                catch (error) {

                    console.error(
                        "CloudCalc Pro login error:",
                        error
                    );


                    let message =
                        "Unable to login. Please check your credentials.";


                    if (error?.message) {

                        message =
                            error.message;
                    }


                    showMessage(message);


                    /* -------------------------------------
                       RESTORE BUTTON
                    ------------------------------------- */

                    if (loginButton) {

                        loginButton.disabled = false;

                        loginButton.classList.remove(
                            "loading"
                        );

                        loginButton.textContent =
                            "LOGIN TO CLOUDCALC";
                    }
                }
            }
        );
    }


    /* =====================================================
       FORGOT PASSWORD
    ===================================================== */

    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                clearMessage();

                const email =
                    emailInput?.value.trim();


                if (!email) {

                    showMessage(
                        "Enter your email address first."
                    );

                    emailInput?.focus();

                    return;
                }


                try {

                    forgotPassword.style.pointerEvents =
                        "none";

                    forgotPassword.textContent =
                        "Sending...";


                    /* -------------------------------------
                       SUPABASE PASSWORD RESET
                    ------------------------------------- */

                    const {
                        error
                    } =
                        await window.supabaseClient.auth
                            .resetPasswordForEmail(
                                email,
                                {
                                    redirectTo:
                                        `${window.location.origin}/frontend/pages/reset-password.html`
                                }
                            );


                    if (error) {

                        throw error;
                    }


                    showMessage(
                        "Password reset instructions have been sent to your email.",
                        "success"
                    );

                }
                catch (error) {

                    console.error(
                        "Password reset error:",
                        error
                    );


                    showMessage(
                        error?.message ||
                        "Unable to send password reset email."
                    );

                }
                finally {

                    forgotPassword.style.pointerEvents =
                        "";

                    forgotPassword.textContent =
                        "Forgot password?";
                }
            }
        );
    }


    console.log(
        "CloudCalc Pro: Login page initialized."
    );

});