
/* =========================================================
   CLOUDCALC PRO
   VALIDATION UTILITY
========================================================= */

(function () {

    "use strict";

    window.CloudCalcValidation = {

        required(value) {

            return (
                value !== null &&
                value !== undefined &&
                String(value).trim().length > 0
            );

        },


        email(value) {

            if (!this.required(value)) {
                return false;
            }

            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(String(value).trim());

        },


        minLength(value, length) {

            if (!this.required(value)) {
                return false;
            }

            return String(value).trim().length >= length;

        },


        maxLength(value, length) {

            if (!this.required(value)) {
                return true;
            }

            return String(value).trim().length <= length;

        },


        number(value) {

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return false;
            }

            return Number.isFinite(
                Number(value)
            );

        },


        positiveNumber(value) {

            return (
                this.number(value) &&
                Number(value) > 0
            );

        },


        integer(value) {

            if (!this.number(value)) {
                return false;
            }

            return Number.isInteger(
                Number(value)
            );

        },


        password(value) {

            if (!this.required(value)) {
                return false;
            }

            return String(value).length >= 6;

        },


        passwordMatch(password, confirmPassword) {

            return (
                this.required(password) &&
                password === confirmPassword
            );

        },


        expression(value) {

            if (!this.required(value)) {
                return false;
            }

            const expression =
                String(value).trim();

            if (expression.length > 500) {
                return false;
            }

            return /^[0-9+\-*/().%\s]+$/
                .test(expression);

        },


        form(form) {

            if (!form) {
                return {
                    valid: false,
                    errors: {}
                };
            }

            const errors = {};

            const fields =
                form.querySelectorAll(
                    "input, select, textarea"
                );

            fields.forEach(field => {

                if (
                    field.disabled ||
                    field.type === "submit" ||
                    field.type === "button"
                ) {
                    return;
                }

                const value =
                    field.value.trim();

                if (
                    field.required &&
                    !this.required(value)
                ) {

                    errors[field.name || field.id] =
                        "This field is required.";

                    return;

                }

                if (
                    field.type === "email" &&
                    value &&
                    !this.email(value)
                ) {

                    errors[field.name || field.id] =
                        "Enter a valid email address.";

                }

            });

            return {

                valid:
                    Object.keys(errors).length === 0,

                errors

            };

        },


        clearErrors(form) {

            if (!form) {
                return;
            }

            form.querySelectorAll(
                ".validation-error"
            ).forEach(element => {
                element.remove();
            });

            form.querySelectorAll(
                ".is-invalid"
            ).forEach(element => {
                element.classList.remove(
                    "is-invalid"
                );
            });

        },


        showError(input, message) {

            if (!input) {
                return;
            }

            input.classList.add(
                "is-invalid"
            );

            let error =
                input.parentElement.querySelector(
                    ".validation-error"
                );

            if (!error) {

                error =
                    document.createElement("small");

                error.className =
                    "validation-error";

                input.parentElement.appendChild(
                    error
                );

            }

            error.textContent = message;

        }

    };

})();

