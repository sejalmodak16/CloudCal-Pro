/* =========================================================
   CLOUDCALC PRO
   SETTINGS PAGE
   Supabase + Preferences + Theme + Logout
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    console.log("CloudCalc Pro: Settings initialized.");

    initializeSettings();
    initializeTheme();
    initializeButtons();
    initializeLogout();
    initializeMobileMenu();
    loadUser();

});


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {

    theme: "dark",

    compactMode: false,

    autoSave: true,

    keyboardInput: true,

    precision: "10",

    rememberSession: true,

    welcomeMessage: true

};


/* =========================================================
   LOAD SETTINGS
========================================================= */

function initializeSettings() {

    const saved =
        localStorage.getItem(
            "cloudcalc-settings"
        );

    let settings =
        DEFAULT_SETTINGS;

    if (saved) {

        try {

            settings = {
                ...DEFAULT_SETTINGS,
                ...JSON.parse(saved)
            };

        }
        catch (error) {

            console.error(
                "CloudCalc Pro: Invalid saved settings.",
                error
            );

            settings =
                DEFAULT_SETTINGS;
        }
    }


    /* -----------------------------------------
       THEME
    ----------------------------------------- */

    setValue(
        "themeSelect",
        settings.theme
    );


    /* -----------------------------------------
       TOGGLES
    ----------------------------------------- */

    setChecked(
        "compactMode",
        settings.compactMode
    );

    setChecked(
        "autoSave",
        settings.autoSave
    );

    setChecked(
        "keyboardInput",
        settings.keyboardInput
    );

    setChecked(
        "rememberSession",
        settings.rememberSession
    );

    setChecked(
        "welcomeMessage",
        settings.welcomeMessage
    );


    /* -----------------------------------------
       PRECISION
    ----------------------------------------- */

    setValue(
        "precisionSelect",
        settings.precision
    );


    /* -----------------------------------------
       APPLY THEME
    ----------------------------------------- */

    applyTheme(
        settings.theme
    );


    console.log(
        "CloudCalc Pro: Settings loaded."
    );
}


/* =========================================================
   THEME
========================================================= */

function initializeTheme() {

    const themeSelect =
        document.getElementById(
            "themeSelect"
        );

    if (!themeSelect) {
        return;
    }


    themeSelect.addEventListener(
        "change",
        function () {

            const theme =
                themeSelect.value;

            applyTheme(theme);

        }
    );
}


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme(theme) {

    if (!theme) {
        theme = "dark";
    }


    if (theme === "system") {

        const prefersDark =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        document.documentElement.setAttribute(
            "data-theme",
            prefersDark
                ? "dark"
                : "light"
        );

    }
    else {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );
    }


    console.log(
        "CloudCalc Pro: Theme:",
        theme
    );
}


/* =========================================================
   SAVE SETTINGS
========================================================= */

function saveSettings() {

    const settings = {

        theme:
            getValue("themeSelect") ||
            "dark",

        compactMode:
            getChecked("compactMode"),

        autoSave:
            getChecked("autoSave"),

        keyboardInput:
            getChecked("keyboardInput"),

        precision:
            getValue("precisionSelect") ||
            "10",

        rememberSession:
            getChecked("rememberSession"),

        welcomeMessage:
            getChecked("welcomeMessage")

    };


    localStorage.setItem(
        "cloudcalc-settings",
        JSON.stringify(settings)
    );


    /* -----------------------------------------
       SAVE THEME SEPARATELY
    ----------------------------------------- */

    localStorage.setItem(
        "cloudcalc-theme",
        settings.theme
    );


    /* -----------------------------------------
       APPLY SETTINGS
    ----------------------------------------- */

    applyTheme(
        settings.theme
    );


    applyCompactMode(
        settings.compactMode
    );


    console.log(
        "CloudCalc Pro: Settings saved.",
        settings
    );


    showToast(
        "Settings saved successfully."
    );
}


/* =========================================================
   RESET SETTINGS
========================================================= */

