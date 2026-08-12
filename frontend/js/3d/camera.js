
/* =========================================================
   CLOUDCALC PRO
   3D CAMERA SYSTEM
   frontend/js/3d/camera.js

   Purpose:
   - Smooth camera movement
   - Cursor-based subtle depth
   - Scroll-based camera movement
   - Responsive positioning
   - Reduced-motion support
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONFIG = {

        defaultPosition: {
            x: 0,
            y: 0,
            z: 7
        },

        desktop: {
            x: 0,
            y: 0,
            z: 7
        },

        tablet: {
            x: 0,
            y: 0,
            z: 8
        },

        mobile: {
            x: 0,
            y: 0,
            z: 9
        },

        cursorStrength: 0.18,

        scrollStrength: 0.35,

        smoothness: 0.06,

        lookAt: {
            x: 0,
            y: 0,
            z: 0
        }

    };


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        camera: null,

        initialized: false,

        cursorX: 0,

        cursorY: 0,

        targetX: 0,

        targetY: 0,

        scrollTarget: 0,

        scrollValue: 0,

        baseX: 0,

        baseY: 0,

        baseZ: 7

    };


    /* =====================================================
       GET CAMERA
    ====================================================== */

    function getCamera() {

        if (
            window.CloudCalc3D &&
            window.CloudCalc3D.camera
        ) {

            return window.CloudCalc3D.camera;

        }

        return null;
    }


    /* =====================================================
       DEVICE TYPE
    ====================================================== */

    function getDevicePosition() {

        const width =
            window.innerWidth;


        if (width <= 600) {

            return CONFIG.mobile;

        }


        if (width <= 1024) {

            return CONFIG.tablet;

        }


        return CONFIG.desktop;
    }


    /* =====================================================
       APPLY BASE POSITION
    ====================================================== */

    function applyBasePosition() {

        const camera =
            state.camera;


        if (!camera) {
            return;
        }


        const position =
            getDevicePosition();


        state.baseX =
            position.x;

        state.baseY =
            position.y;

        state.baseZ =
            position.z;


        camera.position.x =
            position.x;

        camera.position.y =
            position.y;

        camera.position.z =
            position.z;


        camera.lookAt(
            CONFIG.lookAt.x,
            CONFIG.lookAt.y,
            CONFIG.lookAt.z
        );

    }


    /* =====================================================
       CURSOR
    ====================================================== */

    function handleCursor(event) {

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;


        state.cursorX =
            (event.clientX / width) * 2 - 1;


        state.cursorY =
            (event.clientY / height) * 2 - 1;


        state.targetX =
            state.cursorX;


        state.targetY =
            state.cursorY;

    }


    /* =====================================================
       SCROLL
    ====================================================== */

    function handleScroll() {

        const maxScroll =
            document.documentElement.scrollHeight -
            window.innerHeight;


        if (maxScroll <= 0) {

            state.scrollTarget =
                0;

            return;
        }


        state.scrollTarget =
            window.scrollY /
            maxScroll;

    }


    /* =====================================================
       SMOOTH CAMERA UPDATE
    ====================================================== */

    function update() {

        const camera =
            state.camera;


        if (!camera) {
            return;
        }


        const reducedMotion =
            document.documentElement
                .classList
                .contains(
                    "reduced-motion"
                );


        /* ---------------------------------------------
           Reduced Motion
        --------------------------------------------- */

        if (reducedMotion) {

            camera.position.x =
                state.baseX;

            camera.position.y =
                state.baseY;

            camera.position.z =
                state.baseZ;

            camera.lookAt(
                CONFIG.lookAt.x,
                CONFIG.lookAt.y,
                CONFIG.lookAt.z
            );

            return;
        }


        /* ---------------------------------------------
           Smooth Scroll
        --------------------------------------------- */

        state.scrollValue +=
            (
                state.scrollTarget -
                state.scrollValue
            ) *
            CONFIG.smoothness;


        /* ---------------------------------------------
           Cursor Target
        --------------------------------------------- */

        const cursorOffsetX =
            state.targetX *
            CONFIG.cursorStrength;


        const cursorOffsetY =
            state.targetY *
            CONFIG.cursorStrength;


        /* ---------------------------------------------
           Scroll Offset
        --------------------------------------------- */

        const scrollOffsetY =
            state.scrollValue *
            CONFIG.scrollStrength;


        /* ---------------------------------------------
           Final Camera Position
        --------------------------------------------- */

        const finalX =
            state.baseX +
            cursorOffsetX;


        const finalY =
            state.baseY -
            cursorOffsetY -
            scrollOffsetY;


        const finalZ =
            state.baseZ;


        /* ---------------------------------------------
           Smooth Movement
        --------------------------------------------- */

        camera.position.x +=
            (
                finalX -
                camera.position.x
            ) *
            CONFIG.smoothness;


        camera.position.y +=
            (
                finalY -
                camera.position.y
            ) *
            CONFIG.smoothness;


        camera.position.z +=
            (
                finalZ -
                camera.position.z
            ) *
            CONFIG.smoothness;


        camera.lookAt(
            CONFIG.lookAt.x,
            CONFIG.lookAt.y,
            CONFIG.lookAt.z
        );

    }


    /* =====================================================
       RESIZE
    ====================================================== */

    function handleResize() {

        if (!state.camera) {
            return;
        }


        applyBasePosition();

    }


    /* =====================================================
       INITIALIZE
    ====================================================== */

    function initialize() {

        if (state.initialized) {
            return;
        }


        const camera =
            getCamera();


        if (!camera) {
            return;
        }


        state.camera =
            camera;


        applyBasePosition();


        window.addEventListener(
            "mousemove",
            handleCursor,
            {
                passive: true
            }
        );


        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true
            }
        );


        window.addEventListener(
            "resize",
            handleResize,
            {
                passive: true
            }
        );


        handleScroll();


        state.initialized =
            true;


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:camera-ready"
            )
        );

    }


    /* =====================================================
       UPDATE LOOP
    ====================================================== */

    window.addEventListener(
        "cloudcalc:3d-tick",
        update
    );


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


    /* =====================================================
       PUBLIC API
    ====================================================== */

    window.CloudCalc3D =
        window.CloudCalc3D || {};


    window.CloudCalc3D.cameraController = {

        state,

        initialize,

        update,

        reset: () => {

            state.cursorX = 0;
            state.cursorY = 0;

            state.targetX = 0;
            state.targetY = 0;

            state.scrollTarget = 0;
            state.scrollValue = 0;

            if (state.camera) {

                applyBasePosition();

            }

        }

    };

})();

