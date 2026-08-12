
/* =========================================================
   CLOUDCALC PRO
   3D CURSOR INTERACTION
   frontend/js/3d/cursor-interaction.js

   Purpose:
   - Subtle mouse interaction
   - Smooth 3D tilt
   - Premium depth effect
   - Mobile-safe
   - Reduced-motion support
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONFIG = {

        strength: 0.16,

        rotationStrength: 0.10,

        smoothness: 0.06,

        maxRotation: 0.18,

        mobileBreakpoint: 768

    };


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        initialized: false,

        group: null,

        targetX: 0,

        targetY: 0,

        currentX: 0,

        currentY: 0,

        baseRotationX: 0,

        baseRotationY: -0.12

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
       CHECK REDUCED MOTION
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
       HANDLE POINTER
    ====================================================== */

    function handlePointerMove(event) {

        if (
            window.innerWidth <=
            CONFIG.mobileBreakpoint
        ) {
            return;
        }


        if (
            prefersReducedMotion()
        ) {
            return;
        }


        const width =
            window.innerWidth;

        const height =
            window.innerHeight;


        const normalizedX =
            (event.clientX / width) * 2 - 1;


        const normalizedY =
            (event.clientY / height) * 2 - 1;


        state.targetX =
            normalizedX;


        state.targetY =
            normalizedY;

    }


    /* =====================================================
       RESET
    ====================================================== */

    function reset() {

        state.targetX = 0;
        state.targetY = 0;

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


        if (
            prefersReducedMotion()
        ) {

            group.rotation.x =
                state.baseRotationX;

            group.rotation.y =
                state.baseRotationY;

            return;

        }


        /* ---------------------------------------------
           Smooth cursor values
        --------------------------------------------- */

        state.currentX +=
            (
                state.targetX -
                state.currentX
            ) *
            CONFIG.smoothness;


        state.currentY +=
            (
                state.targetY -
                state.currentY
            ) *
            CONFIG.smoothness;


        /* ---------------------------------------------
           Position depth
        --------------------------------------------- */

        group.position.x +=
            (
                1.35 +
                state.currentX *
                CONFIG.strength -
                group.position.x
            ) *
            CONFIG.smoothness;


        /* ---------------------------------------------
           X rotation
        --------------------------------------------- */

        const rotationX =
            state.baseRotationX +
            (
                state.currentY *
                CONFIG.rotationStrength
            );


        /* ---------------------------------------------
           Y rotation
        --------------------------------------------- */

        const rotationY =
            state.baseRotationY +
            (
                state.currentX *
                CONFIG.rotationStrength
            );


        /* ---------------------------------------------
           Limit rotation
        --------------------------------------------- */

        group.rotation.x =
            Math.max(
                -CONFIG.maxRotation,
                Math.min(
                    CONFIG.maxRotation,
                    rotationX
                )
            );


        group.rotation.y =
            Math.max(
                state.baseRotationY -
                CONFIG.maxRotation,

                Math.min(
                    state.baseRotationY +
                    CONFIG.maxRotation,

                    rotationY
                )
            );

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


        state.baseRotationX =
            state.group.rotation.x;


        state.baseRotationY =
            state.group.rotation.y;


        window.addEventListener(
            "pointermove",
            handlePointerMove,
            {
                passive: true
            }
        );


        window.addEventListener(
            "pointerleave",
            reset,
            {
                passive: true
            }
        );


        state.initialized =
            true;


        window.CloudCalc3D =
            window.CloudCalc3D || {};


        window.CloudCalc3D.cursorController = {

            state,

            update,

            reset

        };


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:cursor-ready"
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

