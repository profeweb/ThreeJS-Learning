import './style.css'
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import TextUtils from './TextUtils.js'



// DOM selectors
const containerEl = document.querySelector(".container");
const textInputEl = document.querySelector("#text-input");


let textUtils = new TextUtils("Typing<div>animation</div>");
textUtils.setTextInputElement(textInputEl)
textInputEl.innerHTML = textUtils.string;

// 3D scene related globals
let scene,
    camera,
    renderer,
    particleGeometry,
    particleMaterial,
    instancedMesh,
    dummy,
    clock,
    cursorMesh;

// ---------------------------------------------------------------

init();
createEvents();
refreshText(textUtils);
render(textUtils);

// ---------------------------------------------------------------

function init() {
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 18;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerEl.appendChild(renderer.domElement);

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enablePan = false;



    particleGeometry = new THREE.TorusGeometry(0.1, 0.05, 16, 50);
    particleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    particleMaterial = new THREE.MeshNormalMaterial({});

    dummy = new THREE.Object3D();
    clock = new THREE.Clock();

    const cursorGeometry = new THREE.BoxGeometry(0.3, 4.5, 0.03);
    cursorGeometry.translate(0.1, -2.3, 0);
    const cursorMaterial = new THREE.MeshNormalMaterial({
        transparent: true
    });
    cursorMesh = new THREE.Mesh(cursorGeometry, cursorMaterial);
    scene.add(cursorMesh);
}

// ---------------------------------------------------------------

function createEvents() {
    document.addEventListener("keyup", () => {
        handleInput();
        textUtils.setStringBox(textInputEl)
        refreshText(textUtils);
    });

    document.addEventListener("click", () => {
        document.querySelector(".intro").style.display = "none";
        textInputEl.focus();
        setCaretToEndOfInput();
        handleInput();
        textUtils.setStringBox(textInputEl)
        refreshText(textUtils);
    });
    // textInputEl.addEventListener("blur", () => {
    // textInputEl.focus();
    // });
    textInputEl.addEventListener("focus", () => {
        clock.elapsedTime = 0;
    });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function setCaretToEndOfInput() {
    document.execCommand("selectAll", false, null);
    document.getSelection().collapseToEnd();
}

function handleInput() {
    if (isNewLine(textInputEl.firstChild)) {
        textInputEl.firstChild.remove();
    }
    if (isNewLine(textInputEl.lastChild)) {
        if (isNewLine(textInputEl.lastChild.previousSibling)) {
            textInputEl.lastChild.remove();
        }
    }



    textUtils.setStringBox(textInputEl);

    function isNewLine(el) {
        if (el) {
            if (el.tagName) {
                if (
                    el.tagName.toUpperCase() === "DIV" ||
                    el.tagName.toUpperCase() === "P"
                ) {
                    if (el.innerHTML === "<br>" || el.innerHTML === "</br>") {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}

// ---------------------------------------------------------------

function render() {
    requestAnimationFrame(render);
    updateParticlesMatrices(textUtils);
    updateCursorOpacity();
    renderer.render(scene, camera);
}


// ---------------------------------------------------------------
// Handling params of each particle

function refreshText(textUtils){
    textUtils.refreshText()
    recreateInstancedMesh(textUtils);
    makeTextFitScreen(textUtils);
    updateCursorPosition(textUtils);
}

// ---------------------------------------------------------------
// Handle instances

function recreateInstancedMesh(textUtils) {
    scene.remove(instancedMesh);
    instancedMesh = new THREE.InstancedMesh(
        particleGeometry,
        particleMaterial,
        textUtils.particles.length
    );
    scene.add(instancedMesh);

    instancedMesh.position.x = -0.5 * textUtils.stringBox.wScene;
    instancedMesh.position.y = -0.5 * textUtils.stringBox.hScene;
}

function updateParticlesMatrices(textUtils) {
    let idx = 0;
    if(textUtils.particles) {
        textUtils.particles.forEach((p) => {
            p.grow();
            dummy.rotation.set(p.rotationX, p.rotationY, p.rotationZ);
            dummy.scale.set(p.scale, p.scale, p.scale);
            dummy.position.set(p.x, textUtils.stringBox.hScene - p.y, p.z);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(idx, dummy.matrix);
            idx++;
        });
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
}

// ---------------------------------------------------------------
// Move camera so the text is always visible

function makeTextFitScreen(textUtils) {
    const fov = camera.fov * (Math.PI / 180);
    const fovH = 2 * Math.atan(Math.tan(fov / 2) * camera.aspect);
    const dx = Math.abs((0.55 * textUtils.stringBox.wScene) / Math.tan(0.5 * fovH));
    const dy = Math.abs((0.55 * textUtils.stringBox.hScene) / Math.tan(0.5 * fov));
    const factor = Math.max(dx, dy) / camera.position.length();
    if (factor > 1) {
        camera.position.x *= factor;
        camera.position.y *= factor;
        camera.position.z *= factor;
    }
}

// ---------------------------------------------------------------
// Cursor related

function updateCursorPosition(textUtils) {
    cursorMesh.position.x = -0.5 * textUtils.stringBox.wScene + textUtils.stringBox.caretPosScene[0];
    cursorMesh.position.y = 0.5 * textUtils.stringBox.hScene - textUtils.stringBox.caretPosScene[1];
}

function updateCursorOpacity() {
    let roundPulse = (t) =>
        Math.sign(Math.sin(t * Math.PI)) * Math.pow(Math.sin((t % 1) * 3.14), 0.2);
    if (document.hasFocus() && document.activeElement === textInputEl) {
        cursorMesh.material.opacity = roundPulse(2 * clock.getElapsedTime());
    } else {
        cursorMesh.material.opacity = 0;
    }
}
