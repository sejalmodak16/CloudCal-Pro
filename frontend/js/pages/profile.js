/* =========================================================
   CLOUDCALC PRO
   PROFILE PAGE
   Supabase Authentication
========================================================= */

"use strict";


/* =========================================================
   SUPABASE CHECK
========================================================= */

function checkSupabase() {

    if (!window.supabaseClient) {

        console.error(
            "CloudCalc Pro: Supabase client is missing."
        );

        alert(
            "Supabase connection is not available."
        );

        return false;
    }

    return true;
}


/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile() {

    if (!checkSupabase()) {
        return;
    }

    try {

        console.log(
            "CloudCalc Pro: Loading profile..."
        );


        const {
            data,
            error
        } = await window.supabaseClient
            .auth
            .getUser();


        if (error) {
            throw error;
        }


        const user =
            data?.user;


        /* -----------------------------------------
           LOGIN CHECK
        ----------------------------------------- */

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        /* -----------------------------------------
           USER METADATA
        ----------------------------------------- */

        const metadata =
            user.user_metadata || {};


        const fullName =
            metadata.full_name ||
            metadata.name ||
            "";


        /* -----------------------------------------
           FORM ELEMENTS
        ----------------------------------------- */

        const fullNameInput =
            document.getElementById(
                "fullName"
            );


        const emailInput =
            document.getElementById(
                "email"
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


        /* -----------------------------------------
           FULL NAME
        ----------------------------------------- */

        if (fullNameInput) {

            fullNameInput.value =
                fullName;
        }


        /* -----------------------------------------
           EMAIL
        ----------------------------------------- */

        if (emailInput) {

            emailInput.value =
                user.email || "";
        }


        /* -----------------------------------------
           SIDEBAR NAME
        ----------------------------------------- */

        const displayName =
            fullName ||
            user.email?.split("@")[0] ||
            "User";


        if (userName) {

            userName.textContent =
                displayName;
        }


        /* -----------------------------------------
           SIDEBAR EMAIL
        ----------------------------------------- */

        if (userEmail) {

            userEmail.textContent =
                user.email || "";
        }


        /* -----------------------------------------
           AVATAR
        ----------------------------------------- */

        if (userAvatar) {

            userAvatar.textContent =
                displayName
                    .charAt(0)
                    .toUpperCase();
        }


        console.log(
            "CloudCalc Pro: Profile loaded."
        );

    }
    catch (error) {

        console.error(
            "CloudCalc Pro: Profile loading error:",
            error
        );

        alert(
            error?.message ||
            "Unable to load profile."
        );
    }
}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile() {

    if (!checkSupabase()) {
        return;
    }


    try {

        const fullNameInput =
            document.getElementById(
                "fullName"
            );


        if (!fullNameInput) {

            console.error(
                "CloudCalc Pro: Full name input not found."
            );

            return;
        }


        const fullName =
            fullNameInput.value.trim();


        /* -----------------------------------------
           VALIDATION
        ----------------------------------------- */

        if (!fullName) {

            alert(
                "Please enter your full name."
            );

            fullNameInput.focus();

            return;
        }


        console.log(
            "CloudCalc Pro: Updating profile..."
        );


        /* -----------------------------------------
           UPDATE SUPABASE USER
        ----------------------------------------- */

        const {
            data,
            error
        } = await window.supabaseClient
            .auth
            .updateUser({

                data: {
                    full_name: fullName
                }

            });


        if (error) {
            throw error;
        }


        console.log(
            "CloudCalc Pro: Profile updated:",
            data?.user
        );


        /* -----------------------------------------
           UPDATE SIDEBAR
        ----------------------------------------- */

        const userName =
            document.getElementById(
                "userName"
            );


        const userAvatar =
            document.getElementById(
                "userAvatar"
            );


        if (userName) {

            userName.textContent =
                fullName;
        }


        if (userAvatar) {

            userAvatar.textContent =
                fullName
                    .charAt(0)
                    .toUpperCase();
        }


        alert(
            "Profile updated successfully."
        );

    }
    catch (error) {

        console.error(
            "CloudCalc Pro: Profile update error:",
            error
        );

        alert(
            error?.message ||
            "Unable to update profile."
        );
    }
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
        } = await window.supabaseClient
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
            "CloudCalc Pro: Logout error:",
            error
        );

        alert(
            error?.message ||
            "Unable to logout."
        );
    }
}


/* =========================================================
   INITIALIZE PROFILE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "CloudCalc Pro: Profile initialized."
        );


        /* -----------------------------------------
           SAVE BUTTON
        ----------------------------------------- */

        const saveButton =
            document.getElementById(
                "saveProfile"
            );


        if (saveButton) {

            saveButton.addEventListener(
                "click",
                saveProfile
            );
        }


        /* -----------------------------------------
           LOGOUT BUTTON
        ----------------------------------------- */

        const logoutButton =
            document.getElementById(
                "logoutBtn"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logout
            );
        }


        /* -----------------------------------------
           LOAD PROFILE
        ----------------------------------------- */

        loadProfile();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadProfile =
    loadProfile;

window.saveProfile =
    saveProfile;

window.logout =
    logout;