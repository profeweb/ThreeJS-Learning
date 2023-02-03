import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// (2) Textures
const textureLoader = new THREE.TextureLoader()
const textures = []
for(let i=0; i<10; i++){
    textures[i] = textureLoader.load('/textures/particles/'+(i+1)+'.png')
}

/**
 * Test cube
 */

/*
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)
scene.add(cube)
*/

// (1) GALÀXIA ///////////////////////////////////////////////////////////////////


// (1.1) PARÀMETRES DE LA GALÀXIA
// (1.1.1) Objecte parameters
const parameters = {
    count: 10000,
    size: 0.001,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    texture: 0,
    texturename: 'STAR'
}


// (1.2) FUNCIÓ GENERADORA DE LA GALÀXIA

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {

    // Destrueix la Galàxia anterior
    if(points !== null) {
        console.log('Destrueix Galàxia anterior')
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    console.log('Genera Galàxia')

    // (1.2.1) Geometria
    geometry = new THREE.BufferGeometry()

    // (1.2.2) Posicions i colors dels punts
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    for(let i = 0; i < parameters.count; i++) {

        const i3 = i * 3

        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius

        positions[i3    ] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3    ] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b

    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // (1.2.3) Material
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        alphaMap: textures[parameters.texture],
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })


    // (1.2.4) Crear malla i afegir-la a l'escena
    points = new THREE.Points(geometry, material)
    scene.add(points)

}

generateGalaxy()

// (1.1.2) Controls Dat.GUI
gui.add(parameters, 'count').min(100).max(1000000).step(100).
onFinishChange(generateGalaxy)

gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).
onFinishChange(generateGalaxy)

gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).
onFinishChange(generateGalaxy)

gui.add(parameters, 'branches').min(2).max(20).step(1).
onFinishChange(generateGalaxy)

gui.add(parameters, 'spin').min(- 5).max(5).step(0.001).
onFinishChange(generateGalaxy)

gui.add(parameters, 'randomness').min(0).max(2).step(0.001).
onFinishChange(generateGalaxy)

gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).
onFinishChange(generateGalaxy)

gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)

gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

gui.add( parameters, 'texturename', [ 'STAR', 'PLANET', 'HALO' ] ).onChange((value)=>{
    if(value=='STAR') {
        parameters.texture = 0;
    }
    else if(value=='PLANET') {
        parameters.texture = 1;
    }
    else if(value=='HALO') {
        parameters.texture = 2;
    }
    generateGalaxy()
})


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
camera.position.x = 3
camera.position.y = 3
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()