/* =========================================================
   CLOUDCALC PRO
   REGISTER PAGE
   SUPABASE AUTHENTICATION
========================================================= */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "registerForm"
            );


        if (!form) {

            console.error(
                "CloudCalc Pro: registerForm not found."
            );

            return;
        }


        console.log(
            "CloudCalc Pro: Register page ready."
        );


        /* =================================================
           FORM SUBMIT
        ================================================= */

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                /* -----------------------------------------
                   INPUTS
                ----------------------------------------- */

                const name =
                    form.querySelector(
                        "[name='name'], [name='full_name']"
                    )?.value.trim() || "";


                const email =
                    form.querySelector(
                        "[name='email']"
                    )?.value.trim() || "";


                const password =
                    form.querySelector(
                        "[name='password']"
                    )?.value || "";


                const confirmPassword =
                    form.querySelector(
                        "[name='confirmPassword'], [name='confirm_password']"
                    )?.value || "";


                const button =
                    form.querySelector(
                        "button[type='submit']"
                    );


                /* -----------------------------------------
                   VALIDATION
                ----------------------------------------- */

                if (!name) {

                    showMessage(
                        "Please enter your name.",
                        "error"
                    );

                    return;
                }


                if (!email) {

                    showMessage(
                        "Please enter your email address.",
                        "error"
                    );

                    return;
                }


                const emailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailPattern.test(email)
                ) {

                    showMessage(
                        "Please enter a valid email address.",
                        "error"
                    );

                    return;
                }


                if (
                    password.length < 6
                ) {

                    showMessage(
                        "Password must contain at least 6 characters.",
                        "error"
                    );

                    return;
                }


                if (
                    password !== confirmPassword
                ) {

                    showMessage(
                        "Passwords do not match.",
                        "error"
                    );

                    return;
                }


                /* -----------------------------------------
                   SUPABASE CHECK
                ----------------------------------------- */

                if (
                    !window.supabaseClient
                ) {

                    console.error(
                        "CloudCalc Pro: Supabase client missing."
                    );


                    showMessage(
                        "Supabase connection is not available.",
                        "error"
                    );

                    return;
                }


                /* -----------------------------------------
                   BUTTON LOADING
                ----------------------------------------- */

                if (button) {

                    button.disabled =
                        true;

                    button.dataset.originalText =
                        button.textContent;

                    button.textContent =
                        "Creating account...";

                }


                try {

                    console.log(
                        "CloudCalc Pro: Creating account..."
                    );


                    /* -------------------------------------
                       SUPABASE SIGN UP
                    ------------------------------------- */

                    const {
                        data,
                        error
                    } =
                        await window.supabaseClient
                            .auth
                            .signUp({

                                email:
                                    email,

                                password:
                                    password,

                                options: {

                                    data: {

                                        full_name:
                                            name

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


                    /* -------------------------------------
                       SUCCESS
                    ------------------------------------- */

                    if (data?.session) {

                        showMessage(
                            "Account created successfully. Redirecting...",
                            "success"
                        );


                        setTimeout(
                            function () {

                                window.location.href =
                                    "dashboard.html";

                            },
                            800
                        );

                    }
                    else {

                        /*
                         Supabase email confirmation
                         is enabled.
                        */

                        showMessage(
                            "Account created! Please check your email to confirm your account.",
                            "success"
                        );


                        setTimeout(
                            function () {

                                window.location.href =
                                    "login.html";

                            },
                            1800
                        );

                    }

                }
                catch (error) {

                    console.error(
                        "CloudCalc Pro Registration Error:",
                        error
                    );


                    let message =
                        error?.message ||
                        "Unable to create account.";


                    /* -------------------------------------
                       FRIENDLY SUPABASE ERRORS
                    ------------------------------------- */

                    if (
                        message
                            .toLowerCase()
                            .includes(
                                "already registered"
                            )
                    ) {

                        message =
                            "This email is already registered. Please login.";

                    }


                    if (
                        message
                            .toLowerCase()
                            .includes(
                                "user already registered"
                            )
                    ) {

                        message =
                            "This email is already registered. Please login.";

                    }


                    showMessage(
                        message,
                        "error"
                    );


                    if (button) {

                        button.disabled =
                            false;

                        button.textContent =
                            button.dataset.originalText ||
                            "Create Account";

                    }

                }

            }
        );


    }
);


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    /*
       If your register page has a formMessage
       element, use it.
    */

    const messageElement =
        document.getElementById(
            "formMessage"
        );


    if (messageElement) {

        messageElement.textContent =
            message;


        messageElement.className =
            `form-message show ${type}`;


        return;
    }


    /*
       If no message element exists,
       use alert as fallback.
    */

    if (type === "error") {

        console.error(
            message
        );

    }
}