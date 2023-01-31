import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import * as dat from 'lil-gui'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('rgb(5, 10, 20)')

/**
 * Textures
 */
const manager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(manager)
const matcapTextures = []
for(let i=1; i<=8; i++) {
    matcapTextures.push( textureLoader.load('textures/matcaps/'+i+'.png'))
}

/**
 * Fonts
 */
const meshes = []
const info = {
    paraula : 'TYPO'
}
const URLfonts = [ '/fonts/gentilis_regular.typeface.json',
                '/fonts/helvetiker_regular.typeface.json',
                '/fonts/optimer_regular.typeface.json',
                '/fonts/Purple Smile_Regular.json',
                '/fonts/Purple Smile_Regular.json',
];

const fontLoader = new FontLoader(manager)
const fonts = []
for(let i=0; i<URLfonts.length; i++){
    fontLoader.load( URLfonts[i],
        (font) => {
            console.log('Font loaded', font)
            fonts[i] = font
        })
}

/**
 * Objectes
 */

const grup = new THREE.Group()
scene.add(grup)

manager.onLoad = function ( ) {

    console.log( 'Loading complete!');

    for(let i=0; i<info.paraula.length; i++) {

        // Lletra
        const lletra = info.paraula[i];

        // Font
        const nf = Math.floor(Math.random()*fonts.length)
        const fontR = fonts[nf];

        // Matcap aleatori
        const n = Math.floor(Math.random()*matcapTextures.length)
        const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTextures[n]})

        const textGeometry = new TextGeometry( lletra, {
                font: fontR,
                size: 1,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )
        const text = new THREE.Mesh(textGeometry, textMaterial)

        // Posicionar
        text.position.x = i

        // Afegir a l'escena i a l'array de malles
        grup.add(text)
        meshes.push(text)

    }
};

grup.position.x =-info.paraula.length/2

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );

const pointLight = new THREE.PointLight( 0xff0000, 0.5, 100 );
pointLight.position.set( 1, 0, 0 );
scene.add( pointLight );

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
 * Fullscreen
 */
window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * GUI Controls
 */

const gui = new dat.GUI()
const fs = gui.addFolder('SCENE')
fs.addColor(scene, 'background').name('Background Color')
const ft = gui.addFolder('TEXT')
ft.add(info, 'paraula').name('text').onChange((value)=>{
    console.log(value)
    for(let i=0; i<meshes.length; i++){
        if(i>=value.length){
            meshes[i].remove()
        }
    }
})


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

    // Update objects


    // Update lights
    pointLight.position.x = Math.sin(elapsedTime)*5
    pointLight.position.z = Math.cos(elapsedTime)*5
    pointLight.position.y = Math.sin(elapsedTime/10)*3

    ambientLight.intensity = Math.abs(Math.sin(elapsedTime))

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()