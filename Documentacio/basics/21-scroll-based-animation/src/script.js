import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

//console.log(gsap)


/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui.addColor(parameters, 'materialColor')
    .onChange(()=>{
        material.color.set(parameters.materialColor)
        particles.material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
// scene.add(cube)

// (5) TEXTURA (Gradients)
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

// (3) MATERIAL (TOON)
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

// (2) OBJECTES ///////////////////////////////////

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    //new THREE.MeshBasicMaterial({color:'#ff0000'})
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 0.4, 16, 60),
    //new THREE.MeshBasicMaterial({color:'#ff0000'})
    material
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 16, 60),
    //new THREE.MeshBasicMaterial({color:'#ff0000'})
    material
)

scene.add(mesh1, mesh2, mesh3)

// (6) POSICIONAR ELS OBJECTES EN SECCIONS
const objectsDistance = 4

mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2

mesh1.position.x = 2
mesh2.position.x= -2
mesh3.position.x = 2

// (7) Rotació Permanent
// (7.1) Crear array amb les malles
const sectionMeshes = [mesh1, mesh2, mesh3]

// (11) PARTÍCULES

const particlesCount = 200
const positions = new Float32Array(particlesCount*3)
for(let i=0; i<particlesCount; i++){
    positions[i*3 + 0] = (Math.random() - 0.5)*10
    positions[i*3 + 1] = objectsDistance*0.4 - Math.random() * objectsDistance * sectionMeshes.length
    positions[i*3 + 2] = (Math.random() -0.5)*10
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    size: 0.03,
    sizeAttenuation: true,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// (4) LLUMS
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1,1,0)
scene.add(directionalLight)

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

// (10) Grup de la càmera
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
//scene.add(camera)
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // canvas amb fons transparent
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Afegir un nivell de transparencia al canvas
// renderer.setClearAlpha(0.5)


// (8) Scroll

// (8.1) Variable de scroll vertical
let scrollY = window.scrollY
console.log(scrollY)

// (11) Animacions Disparades (triggered animation)
let currentSection = 0

// (8.2) Listener de l'event de scroll
window.addEventListener('scroll', ()=> {
    scrollY = window.scrollY
    //console.log('scrolling', scrollY)

    const newSection = Math.round(scrollY / sizes.height)
    if (newSection != currentSection) {
        currentSection = newSection
        //console.log('section changed',currentSection)
        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration:1.5,
                ease:'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }
})

// (9) Parallax Effect
// (9.1) Cursor
const cursor = {}
cursor.x = 0
cursor.y = 0

// (9.2) Listener de l'event mousemove
window.addEventListener('mousemove', (event)=>{
    cursor.x = event.clientX / sizes.width -0.5
    cursor.y = event.clientY / sizes.height -0.5
    //console.log('mouse move', cursor.x, cursor.y)
})


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Càlcul del deltaTime
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    //console.log(deltaTime)

    // (7.2) Anima rotació de malles
    for(const mesh of sectionMeshes){
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // (8.3) Moure la Càmera amb l'Scroll
    camera.position.y = -scrollY / sizes.height * objectsDistance

    // (9.3) Moure la Càmera (grup) amb Parallax, Easing i HF Screen
    const parallaxX = +cursor.x
    const parallaxY = -cursor.y
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * deltaTime * 5
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * deltaTime * 5


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()