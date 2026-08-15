"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const voiceButton = document.getElementById("voiceButton");

    if (!voiceButton) {
        console.error("CloudCalc Pro: voiceButton not found.");
        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.error(
            "CloudCalc Pro: Speech Recognition is not supported."
        );

        voiceButton.textContent = "🎤 Not Supported";
        voiceButton.disabled = true;
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceButton.addEventListener("click", function () {

        try {
            recognition.start();

            voiceButton.textContent = "🎙️ Listening...";

            console.log(
                "CloudCalc Pro: Listening for voice..."
            );

        } catch (error) {
            console.error(
                "CloudCalc Pro voice error:",
                error
            );
        }
    });

    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript;

        console.log(
            "CloudCalc Pro voice:",
            transcript
        );

        voiceButton.textContent = "🎤 Voice";

        convertVoiceToCalculation(transcript);
    };

    recognition.onerror = function (event) {

        console.error(
            "CloudCalc Pro voice recognition error:",
            event.error
        );

        voiceButton.textContent = "🎤 Voice";
    };

    recognition.onend = function () {

        voiceButton.textContent = "🎤 Voice";
    };


    function convertVoiceToCalculation(text) {

        let expression = text.toLowerCase();

        expression = expression
            .replace(/plus/g, "+")
            .replace(/minus/g, "-")
            .replace(/times/g, "*")
            .replace(/multiplied by/g, "*")
            .replace(/divided by/g, "/")
            .replace(/divide by/g, "/")
            .replace(/percent/g, "%");

        console.log(
            "Converted calculation:",
            expression
        );

        /*
         * For now, show the recognized
         * calculation in your existing
         * calculator display.
         */

        const expressionElement =
            document.getElementById("expression");

        if (expressionElement) {
            expressionElement.textContent =
                expression;
        }

        calculateVoiceExpression(expression);
    }


    function calculateVoiceExpression(expression) {

        try {

            /*
             * Only allow calculator characters.
             */
            const safeExpression =
                expression.replace(/[^0-9+\-*/%.() ]/g, "");

            if (!safeExpression) {
                return;
            }

            const result =
                Function(
                    `"use strict"; return (${safeExpression})`
                )();

            const resultElement =
                document.getElementById("result");

            if (resultElement) {
                resultElement.textContent =
                    result;
            }

            console.log(
                "Voice calculation result:",
                result
            );

        } catch (error) {

            console.error(
                "Voice calculation failed:",
                error
            );

            const resultElement =
                document.getElementById("result");

            if (resultElement) {
                resultElement.textContent =
                    "Error";
            }
        }
    }

});