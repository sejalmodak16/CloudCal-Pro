
/* =========================================================
   CLOUDCALC PRO
   WEBGL FALLBACK SYSTEM
   frontend/js/3d/webgl-fallback.js

   Pipeline:
   WebGL → CSS 3D → Glass → Glow → Motion → Fallback

   Purpose:
   - Detect WebGL failure
   - Hide broken canvas
   - Enable CSS fallback
   - Keep the landing page usable
   - Support reduced motion
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONFIG = {

        canvasId:
            "webgl-canvas",

        webglBackgroundId:
            "webgl-background",

        fallbackId:
            "webgl-fallback"

    };


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        initialized: false,

        fallbackActive: false

    };


    /* =====================================================
       ELEMENTS
    ====================================================== */

    function getElements() {

        return {

            canvas:
                document.getElementById(
                    CONFIG.canvasId
                ),

            webglBackground:
                document.getElementById(
                    CONFIG.webglBackgroundId
                ),

            fallback:
                document.getElementById(
                    CONFIG.fallbackId
                )

        };

    }


    /* =====================================================
       CHECK WEBGL SUPPORT
    ====================================================== */

    function isWebGLSupported() {

        const canvas =
            document.createElement(
                "canvas"
            );


        try {

            const context =
                canvas.getContext(
                    "webgl"
                ) ||
                canvas.getContext(
                    "experimental-webgl"
                );


            return !!context;

        } catch (error) {

            return false;

        }

    }


    /* =====================================================
       ACTIVATE FALLBACK
    ====================================================== */

    function activateFallback(
        reason = "unknown"
    ) {

        if (
            state.fallbackActive
        ) {
            return;
        }


        const elements =
            getElements();


        state.fallbackActive =
            true;


        /* ---------------------------------------------
           Hide WebGL
        --------------------------------------------- */

        if (
            elements.canvas
        ) {

            elements.canvas.style.display =
                "none";

        }


        if (
            elements.webglBackground
        ) {

            elements.webglBackground
                .classList
                .remove(
                    "webgl-active"
                );

            elements.webglBackground
                .classList
                .add(
                    "webgl-disabled"
                );

        }


        /* ---------------------------------------------
           Show CSS fallback
        --------------------------------------------- */

        if (
            elements.fallback
        ) {

            elements.fallback
                .classList
                .add(
                    "fallback-active"
                );

            elements.fallback
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

        }


        /* ---------------------------------------------
           Body state
        --------------------------------------------- */

        document.documentElement
            .classList
            .add(
                "webgl-fallback-active"
            );


        document.body
            .classList
            .add(
                "webgl-fallback-mode"
            );


        console.info(
            `CloudCalc Pro: CSS fallback enabled (${reason}).`
        );


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:fallback-ready",
                {
                    detail: {
                        reason
                    }
                }
            )
        );

    }


    /* =====================================================
       DEACTIVATE FALLBACK
    ====================================================== */

    function deactivateFallback() {

        if (
            !state.fallbackActive
        ) {
            return;
        }


        const elements =
            getElements();


        state.fallbackActive =
            false;


        if (
            elements.canvas
        ) {

            elements.canvas.style.display =
                "";

        }


        if (
            elements.webglBackground
        ) {

            elements.webglBackground
                .classList
                .remove(
                    "webgl-disabled"
                );

            elements.webglBackground
                .classList
                .add(
                    "webgl-active"
                );

        }


        if (
            elements.fallback
        ) {

            elements.fallback
                .classList
                .remove(
                    "fallback-active"
                );

            elements.fallback
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

        }


        document.documentElement
            .classList
            .remove(
                "webgl-fallback-active"
            );


        document.body
            .classList
            .remove(
                "webgl-fallback-mode"
            );

    }


    /* =====================================================
       WEBGL CONTEXT LOST
    ====================================================== */

    function handleContextLost() {

        activateFallback(
            "WebGL context lost"
        );

    }


    /* =====================================================
       REDUCED MOTION
    ====================================================== */

    function handleReducedMotion() {

        if (
            !window.matchMedia
        ) {
            return;
        }


        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        if (
            reducedMotion
        ) {

            document.documentElement
                .classList
                .add(
                    "reduced-motion"
                );

        } else {

            document.documentElement
                .classList
                .remove(
                    "reduced-motion"
                );

        }

    }


    /* =====================================================
       INITIALIZE
    ====================================================== */

    function initialize() {

        if (
            state.initialized
        ) {
            return;
        }


        state.initialized =
            true;


        /* ---------------------------------------------
           Check browser support
        --------------------------------------------- */

        if (
            !isWebGLSupported()
        ) {

            activateFallback(
                "WebGL not supported"
            );

        }


        /* ---------------------------------------------
           Listen for renderer failure
        --------------------------------------------- */

        window.addEventListener(
            "cloudcalc:webgl-fallback",
            () => {

                activateFallback(
                    "renderer failure"
                );

            }
        );


        /* ---------------------------------------------
           Listen for context loss
        --------------------------------------------- */

        const elements =
            getElements();


        if (
            elements.canvas
        ) {

            elements.canvas.addEventListener(
                "webglcontextlost",
                handleContextLost,
                false
            );

        }


        /* ---------------------------------------------
           Reduced motion
        --------------------------------------------- */

        handleReducedMotion();


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:fallback-system-ready"
            )
        );

    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    window.CloudCalc3D =
        window.CloudCalc3D || {};


    window.CloudCalc3D.fallback =
        {

            state,

            initialize,

            activate:
                activateFallback,

            deactivate:
                deactivateFallback,

            isSupported:
                isWebGLSupported

        };


    /* =====================================================
       START
    ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }

})();
