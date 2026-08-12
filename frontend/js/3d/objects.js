
/* =========================================================
   CLOUDCALC PRO
   3D OBJECT SYSTEM
   frontend/js/3d/objects.js

   Purpose:
   - Create the main 3D CloudCalc visual
   - Add glass-like calculator body
   - Add floating calculation symbols
   - Add subtle depth
   - Work with cursor + scroll interaction
========================================================= */

(() => {
    "use strict";


    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const CONFIG = {

        calculator: {

            width: 2.8,

            height: 3.6,

            depth: 0.28,

            radius: 0.28

        },

        display: {

            width: 2.25,

            height: 0.7,

            depth: 0.08

        },

        button: {

            size: 0.42,

            depth: 0.12,

            spacing: 0.18

        },

        floatingSymbols: true,

        rotationSpeed: 0.00035,

        floatStrength: 0.08

    };


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        initialized: false,

        scene: null,

        group: null,

        body: null,

        display: null,

        buttons: [],

        symbols: [],

        startTime: performance.now()

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
       MATERIALS
    ====================================================== */

    function createMaterials(
        THREE
    ) {

        return {

            body:
                new THREE.MeshPhysicalMaterial({

                    color: 0x111827,

                    metalness: 0.35,

                    roughness: 0.22,

                    transparent: true,

                    opacity: 0.92,

                    clearcoat: 0.8,

                    clearcoatRoughness: 0.18

                }),


            display:
                new THREE.MeshPhysicalMaterial({

                    color: 0x0b1220,

                    metalness: 0.2,

                    roughness: 0.12,

                    transparent: true,

                    opacity: 0.96,

                    clearcoat: 1,

                    clearcoatRoughness: 0.1

                }),


            button:
                new THREE.MeshPhysicalMaterial({

                    color: 0x1d2638,

                    metalness: 0.25,

                    roughness: 0.28,

                    clearcoat: 0.7,

                    clearcoatRoughness: 0.2

                }),


            accent:
                new THREE.MeshPhysicalMaterial({

                    color: 0x7c8cff,

                    emissive: 0x303b91,

                    emissiveIntensity: 1.4,

                    metalness: 0.15,

                    roughness: 0.2

                })

        };

    }


    /* =====================================================
       CREATE CALCULATOR BODY
    ====================================================== */

    function createBody(
        THREE,
        materials
    ) {

        const geometry =
            new THREE.BoxGeometry(
                CONFIG.calculator.width,
                CONFIG.calculator.height,
                CONFIG.calculator.depth,
                6,
                6,
                4
            );


        const body =
            new THREE.Mesh(
                geometry,
                materials.body
            );


        body.position.set(
            0,
            0,
            0
        );


        return body;

    }


    /* =====================================================
       CREATE DISPLAY
    ====================================================== */

    function createDisplay(
        THREE,
        materials
    ) {

        const geometry =
            new THREE.BoxGeometry(
                CONFIG.display.width,
                CONFIG.display.height,
                CONFIG.display.depth
            );


        const display =
            new THREE.Mesh(
                geometry,
                materials.display
            );


        display.position.set(
            0,
            1.05,
            0.19
        );


        return display;

    }


    /* =====================================================
       CREATE BUTTONS
    ====================================================== */

    function createButtons(
        THREE,
        materials
    ) {

        const group =
            new THREE.Group();


        const labels = [
            "7", "8", "9", "÷",
            "4", "5", "6", "×",
            "1", "2", "3", "−",
            "0", ".", "=", "+"
        ];


        const columns = 4;

        const rows = 4;


        const startX =
            -0.82;


        const startY =
            0.25;


        let index = 0;


        for (
            let row = 0;
            row < rows;
            row++
        ) {

            for (
                let column = 0;
                column < columns;
                column++
            ) {

                const geometry =
                    new THREE.BoxGeometry(
                        CONFIG.button.size,
                        CONFIG.button.size,
                        CONFIG.button.depth
                    );


                const material =
                    labels[index] === "=" ||
                    labels[index] === "+" ||
                    labels[index] === "÷" ||
                    labels[index] === "×" ||
                    labels[index] === "−"
                        ? materials.accent
                        : materials.button;


                const button =
                    new THREE.Mesh(
                        geometry,
                        material
                    );


                button.position.x =
                    startX +
                    column *
                    (
                        CONFIG.button.size +
                        CONFIG.button.spacing
                    );


                button.position.y =
                    startY -
                    row *
                    (
                        CONFIG.button.size +
                        CONFIG.button.spacing
                    );


                button.position.z =
                    0.22;


                button.userData =
                    {
                        label:
                            labels[index]
                    };


                group.add(
                    button
                );


                state.buttons.push(
                    button
                );


                index++;

            }

        }


        return group;

    }


    /* =====================================================
       CREATE FLOATING SYMBOLS
    ====================================================== */

    function createFloatingSymbols(
        THREE
    ) {

        if (
            !CONFIG.floatingSymbols
        ) {

            return;

        }


        const symbolData = [

            {
                x: -2.3,
                y: 1.8,
                z: -0.5,
                symbol: "+"
            },

            {
                x: 2.2,
                y: 1.1,
                z: -0.3,
                symbol: "×"
            },

            {
                x: -2.1,
                y: -1.4,
                z: -0.4,
                symbol: "="
            },

            {
                x: 2.1,
                y: -1.6,
                z: -0.5,
                symbol: "%"
            }

        ];


        /*
         * Simple geometric symbols instead of
         * loading external fonts/textures.
         *
         * This keeps the WebGL scene lightweight.
         */

        symbolData.forEach(
            (item, index) => {

                const geometry =
                    new THREE.TorusGeometry(
                        0.13,
                        0.035,
                        8,
                        24
                    );


                const material =
                    new THREE.MeshStandardMaterial({

                        color:
                            0x7c8cff,

                        emissive:
                            0x303b91,

                        emissiveIntensity:
                            1.2,

                        metalness:
                            0.3,

                        roughness:
                            0.25

                    });


                const symbol =
                    new THREE.Mesh(
                        geometry,
                        material
                    );


                symbol.position.set(
                    item.x,
                    item.y,
                    item.z
                );


                symbol.userData = {

                    baseX:
                        item.x,

                    baseY:
                        item.y,

                    baseZ:
                        item.z,

                    offset:
                        index * 1.2

                };


                state.symbols.push(
                    symbol
                );


                state.group.add(
                    symbol
                );

            }
        );

    }


    /* =====================================================
       CREATE OBJECT
    ====================================================== */

    function createObject() {

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


        const materials =
            createMaterials(
                THREE
            );


        state.group =
            new THREE.Group();


        state.group.position.set(
            1.35,
            0,
            0
        );


        state.group.rotation.set(
            0,
            -0.12,
            0
        );


        /* ---------------------------------------------
           Body
        --------------------------------------------- */

        state.body =
            createBody(
                THREE,
                materials
            );


        state.group.add(
            state.body
        );


        /* ---------------------------------------------
           Display
        --------------------------------------------- */

        state.display =
            createDisplay(
                THREE,
                materials
            );


        state.group.add(
            state.display
        );


        /* ---------------------------------------------
           Buttons
        --------------------------------------------- */

        const buttonGroup =
            createButtons(
                THREE,
                materials
            );


        state.group.add(
            buttonGroup
        );


        /* ---------------------------------------------
           Floating Objects
        --------------------------------------------- */

        createFloatingSymbols(
            THREE
        );


        /* ---------------------------------------------
           Scene
        --------------------------------------------- */

        scene.add(
            state.group
        );


        return true;

    }


    /* =====================================================
       UPDATE OBJECT
    ====================================================== */

    function update() {

        if (
            !state.group
        ) {

            return;

        }


        const reducedMotion =
            document.documentElement
                .classList
                .contains(
                    "reduced-motion"
                );


        if (
            reducedMotion
        ) {

            return;

        }


        const elapsed =
            performance.now() -
            state.startTime;


        /* ---------------------------------------------
           Main calculator movement
        --------------------------------------------- */

        state.group.rotation.y +=
            CONFIG.rotationSpeed;


        state.group.position.y =
            Math.sin(
                elapsed * 0.001
            ) *
            CONFIG.floatStrength;


        /* ---------------------------------------------
           Floating elements
        --------------------------------------------- */

        state.symbols.forEach(
            (symbol) => {

                const data =
                    symbol.userData;


                symbol.position.y =
                    data.baseY +
                    Math.sin(
                        elapsed * 0.001 +
                        data.offset
                    ) *
                    0.08;

            }
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


        const created =
            createObject();


        if (!created) {

            return;

        }


        state.initialized =
            true;


        window.CloudCalc3D =
            window.CloudCalc3D || {};


        window.CloudCalc3D.objects =
            state;


        window.CloudCalc3D.objectController = {

            state,

            update

        };


        window.dispatchEvent(
            new CustomEvent(
                "cloudcalc:objects-ready"
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
       WAIT FOR LIGHTS
    ====================================================== */

    window.addEventListener(
        "cloudcalc:lights-ready",
        initialize,
        {
            once: true
        }
    );


    /* =====================================================
       FALLBACK INITIALIZATION
    ====================================================== */

    window.addEventListener(
        "cloudcalc:scene-ready",
        () => {

            /*
             * If lights.js is unavailable,
             * still allow the object system
             * to initialize.
             */

            window.setTimeout(
                () => {

                    if (
                        !state.initialized
                    ) {

                        initialize();

                    }

                },
                1000
            );

        },
        {
            once: true
        }
    );

})();

