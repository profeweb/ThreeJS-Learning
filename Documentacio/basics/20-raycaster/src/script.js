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

/**
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

// (0) Línia de visualització del Raycaster
const material = new THREE.LineBasicMaterial({color: 0xffffff});
const points = [ new THREE.Vector3( - 3, 0, 0 ), new THREE.Vector3( + 3, 0, 0 ) ];
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geometry, material );
scene.add( line );

// (1) RAYCASTER  ///////////////////////////////////////////

// (1.1) Crea el Raycaster
const raycaster = new THREE.Raycaster()

// (1.2) Configurar el raycaster
/*
const rayOrigin = new THREE.Vector3(-3, 0, 0)
const rayDirection = new THREE.Vector3(10, 0, 0)
console.log(rayDirection.length())
rayDirection.normalize()
console.log(rayDirection.length())
raycaster.set(rayOrigin, rayDirection)
 */

// (1.3) Test d'intersecció
//const intersect = raycaster.intersectObject(object2)
//console.log(intersect)

//const intersects = raycaster.intersectObjects([object1, object2, object3])
//console.log(intersects)

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

// (4) MOUSE ////////////////////////////////////////////////
// (4.1) Posició del Mouse
const mouse = new THREE.Vector2()

// (4.2) Mouse move Listener
window.addEventListener('mousemove', (event)=>{
    mouse.x  = +(event.clientX / sizes.width )  * 2 - 1
    mouse.y  = -(event.clientY / sizes.height ) * 2 + 1
    //console.log('mouse move', mouse.x, mouse.y)
})

// (4.4) Mouse-enter & Mouse-leave control
let currentIntersect = null;

// (4.5) Mouse-click control
window.addEventListener('click', (event)=>{
    if(currentIntersect){
        console.log('click sobre bolla')
        if(currentIntersect.object === object1){
            console.log('click sobre bolla 1')
        }
        else if(currentIntersect.object === object2){
            console.log('click sobre bolla 2')
        }
        else if(currentIntersect.object === object3){
            console.log('click sobre bolla 3')
        }
    }
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
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

    // (2.1) Anima objectes
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5


    // (2.2) Configura el raycaster
    /*
    const rayOrigin = new THREE.Vector3(-3, 0, 0)
    const rayDirection = new THREE.Vector3(1, 0, 0)
    rayDirection.normalize()
    raycaster.set(rayOrigin, rayDirection)
    */

    // (4.3) Configura raycaster amb MOUSE (Hovering)
    raycaster.setFromCamera(mouse, camera)

    // (2.3) Test de raycasting sobre els objectes animats
    const objectsToTest = [object1, object2, object3]
    const intersects = raycaster.intersectObjects(objectsToTest)
    //console.log(intersects.length)

    // (2.4) Actualitzar materials dels objectes interseccionats
    for(const object of objectsToTest){
        object.material.color.set('#ff0000')
    }
    for(const intersect of intersects){
        //console.log(intersect.object)
        intersect.object.material.color.set('#0000ff')
    }

    // (4.5)
    if(intersects.length){
        //console.log('Mouse sobre alguna bolla')
        if(currentIntersect ===null){
            console.log('mouse enter')
        }
        currentIntersect = intersects[0]
    }
    else {
        //console.log('Mouse fora de cap bolla')
        if(currentIntersect){
            console.log('mouse leave')
        }
        currentIntersect = null
    }


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()