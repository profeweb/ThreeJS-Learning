import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import imageSource from './color.jpg'
import {load} from "three/examples/jsm/libs/opentype.module";

// Test image SRC
console.log(imageSource)

////////////////////////////////////////////////////////////////////////////////
// Ús de Textures
// (1) Càrrega d'imatge per a la textura
const image = new Image()
image.src = '/textures/door/color.jpg'
const texture = new THREE.Texture(image)
image.addEventListener('load', () => {
    texture.needsUpdate = true
})

// (2) Emprant TextureLoader
const textureLoader = new THREE.TextureLoader()
const texture2 = textureLoader.load(
    '/textures/door/color.jpg',
    ()=>{
        console.log('load')
    },
    ()=>{
        console.log('progress')
    },
    ()=>{
        console.log('error')
    }
)

// (3) Emprant LoadingManager
const loadingManager = new THREE.LoadingManager()
/*
loadingManager.onStart = ()=>{
    console.log('started')
}
loadingManager.onProgress = ()=>{
    console.log('progress')
}
loadingManager.onError = ()=>{
    console.log('error')
}
 */
const textureLoader3 = new THREE.TextureLoader(loadingManager)
//const colorTexture = textureLoader3.load('/textures/door/color.jpg');
//const colorTexture = textureLoader3.load('/textures/checkerboard-1024x1024.png');
//const colorTexture = textureLoader3.load('/textures/checkerboard-8x8.png');
const colorTexture = textureLoader3.load('/textures/minecraft.png');
const alphaTexture = textureLoader3.load('/textures/door/alpha.jpg');
const heightTexture = textureLoader3.load('/textures/door/height.jpg');
const normalTexture = textureLoader3.load('/textures/door/normal.jpg');
const ambientOcclusionTexture = textureLoader3.load('/textures/door/ambientOcclusion.jpg');
const metalnessTexture = textureLoader3.load('/textures/door/metalness.jpg');
const roughnessTexture = textureLoader3.load('/textures/door/roughness.jpg');

// Modificació de Textura
/*
colorTexture.repeat.x = 2
colorTexture.repeat.y = 3

colorTexture.wrapS = THREE.RepeatWrapping
colorTexture.wrapT = THREE.RepeatWrapping
colorTexture.wrapS = THREE.MirroredRepeatWrapping
colorTexture.wrapT = THREE.MirroredRepeatWrapping

colorTexture.offset.x = 0.5
colorTexture.offset.y = 0.5

colorTexture.rotation = Math.PI/4
colorTexture.center.x = 0.5
colorTexture.center.y = 0.5

 */

// Filtering i Mipmapping
colorTexture.generateMipmaps = false
colorTexture.minFilter = THREE.NearestFilter
colorTexture.magFilter = THREE.NearestFilter

////////////////////////////////////////////////////////////////////////////

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objectes
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
console.log(geometry.attributes.uv)

// Objecte amb textura a partir d'imatge
const material1 = new THREE.MeshBasicMaterial({ map: texture})
const mesh1 = new THREE.Mesh(geometry, material1)
mesh1.position.x = -2
scene.add(mesh1)

const material2 = new THREE.MeshBasicMaterial({ map: texture2})
const mesh2 = new THREE.Mesh(geometry, material2)
mesh2.position.x = 2
scene.add(mesh2)

//const material3 = new THREE.MeshBasicMaterial({ map: colorTexture})
//const material3 = new THREE.MeshBasicMaterial({ map: checkboardTexture})
const material3 = new THREE.MeshBasicMaterial({ map: colorTexture})
const mesh3 = new THREE.Mesh(geometry, material3)
mesh3.position.x = 0
scene.add(mesh3)

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
camera.position.z = 1
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