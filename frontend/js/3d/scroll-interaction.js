
/* =========================================================
   CLOUDCALC PRO
   3D SCROLL INTERACTION
   frontend/js/3d/scroll-interaction.js

   Purpose:
   - Smooth scroll-based 3D movement
   - Subtle depth effect
   - Hero object reacts to page scroll
   - Mobile friendly
   - Reduced-motion support
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONFIG = {

        positionStrength: 0.45,

        rotationStrength: 0.12,

        scaleStrength: 0.035,

        smoothness: 0.06,

        maxScrollEffect: 1.0,

        mobileStrength: 0.65

    };


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        initialized: false,

        group: null,

        target: 0,

        current: 0,

        baseX: 0,

        baseY: 0,

        baseZ: 0,

        baseRotationX: 0,

        baseRotationY: 0,

        baseScale: 1

    };


    /* =====================================================
       GET OBJECT GROUP
    ====================================================== */

    function getObjectGroup() {

        if (
            window.CloudCalc3D &&
            window.CloudCalc3D.objects &&
            window.CloudCalc3D.objects.group
        ) {

            return window.CloudCalc3D.objects.group;

        }

        return null;

    }


    /* =====================================================
       REDUCED MOTION
    ====================================================== */

    function prefersReducedMotion() {

        return (
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        );

    }


    /* =====================================================
       GET SCROLL PROGRESS
    ====================================================== */

    function getScrollProgress() {

        const documentHeight =
            document.documentElement.scrollHeight;

        const viewportHeight =
            window.innerHeight;


        const maxScroll =
            documentHeight -
            viewportHeight;


        if (
            maxScroll <= 0
        ) {

            return 0;

        }


        return Math.min(
            Math.max(
                window.scrollY /
                maxScroll,
                0
            ),
            CONFIG.maxScrollEffect
        );

    }


    /* =====================================================
       HANDLE SCROLL
    ====================================================== */

    function handleScroll() {

        if (
            prefersReducedMotion()
        ) {

            state.target = 0;

            return;

        }


        state.target =
            getScrollProgress();

    }


    /* =====================================================
       UPDATE
    ====================================================== */

    function update() {

        const group =
            state.group;


        if (!group) {
            return;
        }


        /* ---------------------------------------------
           Reduced motion
        --------------------------------------------- */

        if (
            prefersReducedMotion()
        ) {

            group.position.x =
                state.baseX;

            group.position.y =
                state.baseY;

            group.position.z =
                state.baseZ;

            group.rotation.x =
                state.baseRotationX;

            group.rotation.y =
                state.baseRotationY;

            group.scale.set(
                state.baseScale,
                state.baseScale,
                state.baseScale
            );

            return;

        }


        /* ---------------------------------------------
           Smooth scroll value
        --------------------------------------------- */

        state.current +=
            (
                state.target -
                state.current
            ) *
            CONFIG.smoothness;


        /* ---------------------------------------------
           Mobile adjustment
        --------------------------------------------- */

        const isMobile =
            window.innerWidth <= 768;


        const strength =
            isMobile
                ? CONFIG.mobileStrength
                : 1;


        /* ---------------------------------------------
           Vertical movement
        --------------------------------------------- */

        const targetY =
            state.baseY -
            state.current *
            CONFIG.positionStrength *
            strength;


        group.position.y +=
            (
                targetY -
                group.position.y
            ) *
            CONFIG.smoothness;


        /* ---------------------------------------------
           Depth movement
        --------------------------------------------- */

        const targetZ =
            state.baseZ +
            state.current *
            0.18;


        group.position.z +=
            (
                targetZ -
                group.position.z
            ) *
            CONFIG.smoothness;


        /* ---------------------------------------------
           Rotation
        --------------------------------------------- */

        const targetRotationX =
            state.baseRotationX +
            state.current *
            CONFIG.rotationStrength;


        group.rotation.x +=
            (
                targetRotationX -
                group.rotation.x
            ) *
            CONFIG.smoothness;


        /* ---------------------------------------------
           Scale
        --------------------------------------------- */

        const targetScale =
            state.baseScale +
            state.current *
            CONFIG.scaleStrength;


        group.scale.x +=
            (
                targetScale -
                group.scale.x
            ) *
            CONFIG.smoothness;


        group.scale.y +=
            (
                targetScale -
                group.scale.y
            ) *
            CONFIG.smoothness;


        group.scale.z +=
            (
                targetScale -
                group.scale.z
            ) *
            CONFIG.smoothness;

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


        state.group =
            getObjectGroup();


        if (
            !state.group
        ) {
            return;
        }


        /* ---------------------------------------------
           Store original transform
        --------------------------------------------- */

        state.baseX =
            state.group.position.x;

        state.baseY =
            state.group.position.y;

        state.baseZ =
            state.group.position.z;


        state.baseRotationX =
            state.group.rotation.x;

        state.baseRotationY =
            state.group.rotation.y;


        state.baseScale =
            state.group.scale.x;


        /* ---------------------------------------------
           Events
        --------------------------------------------- */

        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true
            }
        );


        window.addEventListener(
            "resize",
            handleScroll,
            {
                passive: true
            }
        );


        handleScroll();


        state.initialized =
            true;


        /* ---------------------------------------------
           Public API
        --------------------------------------------- */

        window.CloudCalc3D =
            window.CloudCalc3D || {};


        window.CloudCalc3D.scrollController = {

            state,

            update,

            refresh:
                handleScroll

        };


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:scroll-ready"
            )
        );

    }


    /* =====================================================
       UPDATE WITH WEBGL LOOP
    ====================================================== */

    window.addEventListener(
        "cloudcalc:3d-tick",
        update
    );


    /* =====================================================
       WAIT FOR OBJECTS
    ====================================================== */

    window.addEventListener(
        "cloudcalc:objects-ready",
        initialize,
        {
            once: true
        }
    );


})();
