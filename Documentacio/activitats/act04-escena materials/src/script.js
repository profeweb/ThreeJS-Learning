import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const matcapTextures = []
for(let i=1; i<=8; i++) {
    matcapTextures.push( textureLoader.load('textures/matcaps/'+i+'.png'))
}

/**
 * Objectes
 */
const meshes = []

// 25 geometries diferents
for(let i=0; i<25; i++) {
    let geometry;
    switch(i%5){
        case 0:
            geometry = new THREE.BoxGeometry(0.25, 0.25, 0.25)
            break
        case 1:
            geometry = new THREE.ConeGeometry(0.15, 0.5, 5)
            break
        case 2:
            geometry = new THREE.TorusGeometry( 0.5, 0.15, 16, 10);
            break
        case 3:
            geometry = new THREE.CylinderGeometry( 0.5, 0.15, 1, 10);
            break
        default:
            geometry = new THREE.SphereGeometry(Math.random() * 0.5, 4, 8)
    }

    // Matcap aleatori
    const n = Math.floor(Math.random()*matcapTextures.length)
    const material = new THREE.MeshMatcapMaterial({ matcap: matcapTextures[n]})

    // Malla ( Geometria + Material)
    const mesh = new THREE.Mesh(geometry, material)

    // Posició aleatòria
    mesh.position.set(Math.random()*5 -2.5, Math.random()*5 -2.5,Math.random()*5 -2.5)
    meshes.push(mesh)
    scene.add(mesh)
}

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
const fc = gui.addFolder('CAMERA')
fc.add(camera.position, 'x').min(- 3).max(3).step(0.01)
fc.add(camera.position, 'y').min(- 3).max(3).step(0.01)
fc.add(camera.position, 'z').min(0).max(10).step(0.01)
const fl = gui.addFolder('LIGHTS')
fl.addColor(ambientLight, 'color').name('Ambient Color')
fl.add(pointLight, 'intensity').name('PointLight Intensity').min(0).max(1).step(0.01)

const resetObjectes = {
    objectRotation: true,
    randomScale: () => {
        meshes.forEach((mesh, index, array)=>{
            const scale = Math.random()
            mesh.scale.set(scale, scale, scale)
        })
    },
    randomPosition: () => {
        meshes.forEach((mesh, index, array)=>{
            mesh.position.set(Math.random()*5 -2.5, Math.random()*5 -2.5,Math.random()*5 -2.5)
        })
    },
    randomMaterial: () => {
        meshes.forEach((mesh, index, array)=>{
            // Matcap aleatori
            const n = Math.floor(Math.random()*matcapTextures.length)
            const material = new THREE.MeshMatcapMaterial({ matcap: matcapTextures[n]})
            mesh.material = material;
        })
    }
}

const fo = gui.addFolder('OBJECTS')
fo.add(resetObjectes, 'objectRotation')
fo.add(resetObjectes, 'randomScale').name('Re-SCALE')
fo.add(resetObjectes, 'randomPosition').name('Re-POSITION')
fo.add(resetObjectes, 'randomMaterial').name('Re-MATERIAL')

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
    if(resetObjectes.objectRotation) {
        meshes.forEach((element, index, array) => {
            element.rotation.y = elapsedTime * (index + 1) / 10
            element.rotation.x = elapsedTime * (index + 1) / 10
            element.rotation.z = elapsedTime * (index + 1) / 10
        })
    }

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