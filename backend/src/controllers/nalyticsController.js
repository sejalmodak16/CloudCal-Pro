"use strict";

/* =========================================================
   CLOUDCALC PRO
   ANALYTICS CONTROLLER
========================================================= */

async function getAnalytics(req, res) {
    try {
        /* ---------------------------------------------
           AUTHENTICATED USER
        --------------------------------------------- */

        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found."
            });
        }

        /* ---------------------------------------------
           GET USER HISTORY
        --------------------------------------------- */

        const { data, error } = await req.supabase
            .from("history")
            .select(
                "id, user_id, expression, result, operation, created_at"
            )
            .eq("user_id", userId)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            console.error(
                "Analytics history error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        const history = data || [];

        /* ---------------------------------------------
           TOTAL CALCULATIONS
        --------------------------------------------- */

        const totalCalculations = history.length;

        /* ---------------------------------------------
           NUMERIC RESULTS
        --------------------------------------------- */

        const numericResults = history
            .map(item => Number(item.result))
            .filter(value => Number.isFinite(value));

        /* ---------------------------------------------
           AVERAGE RESULT
        --------------------------------------------- */

        let averageResult = 0;

        if (numericResults.length > 0) {
            const sum = numericResults.reduce(
                (total, value) => total + value,
                0
            );

            averageResult = sum / numericResults.length;
        }

        /* ---------------------------------------------
           HIGHEST RESULT
        --------------------------------------------- */

        const highestResult =
            numericResults.length > 0
                ? Math.max(...numericResults)
                : 0;

        /* ---------------------------------------------
           LATEST RESULT
        --------------------------------------------- */

        const latestResult =
            history.length > 0
                ? history[0].result
                : 0;

        /* ---------------------------------------------
           OPERATION COUNTS
        --------------------------------------------- */

        const operationCounts = {};

        history.forEach(item => {
            const operation =
                item.operation ||
                detectOperation(item.expression);

            const normalized =
                String(operation).toLowerCase();

            operationCounts[normalized] =
                (operationCounts[normalized] || 0) + 1;
        });

        /* ---------------------------------------------
           MOST USED OPERATION
        --------------------------------------------- */

        const sortedOperations =
            Object.entries(operationCounts)
                .sort((a, b) => b[1] - a[1]);

        const mostUsedOperation =
            sortedOperations.length > 0
                ? sortedOperations[0][0]
                : null;

        /* ---------------------------------------------
           ACTIVE DAYS
        --------------------------------------------- */

        const activeDaySet = new Set();

        history.forEach(item => {
            if (!item.created_at) {
                return;
            }

            const date =
                new Date(item.created_at);

            const day =
                date.toISOString().split("T")[0];

            activeDaySet.add(day);
        });

        const activeDays =
            activeDaySet.size;

        /* ---------------------------------------------
           LAST 7 DAYS ACTIVITY
        --------------------------------------------- */

        const activity = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();

            date.setHours(
                0,
                0,
                0,
                0
            );

            date.setDate(
                date.getDate() - i
            );

            const dateKey =
                date.toISOString().split("T")[0];

            const count =
                history.filter(item => {
                    if (!item.created_at) {
                        return false;
                    }

                    const itemDate =
                        new Date(item.created_at);

                    const itemKey =
                        itemDate
                            .toISOString()
                            .split("T")[0];

                    return itemKey === dateKey;
                }).length;

            activity.push({
                date: dateKey,
                count: count
            });
        }

        /* ---------------------------------------------
           RESPONSE
        --------------------------------------------- */

        return res.json({
            success: true,

            data: {
                totalCalculations,

                averageResult:
                    Number(
                        averageResult.toFixed(2)
                    ),

                highestResult,

                latestResult,

                mostUsedOperation,

                activeDays,

                operationCounts,

                activity
            }
        });

    } catch (error) {
        console.error(
            "Analytics controller error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load analytics."
        });
    }
}


/* =========================================================
   DETECT OPERATION
========================================================= */

function detectOperation(expression) {

    const value =
        String(expression || "");

    if (value.includes("+")) {
        return "addition";
    }

    if (value.includes("-")) {
        return "subtraction";
    }

    if (
        value.includes("*") ||
        value.includes("×")
    ) {
        return "multiplication";
    }

    if (
        value.includes("/") ||
        value.includes("÷")
    ) {
        return "division";
    }

    if (value.includes("%")) {
        return "percentage";
    }

    return "calculation";
}


module.exports = {
    getAnalytics
};