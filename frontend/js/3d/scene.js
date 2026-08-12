
/* =========================================================
   CLOUDCALC PRO
   THREE.JS / WEBGL SCENE
   frontend/js/3d/scene.js

   Pipeline:
   WebGL → CSS 3D → Glass → Depth → Glow → Motion → Fallback
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       CONFIG
    ====================================================== */

    const CONFIG = {
        canvasId: "webgl-canvas",
        backgroundId: "webgl-background",

        backgroundColor: 0x080b14,

        antialias: true,
        alpha: true,

        pixelRatioLimit: 2,

        cameraFov: 45,
        cameraNear: 0.1,
        cameraFar: 100
    };


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        initialized: false,

        running: false,

        width: 0,

        height: 0,

        animationFrame: null,

        scene: null,

        camera: null,

        renderer: null,

        canvas: null

    };


    /* =====================================================
       GET THREE.JS
    ====================================================== */

    function getThree() {

        if (!window.THREE) {

            console.warn(
                "CloudCalc Pro: Three.js is not ready."
            );

            return null;
        }

        return window.THREE;
    }


    /* =====================================================
       GET CANVAS
    ====================================================== */

    function getCanvas() {

        const canvas =
            document.getElementById(
                CONFIG.canvasId
            );

        if (!canvas) {

            console.warn(
                `CloudCalc Pro: #${CONFIG.canvasId} not found.`
            );

            return null;
        }

        return canvas;
    }


    /* =====================================================
       CREATE SCENE
    ====================================================== */

    function createScene(THREE) {

        const scene =
            new THREE.Scene();

        /*
         * Very subtle atmospheric background.
         * Most of the visual treatment comes from
         * CSS glass + lighting + 3D objects.
         */

        scene.background =
            new THREE.Color(
                CONFIG.backgroundColor
            );

        return scene;
    }


    /* =====================================================
       CREATE CAMERA
    ====================================================== */

    function createCamera(
        THREE,
        width,
        height
    ) {

        const aspect =
            width / height;

        const camera =
            new THREE.PerspectiveCamera(
                CONFIG.cameraFov,
                aspect,
                CONFIG.cameraNear,
                CONFIG.cameraFar
            );

        camera.position.set(
            0,
            0,
            7
        );

        camera.lookAt(
            0,
            0,
            0
        );

        return camera;
    }


    /* =====================================================
       CREATE RENDERER
    ====================================================== */

    function createRenderer(
        THREE,
        canvas
    ) {

        try {

            const renderer =
                new THREE.WebGLRenderer(
                    {
                        canvas,
                        antialias:
                            CONFIG.antialias,
                        alpha:
                            CONFIG.alpha,
                        powerPreference:
                            "high-performance"
                    }
                );


            /*
             * Limit pixel ratio so high-DPI displays
             * do not unnecessarily overload the GPU.
             */

            const pixelRatio =
                Math.min(
                    window.devicePixelRatio || 1,
                    CONFIG.pixelRatioLimit
                );


            renderer.setPixelRatio(
                pixelRatio
            );


            renderer.setSize(
                window.innerWidth,
                window.innerHeight,
                false
            );


            /*
             * Transparent canvas allows the CSS
             * background/glass system to remain visible.
             */

            renderer.setClearColor(
                CONFIG.backgroundColor,
                0
            );


            return renderer;

        } catch (error) {

            console.error(
                "CloudCalc Pro: WebGL renderer could not be created.",
                error
            );

            return null;
        }
    }


    /* =====================================================
       RESIZE
    ====================================================== */

    function resize() {

        if (
            !state.camera ||
            !state.renderer
        ) {
            return;
        }


        const width =
            window.innerWidth;

        const height =
            window.innerHeight;


        state.width =
            width;

        state.height =
            height;


        state.camera.aspect =
            width / height;


        state.camera.updateProjectionMatrix();


        state.renderer.setSize(
            width,
            height,
            false
        );

    }


    /* =====================================================
       RENDER
    ====================================================== */

    function render() {

        if (
            !state.running ||
            !state.scene ||
            !state.camera ||
            !state.renderer
        ) {
            return;
        }


        state.renderer.render(
            state.scene,
            state.camera
        );


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:3d-tick"
            )
        );


        state.animationFrame =
            requestAnimationFrame(
                render
            );
    }


    /* =====================================================
       START
    ====================================================== */

    function start() {

        if (
            !state.initialized
        ) {
            return;
        }


        if (
            state.running
        ) {
            return;
        }


        state.running =
            true;


        render();

    }


    /* =====================================================
       STOP
    ====================================================== */

    function stop() {

        state.running =
            false;


        if (
            state.animationFrame
        ) {

            cancelAnimationFrame(
                state.animationFrame
            );

            state.animationFrame =
                null;
        }

    }


    /* =====================================================
       WEBGL FAILURE
    ====================================================== */

    function triggerFallback() {

        console.warn(
            "CloudCalc Pro: WebGL fallback activated."
        );


        stop();


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:webgl-fallback"
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


        const THREE =
            getThree();


        if (!THREE) {

            triggerFallback();

            return;
        }


        const canvas =
            getCanvas();


        if (!canvas) {

            triggerFallback();

            return;
        }


        state.canvas =
            canvas;


        state.width =
            window.innerWidth;

        state.height =
            window.innerHeight;


        /* ---------------------------------------------
           Scene
        --------------------------------------------- */

        state.scene =
            createScene(
                THREE
            );


        /* ---------------------------------------------
           Camera
        --------------------------------------------- */

        state.camera =
            createCamera(
                THREE,
                state.width,
                state.height
            );


        /* ---------------------------------------------
           Renderer
        --------------------------------------------- */

        state.renderer =
            createRenderer(
                THREE,
                canvas
            );


        if (
            !state.renderer
        ) {

            triggerFallback();

            return;
        }


        /* ---------------------------------------------
           Resize
        --------------------------------------------- */

        window.addEventListener(
            "resize",
            resize,
            { passive: true }
        );


        /* ---------------------------------------------
           Context Lost
        --------------------------------------------- */

        canvas.addEventListener(
            "webglcontextlost",
            () => {

                stop();

                window.dispatchEvent(
                    new CustomEvent(
                        "cloudcalc:webgl-fallback"
                    )
                );

            },
            false
        );


        /* ---------------------------------------------
           Context Restored
        --------------------------------------------- */

        canvas.addEventListener(
            "webglcontextrestored",
            () => {

                start();

            },
            false
        );


        state.initialized =
            true;


        resize();


        /*
         * Tell the other 3D modules that the
         * scene is ready.
         */

        window.CloudCalc3D =
            window.CloudCalc3D || {};


        window.CloudCalc3D.scene =
            state.scene;

        window.CloudCalc3D.camera =
            state.camera;

        window.CloudCalc3D.renderer =
            state.renderer;

        window.CloudCalc3D.canvas =
            state.canvas;


        window.CloudCalc3D.start =
            start;

        window.CloudCalc3D.stop =
            stop;

        window.CloudCalc3D.resize =
            resize;


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:scene-ready"
            )
        );


        start();

    }


    /* =====================================================
       WAIT FOR THREE.JS
    ====================================================== */

    function waitForThree() {

        if (
            window.THREE
        ) {

            initialize();

            return;
        }


        window.addEventListener(
            "cloudcalc:three-ready",
            initialize,
            {
                once: true
            }
        );


        /*
         * Safety fallback.
         * If Three.js does not become available,
         * do not leave the page waiting forever.
         */

        window.setTimeout(
            () => {

                if (
                    !state.initialized &&
                    !window.THREE
                ) {

                    triggerFallback();

                }

            },
            5000
        );

    }


    /* =====================================================
       PUBLIC API
    ====================================================== */

    window.CloudCalc3D =
        window.CloudCalc3D || {};


    window.CloudCalc3D.sceneState =
        state;


    window.CloudCalc3D.initialize =
        initialize;


    /* =====================================================
       START
    ====================================================== */

    waitForThree();

})();

