import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

// Shaders
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'


// Debug
const gui = new dat.GUI()
const debugObject = {}
debugObject.offset = -1
debugObject.colorStart = new THREE.Color(0xa585e5)
debugObject.colorEnd = new THREE.Color(0x4c337f)

gui.add(debugObject, 'offset').min(-4).max(4).step(0.001).name('Offset').onChange((value)=>{
    material.uniforms.uOffset.value = value
})
gui.addColor(debugObject, 'colorStart').name('Color Start')
gui.addColor(debugObject, 'colorEnd').name('Color End')


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Materials

const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms:{
        uTime: { value: 0 },
        uColorStart: { value: debugObject.colorStart },
        uColorEnd: { value: debugObject.colorEnd },
        uOffset: { value: debugObject.offset },
    }
});

// Objects
const mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2, 1, 1 ), material );
scene.add( mesh );


// Sizes & Resize
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


// Camera
//const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
//camera.position.set(0, 0, 10)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.clearColor(1, 1, 1, 1)

mesh.scale.set(5 , 5 , 1)

// Animació

const clock = new THREE.Clock()

const tick = () => {

    const elapsedTime = clock.getElapsedTime()

    // Update shader
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()