
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
        console.error("CloudCalc Pro: Supabase client is missing.");
        alert("Supabase connection is not available.");
        return false;
    }

    return true;
}

/* =========================================================
   GET CURRENT SESSION
   IMPORTANT:
   Does NOT redirect to login.
========================================================= */

async function getSession() {
    if (!checkSupabase()) {
        return null;
    }

    try {
        const { data, error } =
            await window.supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        const session = data?.session;

        if (!session || !session.user) {
            console.warn("CloudCalc Pro: No active login session.");
            return null;
        }

        return session;

    } catch (error) {
        console.error(
            "CloudCalc Pro: Session loading error:",
            error
        );

        return null;
    }
}

/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile() {
    if (!checkSupabase()) {
        return;
    }

    console.log("CloudCalc Pro: Loading profile...");

    const session = await getSession();

    /* -----------------------------------------------------
       NO LOGIN
       Stay on profile page.
    ----------------------------------------------------- */

    if (!session) {
        const fullNameInput = document.getElementById("fullName");
        const emailInput = document.getElementById("email");
        const userName = document.getElementById("userName");
        const userEmail = document.getElementById("userEmail");
        const userAvatar = document.getElementById("userAvatar");

        if (fullNameInput) {
            fullNameInput.value = "";
        }

        if (emailInput) {
            emailInput.value = "";
        }

        if (userName) {
            userName.textContent = "Guest";
        }

        if (userEmail) {
            userEmail.textContent = "Please login";
        }

        if (userAvatar) {
            userAvatar.textContent = "G";
        }

        console.warn(
            "CloudCalc Pro: Profile opened without login."
        );

        return;
    }

    try {
        const user = session.user;
        const metadata = user.user_metadata || {};

        /* -------------------------------------------------
           GET USER NAME
        ------------------------------------------------- */

        const fullName =
            metadata.full_name ||
            metadata.name ||
            "";

        /* -------------------------------------------------
           GET HTML ELEMENTS
        ------------------------------------------------- */

        const fullNameInput =
            document.getElementById("fullName");

        const emailInput =
            document.getElementById("email");

        const userName =
            document.getElementById("userName");

        const userEmail =
            document.getElementById("userEmail");

        const userAvatar =
            document.getElementById("userAvatar");

        /* -------------------------------------------------
           FULL NAME
        ------------------------------------------------- */

        if (fullNameInput) {
            fullNameInput.value = fullName;
        }

        /* -------------------------------------------------
           EMAIL
        ------------------------------------------------- */

        if (emailInput) {
            emailInput.value = user.email || "";
        }

        /* -------------------------------------------------
           DISPLAY NAME
        ------------------------------------------------- */

        const displayName =
            fullName ||
            user.email?.split("@")[0] ||
            "User";

        /* -------------------------------------------------
           SIDEBAR NAME
        ------------------------------------------------- */

        if (userName) {
            userName.textContent = displayName;
        }

        /* -------------------------------------------------
           SIDEBAR EMAIL
        ------------------------------------------------- */

        if (userEmail) {
            userEmail.textContent = user.email || "";
        }

        /* -------------------------------------------------
           AVATAR
        ------------------------------------------------- */

        if (userAvatar) {
            userAvatar.textContent =
                displayName.charAt(0).toUpperCase();
        }

        console.log(
            "CloudCalc Pro: Profile loaded successfully."
        );

    } catch (error) {
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

    const fullNameInput =
        document.getElementById("fullName");

    if (!fullNameInput) {
        console.error(
            "CloudCalc Pro: Full name input not found."
        );
        return;
    }

    const fullName =
        fullNameInput.value.trim();

    /* -----------------------------------------------------
       VALIDATION
    ----------------------------------------------------- */

    if (!fullName) {
        alert("Please enter your full name.");
        fullNameInput.focus();
        return;
    }

    /* -----------------------------------------------------
       CHECK LOGIN
    ----------------------------------------------------- */

    const session = await getSession();

    if (!session) {
        alert("Please login to update your profile.");
        return;
    }

    try {
        console.log(
            "CloudCalc Pro: Updating profile..."
        );

        /* -------------------------------------------------
           UPDATE SUPABASE USER METADATA
        ------------------------------------------------- */

        const { data, error } =
            await window.supabaseClient.auth.updateUser({
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

        /* -------------------------------------------------
           UPDATE SIDEBAR
        ------------------------------------------------- */

        const userName =
            document.getElementById("userName");

        const userAvatar =
            document.getElementById("userAvatar");

        if (userName) {
            userName.textContent = fullName;
        }

        if (userAvatar) {
            userAvatar.textContent =
                fullName.charAt(0).toUpperCase();
        }

        alert("Profile updated successfully.");

    } catch (error) {
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

        const { error } =
            await window.supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        console.log(
            "CloudCalc Pro: User logged out."
        );

        window.location.href = "login.html";

    } catch (error) {
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

        /* -------------------------------------------------
           SAVE BUTTON
        ------------------------------------------------- */

        const saveButton =
            document.getElementById("saveProfile");

        if (saveButton) {
            saveButton.addEventListener(
                "click",
                saveProfile
            );
        }

        /* -------------------------------------------------
           LOGOUT BUTTON
        ------------------------------------------------- */

        const logoutButton =
            document.getElementById("logoutBtn");

        if (logoutButton) {
            logoutButton.addEventListener(
                "click",
                logout
            );
        }

        /* -------------------------------------------------
           LOAD PROFILE
        ------------------------------------------------- */

        loadProfile();
    }
);

/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.loadProfile = loadProfile;
window.saveProfile = saveProfile;
window.logout = logout;
