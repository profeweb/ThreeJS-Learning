import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color('rgb(5, 10, 20)')

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
    // Color aleatori
    const r = Math.floor(Math.random()*256)
    const g = Math.floor(Math.random()*256)
    const b = Math.floor(Math.random()*256)
    const color = new THREE.Color("rgb("+r+","+g+","+b+")");
    const material = new THREE.MeshPhongMaterial({color: color})

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
    meshes.forEach((element, index, array)=>{
        element.rotation.y = elapsedTime * (index+1)/10
        element.rotation.x = elapsedTime * (index+1)/10
        element.rotation.z = elapsedTime * (index+1)/10
    })

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