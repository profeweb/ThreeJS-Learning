import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes Helper
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('textures/matcaps/6.png')
const matcapTexture2 = textureLoader.load('textures/matcaps/6.png')


/**
 * Fonts
 */
const fontLoader = new FontLoader()
fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) =>{
        console.log('Font loaded', font)
        const textGeometry = new TextGeometry(
            'Hello Three.js',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )

        // CENTRAR

        // OPCIÓ 1: amb Bounding Box
        // Calcula la bounding box del text
        textGeometry.computeBoundingBox()
        console.log(textGeometry.boundingBox)
        // Centra el text
        textGeometry.translate(
            -(textGeometry.boundingBox.max.x-0.02) * 0.5,
            -(textGeometry.boundingBox.max.y-0.02) * 0.5,
            -(textGeometry.boundingBox.max.z -0.03) * 0.5,
        )

        // Recalcula la bounding box del text
        textGeometry.computeBoundingBox()
        console.log(textGeometry.boundingBox)

        //OPCIÓ 2: amb center
        textGeometry.center()

        //const textMaterial = new THREE.MeshBasicMaterial({wireframe: true,})
        const textMaterial = new THREE.MeshMatcapMaterial({
            matcap: matcapTexture
        })
        const text = new THREE.Mesh(textGeometry, textMaterial)
        scene.add(text)

        // Temps START
        console.time('DONUTS')

        const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)
        const donutMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture2})

        // 100 Donuts
        for(let i=0; i<100; i++){
            //const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)
            //const donutMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture})
            const donut = new THREE.Mesh(donutGeometry, donutMaterial)

            //Posició aleatòria
            donut.position.x = (Math.random() -0.5) * 10
            donut.position.y = (Math.random() -0.5) * 10
            donut.position.z = (Math.random() -0.5) * 10

            // Rotació aleatòria
            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            // Escala aleatòria
            const scale = Math.random()
            donut.scale.set( scale, scale, scale)

            scene.add(donut)
        }

        // Temps FINAL
        console.timeEnd('DONUTS')
    }
)

/**
 * Object
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)

//scene.add(cube)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()