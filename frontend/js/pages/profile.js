/* =========================================================
   CLOUDCALC PRO
   PROFILE PAGE
   Supabase Authentication
========================================================= */


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
        } =
            await window.supabaseClient
                .auth
                .getUser();


        if (error) {
            throw error;
        }


        const user =
            data?.user;


        /* -----------------------------------------
           USER NOT LOGGED IN
        ----------------------------------------- */

        if (!user) {

            console.log(
                "No logged-in user."
            );

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
           SIDEBAR USER NAME
        ----------------------------------------- */

        if (userName) {

            userName.textContent =
                fullName ||
                user.email?.split("@")[0] ||
                "User";
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

            const displayName =
                fullName ||
                user.email ||
                "U";


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
                "fullName input not found."
            );

            return;
        }


        const fullName =
            fullNameInput.value.trim();


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


        const {
            data,
            error
        } =
            await window.supabaseClient
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
            "Profile updated:",
            data?.user
        );


        /* -----------------------------------------
           UPDATE DISPLAY
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
            "Profile update error:",
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
            "Logout error:",
            error
        );

        alert(
            error?.message ||
            "Unable to logout."
        );
    }
}


/* =========================================================
   SAVE BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

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
           LOAD PROFILE
        ----------------------------------------- */

        loadProfile();

    }
);


/* =========================================================
   MAKE FUNCTIONS AVAILABLE
========================================================= */

window.loadProfile =
    loadProfile;

window.saveProfile =
    saveProfile;

window.logout =
    logout;