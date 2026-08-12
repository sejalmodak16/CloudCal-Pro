
/* =========================================================
   CLOUDCALC PRO
   3D PERFORMANCE CONTROLLER
   frontend/js/3d/performance.js

   Purpose:
   - Detect device performance
   - Limit pixel ratio
   - Pause WebGL when tab is hidden
   - Support reduced motion
   - Protect weaker devices
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONFIG = {

        maxPixelRatio: 2,

        lowPerformancePixelRatio: 1,

        lowPerformanceCores: 4,

        lowPerformanceMemory: 4,

        mobilePixelRatio: 1.5

    };


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        initialized: false,

        isLowPerformance: false,

        isMobile: false,

        reducedMotion: false,

        pageVisible: true,

        pixelRatio: 1

    };


    /* =====================================================
       DEVICE DETECTION
    ====================================================== */

    function detectDevice() {

        const cores =
            navigator.hardwareConcurrency || 4;


        const memory =
            navigator.deviceMemory || 8;


        state.isMobile =
            window.innerWidth <= 768;


        state.isLowPerformance =
            cores <= CONFIG.lowPerformanceCores ||
            memory <= CONFIG.lowPerformanceMemory;


        state.reducedMotion =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        /* ---------------------------------------------
           Select pixel ratio
        --------------------------------------------- */

        const deviceRatio =
            window.devicePixelRatio || 1;


        if (
            state.isLowPerformance
        ) {

            state.pixelRatio =
                CONFIG.lowPerformancePixelRatio;

        } else if (
            state.isMobile
        ) {

            state.pixelRatio =
                Math.min(
                    deviceRatio,
                    CONFIG.mobilePixelRatio
                );

        } else {

            state.pixelRatio =
                Math.min(
                    deviceRatio,
                    CONFIG.maxPixelRatio
                );

        }

    }


    /* =====================================================
       APPLY PERFORMANCE SETTINGS
    ====================================================== */

    function applySettings() {

        if (
            !window.CloudCalc3D
        ) {
            return;
        }


        const renderer =
            window.CloudCalc3D.renderer;


        if (
            !renderer
        ) {
            return;
        }


        renderer.setPixelRatio(
            state.pixelRatio
        );


        renderer.setSize(
            window.innerWidth,
            window.innerHeight,
            false
        );


        /* ---------------------------------------------
           Reduced motion class
        --------------------------------------------- */

        if (
            state.reducedMotion
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


        /* ---------------------------------------------
           Low performance class
        --------------------------------------------- */

        if (
            state.isLowPerformance
        ) {

            document.documentElement
                .classList
                .add(
                    "low-performance"
                );

        } else {

            document.documentElement
                .classList
                .remove(
                    "low-performance"
                );

        }

    }


    /* =====================================================
       PAGE VISIBILITY
    ====================================================== */

    function handleVisibility() {

        state.pageVisible =
            !document.hidden;


        if (
            !window.CloudCalc3D
        ) {
            return;
        }


        if (
            state.pageVisible
        ) {

            if (
                typeof
                window.CloudCalc3D.start ===
                "function"
            ) {

                window.CloudCalc3D.start();

            }

        } else {

            if (
                typeof
                window.CloudCalc3D.stop ===
                "function"
            ) {

                window.CloudCalc3D.stop();

            }

        }

    }


    /* =====================================================
       RESIZE
    ====================================================== */

    function handleResize() {

        detectDevice();

        applySettings();

    }


    /* =====================================================
       REDUCED MOTION CHANGE
    ====================================================== */

    function handleMotionChange() {

        detectDevice();

        applySettings();

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


        detectDevice();


        document.addEventListener(
            "visibilitychange",
            handleVisibility
        );


        window.addEventListener(
            "resize",
            handleResize,
            {
                passive: true
            }
        );


        const motionQuery =
            window.matchMedia
                ? window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                )
                : null;


        if (
            motionQuery
        ) {

            if (
                typeof motionQuery.addEventListener ===
                "function"
            ) {

                motionQuery.addEventListener(
                    "change",
                    handleMotionChange
                );

            } else if (
                typeof motionQuery.addListener ===
                "function"
            ) {

                motionQuery.addListener(
                    handleMotionChange
                );

            }

        }


        state.initialized =
            true;


        applySettings();


        window.CloudCalc3D =
            window.CloudCalc3D || {};


        window.CloudCalc3D.performance =
            state;


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:performance-ready"
            )
        );

    }


    /* =====================================================
       WAIT FOR SCENE
    ====================================================== */

    window.addEventListener(
        "cloudcalc:scene-ready",
        initialize,
        {
            once: true
        }
    );


})();

