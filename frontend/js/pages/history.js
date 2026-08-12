/* =========================================================
   CLOUDCALC PRO
   HISTORY PAGE
   Supabase
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    console.log("CloudCalc Pro: History initialized.");

    const historyContainer =
        document.getElementById("historyContainer");

    const emptyState =
        document.getElementById("emptyState");

    const loadingState =
        document.getElementById("loadingState");

    /* =====================================================
       SUPABASE CHECK
    ===================================================== */

    if (!window.supabaseClient) {

        console.error(
            "CloudCalc Pro: Supabase client missing."
        );

        showMessage(
            "Supabase connection failed."
        );

        return;
    }


    /* =====================================================
       LOAD HISTORY
    ===================================================== */

    async function loadHistory() {

        try {

            if (loadingState) {
                loadingState.style.display = "block";
            }

            if (emptyState) {
                emptyState.style.display = "none";
            }


            /* ---------------------------------------------
               GET CURRENT USER
            --------------------------------------------- */

            const {
                data: userData,
                error: userError
            } =
                await window.supabaseClient.auth.getUser();


            if (userError) {
                throw userError;
            }


            const user = userData?.user;


            if (!user) {

                window.location.href =
                    "login.html";

                return;
            }


            console.log(
                "Loading history for:",
                user.email
            );


            /* ---------------------------------------------
               GET CALCULATIONS
            --------------------------------------------- */

            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from("calculations")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", {
                        ascending: false
                    });


            if (error) {

                console.error(
                    "Supabase history query error:",
                    error
                );

                throw error;
            }


            console.log(
                "CloudCalc Pro: History data:",
                data
            );


            /* ---------------------------------------------
               HIDE LOADING
            --------------------------------------------- */

            if (loadingState) {
                loadingState.style.display = "none";
            }


            /* ---------------------------------------------
               EMPTY HISTORY
            --------------------------------------------- */

            if (!data || data.length === 0) {

                if (emptyState) {
                    emptyState.style.display = "block";
                }

                if (historyContainer) {
                    historyContainer.innerHTML = "";
                }

                return;
            }


            /* ---------------------------------------------
               DISPLAY HISTORY
            --------------------------------------------- */

            renderHistory(data);

        }
        catch (error) {

            console.error(
                "History loading error:",
                error
            );

            if (loadingState) {
                loadingState.style.display = "none";
            }

            showMessage(
                error?.message ||
                "Unable to load calculation history."
            );
        }
    }


    /* =====================================================
       RENDER HISTORY
    ===================================================== */

    function renderHistory(history) {

        if (!historyContainer) {

            console.error(
                "historyContainer element not found."
            );

            return;
        }


        historyContainer.innerHTML = "";


        history.forEach(item => {

            const card =
                document.createElement("div");

            card.className =
                "history-card";


            const expression =
                item.expression || "Unknown";


            const result =
                item.result || "0";


            const operation =
                item.operation || "calculation";


            const date =
                item.created_at
                    ? new Date(
                        item.created_at
                    ).toLocaleString()
                    : "";


            card.innerHTML = `
                <div class="history-expression">
                    ${escapeHTML(expression)}
                </div>

                <div class="history-result">
                    = ${escapeHTML(result)}
                </div>

                <div class="history-operation">
                    ${escapeHTML(operation)}
                </div>

                <div class="history-date">
                    ${escapeHTML(date)}
                </div>
            `;


            historyContainer.appendChild(card);

        });
    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(message) {

        if (!historyContainer) {
            console.error(message);
            return;
        }

        historyContainer.innerHTML = `
            <div class="history-error">
                ${escapeHTML(message)}
            </div>
        `;
    }


    /* =====================================================
       START
    ===================================================== */

    await loadHistory();

});