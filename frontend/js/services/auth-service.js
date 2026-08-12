/* =========================================================
   CLOUDCALC PRO
   AUTH SERVICE
   SUPABASE AUTHENTICATION
========================================================= */

(function () {

    "use strict";

    function getSupabaseClient() {

        if (!window.supabaseClient) {

            throw new Error(
                "Supabase client is not initialized."
            );

        }

        return window.supabaseClient;
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    async function signInUser(email, password) {

        const supabase =
            getSupabaseClient();

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();

        const cleanPassword =
            String(password || "");

        if (!cleanEmail) {
            throw new Error(
                "Please enter your email address."
            );
        }

        if (!cleanPassword) {
            throw new Error(
                "Please enter your password."
            );
        }

        const {
            data,
            error
        } =
            await supabase.auth.signInWithPassword({

                email: cleanEmail,

                password: cleanPassword

            });

        if (error) {

            console.error(
                "Supabase login error:",
                error
            );

            throw new Error(
                getAuthErrorMessage(error)
            );
        }

        if (!data?.session) {

            throw new Error(
                "Login failed. No active session was created."
            );
        }

        return data;
    }


    /* =====================================================
       REGISTER
    ===================================================== */

    async function signUpUser(
        email,
        password,
        fullName
    ) {

        const supabase =
            getSupabaseClient();

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();

        const cleanPassword =
            String(password || "");

        const cleanName =
            String(fullName || "")
                .trim();

        const {
            data,
            error
        } =
            await supabase.auth.signUp({

                email: cleanEmail,

                password: cleanPassword,

                options: {

                    data: {

                        full_name:
                            cleanName

                    }

                }

            });

        if (error) {

            console.error(
                "Supabase registration error:",
                error
            );

            throw new Error(
                getAuthErrorMessage(error)
            );
        }

        return data;
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    async function signOutUser() {

        const supabase =
            getSupabaseClient();

        const {
            error
        } =
            await supabase.auth.signOut();

        if (error) {

            throw new Error(
                getAuthErrorMessage(error)
            );
        }

        return true;
    }


    /* =====================================================
       CURRENT USER
    ===================================================== */

    async function getCurrentUser() {

        const supabase =
            getSupabaseClient();

        const {
            data,
            error
        } =
            await supabase.auth.getUser();

        if (error) {

            console.error(
                "Get user error:",
                error
            );

            return null;
        }

        return data?.user || null;
    }


    /* =====================================================
       CURRENT SESSION
    ===================================================== */

    async function getCurrentSession() {

        const supabase =
            getSupabaseClient();

        const {
            data,
            error
        } =
            await supabase.auth.getSession();

        if (error) {

            console.error(
                "Get session error:",
                error
            );

            return null;
        }

        return data?.session || null;
    }


    /* =====================================================
       PASSWORD RESET
    ===================================================== */

    async function resetUserPassword(email) {

        const supabase =
            getSupabaseClient();

        const cleanEmail =
            String(email || "")
                .trim()
                .toLowerCase();

        if (!cleanEmail) {

            throw new Error(
                "Please enter your email address first."
            );
        }

        const redirectUrl =
            `${window.location.origin}/frontend/pages/login.html`;

        const {
            error
        } =
            await supabase.auth.resetPasswordForEmail(
                cleanEmail,
                {
                    redirectTo: redirectUrl
                }
            );

        if (error) {

            throw new Error(
                getAuthErrorMessage(error)
            );
        }

        return true;
    }


    /* =====================================================
       AUTH STATE
    ===================================================== */

    function onAuthStateChange(callback) {

        const supabase =
            getSupabaseClient();

        return supabase.auth.onAuthStateChange(
            (event, session) => {

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback(
                        event,
                        session
                    );
                }

            }
        );
    }


    /* =====================================================
       ERROR HANDLER
    ===================================================== */

    function getAuthErrorMessage(error) {

        const message =
            String(
                error?.message || ""
            ).toLowerCase();

        if (
            message.includes(
                "invalid login credentials"
            )
        ) {

            return "Invalid email or password.";
        }

        if (
            message.includes(
                "email not confirmed"
            )
        ) {

            return "Please confirm your email before logging in.";
        }

        if (
            message.includes(
                "user already registered"
            )
        ) {

            return "This email is already registered. Please login.";
        }

        if (
            message.includes(
                "password should be at least"
            )
        ) {

            return "Password must contain at least 6 characters.";
        }

        return (
            error?.message ||
            "Authentication failed."
        );
    }


    /* =====================================================
       GLOBAL AUTH SERVICE
    ===================================================== */

    window.authService = {

        signInUser,

        signUpUser,

        signOutUser,

        getCurrentUser,

        getCurrentSession,

        resetUserPassword,

        onAuthStateChange

    };


    console.log(
        "CloudCalc Pro: Auth service ready."
    );

})();