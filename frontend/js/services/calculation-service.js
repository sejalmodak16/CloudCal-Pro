/* =========================================================
   CLOUDCALC PRO
   CALCULATION SERVICE
   Vanilla JavaScript + Supabase
========================================================= */

(function () {
    "use strict";

    /*
        This service uses the existing Supabase client.

        Expected global:
            window.supabaseClient

        Expected table:
            calculations

        Columns:
            id
            user_id
            expression
            result
            operation
            created_at
    */


    /* =====================================================
       HELPERS
    ===================================================== */

    function getSupabaseClient() {

        if (window.supabaseClient) {
            return window.supabaseClient;
        }

        /*
            Some existing CloudCalc projects expose the client
            using another common name.
        */

        if (window.supabase) {
            return window.supabase;
        }

        throw new Error(
            "Supabase client is not initialized."
        );
    }


    async function getCurrentUser() {

        const client = getSupabaseClient();

        const {
            data,
            error
        } = await client.auth.getUser();

        if (error) {
            throw error;
        }

        if (!data || !data.user) {
            throw new Error(
                "Please login before using CloudCalc Pro."
            );
        }

        return data.user;
    }


    /* =====================================================
       VALIDATE EXPRESSION
    ===================================================== */

    function validateExpression(expression) {

        if (
            typeof expression !== "string" ||
            !expression.trim()
        ) {
            throw new Error(
                "Enter a calculation first."
            );
        }


        const clean = expression
            .replace(/\s+/g, "");


        /*
            Only operations supported by the backend:
                numbers
                decimal
                +
                -
                *
                /
                (
                )
        */

        const validCharacters =
            /^[0-9+\-*/().]+$/;


        if (!validCharacters.test(clean)) {

            throw new Error(
                "Invalid characters in expression."
            );
        }


        /*
            Prevent consecutive operators that are
            obviously invalid.

            Negative numbers such as:
                -5
                8*-2
                (-4)
            remain allowed.
        */

        if (
            /[+*/]{2,}/.test(clean)
        ) {
            throw new Error(
                "Invalid operator sequence."
            );
        }


        /*
            Parentheses balance.
        */

        let balance = 0;

        for (const char of clean) {

            if (char === "(") {
                balance++;
            }

            if (char === ")") {
                balance--;

                if (balance < 0) {
                    throw new Error(
                        "Invalid parentheses."
                    );
                }
            }
        }


        if (balance !== 0) {
            throw new Error(
                "Parentheses are not balanced."
            );
        }


        return clean;
    }


    /* =====================================================
       SAFE CALCULATOR
       Basic arithmetic only
===================================================== */

    function evaluateExpression(expression) {

        const clean =
            validateExpression(expression);


        /*
            We intentionally don't directly use eval()
            on arbitrary user input.

            The expression has already been restricted to:
                digits
                operators
                decimal points
                parentheses
        */


        const tokens =
            tokenize(clean);

        let position = 0;


        function parseExpression() {

            let value =
                parseTerm();


            while (
                position < tokens.length &&
                (
                    tokens[position] === "+" ||
                    tokens[position] === "-"
                )
            ) {

                const operator =
                    tokens[position++];

                const right =
                    parseTerm();


                if (operator === "+") {
                    value += right;
                } else {
                    value -= right;
                }
            }


            return value;
        }


        function parseTerm() {

            let value =
                parseFactor();


            while (
                position < tokens.length &&
                (
                    tokens[position] === "*" ||
                    tokens[position] === "/"
                )
            ) {

                const operator =
                    tokens[position++];

                const right =
                    parseFactor();


                if (operator === "*") {

                    value *= right;

                } else {

                    if (right === 0) {
                        throw new Error(
                            "Cannot divide by zero."
                        );
                    }

                    value /= right;
                }
            }


            return value;
        }


        function parseFactor() {

            if (
                position >=
                tokens.length
            ) {
                throw new Error(
                    "Invalid expression."
                );
            }


            const token =
                tokens[position];


            /*
                Unary negative number
            */

            if (token === "-") {

                position++;

                return -parseFactor();
            }


            /*
                Unary positive number
            */

            if (token === "+") {

                position++;

                return parseFactor();
            }


            /*
                Parentheses
            */

            if (token === "(") {

                position++;

                const value =
                    parseExpression();


                if (
                    tokens[position] !== ")"
                ) {
                    throw new Error(
                        "Invalid parentheses."
                    );
                }


                position++;

                return value;
            }


            /*
                Number
            */

            if (
                typeof token === "number"
            ) {

                position++;

                return token;
            }


            throw new Error(
                "Invalid expression."
            );
        }


        const result =
            parseExpression();


        if (
            position !== tokens.length
        ) {
            throw new Error(
                "Invalid expression."
            );
        }


        if (
            !Number.isFinite(result)
        ) {
            throw new Error(
                "Calculation produced an invalid result."
            );
        }


        return result;
    }


    /* =====================================================
       TOKENIZER
    ===================================================== */

    function tokenize(expression) {

        const tokens = [];

        let index = 0;


        while (
            index < expression.length
        ) {

            const char =
                expression[index];


            /*
                Operators / parentheses
            */

            if (
                "+-*/()".includes(char)
            ) {

                tokens.push(char);

                index++;

                continue;
            }


            /*
                Number / decimal
            */

            if (
                /[0-9.]/.test(char)
            ) {

                let number = "";

                let decimalCount = 0;


                while (
                    index <
                        expression.length &&
                    /[0-9.]/.test(
                        expression[index]
                    )
                ) {

                    const current =
                        expression[index];


                    if (current === ".") {

                        decimalCount++;

                        if (
                            decimalCount > 1
                        ) {
                            throw new Error(
                                "Invalid decimal number."
                            );
                        }
                    }


                    number += current;

                    index++;
                }


                if (
                    number === "." ||
                    number === ""
                ) {
                    throw new Error(
                        "Invalid number."
                    );
                }


                const parsed =
                    Number(number);


                if (
                    !Number.isFinite(parsed)
                ) {
                    throw new Error(
                        "Invalid number."
                    );
                }


                tokens.push(parsed);

                continue;
            }


            throw new Error(
                "Invalid expression."
            );
        }


        return tokens;
    }


    /* =====================================================
       FORMAT RESULT
    ===================================================== */

    function formatResult(result) {

        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {
            return String(result);
        }


        /*
            Avoid ugly floating-point output.

            Example:
                0.1 + 0.2
                becomes
                0.3
        */

        const rounded =
            Number(
                result.toPrecision(12)
            );


        return String(rounded);
    }


    /* =====================================================
       DETERMINE OPERATION
    ===================================================== */

    function getOperation(expression) {

        if (
            expression.includes("+") ||
            expression.includes("-") ||
            expression.includes("*") ||
            expression.includes("/")
        ) {
            return "basic";
        }

        return "basic";
    }


    /* =====================================================
       CALCULATE
    ===================================================== */

    async function calculate(expression) {

        const clean =
            validateExpression(expression);


        const numericResult =
            evaluateExpression(clean);


        const result =
            formatResult(numericResult);


        return {
            expression: clean,
            result: result,
            numericResult: numericResult,
            operation: getOperation(clean)
        };
    }


    /* =====================================================
       SAVE CALCULATION
    ===================================================== */

    async function saveCalculation(
        expression,
        result,
        operation = "basic"
    ) {

        const client =
            getSupabaseClient();


        const user =
            await getCurrentUser();


        if (
            expression === undefined ||
            result === undefined
        ) {
            throw new Error(
                "Expression and result are required."
            );
        }


        const row = {

            user_id: user.id,

            expression:
                String(expression),

            result:
                String(result),

            operation:
                String(operation || "basic")
        };


        const {
            data,
            error
        } = await client
            .from("calculations")
            .insert(row)
            .select()
            .single();


        if (error) {
            throw error;
        }


        return data;
    }


    /* =====================================================
       GET HISTORY
       Latest 40 records
    ===================================================== */

    async function getHistory() {

        const client =
            getSupabaseClient();


        const user =
            await getCurrentUser();


        const {
            data,
            error
        } = await client
            .from("calculations")
            .select(
                "id,user_id,expression,result,operation,created_at"
            )
            .eq(
                "user_id",
                user.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(40);


        if (error) {
            throw error;
        }


        return data || [];
    }


    /* =====================================================
       DELETE ONE CALCULATION
    ===================================================== */

    async function deleteCalculation(id) {

        if (!id) {
            throw new Error(
                "Calculation ID is required."
            );
        }


        const client =
            getSupabaseClient();


        const user =
            await getCurrentUser();


        const {
            error
        } = await client
            .from("calculations")
            .delete()
            .eq(
                "id",
                id
            )
            .eq(
                "user_id",
                user.id
            );


        if (error) {
            throw error;
        }


        return true;
    }


    /* =====================================================
       DELETE ALL USER CALCULATIONS
    ===================================================== */

    async function deleteAllCalculations() {

        const client =
            getSupabaseClient();


        const user =
            await getCurrentUser();


        const {
            error
        } = await client
            .from("calculations")
            .delete()
            .eq(
                "user_id",
                user.id
            );


        if (error) {
            throw error;
        }


        return true;
    }


    /* =====================================================
       GET STATISTICS
    ===================================================== */

    async function getStatistics() {

        const history =
            await getHistory();


        const total =
            history.length;


        if (!total) {

            return {

                total: 0,

                average: 0,

                latest: null,

                successful: 0

            };
        }


        const values =
            history
                .map(item =>
                    Number(item.result)
                )
                .filter(
                    Number.isFinite
                );


        const average =
            values.length
                ? values.reduce(
                    (
                        sum,
                        value
                    ) =>
                        sum + value,
                    0
                ) / values.length
                : 0;


        return {

            total,

            average,

            latest:
                history[0] || null,

            successful:
                values.length
        };
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.CalculationService = {

        calculate,

        evaluateExpression,

        validateExpression,

        formatResult,

        saveCalculation,

        getHistory,

        deleteCalculation,

        deleteAllCalculations,

        getStatistics

    };

})();