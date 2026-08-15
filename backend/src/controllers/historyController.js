"use strict";

/* =========================================================
   SAVE HISTORY
========================================================= */

async function saveHistory(req, res) {

    try {

        const {
            expression,
            result,
            operation
        } = req.body;

        /* ---------------------------------------------
           AUTHENTICATED USER
        --------------------------------------------- */

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                success: false,
                message: "Authenticated user not found."
            });
        }

        if (
            !expression ||
            result === undefined
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "expression and result are required."
            });
        }

        const user_id = req.user.id;

        /* ---------------------------------------------
           USE AUTHENTICATED SUPABASE CLIENT
        --------------------------------------------- */

        const { data, error } =
            await req.supabase
                .from("history")
                .insert({
                    user_id: user_id,
                    expression: expression,
                    result: String(result),
                    operation:
                        operation || "calculation"
                })
                .select()
                .single();

        if (error) {

            console.error(
                "Supabase save error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({

            success: true,

            message:
                "Calculation saved successfully.",

            data: data

        });

    }

    catch (error) {

        console.error(
            "Save history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error."
        });

    }

}


/* =========================================================
   GET HISTORY
========================================================= */

async function getHistory(req, res) {

    try {

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                success: false,
                message: "Authenticated user not found."
            });

        }

        const user_id = req.user.id;

        const { data, error } =
            await req.supabase
                .from("history")
                .select(
                    "id, user_id, expression, result, operation, created_at"
                )
                .eq(
                    "user_id",
                    user_id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {

            console.error(
                "Supabase get error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }

        return res.json({
            success: true,
            data: data || []
        });

    }

    catch (error) {

        console.error(
            "Get history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error."
        });

    }

}


/* =========================================================
   DELETE HISTORY
========================================================= */

async function deleteHistory(req, res) {

    try {

        const {
            id
        } = req.params;

        if (!id) {

            return res.status(400).json({
                success: false,
                message:
                    "History ID is required."
            });

        }

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                success: false,
                message: "Authenticated user not found."
            });

        }

        const user_id = req.user.id;

        /* ---------------------------------------------
           DELETE ONLY USER'S OWN RECORD
        --------------------------------------------- */

        const {
            data,
            error
        } =
            await req.supabase
                .from("history")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "user_id",
                    user_id
                )
                .select()
                .maybeSingle();

        if (error) {

            console.error(
                "Supabase delete error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }

        if (!data) {

            return res.status(404).json({
                success: false,
                message:
                    "History record not found."
            });

        }

        return res.json({

            success: true,

            message:
                "History deleted successfully.",

            data: data

        });

    }

    catch (error) {

        console.error(
            "Delete history error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error."
        });

    }

}


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
    saveHistory,
    getHistory,
    deleteHistory
};