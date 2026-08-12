
/* =========================================================
   CLOUDCALC PRO
   3D LIGHTING SYSTEM
   frontend/js/3d/lights.js

   Purpose:
   - Premium ambient lighting
   - Soft key light
   - Subtle rim lighting
   - Supports glass / 3D depth
   - Lightweight for college/demo devices
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONFIG = {

        ambient: {
            color: 0xffffff,
            intensity: 0.65
        },

        key: {
            color: 0xffffff,
            intensity: 2.2,

            position: {
                x: 4,
                y: 5,
                z: 6
            }
        },

        fill: {
            color: 0x7c8cff,
            intensity: 1.4,

            position: {
                x: -4,
                y: 1,
                z: 4
            }
        },

        rim: {
            color: 0x9c7cff,
            intensity: 1.8,

            position: {
                x: 2,
                y: -2,
                z: -4
            }
        }

    };


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        initialized: false,

        scene: null,

        ambient: null,

        key: null,

        fill: null,

        rim: null

    };


    /* =====================================================
       GET THREE
    ====================================================== */

    function getThree() {

        return window.THREE || null;

    }


    /* =====================================================
       GET SCENE
    ====================================================== */

    function getScene() {

        if (
            window.CloudCalc3D &&
            window.CloudCalc3D.scene
        ) {

            return window.CloudCalc3D.scene;

        }

        return null;

    }


    /* =====================================================
       CREATE LIGHTS
    ====================================================== */

    function createLights() {

        const THREE =
            getThree();


        const scene =
            getScene();


        if (
            !THREE ||
            !scene
        ) {

            return false;

        }


        /* =================================================
           AMBIENT LIGHT
        ================================================= */

        state.ambient =
            new THREE.AmbientLight(
                CONFIG.ambient.color,
                CONFIG.ambient.intensity
            );


        scene.add(
            state.ambient
        );


        /* =================================================
           KEY LIGHT
        ================================================= */

        state.key =
            new THREE.DirectionalLight(
                CONFIG.key.color,
                CONFIG.key.intensity
            );


        state.key.position.set(
            CONFIG.key.position.x,
            CONFIG.key.position.y,
            CONFIG.key.position.z
        );


        scene.add(
            state.key
        );


        /* =================================================
           FILL LIGHT
        ================================================= */

        state.fill =
            new THREE.PointLight(
                CONFIG.fill.color,
                CONFIG.fill.intensity,
                20,
                2
            );


        state.fill.position.set(
            CONFIG.fill.position.x,
            CONFIG.fill.position.y,
            CONFIG.fill.position.z
        );


        scene.add(
            state.fill
        );


        /* =================================================
           RIM LIGHT
        ================================================= */

        state.rim =
            new THREE.PointLight(
                CONFIG.rim.color,
                CONFIG.rim.intensity,
                18,
                2
            );


        state.rim.position.set(
            CONFIG.rim.position.x,
            CONFIG.rim.position.y,
            CONFIG.rim.position.z
        );


        scene.add(
            state.rim
        );


        return true;

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


        const created =
            createLights();


        if (!created) {

            return;

        }


        state.scene =
            getScene();


        state.initialized =
            true;


        /* ---------------------------------------------
           Public references
        --------------------------------------------- */

        window.CloudCalc3D =
            window.CloudCalc3D || {};


        window.CloudCalc3D.lights =
            state;


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:lights-ready"
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


    /* =====================================================
       PUBLIC API
    ====================================================== */

    window.CloudCalc3D =
        window.CloudCalc3D || {};


    window.CloudCalc3D.lightingController = {

        state,

        initialize

    };

})();