function resetSettings() {

    const confirmed =
        window.confirm(
            "Reset all CloudCalc Pro settings to default?"
        );


    if (!confirmed) {
        return;
    }


    localStorage.removeItem(
        "cloudcalc-settings"
    );

    localStorage.removeItem(
        "cloudcalc-theme"
    );


    /* -----------------------------------------
       RESTORE DEFAULT VALUES
    ----------------------------------------- */

    setValue(
        "themeSelect",
        DEFAULT_SETTINGS.theme
    );

    setChecked(
        "compactMode",
        DEFAULT_SETTINGS.compactMode
    );

    setChecked(
        "autoSave",
        DEFAULT_SETTINGS.autoSave
    );

    setChecked(
        "keyboardInput",
        DEFAULT_SETTINGS.keyboardInput
    );

    setValue(
        "precisionSelect",
        DEFAULT_SETTINGS.precision
    );

    setChecked(
        "rememberSession",
        DEFAULT_SETTINGS.rememberSession
    );

    setChecked(
        "welcomeMessage",
        DEFAULT_SETTINGS.welcomeMessage
    );


    applyTheme(
        DEFAULT_SETTINGS.theme
    );

    applyCompactMode(
        DEFAULT_SETTINGS.compactMode
    );


    showToast(
        "Settings reset to default."
    );


    console.log(
        "CloudCalc Pro: Settings reset."
    );
}


/* =========================================================
   COMPACT MODE
========================================================= */

function applyCompactMode(enabled) {

    document.body.classList.toggle(
        "compact-mode",
        Boolean(enabled)
    );
}


/* =========================================================
   BUTTONS
========================================================= */

function initializeButtons() {

    const saveButton =
        document.getElementById(
            "saveSettings"
        );


    const resetButton =
        document.getElementById(
            "resetSettings"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveSettings
        );
    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetSettings
        );
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const logoutButtons = [

        document.getElementById(
            "logoutBtn"
        ),

        document.getElementById(
            "dangerLogout"
        )

    ].filter(Boolean);


    if (!logoutButtons.length) {

        console.warn(
            "CloudCalc Pro: Logout buttons not found."
        );

        return;
    }


    logoutButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function () {

                    await logout(button);

                }
            );

        }
    );
}


/* =========================================================
   LOGOUT FUNCTION
========================================================= */

async function logout(button) {

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

        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Signing out...";
        }


        console.log(
            "CloudCalc Pro: Signing out..."
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


        /* -----------------------------------------
           CLEAR LOCAL SETTINGS
        ----------------------------------------- */

        localStorage.removeItem(
            "cloudcalc-settings"
        );


        localStorage.removeItem(
            "cloudcalc-theme"
        );


        console.log(
            "CloudCalc Pro: Logout successful."
        );


        window.location.href =
            "login.html";

    }
    catch (error) {

        console.error(
            "CloudCalc Pro: Logout error:",
            error
        );


        showToast(
            error?.message ||
            "Unable to logout."
        );


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Sign Out";
        }
    }
}


/* =========================================================
   LOAD USER
========================================================= */

async function loadUser() {

    if (!window.supabaseClient) {

        console.error(
            "CloudCalc Pro: Supabase client unavailable."
        );

        return;
    }


    try {

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


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


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
                name;
        }


        if (userEmail) {

            userEmail.textContent =
                user.email || "";
        }


        if (userAvatar) {

            userAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();
        }


        console.log(
            "CloudCalc Pro: Settings user loaded:",
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
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (
        !mobileMenu ||
        !sidebar
    ) {
        return;
    }


    mobileMenu.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        sidebar.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        console.log(
            "Toast:",
            message
        );

        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


/* =========================================================
   HELPER: GET VALUE
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.value
        : null;
}


/* =========================================================
   HELPER: SET VALUE
========================================================= */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value;
    }
}


/* =========================================================
   HELPER: GET CHECKED
========================================================= */

function getChecked(id) {

    const element =
        document.getElementById(id);


    return element
        ? element.checked
        : false;
}


/* =========================================================
   HELPER: SET CHECKED
========================================================= */

function setChecked(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.checked =
            Boolean(value);
    }
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.saveSettings =
    saveSettings;

window.resetSettings =
    resetSettings;

window.logout =
    logout;