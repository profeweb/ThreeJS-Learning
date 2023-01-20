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

// Textures /////////////////////////////////////////////////////////////////////

const textureLoader = new THREE.TextureLoader()
const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
const matcapTexture = textureLoader.load('/textures/matcaps/1.png')
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')

const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMapTexture = cubeTextureLoader.load([
    'textures/environmentMaps/0/px.jpg',
    'textures/environmentMaps/0/nx.jpg',
    'textures/environmentMaps/0/py.jpg',
    'textures/environmentMaps/0/ny.jpg',
    'textures/environmentMaps/0/pz.jpg',
    'textures/environmentMaps/0/nz.jpg',
    ]
)

// MATERIALS ///////////////////////////////////////////////////////////

// MeshBasicMaterial ///////////////////////////////////////////////////
// (1.1) Per defecte (blanc)
//const material = new THREE.MeshBasicMaterial()
// (1.2.a) Amb color
//const material = new THREE.MeshBasicMaterial({color: 0xff0000})
// (1.2.b) Amb Color
//material.color = new THREE.Color(0x00ff00)
// (1.3) Amb Map
//material.map = doorColorTexture
// (1.4) Wireframe
//material.wireframe = true
// (1.5) Opacitat
//material.opacity = 0.5
//material.transparent = true
// (1.6) Alpha
//material.alphaMap = doorAlphaTexture
//material.transparent = true
// (1..7) Side
//material.side = THREE.DoubleSide

// MeshNormalMaterial ///////////////////////////////////////////////////
// (2.1) Per defecte (normals)
//const material = new THREE.MeshNormalMaterial()
// (2.2) Flat shading
//material.flatShading = true

// MeshMatcapMaterial ///////////////////////////////////////////////////
// (3.1) Per defecte
//const material = new THREE.MeshMatcapMaterial()
// (3.2) Amb MatCap
//material.matcap = matcapTexture

// MeshDepthMaterial ///////////////////////////////////////////////////
// (4.1) Per defecte
//const material = new THREE.MeshDepthMaterial()

// LLUMS PER ALS MATERIALS SEGUENTS (Comentar per als anteriors)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
scene.add(ambientLight, pointLight)

// MeshLambertMaterial ///////////////////////////////////////////////////
// (5.1) Per defecte
//const material = new THREE.MeshLambertMaterial()

// MeshPhongMaterial ///////////////////////////////////////////////////
// (6.1) Per defecte
//const material = new THREE.MeshPhongMaterial()
// (6.2) Amb brillantor
//material.shininess = 100
// (6.3) Amb color reflectant
//material.specular = new THREE.Color(0xff0000)

// MeshToonMaterial ///////////////////////////////////////////////////
// (7.1) Per defecte
//const material = new THREE.MeshToonMaterial()
// (7.2) Amb gradient
//material.gradientMap = gradientTexture
//gradientTexture.minFilter = THREE.NearestFilter
//gradientTexture.magFilter = THREE.NearestFilter
//gradientTexture.generateMipmaps = false

// MeshStandardMaterial ///////////////////////////////////////////////////
// (8.1) Per defecte
//const material = new THREE.MeshStandardMaterial()
// (8.2) Amb metalness i roughness
//material.metalness = 0.45
//material.roughness = 0.65
// (8.3) Control amb DEBUG UI
//const gui = new dat.GUI()
//gui.add(material, 'metalness').min(0).max(1).step(0.0001)
//gui.add(material, 'roughness').min(0).max(1).step(0.0001)
// (8.4) Amb map
//material.map = doorColorTexture
// (8.5) Amb Ambient Occlusion map
//material.aoMap = doorAmbientOcclusionTexture
//material.aoMapIntensity = 1
//gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.0001)
// (8.6) Amb Displacement map
//material.displacementMap = doorHeightTexture
//material.displacementScale = 0.05
//gui.add(material, 'displacementScale').min(0).max(1).step(0.0001)
// (8.7) Amb Metalness map
//material.metalness = 0
//material.roughness = 1
//material.metalnessMap = doorMetalnessTexture
//material.roughnessMap = doorRoughnessTexture
// (8.8) Amb Normal map
//material.normalMap = doorNormalTexture
//material.normalScale.set(0.5, 0.5)
// (8.9) Amb Alpha map
//material.alphaMap = doorAlphaTexture
//material.transparent = true

// EnvironmentMap amb MeshStandardMaterial ///////////////////////////////////////////////////
// (9.1) Amb metalness i Roughness
const material = new THREE.MeshStandardMaterial()
material.metalness = 0.7
material.roughness = 0.2
const gui = new dat.GUI()
gui.add(material, 'metalness').min(0).max(1).step(0.0001)
gui.add(material, 'roughness').min(0).max(1).step(0.0001)
material.envMap = environmentMapTexture

////////////////////////////////////////////////////////////////////////////

// Objectes
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16, 64, 64),
    material
)
sphere.position.x = -1.5

const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1, 1, 100, 100),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128),
    material
)
torus.position.x = 1.5

scene.add(sphere, plane, torus)

// Crea còpia de UV en UV2 (Necessari per MeshStandardMaterial amb )
console.log(plane.geometry.attributes.uv.array)
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))


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

    // Update objects
    sphere.rotation.y = elapsedTime * 0.1
    plane.rotation.y = elapsedTime * 0.1
    torus.rotation.y = elapsedTime * 0.1

    sphere.rotation.x = elapsedTime * 0.15
    plane.rotation.x = elapsedTime * 0.15
    torus.rotation.x = elapsedTime * 0.15

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()